/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { PasskeyService } from '@fxa/accounts/passkey';
import { AppError } from '@fxa/accounts/errors';
import { recordSecurityEvent } from './utils/security-event';
import { isPasskeyFeatureEnabled } from '../passkey-utils';
import { passkeyRoutes } from './passkeys';

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: jest.fn(),
}));

describe('passkeys routes', () => {
  let log: any,
    db: any,
    customs: any,
    statsd: any,
    glean: any,
    routes: any,
    route: any,
    request: any,
    mockPasskeyService: any;

  const UID = 'uid-123';
  const SESSION_TOKEN_ID = 'session-token-456';
  const TEST_EMAIL = 'test@example.com';

  const config = {
    passkeys: {
      enabled: true,
    },
  };

  const mockRegistrationOptions = {
    challenge: 'challenge-abc',
    rp: { name: 'Firefox Accounts', id: 'accounts.firefox.com' },
    user: { id: UID, name: TEST_EMAIL, displayName: TEST_EMAIL },
    pubKeyCredParams: [],
    timeout: 60000,
    attestation: 'none',
  };

  const mockPasskey = {
    credentialId: 'credential-id-xyz',
    name: 'My Passkey',
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    transports: ['internal'],
  };

  async function runTest(
    routePath: string,
    requestOptions: any,
    method = 'POST'
  ) {
    routes = passkeyRoutes(customs, db, config, statsd, glean, log);
    route = routes.find((r) => r.path === routePath && r.method === method);
    request = {
      ...requestOptions,
    };
    request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));
    return await route.handler(request);
  }

  beforeEach(() => {
    log = {
      begin: jest.fn(),
    };
    customs = {
      checkAuthenticated: jest.fn(),
    };
    statsd = {
      increment: jest.fn(),
    };
    glean = {};
    db = {
      account: jest.fn().mockResolvedValue({
        email: TEST_EMAIL,
      }),
    };

    mockPasskeyService = {
      get enabled() {
        return config.passkeys.enabled;
      },
      generateRegistrationChallenge: jest
        .fn()
        .mockResolvedValue(mockRegistrationOptions),
      createPasskeyFromRegistrationResponse: jest
        .fn()
        .mockResolvedValue(mockPasskey),
    };

    Container.set(PasskeyService, mockPasskeyService);
  });

  afterEach(() => {
    config.passkeys.enabled = true;
    jest.clearAllMocks();
    Container.reset();
  });

  describe('isPasskeyFeatureEnabled', () => {
    it('throws featureNotEnabled when passkeys.enabled is false', () => {
      expect(() =>
        isPasskeyFeatureEnabled({
          passkeys: {
            enabled: false,
          },
        })
      ).toThrow('Feature not enabled');
    });
  });

  describe('POST /passkey/registration/start', () => {
    it('calls PasskeyService.generateRegistrationChallenge and returns options', async () => {
      const result = await runTest('/passkey/registration/start', {
        auth: {
          credentials: {
            uid: UID,
            id: SESSION_TOKEN_ID,
            email: TEST_EMAIL,
          },
        },
      });

      expect(result).toBe(mockRegistrationOptions);
      expect(
        mockPasskeyService.generateRegistrationChallenge
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPasskeyService.generateRegistrationChallenge
      ).toHaveBeenCalledWith(Buffer.from(UID), TEST_EMAIL);
    });

    it('enforces rate limiting via customs.checkAuthenticated', async () => {
      await runTest('/passkey/registration/start', {
        auth: {
          credentials: {
            uid: UID,
            id: SESSION_TOKEN_ID,
            email: TEST_EMAIL,
          },
        },
      });

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.anything(),
        UID,
        TEST_EMAIL,
        'passkeyRegisterStart'
      );
    });

    it('throws when customs rate limit blocks the request', async () => {
      customs.checkAuthenticated = jest
        .fn()
        .mockRejectedValue(AppError.tooManyRequests(60));

      await expect(() =>
        runTest('/passkey/registration/start', {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
        })
      ).rejects.toThrow('Client has sent too many requests');
    });

    it('can be disabled', async () => {
      config.passkeys.enabled = false;
      await expect(() =>
        runTest('/passkey/registration/start', {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
        })
      ).rejects.toThrow('System unavailable, try again soon');
    });
  });

  describe('POST /passkey/registration/finish', () => {
    const payload = {
      response: { id: 'cred', response: { attestationObject: 'abc' } },
      challenge: 'challenge-abc',
    };

    it('calls PasskeyService.createPasskeyFromRegistrationResponse and returns passkey', async () => {
      const result = await runTest('/passkey/registration/finish', {
        auth: {
          credentials: {
            uid: UID,
            id: SESSION_TOKEN_ID,
            email: TEST_EMAIL,
          },
        },
        payload,
      });

      expect(result).toEqual(
        expect.objectContaining({
          credentialId: mockPasskey.credentialId,
          name: mockPasskey.name,
          transports: mockPasskey.transports,
          lastUsedAt: expect.any(Number),
          createdAt: expect.any(Number),
        })
      );

      expect(
        mockPasskeyService.createPasskeyFromRegistrationResponse
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPasskeyService.createPasskeyFromRegistrationResponse
      ).toHaveBeenCalledWith(
        Buffer.from(UID),
        payload.response,
        payload.challenge
      );
    });

    it('records a success security event on successful registration', async () => {
      await runTest('/passkey/registration/finish', {
        auth: {
          credentials: {
            uid: UID,
            id: SESSION_TOKEN_ID,
            email: TEST_EMAIL,
          },
        },
        payload,
      });

      expect(recordSecurityEvent).toHaveBeenCalledTimes(1);
      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.registration_success',
        expect.anything()
      );
    });

    it('records a failure security event and rethrows when service throws', async () => {
      mockPasskeyService.createPasskeyFromRegistrationResponse = jest
        .fn()
        .mockRejectedValue(new Error('attestation verification failed'));

      await expect(() =>
        runTest('/passkey/registration/finish', {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          payload,
        })
      ).rejects.toThrow('attestation verification failed');

      expect(recordSecurityEvent).toHaveBeenCalledTimes(1);
      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.registration_failure',
        expect.anything()
      );
    });

    it('enforces rate limiting via customs.checkAuthenticated', async () => {
      await runTest('/passkey/registration/finish', {
        auth: {
          credentials: {
            uid: UID,
            id: SESSION_TOKEN_ID,
            email: TEST_EMAIL,
          },
        },
        payload,
      });

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.anything(),
        UID,
        TEST_EMAIL,
        'passkeyRegisterFinish'
      );
    });

    it('can be disabled', async () => {
      config.passkeys.enabled = false;

      await expect(() =>
        runTest('/passkey/registration/finish', {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          payload,
        })
      ).rejects.toThrow('System unavailable, try again soon');
    });
  });
});
