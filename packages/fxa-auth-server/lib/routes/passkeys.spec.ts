/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { PasskeyService } from '@fxa/accounts/passkey';
import { AppError } from '@fxa/accounts/errors';
import { recordSecurityEvent } from './utils/security-event';
import {
  isPasskeyRegistrationEnabled,
  isPasskeyAuthenticationEnabled,
} from '../passkey-utils';
import { passkeyRoutes, PasskeyHandler } from './passkeys';
import { FxaMailer } from '../senders/fxa-mailer';

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: jest.fn(),
}));

jest.mock('../senders/fxa-mailer-format', () => ({
  FxaMailerFormat: {
    account: jest.fn().mockReturnValue({
      to: 'test@example.com',
      uid: 'uid-123',
      metricsEnabled: true,
    }),
    metricsContext: jest.fn().mockResolvedValue({}),
    localTime: jest.fn().mockReturnValue({}),
    location: jest.fn().mockReturnValue({}),
    device: jest.fn().mockReturnValue({}),
    sync: jest.fn().mockReturnValue({}),
  },
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
    mockPasskeyService: any,
    mockFxaMailer: any;

  const UID = 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6';
  const SESSION_TOKEN_ID = 'session-token-456';
  const TEST_EMAIL = 'test@example.com';
  const CREDENTIAL_ID_B64 =
    Buffer.from('credential-id-xyz').toString('base64url');

  const config = {
    passkeys: {
      enabled: true,
      registrationEnabled: true,
      authenticationEnabled: true,
    },
  };

  const mockAuthenticationOptions = {
    challenge: 'auth-challenge-xyz',
    timeout: 60000,
    userVerification: 'required',
    rpId: 'accounts.firefox.com',
  };

  const mockRegistrationOptions = {
    challenge: 'challenge-abc',
    rp: { name: 'Firefox Accounts', id: 'accounts.firefox.com' },
    user: { id: UID, name: TEST_EMAIL, displayName: TEST_EMAIL },
    pubKeyCredParams: [],
    timeout: 60000,
    attestation: 'none',
  };

  const MOCK_AAGUID = 'adce0002-35bc-c60a-648b-0b25f1f05503';
  const MOCK_CREDENTIAL_ID = 'mock-credential-id-xyz';

  // PasskeyRecord shape: credentialId and aaguid are strings.
  const mockPasskeyRecord = {
    credentialId: MOCK_CREDENTIAL_ID,
    name: 'My Passkey',
    createdAt: Date.now(),
    lastUsedAt: null,
    transports: ['internal'],
    publicKey: Buffer.from('public-key'),
    signCount: 42,
    aaguid: MOCK_AAGUID,
    backupEligible: true,
    backupState: false,
    prfEnabled: true,
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
      error: jest.fn(),
    };
    customs = {
      checkAuthenticated: jest.fn(),
      checkIpOnly: jest.fn(),
    };
    statsd = {
      increment: jest.fn(),
    };
    glean = {
      passkey: {
        createComplete: jest.fn(),
        deleteSuccess: jest.fn(),
        renameSuccess: jest.fn(),
      },
    };
    db = {
      account: jest.fn().mockResolvedValue({
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        emailVerified: true,
        verifierSetAt: 1234567890,
      }),
      createPasskeyVerifiedSessionToken: jest
        .fn()
        .mockResolvedValue({ id: 'new-session-token-id' }),
      securityEvent: jest.fn().mockResolvedValue(undefined),
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
        .mockResolvedValue(mockPasskeyRecord),
      listPasskeysForUser: jest.fn().mockResolvedValue([mockPasskeyRecord]),
      deletePasskey: jest.fn().mockResolvedValue(undefined),
      renamePasskey: jest.fn().mockResolvedValue(mockPasskeyRecord),
      generateAuthenticationChallenge: jest
        .fn()
        .mockResolvedValue(mockAuthenticationOptions),
      verifyAuthenticationResponse: jest.fn().mockResolvedValue({ uid: UID }),
    };

    mockFxaMailer = {
      canSend: jest.fn().mockReturnValue(true),
      sendPostAddPasskeyEmail: jest.fn().mockResolvedValue(undefined),
      sendPostRemovePasskeyEmail: jest.fn().mockResolvedValue(undefined),
    };

    Container.set(PasskeyService, mockPasskeyService);
    Container.set(FxaMailer, mockFxaMailer);
  });

  afterEach(() => {
    config.passkeys.enabled = true;
    config.passkeys.registrationEnabled = true;
    config.passkeys.authenticationEnabled = true;
    Container.reset();
  });

  describe('isPasskeyRegistrationEnabled', () => {
    it('throws featureNotEnabled when registrationEnabled is false', () => {
      expect(() =>
        isPasskeyRegistrationEnabled({
          passkeys: {
            enabled: true,
            registrationEnabled: false,
          },
        })
      ).toThrow('Feature not enabled');
    });
  });

  describe('isPasskeyAuthenticationEnabled', () => {
    it('throws featureNotEnabled when authenticationEnabled is false', () => {
      expect(() =>
        isPasskeyAuthenticationEnabled({
          passkeys: {
            enabled: true,
            authenticationEnabled: false,
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
      ).toHaveBeenCalledWith(UID, TEST_EMAIL);
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

      expect(result).toEqual({
        credentialId: mockPasskeyRecord.credentialId,
        name: mockPasskeyRecord.name,
        createdAt: mockPasskeyRecord.createdAt,
        lastUsedAt: mockPasskeyRecord.lastUsedAt,
        transports: mockPasskeyRecord.transports,
        aaguid: mockPasskeyRecord.aaguid,
        backupEligible: mockPasskeyRecord.backupEligible,
        backupState: mockPasskeyRecord.backupState,
        prfEnabled: mockPasskeyRecord.prfEnabled,
      });

      expect(
        mockPasskeyService.createPasskeyFromRegistrationResponse
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPasskeyService.createPasskeyFromRegistrationResponse
      ).toHaveBeenCalledWith(UID, payload.response, payload.challenge);
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

    it('records glean.passkey.createComplete on successful registration', async () => {
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

      expect(glean.passkey.createComplete).toHaveBeenCalledTimes(1);
      expect(glean.passkey.createComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            credentials: expect.objectContaining({ uid: UID }),
          }),
        })
      );
    });

    it('does not record glean.passkey.createComplete when registration fails', async () => {
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
      ).rejects.toThrow();

      expect(glean.passkey.createComplete).not.toHaveBeenCalled();
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

    it('does not send email when registration fails', async () => {
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
      ).rejects.toThrow();

      expect(mockFxaMailer.sendPostAddPasskeyEmail).not.toHaveBeenCalled();
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

    it('sends postAddPasskey email on successful registration', async () => {
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

      expect(mockFxaMailer.canSend).toHaveBeenCalledWith('postAddPasskey');
      expect(mockFxaMailer.sendPostAddPasskeyEmail).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPostAddPasskeyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ showSyncPasswordNote: true })
      );
    });

    it('sets showSyncPasswordNote to false for passwordless accounts', async () => {
      db.account.mockResolvedValueOnce({ email: TEST_EMAIL, verifierSetAt: 0 });

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

      expect(mockFxaMailer.sendPostAddPasskeyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ showSyncPasswordNote: false })
      );
    });

    it('skips email when canSend returns false', async () => {
      mockFxaMailer.canSend.mockReturnValue(false);

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

      expect(mockFxaMailer.sendPostAddPasskeyEmail).not.toHaveBeenCalled();
    });

    it('swallows email send errors and still returns passkey data', async () => {
      mockFxaMailer.sendPostAddPasskeyEmail.mockRejectedValue(
        new Error('email send failed')
      );

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
          credentialId: mockPasskeyRecord.credentialId,
        })
      );
      expect(log.error).toHaveBeenCalledWith(
        'passkeys.registrationFinish.sendEmail',
        expect.objectContaining({ err: expect.any(Error) })
      );
    });
  });

  describe('GET /passkeys', () => {
    it('returns mapped passkeys', async () => {
      const result = await runTest(
        '/passkeys',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
        },
        'GET'
      );

      expect(mockPasskeyService.listPasskeysForUser).toHaveBeenCalledWith(UID);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        credentialId: mockPasskeyRecord.credentialId,
        name: mockPasskeyRecord.name,
        createdAt: mockPasskeyRecord.createdAt,
        lastUsedAt: mockPasskeyRecord.lastUsedAt,
        transports: mockPasskeyRecord.transports,
        aaguid: mockPasskeyRecord.aaguid,
        backupEligible: mockPasskeyRecord.backupEligible,
        backupState: mockPasskeyRecord.backupState,
        prfEnabled: mockPasskeyRecord.prfEnabled,
      });
      expect(result[0]).not.toHaveProperty('publicKey');
      expect(result[0]).not.toHaveProperty('signCount');
    });

    it('returns an empty array when user has no passkeys', async () => {
      mockPasskeyService.listPasskeysForUser.mockResolvedValueOnce([]);

      const result = await runTest(
        '/passkeys',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
        },
        'GET'
      );

      expect(result).toEqual([]);
    });

    it('enforces rate limiting via customs.checkAuthenticated', async () => {
      await runTest(
        '/passkeys',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
        },
        'GET'
      );

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.anything(),
        UID,
        TEST_EMAIL,
        'passkeysList'
      );
    });
  });

  describe('DELETE /passkey/{credentialId}', () => {
    it('decodes credentialId and calls deletePasskey', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(mockPasskeyService.deletePasskey).toHaveBeenCalledWith(
        UID,
        CREDENTIAL_ID_B64
      );
    });

    it('records a security event on success', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.removed',
        expect.anything()
      );
    });

    it('records glean.passkey.deleteSuccess on successful deletion', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(glean.passkey.deleteSuccess).toHaveBeenCalledTimes(1);
      expect(glean.passkey.deleteSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            credentials: expect.objectContaining({ uid: UID }),
          }),
        })
      );
    });

    it('does not record glean.passkey.deleteSuccess when deletion fails', async () => {
      mockPasskeyService.deletePasskey.mockRejectedValue(
        AppError.passkeyNotFound()
      );

      await expect(() =>
        runTest(
          '/passkey/{credentialId}',
          {
            auth: {
              credentials: {
                uid: UID,
                id: SESSION_TOKEN_ID,
                email: TEST_EMAIL,
              },
            },
            params: { credentialId: CREDENTIAL_ID_B64 },
          },
          'DELETE'
        )
      ).rejects.toThrow();

      expect(glean.passkey.deleteSuccess).not.toHaveBeenCalled();
    });

    it('throws passkeyNotFound when service throws passkeyNotFound', async () => {
      mockPasskeyService.deletePasskey.mockRejectedValue(
        AppError.passkeyNotFound()
      );

      await expect(() =>
        runTest(
          '/passkey/{credentialId}',
          {
            auth: {
              credentials: {
                uid: UID,
                id: SESSION_TOKEN_ID,
                email: TEST_EMAIL,
              },
            },
            params: { credentialId: CREDENTIAL_ID_B64 },
          },
          'DELETE'
        )
      ).rejects.toThrow();
    });

    it('returns empty object on success', async () => {
      const result = await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(result).toEqual({});
    });

    it('enforces rate limiting via customs.checkAuthenticated', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.anything(),
        UID,
        TEST_EMAIL,
        'passkeyDelete'
      );
    });

    it('sends postRemovePasskey email on successful deletion', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(mockFxaMailer.canSend).toHaveBeenCalledWith('postRemovePasskey');
      expect(mockFxaMailer.sendPostRemovePasskeyEmail).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPostRemovePasskeyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: TEST_EMAIL })
      );
    });

    it('skips email when canSend returns false', async () => {
      mockFxaMailer.canSend.mockReturnValue(false);

      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(mockFxaMailer.sendPostRemovePasskeyEmail).not.toHaveBeenCalled();
    });

    it('swallows email send errors and still returns empty object', async () => {
      mockFxaMailer.sendPostRemovePasskeyEmail.mockRejectedValue(
        new Error('email send failed')
      );

      const result = await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
        },
        'DELETE'
      );

      expect(result).toEqual({});
      expect(log.error).toHaveBeenCalledWith(
        'passkeys.deletePasskey.sendEmail',
        expect.objectContaining({ err: expect.any(Error) })
      );
    });
  });

  describe('PATCH /passkey/{credentialId}', () => {
    it('decodes credentialId and calls renamePasskey', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
          payload: { name: 'Renamed Key' },
        },
        'PATCH'
      );

      expect(mockPasskeyService.renamePasskey).toHaveBeenCalledWith(
        UID,
        CREDENTIAL_ID_B64,
        'Renamed Key'
      );
    });

    it('returns updated passkey data on success', async () => {
      const result = await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
          payload: { name: 'Renamed Key' },
        },
        'PATCH'
      );

      expect(result).toEqual({
        credentialId: mockPasskeyRecord.credentialId,
        name: mockPasskeyRecord.name,
        createdAt: mockPasskeyRecord.createdAt,
        lastUsedAt: mockPasskeyRecord.lastUsedAt,
        transports: mockPasskeyRecord.transports,
        aaguid: mockPasskeyRecord.aaguid,
        backupEligible: mockPasskeyRecord.backupEligible,
        backupState: mockPasskeyRecord.backupState,
        prfEnabled: mockPasskeyRecord.prfEnabled,
      });
    });

    it('throws passkeyNotFound when service throws passkeyNotFound', async () => {
      mockPasskeyService.renamePasskey.mockRejectedValue(
        AppError.passkeyNotFound()
      );

      await expect(() =>
        runTest(
          '/passkey/{credentialId}',
          {
            auth: {
              credentials: {
                uid: UID,
                id: SESSION_TOKEN_ID,
                email: TEST_EMAIL,
              },
            },
            params: { credentialId: CREDENTIAL_ID_B64 },
            payload: { name: 'New Name' },
          },
          'PATCH'
        )
      ).rejects.toThrow();
    });

    it('records glean.passkey.renameSuccess on successful rename', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
          payload: { name: 'Renamed Key' },
        },
        'PATCH'
      );

      expect(glean.passkey.renameSuccess).toHaveBeenCalledTimes(1);
      expect(glean.passkey.renameSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            credentials: expect.objectContaining({ uid: UID }),
          }),
        })
      );
    });

    it('does not record glean.passkey.renameSuccess when rename fails', async () => {
      mockPasskeyService.renamePasskey.mockRejectedValue(
        AppError.passkeyNotFound()
      );

      await expect(() =>
        runTest(
          '/passkey/{credentialId}',
          {
            auth: {
              credentials: {
                uid: UID,
                id: SESSION_TOKEN_ID,
                email: TEST_EMAIL,
              },
            },
            params: { credentialId: CREDENTIAL_ID_B64 },
            payload: { name: 'New Name' },
          },
          'PATCH'
        )
      ).rejects.toThrow();

      expect(glean.passkey.renameSuccess).not.toHaveBeenCalled();
    });

    it('enforces rate limiting via customs.checkAuthenticated', async () => {
      await runTest(
        '/passkey/{credentialId}',
        {
          auth: {
            credentials: {
              uid: UID,
              id: SESSION_TOKEN_ID,
              email: TEST_EMAIL,
            },
          },
          params: { credentialId: CREDENTIAL_ID_B64 },
          payload: { name: 'Renamed Key' },
        },
        'PATCH'
      );

      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        expect.anything(),
        UID,
        TEST_EMAIL,
        'passkeysRename'
      );
    });
  });

  describe('POST /passkey/authentication/start', () => {
    it('calls PasskeyService.generateAuthenticationChallenge with no uid and returns options', async () => {
      const result = await runTest('/passkey/authentication/start', {
        auth: { credentials: {} },
        app: { ua: {} },
      });

      expect(result).toBe(mockAuthenticationOptions);
      expect(
        mockPasskeyService.generateAuthenticationChallenge
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPasskeyService.generateAuthenticationChallenge
      ).toHaveBeenCalledWith();
    });

    it('enforces rate limiting via customs.checkIpOnly', async () => {
      await runTest('/passkey/authentication/start', {
        auth: { credentials: {} },
        app: { ua: {} },
      });

      expect(customs.checkIpOnly).toHaveBeenCalledWith(
        expect.anything(),
        'passkeyAuthStart'
      );
    });

    it('throws when customs rate limit blocks the request', async () => {
      customs.checkIpOnly = jest
        .fn()
        .mockRejectedValue(AppError.tooManyRequests(60));

      await expect(() =>
        runTest('/passkey/authentication/start', {
          auth: { credentials: {} },
          app: { ua: {} },
        })
      ).rejects.toThrow('Client has sent too many requests');
    });
  });

  describe('POST /passkey/authentication/finish', () => {
    const payload = {
      response: {
        id: 'credential-id',
        type: 'public-key',
        response: { authenticatorData: 'abc' },
      },
      challenge: 'auth-challenge-xyz',
    };

    it('verifies the response and returns session token with metadata', async () => {
      const result = await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(
        mockPasskeyService.verifyAuthenticationResponse
      ).toHaveBeenCalledWith(payload.response, payload.challenge);
      expect(db.createPasskeyVerifiedSessionToken).toHaveBeenCalledWith(
        expect.objectContaining({ uid: UID })
      );
      expect(result).toEqual({
        uid: UID,
        sessionToken: 'new-session-token-id',
        verified: true,
        requiresPasswordForSync: false,
        hasPassword: true,
      });
    });

    it('sets requiresPasswordForSync true when service is sync', async () => {
      const result = await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload: { ...payload, service: 'sync' },
      });

      expect(result.requiresPasswordForSync).toBe(true);
    });

    it('sets hasPassword false for passwordless accounts', async () => {
      db.account.mockResolvedValueOnce({
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        emailVerified: true,
        verifierSetAt: 0,
      });

      const result = await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(result.hasPassword).toBe(false);
    });

    it('records account.passkey.authentication_success security event', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.authentication_success',
        expect.anything()
      );
    });

    it('enforces rate limiting via customs.checkIpOnly', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(customs.checkIpOnly).toHaveBeenCalledWith(
        expect.anything(),
        'passkeyAuthFinish'
      );
    });

    it('records authentication_failure and rethrows when verifyAuthenticationResponse fails', async () => {
      mockPasskeyService.verifyAuthenticationResponse = jest
        .fn()
        .mockRejectedValue(AppError.passkeyAuthenticationFailed());

      await expect(() =>
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toThrow();

      expect(recordSecurityEvent).toHaveBeenCalledWith(
        'account.passkey.authentication_failure',
        expect.anything()
      );
    });

    it('does not record authentication_success when verification fails', async () => {
      mockPasskeyService.verifyAuthenticationResponse = jest
        .fn()
        .mockRejectedValue(AppError.passkeyAuthenticationFailed());

      await expect(() =>
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toThrow();

      expect(recordSecurityEvent).not.toHaveBeenCalledWith(
        'account.passkey.authentication_success',
        expect.anything()
      );
    });

    it('throws when customs rate limit blocks the request', async () => {
      customs.checkIpOnly = jest
        .fn()
        .mockRejectedValue(AppError.tooManyRequests(60));

      await expect(() =>
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toThrow('Client has sent too many requests');
    });

    it('propagates db.account failure after successful verification', async () => {
      db.account.mockRejectedValueOnce(new Error('DB error'));

      await expect(() =>
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toThrow('DB error');

      expect(recordSecurityEvent).not.toHaveBeenCalledWith(
        'account.passkey.authentication_success',
        expect.anything()
      );
      expect(recordSecurityEvent).not.toHaveBeenCalledWith(
        'account.passkey.authentication_failure',
        expect.anything()
      );
    });
  });

  describe('PasskeyHandler.createPasskeySessionToken', () => {
    const mockAccount = {
      uid: UID,
      email: TEST_EMAIL,
      emailCode: 'emailcode123',
      emailVerified: true,
      verifierSetAt: 1234567890,
    };

    const mockRequest = {
      app: {
        ua: {
          browser: 'Firefox',
          browserVersion: '124.0',
          os: 'macOS',
          osVersion: '14.0',
          deviceType: null,
          formFactor: null,
        },
      },
    };

    let handler: PasskeyHandler;

    beforeEach(() => {
      handler = new PasskeyHandler(
        mockPasskeyService,
        db,
        customs,
        log,
        mockFxaMailer,
        statsd,
        glean
      );
    });

    it('creates a verified session token with correct options', async () => {
      await handler.createPasskeySessionToken(mockAccount, mockRequest as any);

      expect(db.createPasskeyVerifiedSessionToken).toHaveBeenCalledWith({
        uid: UID,
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        emailVerified: true,
        verifierSetAt: 1234567890,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '124.0',
        uaOS: 'macOS',
        uaOSVersion: '14.0',
        uaDeviceType: null,
        uaFormFactor: null,
      });
    });

    it('returns the created session token and emits success metric', async () => {
      const result = await handler.createPasskeySessionToken(
        mockAccount,
        mockRequest as any
      );

      expect(result).toEqual({ id: 'new-session-token-id' });
      expect(statsd.increment).toHaveBeenCalledWith(
        'passkeys.createSessionToken.success'
      );
    });

    it('propagates errors from createPasskeyVerifiedSessionToken', async () => {
      const dbError = new Error('DB unavailable');
      db.createPasskeyVerifiedSessionToken.mockRejectedValue(dbError);

      await expect(
        handler.createPasskeySessionToken(mockAccount, mockRequest as any)
      ).rejects.toThrow('DB unavailable');
    });
  });
});
