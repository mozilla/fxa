/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Schema } from 'joi';
import { Container } from 'typedi';
import { PasskeyService } from '@fxa/accounts/passkey';
import { AppError } from '@fxa/accounts/errors';
import { recordSecurityEvent } from './utils/security-event';
import {
  isPasskeyRegistrationEnabled,
  isPasskeyAuthenticationEnabled,
} from '../passkey-utils';
import {
  passkeyRoutes,
  passkeyResponseSchema,
  PasskeyHandler,
} from './passkeys';
import { ConfigType } from '../../config';
import { FxaMailer } from '../senders/fxa-mailer';
import { OAuthClientInfoServiceName } from '../senders/oauth_client_info';

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
    mockFxaMailer: any,
    mailer: any,
    mockOauthClientInfoService: any;

  const UID = 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6';
  const SESSION_TOKEN_ID = 'session-token-456';
  const TEST_EMAIL = 'test@example.com';
  const CREDENTIAL_ID_B64 =
    Buffer.from('credential-id-xyz').toString('base64url');

  // Only the passkeys flags and the MFA action list are read by these routes;
  // cast the partial fixture to the full ConfigType the factory expects.
  const config = {
    passkeys: {
      enabled: true,
      registrationEnabled: true,
      authenticationEnabled: true,
    },
    mfa: {
      actions: ['2fa', 'email', 'recovery_key', 'password', 'passkey'],
    },
  } as unknown as ConfigType;

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
    routes = passkeyRoutes(customs, db, config, statsd, glean, log, mailer);
    route = routes.find((r) => r.path === routePath && r.method === method);
    request = {
      headers: { 'user-agent': 'test-agent' },
      ...requestOptions,
      app: {
        acceptLanguage: 'en',
        clientAddress: '127.0.0.1',
        geo: { location: { country: 'United States', countryCode: 'US' } },
        ...requestOptions.app,
      },
    };
    request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));
    request.setMetricsFlowCompleteSignal = jest.fn();
    request.stashMetricsContext = jest.fn(() => Promise.resolve());
    return await route.handler(request);
  }

  beforeEach(() => {
    log = {
      begin: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      notifyAttachedServices: jest.fn().mockResolvedValue(undefined),
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
        authenticationStarted: jest.fn(),
        authenticationVerificationSuccess: jest.fn(),
        createComplete: jest.fn(),
        deleteSuccess: jest.fn(),
        renameSuccess: jest.fn(),
      },
      login: {
        complete: jest.fn(),
      },
    };
    db = {
      account: jest.fn().mockResolvedValue({
        uid: UID,
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        emailVerified: true,
        verifierSetAt: 1234567890,
        primaryEmail: {
          email: TEST_EMAIL,
          emailCode: 'emailcode123',
          isVerified: true,
        },
        emails: [{ email: TEST_EMAIL, isPrimary: true, isVerified: true }],
      }),
      createPasskeyVerifiedSessionToken: jest.fn().mockResolvedValue({
        id: 'new-session-token-id',
        data: 'new-session-token-data',
      }),
      securityEvent: jest.fn().mockResolvedValue(undefined),
      sessions: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
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
      sendPostAddPasskeyEmail: jest.fn().mockResolvedValue(undefined),
      sendPostRemovePasskeyEmail: jest.fn().mockResolvedValue(undefined),
      sendNewDeviceLoginEmail: jest.fn().mockResolvedValue(undefined),
    };

    mailer = {
      sendNewDeviceLoginEmail: jest.fn().mockResolvedValue(undefined),
    };

    mockOauthClientInfoService = {
      fetch: jest.fn().mockResolvedValue({ name: 'Mozilla' }),
    };

    Container.set(PasskeyService, mockPasskeyService);
    Container.set(FxaMailer, mockFxaMailer);
    Container.set(OAuthClientInfoServiceName, mockOauthClientInfoService);
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

    it('accepts an unknown transport in excludeCredentials', async () => {
      mockPasskeyService.generateRegistrationChallenge.mockResolvedValue({
        ...mockRegistrationOptions,
        excludeCredentials: [
          {
            id: CREDENTIAL_ID_B64,
            type: 'public-key',
            transports: ['internal', 'unknown'],
          },
        ],
      });

      const result = await runTest('/passkey/registration/start', {
        auth: {
          credentials: { uid: UID, id: SESSION_TOKEN_ID, email: TEST_EMAIL },
        },
      });

      await expect(
        route.options.response.schema.validateAsync(result)
      ).resolves.toMatchObject({
        excludeCredentials: [{ transports: ['internal', 'unknown'] }],
      });
    });

    describe('when the primary email differs from the signup email', () => {
      // A user who changed their primary email: the immutable signup address
      // on accounts.email diverges from the current primary in the emails table.
      const signupEmail = 'original-signup@example.com';
      const currentPrimaryEmail = 'current-primary@example.com';

      beforeEach(() => {
        db.account = jest.fn().mockResolvedValue({
          uid: UID,
          email: signupEmail,
          emailCode: 'emailcode123',
          emailVerified: true,
          verifierSetAt: 1234567890,
          primaryEmail: {
            email: currentPrimaryEmail,
            emailCode: 'emailcode123',
            isVerified: true,
          },
          emails: [
            { email: signupEmail, isPrimary: false, isVerified: true },
            { email: currentPrimaryEmail, isPrimary: true, isVerified: true },
          ],
        });
      });

      it('registers the passkey with the current primary email', async () => {
        await runTest('/passkey/registration/start', {
          auth: {
            credentials: { uid: UID, id: SESSION_TOKEN_ID, email: signupEmail },
          },
        });

        expect(
          mockPasskeyService.generateRegistrationChallenge
        ).toHaveBeenCalledWith(UID, currentPrimaryEmail);
      });

      it('keys the customs rate-limit check on the current primary email', async () => {
        await runTest('/passkey/registration/start', {
          auth: {
            credentials: { uid: UID, id: SESSION_TOKEN_ID, email: signupEmail },
          },
        });

        expect(customs.checkAuthenticated).toHaveBeenCalledWith(
          expect.anything(),
          UID,
          currentPrimaryEmail,
          'passkeyRegisterStart'
        );
      });
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

      expect(mockFxaMailer.sendPostAddPasskeyEmail).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPostAddPasskeyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ showSyncPasswordNote: true })
      );
    });

    it('sets showSyncPasswordNote to false for passwordless accounts', async () => {
      db.account.mockResolvedValueOnce({
        email: TEST_EMAIL,
        primaryEmail: {
          email: TEST_EMAIL,
          emailCode: 'emailcode123',
          isVerified: true,
        },
        verifierSetAt: 0,
      });

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

      expect(mockFxaMailer.sendPostRemovePasskeyEmail).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPostRemovePasskeyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: TEST_EMAIL })
      );
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
      ).toHaveBeenCalledWith({ keysRequired: undefined });
    });

    it('forwards the keysRequired hint from the payload to the service', async () => {
      await runTest('/passkey/authentication/start', {
        auth: { credentials: {} },
        payload: { keysRequired: true },
        app: { ua: {} },
      });

      expect(
        mockPasskeyService.generateAuthenticationChallenge
      ).toHaveBeenCalledWith({ keysRequired: true });
    });

    it('records glean.passkey.authenticationStarted with the request', async () => {
      const request = {
        auth: { credentials: {} },
        app: { ua: {} },
      };
      await runTest('/passkey/authentication/start', request);

      expect(glean.passkey.authenticationStarted).toHaveBeenCalledTimes(1);
      expect(glean.passkey.authenticationStarted).toHaveBeenCalledWith(
        expect.objectContaining({ auth: { credentials: {} } })
      );
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
      keysRequired: false,
    };

    it('verifies the response and returns session token with metadata', async () => {
      const result = await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(
        mockPasskeyService.verifyAuthenticationResponse
      ).toHaveBeenCalledWith(
        payload.response,
        payload.challenge,
        undefined,
        undefined
      );
      expect(db.createPasskeyVerifiedSessionToken).toHaveBeenCalledWith(
        expect.objectContaining({ uid: UID })
      );
      expect(result).toEqual({
        uid: UID,
        sessionToken: 'new-session-token-data',
        verified: true,
        hasPassword: true,
      });
    });

    it('forwards prfSupported from the payload to verifyAuthenticationResponse', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload: { ...payload, prfSupported: true },
      });

      expect(
        mockPasskeyService.verifyAuthenticationResponse
      ).toHaveBeenCalledWith(
        payload.response,
        payload.challenge,
        undefined,
        true
      );
    });

    it('sets hasPassword false for passwordless accounts', async () => {
      db.account.mockResolvedValueOnce({
        uid: UID,
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        emailVerified: true,
        verifierSetAt: 0,
        primaryEmail: {
          email: TEST_EMAIL,
          emailCode: 'emailcode123',
          isVerified: true,
        },
        emails: [{ email: TEST_EMAIL, isPrimary: true, isVerified: true }],
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

    it('stashes the metrics context against the new session token', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      // The password-creation and key-fetch steps of a keys-required sign-in
      // send no metrics context, so they resolve it from this stash.
      expect(request.stashMetricsContext).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-session-token-id' })
      );
    });

    it('does not emit glean.login.complete directly at the ceremony', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      // login.complete is emitted by the flow-complete machinery, driven by the
      // signal set below. Emitting here too would double-count every
      // keys-required sign-in, which also completes at /session/reauth.
      expect(glean.login.complete).not.toHaveBeenCalled();
    });

    it('does not set the login flow-complete signal when verification fails', async () => {
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

      expect(request.setMetricsFlowCompleteSignal).not.toHaveBeenCalled();
      expect(glean.login.complete).not.toHaveBeenCalled();
    });

    it('emits glean.passkey.authenticationVerificationSuccess on a verified assertion', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      expect(
        glean.passkey.authenticationVerificationSuccess
      ).toHaveBeenCalledTimes(1);
    });

    it('does not emit glean.passkey.authenticationVerificationSuccess when verification fails', async () => {
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

      expect(
        glean.passkey.authenticationVerificationSuccess
      ).not.toHaveBeenCalled();
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

    it('calls checkIpOnly with passkeyAuthFinishFailed when verification fails', async () => {
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

      expect(customs.checkIpOnly).toHaveBeenCalledWith(
        expect.anything(),
        'passkeyAuthFinishFailed'
      );
    });

    it('rethrows the original verification error after recording the failure signal', async () => {
      const verificationError = AppError.passkeyAuthenticationFailed();
      mockPasskeyService.verifyAuthenticationResponse = jest
        .fn()
        .mockRejectedValue(verificationError);

      await expect(
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toBe(verificationError);
    });

    it('does not call checkIpOnly with passkeyAuthFinishFailed on successful authentication', async () => {
      await runTest('/passkey/authentication/finish', {
        auth: { credentials: {} },
        app: { ua: {} },
        payload,
      });

      const allCalls = (customs.checkIpOnly as jest.Mock).mock.calls.map(
        (args: string[]) => args[1]
      );
      expect(allCalls).not.toContain('passkeyAuthFinishFailed');
    });

    // Documents current behavior: if customs throws during the passkeyAuthFinishFailed
    // signal, the original verification error is masked by the customs error.
    // Consider wrapping in a try/catch (like the email-send pattern) to preserve
    // the original error for the caller.
    it('propagates a customs failure from passkeyAuthFinishFailed instead of the original verification error', async () => {
      mockPasskeyService.verifyAuthenticationResponse = jest
        .fn()
        .mockRejectedValue(AppError.passkeyAuthenticationFailed());
      const customsError = new Error('customs service unavailable');
      customs.checkIpOnly = jest
        .fn()
        .mockResolvedValueOnce(undefined) // passkeyAuthFinish — succeeds
        .mockRejectedValueOnce(customsError); // passkeyAuthFinishFailed — fails

      await expect(
        runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        })
      ).rejects.toBe(customsError);
    });

    describe('post sign-in notifications', () => {
      it('sends a generic "Mozilla account" email for a non-OAuth sign-in (no service)', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        expect(mockOauthClientInfoService.fetch).toHaveBeenCalledWith(
          undefined
        );
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            clientName: 'Mozilla',
            showBannerWarning: false,
          })
        );
        expect(mailer.sendNewDeviceLoginEmail).not.toHaveBeenCalled();
      });

      it('shows the relying-party name for a non-sync OAuth sign-in', async () => {
        mockOauthClientInfoService.fetch.mockResolvedValue({
          name: 'Firefox Monitor',
        });

        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: { ...payload, service: 'dcdb5ae7add825d2' },
        });

        expect(mockOauthClientInfoService.fetch).toHaveBeenCalledWith(
          'dcdb5ae7add825d2'
        );
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledWith(
          expect.objectContaining({ clientName: 'Firefox Monitor' })
        );
      });

      it('forces the generic "Mozilla account" email while deferring, dropping the service framing (no framing before keys)', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: { ...payload, service: 'sync', keysRequired: true },
        });

        expect(mockOauthClientInfoService.fetch).toHaveBeenCalledWith(
          undefined
        );
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledWith(
          expect.objectContaining({ clientName: 'Mozilla' })
        );
      });

      it('does not reject the sign-in when the email send fails', async () => {
        mockFxaMailer.sendNewDeviceLoginEmail.mockRejectedValue(
          new Error('smtp down')
        );

        const result = await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        expect(result.uid).toBe(UID);
        expect(log.trace).toHaveBeenCalledWith(
          'passkeys.authenticationFinish.sendNewDeviceLoginEmail.error',
          { error: expect.any(Error) }
        );
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      });

      it('notifies attached services of the login', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        expect(log.notifyAttachedServices).toHaveBeenCalledWith(
          'login',
          expect.anything(),
          {
            country: 'United States',
            countryCode: 'US',
            deviceCount: 1,
            email: TEST_EMAIL,
            service: undefined,
            uid: UID,
            userAgent: 'test-agent',
          }
        );
      });

      it('emits the account.login metrics event and flow signal when keysRequired is false', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        expect(request.emitMetricsEvent).toHaveBeenCalledWith('account.login', {
          uid: UID,
        });
        expect(request.setMetricsFlowCompleteSignal).toHaveBeenCalledWith(
          'account.login',
          'login',
          'passkey'
        );
      });

      it('sets the flow signal before emitting account.login when keysRequired is false', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        // emitMetricsEvent only recognises the flow as complete — and so records
        // login.complete — if the signal is already set. Reversing these two
        // silently drops the event for keys-optional sign-ins.
        expect(
          request.setMetricsFlowCompleteSignal.mock.invocationCallOrder[0]
        ).toBeLessThan(request.emitMetricsEvent.mock.invocationCallOrder[0]);
      });

      it('records the account.login security event when keysRequired is false', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload,
        });

        expect(recordSecurityEvent).toHaveBeenCalledWith(
          'account.login',
          expect.objectContaining({
            account: { uid: UID },
            method: 'passkey',
          })
        );
      });

      it('does not emit the account.login metrics event when keysRequired is true', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: { ...payload, keysRequired: true },
        });

        expect(request.emitMetricsEvent).not.toHaveBeenCalledWith(
          'account.login',
          expect.anything()
        );
        expect(request.setMetricsFlowCompleteSignal).not.toHaveBeenCalled();
      });

      it('does not record the account.login security event when keysRequired is true', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: { ...payload, keysRequired: true },
        });

        expect(recordSecurityEvent).not.toHaveBeenCalledWith(
          'account.login',
          expect.anything()
        );
      });

      // The client owns the defer decision (it depends on the browser's
      // keys-optional capability); `service` does not influence it. The two
      // tests below pair a deferring login with a non-Sync service and a
      // non-deferring login with service=sync to prove that independence.
      it('defers account.login and sends a generic-subject email when keysRequired is true, regardless of service', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: {
            ...payload,
            service: 'vpn',
            keysRequired: true,
          },
        });

        expect(request.emitMetricsEvent).not.toHaveBeenCalledWith(
          'account.login',
          expect.anything()
        );
        expect(request.setMetricsFlowCompleteSignal).not.toHaveBeenCalled();
        expect(recordSecurityEvent).not.toHaveBeenCalledWith(
          'account.login',
          expect.anything()
        );
        // New-device-login email is still sent, just with a generic subject.
        expect(mockOauthClientInfoService.fetch).toHaveBeenCalledWith(
          undefined
        );
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledWith(
          expect.objectContaining({ clientName: 'Mozilla' })
        );
      });

      it('emits account.login when keysRequired is false, even for service=sync', async () => {
        await runTest('/passkey/authentication/finish', {
          auth: { credentials: {} },
          app: { ua: {} },
          payload: {
            ...payload,
            service: 'sync',
            keysRequired: false,
          },
        });

        expect(request.emitMetricsEvent).toHaveBeenCalledWith('account.login', {
          uid: UID,
        });
      });
    });
  });

  describe('PasskeyHandler.createPasskeySessionToken', () => {
    // Signup fields differ from the primary to prove the token seeds from the
    // current primary, not the immutable signup address on account.email.
    const mockAccount = {
      uid: UID,
      email: 'original-signup@example.com',
      emailCode: 'signup-code-000',
      emailVerified: false,
      verifierSetAt: 1234567890,
      primaryEmail: {
        email: TEST_EMAIL,
        emailCode: 'emailcode123',
        isVerified: true,
      },
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
        glean,
        mailer,
        mockOauthClientInfoService
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

      expect(result).toEqual({
        id: 'new-session-token-id',
        data: 'new-session-token-data',
      });
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

  describe('credentialId payload validation', () => {
    const VALID_CRED_ID = 'A_z-09Aa';
    const VALID_CHALLENGE = 'A_z-09';
    const VALID_AUTH_INNER = {
      clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0In0',
      authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAQ',
      signature: 'MEUCIQCx',
    };
    const VALID_REG_INNER = {
      clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0',
      attestationObject: 'o2NmbXRkbm9uZQ',
    };

    function getSchema(
      path: string,
      method: string,
      kind: 'payload' | 'params'
    ): Schema {
      const all = passkeyRoutes(
        customs,
        db,
        config,
        statsd,
        glean,
        log,
        mailer
      );
      const route = all.find(
        (r: any) => r.path === path && r.method === method
      );
      if (!route) {
        throw new Error(`Route not found: ${method} ${path}`);
      }
      // Not every passkey route declares validation, so the union of route
      // option types doesn't carry `validate`.
      const schema = (
        route.options as {
          validate?: { payload?: Schema; params?: Schema };
        }
      ).validate?.[kind];
      if (!schema) {
        throw new Error(`No ${kind} schema on route: ${method} ${path}`);
      }
      return schema;
    }

    const authPayload = (
      responseOverride: Record<string, unknown> = {},
      innerOverride: Record<string, unknown> = {},
      challenge: string = VALID_CHALLENGE
    ) => ({
      response: {
        id: VALID_CRED_ID,
        type: 'public-key',
        response: { ...VALID_AUTH_INNER, ...innerOverride },
        ...responseOverride,
      },
      challenge,
      keysRequired: false,
    });

    const regPayload = (
      responseOverride: Record<string, unknown> = {},
      innerOverride: Record<string, unknown> = {},
      challenge: string = VALID_CHALLENGE
    ) => ({
      response: {
        id: VALID_CRED_ID,
        type: 'public-key',
        response: { ...VALID_REG_INNER, ...innerOverride },
        ...responseOverride,
      },
      challenge,
    });

    describe('POST /passkey/authentication/finish', () => {
      let schema: Schema;
      beforeEach(() => {
        schema = getSchema('/passkey/authentication/finish', 'POST', 'payload');
      });

      it('accepts a well-formed assertion payload', () => {
        const { error } = schema.validate(authPayload());
        expect(error).toBeUndefined();
      });

      it('rejects a payload missing keysRequired', () => {
        const withoutKeysRequired = authPayload();
        delete (withoutKeysRequired as { keysRequired?: boolean }).keysRequired;
        const { error } = schema.validate(withoutKeysRequired);
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['keysRequired'],
            type: 'any.required',
          }),
        ]);
      });

      it.each([
        [
          'shell-injection probe shape',
          '(nslookup x.example.com||curl x.example.com)',
          'string.pattern.base',
        ],
        ['contains slash', 'A/B', 'string.pattern.base'],
        ['contains plus', 'A+B', 'string.pattern.base'],
        ['contains equals padding', 'AA==', 'string.pattern.base'],
        ['empty string', '', 'string.empty'],
      ])('rejects response.id (%s)', (_label, badId, expectedType) => {
        const { error } = schema.validate(authPayload({ id: badId }));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['response', 'id'],
            type: expectedType,
          }),
        ]);
      });

      it('rejects response.id that exceeds the max length', () => {
        const { error } = schema.validate(
          authPayload({ id: 'A'.repeat(1365) })
        );
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['response', 'id'],
            type: 'string.max',
          }),
        ]);
      });

      it('rejects a challenge longer than 64 chars', () => {
        const { error } = schema.validate(authPayload({}, {}, 'A'.repeat(65)));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['challenge'],
            type: 'string.max',
          }),
        ]);
      });

      it('rejects a non-base64url challenge', () => {
        const { error } = schema.validate(authPayload({}, {}, 'has/slash'));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['challenge'],
            type: 'string.pattern.base',
          }),
        ]);
      });

      it.each<[string, Record<string, string>]>([
        ['clientDataJSON', { clientDataJSON: 'has/slash' }],
        ['authenticatorData', { authenticatorData: 'has/slash' }],
        ['signature', { signature: 'has/slash' }],
        ['userHandle', { userHandle: 'has/slash' }],
      ])(
        'rejects a non-base64url response.response.%s',
        (field: string, innerOverride: Record<string, string>) => {
          const { error } = schema.validate(authPayload({}, innerOverride));
          expect(error?.details).toEqual([
            expect.objectContaining({
              path: ['response', 'response', field],
              type: 'string.pattern.base',
            }),
          ]);
        }
      );

      it.each<[string]>([
        ['clientDataJSON'],
        ['authenticatorData'],
        ['signature'],
      ])(
        'rejects when required response.response.%s is missing',
        (field: string) => {
          const inner: Record<string, string> = { ...VALID_AUTH_INNER };
          delete inner[field];
          const { error } = schema.validate({
            response: {
              id: VALID_CRED_ID,
              type: 'public-key',
              response: inner,
            },
            challenge: VALID_CHALLENGE,
          });
          expect(error?.details).toEqual([
            expect.objectContaining({
              path: ['response', 'response', field],
              type: 'any.required',
            }),
          ]);
        }
      );
    });

    describe('POST /passkey/registration/finish', () => {
      let schema: Schema;
      beforeEach(() => {
        schema = getSchema('/passkey/registration/finish', 'POST', 'payload');
      });

      it('accepts a well-formed attestation payload', () => {
        const { error } = schema.validate(regPayload());
        expect(error).toBeUndefined();
      });

      it('rejects a non-base64url response.id', () => {
        const { error } = schema.validate(regPayload({ id: 'has/slash' }));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['response', 'id'],
            type: 'string.pattern.base',
          }),
        ]);
      });

      it('rejects a challenge longer than 64 chars', () => {
        const { error } = schema.validate(regPayload({}, {}, 'A'.repeat(65)));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['challenge'],
            type: 'string.max',
          }),
        ]);
      });

      it('rejects a non-base64url challenge', () => {
        const { error } = schema.validate(regPayload({}, {}, 'has/slash'));
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['challenge'],
            type: 'string.pattern.base',
          }),
        ]);
      });

      it.each<[string, Record<string, string>]>([
        ['clientDataJSON', { clientDataJSON: 'has/slash' }],
        ['attestationObject', { attestationObject: 'has/slash' }],
        ['authenticatorData', { authenticatorData: 'has/slash' }],
        ['publicKey', { publicKey: 'has/slash' }],
      ])(
        'rejects a non-base64url response.response.%s',
        (field: string, innerOverride: Record<string, string>) => {
          const { error } = schema.validate(regPayload({}, innerOverride));
          expect(error?.details).toEqual([
            expect.objectContaining({
              path: ['response', 'response', field],
              type: 'string.pattern.base',
            }),
          ]);
        }
      );

      it.each<[string]>([['clientDataJSON'], ['attestationObject']])(
        'rejects when required response.response.%s is missing',
        (field: string) => {
          const inner: Record<string, string> = { ...VALID_REG_INNER };
          delete inner[field];
          const { error } = schema.validate({
            response: {
              id: VALID_CRED_ID,
              type: 'public-key',
              response: inner,
            },
            challenge: VALID_CHALLENGE,
          });
          expect(error?.details).toEqual([
            expect.objectContaining({
              path: ['response', 'response', field],
              type: 'any.required',
            }),
          ]);
        }
      );
    });

    describe('DELETE /passkey/{credentialId}', () => {
      let schema: Schema;
      beforeEach(() => {
        schema = getSchema('/passkey/{credentialId}', 'DELETE', 'params');
      });

      it('accepts a base64url credentialId', () => {
        const { error } = schema.validate({ credentialId: VALID_CRED_ID });
        expect(error).toBeUndefined();
      });

      it('rejects a non-base64url credentialId', () => {
        const { error } = schema.validate({ credentialId: 'has/slash' });
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['credentialId'],
            type: 'string.pattern.base',
          }),
        ]);
      });
    });

    describe('PATCH /passkey/{credentialId}', () => {
      let schema: Schema;
      beforeEach(() => {
        schema = getSchema('/passkey/{credentialId}', 'PATCH', 'params');
      });

      it('accepts a base64url credentialId', () => {
        const { error } = schema.validate({ credentialId: VALID_CRED_ID });
        expect(error).toBeUndefined();
      });

      it('rejects a non-base64url credentialId', () => {
        const { error } = schema.validate({ credentialId: 'has/slash' });
        expect(error?.details).toEqual([
          expect.objectContaining({
            path: ['credentialId'],
            type: 'string.pattern.base',
          }),
        ]);
      });
    });
  });

  describe('passkeyResponseSchema', () => {
    const VALID_PASSKEY = {
      credentialId: 'A_z-09Aa',
      name: 'Work laptop',
      createdAt: 1700000000000,
      lastUsedAt: null,
      transports: ['internal'],
      aaguid: 'adce0002-35bc-c60a-648b-0b25f1f05503',
      backupEligible: true,
      backupState: true,
      prfEnabled: false,
    };
    const BAD_AAGUID_PASSKEY = {
      ...VALID_PASSKEY,
      aaguid: 'adce000235bcc60a648b0b25f1f05503',
    };

    function getResponseSchema(method: string, path: string): Schema {
      const all = passkeyRoutes(
        customs,
        db,
        config,
        statsd,
        glean,
        log,
        mailer
      );
      const route = all.find(
        (r: any) => r.path === path && r.method === method
      );
      const schema = (route?.options as { response?: { schema?: Schema } })
        ?.response?.schema;
      if (!schema) {
        throw new Error(`No response schema on route: ${method} ${path}`);
      }
      return schema;
    }

    it('accepts a well-formed passkey', () => {
      const { error } = passkeyResponseSchema.validate(VALID_PASSKEY);
      expect(error).toBeUndefined();
    });

    it('rejects a non-base64url credentialId', () => {
      const { error } = passkeyResponseSchema.validate({
        ...VALID_PASSKEY,
        credentialId: 'has/slash',
      });
      expect(error?.details).toEqual([
        expect.objectContaining({
          context: expect.objectContaining({ key: 'credentialId' }),
          type: 'string.pattern.base',
        }),
      ]);
    });

    it('rejects an aaguid that is not a hyphenated UUID', () => {
      const { error } = passkeyResponseSchema.validate(BAD_AAGUID_PASSKEY);
      expect(error?.details).toEqual([
        expect.objectContaining({
          context: expect.objectContaining({ key: 'aaguid' }),
          type: 'string.pattern.base',
        }),
      ]);
    });

    // `GET /passkeys` returns an array, the other two a single object.
    const routeCases: Array<[string, string, unknown]> = [
      ['POST', '/passkey/registration/finish', BAD_AAGUID_PASSKEY],
      ['GET', '/passkeys', [BAD_AAGUID_PASSKEY]],
      ['PATCH', '/passkey/{credentialId}', BAD_AAGUID_PASSKEY],
    ];

    it.each(routeCases)(
      '%s %s validates its response against the schema',
      (method, path, response) => {
        const { error } = getResponseSchema(method, path).validate(response);
        expect(error?.details[0]).toEqual(
          expect.objectContaining({
            context: expect.objectContaining({ key: 'aaguid' }),
            type: 'string.pattern.base',
          })
        );
      }
    );
  });
});
