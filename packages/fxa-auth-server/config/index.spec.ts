/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('Config', () => {
  describe('NODE_ENV=prod', () => {
    let originalEnv: Record<string, string | undefined>;

    function mockEnv(key: string, value: string) {
      originalEnv[key] = process.env[key];
      process.env[key] = value;
    }

    beforeEach(() => {
      originalEnv = {};
      jest.resetModules();
      mockEnv('NODE_ENV', 'prod');
    });

    afterEach(() => {
      for (const key in originalEnv) {
        if (originalEnv[key] === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = originalEnv[key];
        }
      }
    });

    const MFA_JWT_KEY = 'production secret here, 32+ bytes long';

    // Every guarded production secret except MFA__JWT__KEY, so the MFA key
    // can be exercised on its own below.
    function mockOtherProductionSecrets() {
      mockEnv('FLOW_ID_KEY', 'production secret here');
      mockEnv('OAUTH_SERVER_SECRET_KEY', 'production secret here');
      mockEnv(
        'PROFILE_SERVER_AUTH_SECRET_BEARER_TOKEN',
        'production secret here'
      );
      mockEnv('SESSION_TOKEN_HANDLE_KEY', 'production secret here');
    }

    it('errors when secret settings have their default values', () => {
      expect(() => {
        require('./index');
      }).toThrow(/Config '[a-zA-Z._]+' must be set in production/);
    });

    it('succeeds when secret settings have all been configured', () => {
      mockOtherProductionSecrets();
      mockEnv('MFA__JWT__KEY', MFA_JWT_KEY);
      expect(() => {
        require('./index');
      }).not.toThrow();
    });

    it('errors when MFA__JWT__KEY is left at its default', () => {
      mockOtherProductionSecrets();
      expect(() => {
        require('./index');
      }).toThrow(/Config 'mfa\.jwt\.secretKey' must be set in production/);
    });

    it('errors when MFA__JWT__KEY is shorter than 32 bytes', () => {
      mockOtherProductionSecrets();
      mockEnv('MFA__JWT__KEY', 'short-but-not-the-default');
      expect(() => {
        require('./index');
      }).toThrow(
        /Config 'mfa\.jwt\.secretKey' must be at least 32 bytes in production/
      );
    });

    it.each(['GOOGLE_AUTH_JWKS_URI', 'APPLE_AUTH_JWKS_URI'])(
      'errors when %s is set outside NODE_ENV=dev',
      (envVar) => {
        mockOtherProductionSecrets();
        mockEnv('MFA__JWT__KEY', MFA_JWT_KEY);
        mockEnv(envVar, 'http://localhost:9300/jwks');
        expect(() => {
          require('./index');
        }).toThrow(/jwksUri' may only be set when NODE_ENV=dev/);
      }
    );
  });

  describe('rate limit rules', () => {
    // The shipped rules file is otherwise only parsed at server boot, so a typo
    // here surfaces as a deploy-time crash rather than a failing test.
    function shippedRules() {
      const { parseConfigRules } = require('@fxa/accounts/rate-limit');
      const { config } = require('./index');
      return parseConfigRules(config.get('rateLimit.rules'));
    }

    it('parses without error', () => {
      expect(shippedRules).not.toThrow();
    });

    it('limits tokenExchange on both the token hash and the ip', () => {
      expect(shippedRules()['tokenExchange']).toEqual([
        {
          blockingOn: 'token',
          maxAttempts: 5,
          windowDurationInSeconds: 900,
          blockDurationInSeconds: 900,
          blockPolicy: 'block',
        },
        {
          blockingOn: 'ip',
          maxAttempts: 100,
          windowDurationInSeconds: 900,
          blockDurationInSeconds: 900,
          blockPolicy: 'block',
        },
      ]);
    });
  });
});
