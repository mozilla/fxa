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

    it('errors when secret settings have their default values', () => {
      expect(() => {
        require('./index');
      }).toThrow(/Config '[a-zA-Z._]+' must be set in production/);
    });

    it('succeeds when secret settings have all been configured', () => {
      mockEnv('FLOW_ID_KEY', 'production secret here');
      mockEnv('OAUTH_SERVER_SECRET_KEY', 'production secret here');
      mockEnv(
        'PROFILE_SERVER_AUTH_SECRET_BEARER_TOKEN',
        'production secret here'
      );
      expect(() => {
        require('./index');
      }).not.toThrow();
    });
  });
});
