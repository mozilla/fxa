/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { PasskeyConfig } from './passkey.config';
import { PasskeyService } from './passkey.service';
import { PasskeyManager } from './passkey.manager';
import { PasskeyChallengeManager } from './passkey.challenge.manager';
import { AppError } from '@fxa/accounts/errors';

jest.mock('./webauthn-adapter', () => ({
  generateRegistrationOptions: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
  generateAuthenticationOptions: jest.fn(),
  verifyAuthenticationResponse: jest.fn(),
}));

import * as webauthnAdapter from './webauthn-adapter';

const mockGenerateRegistrationOptions =
  webauthnAdapter.generateRegistrationOptions as jest.Mock;
const mockVerifyRegistrationResponse =
  webauthnAdapter.verifyRegistrationResponse as jest.Mock;

describe('PasskeyService', () => {
  let service: PasskeyService;

  const MOCK_UID = Buffer.alloc(16, 0xaa);
  const MOCK_USER_NAME = 'user@example.com';
  const MOCK_CHALLENGE = 'mock-challenge-base64url';
  const MOCK_CREDENTIAL_ID = Buffer.alloc(32, 0xbb);
  const MOCK_PUBLIC_KEY = Buffer.alloc(64, 0xcc);
  const MOCK_AAGUID_ZEROS = Buffer.alloc(16, 0x00);

  const mockPasskey = {
    uid: MOCK_UID,
    credentialId: MOCK_CREDENTIAL_ID,
    publicKey: MOCK_PUBLIC_KEY,
    signCount: 5,
    backupState: false,
    backupEligible: false,
    prfEnabled: false,
    name: 'Test Passkey',
    createdAt: Date.now(),
    lastUsedAt: null,
    transports: '[]',
    aaguid: Buffer.alloc(16),
  };

  const mockResponse: AuthenticationResponseJSON = {
    id: MOCK_CREDENTIAL_ID.toString('base64url'),
    rawId: MOCK_CREDENTIAL_ID.toString('base64url'),
    response: {
      authenticatorData: 'mock-auth-data',
      clientDataJSON: 'mock-client-data-json',
      signature: 'mock-signature',
    },
    type: 'public-key',
    clientExtensionResults: {},
  };

  const mockStoredChallenge = {
    challenge: MOCK_CHALLENGE,
    type: 'authentication' as const,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60000,
  };

  const mockManager = {
    checkPasskeyCount: jest.fn(),
    registerPasskey: jest.fn(),
    listPasskeysForUser: jest.fn(),
    findPasskeyByCredentialId: jest.fn(),
    updatePasskeyAfterAuth: jest.fn(),
  };

  const mockChallengeManager = {
    generateRegistrationChallenge: jest.fn(),
    consumeRegistrationChallenge: jest.fn(),
    generateAuthenticationChallenge: jest.fn(),
    consumeAuthenticationChallenge: jest.fn(),
  };

  const mockMetrics = {
    increment: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockConfig = Object.assign(new PasskeyConfig(), {
    rpId: 'accounts.firefox.com',
    allowedOrigins: ['https://accounts.firefox.com'],
    challengeTimeout: 60000,
    maxPasskeysPerUser: 10,
    userVerification: 'required',
    residentKey: 'required',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasskeyService,
        { provide: PasskeyManager, useValue: mockManager },
        { provide: PasskeyChallengeManager, useValue: mockChallengeManager },
        { provide: PasskeyConfig, useValue: mockConfig },
        { provide: StatsDService, useValue: mockMetrics },
        { provide: LOGGER_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get(PasskeyService);
  });

  describe('generateRegistrationChallenge', () => {
    const mockWebAuthnOptions: PublicKeyCredentialCreationOptionsJSON = {
      rp: { name: 'accounts.firefox.com', id: 'accounts.firefox.com' },
      user: {
        id: 'mock-user-id',
        name: 'user@example.com',
        displayName: 'user@example.com',
      },
      challenge: MOCK_CHALLENGE,
      pubKeyCredParams: [],
      timeout: 60000,
      attestation: 'none',
    } as unknown as PublicKeyCredentialCreationOptionsJSON;

    beforeEach(() => {
      mockManager.checkPasskeyCount.mockResolvedValue(undefined);
      mockChallengeManager.generateRegistrationChallenge.mockResolvedValue(
        MOCK_CHALLENGE
      );
      mockGenerateRegistrationOptions.mockResolvedValue(mockWebAuthnOptions);
    });

    it('returns PublicKeyCredentialCreationOptionsJSON from the adapter', async () => {
      const result = await service.generateRegistrationChallenge(
        MOCK_UID,
        MOCK_USER_NAME
      );
      expect(result).toBe(mockWebAuthnOptions);
    });

    it('calls passkeyManager.checkPasskeyCount with uid before generating challenge', async () => {
      await service.generateRegistrationChallenge(MOCK_UID, MOCK_USER_NAME);
      expect(mockManager.checkPasskeyCount).toHaveBeenCalledWith(MOCK_UID);

      const [checkCallOrder] =
        mockManager.checkPasskeyCount.mock.invocationCallOrder;
      const [generateChallengeCallOrder] =
        mockChallengeManager.generateRegistrationChallenge.mock
          .invocationCallOrder;
      expect(checkCallOrder).toBeLessThan(generateChallengeCallOrder);
    });

    it('passes correct arguments to challengeManager and adapter', async () => {
      await service.generateRegistrationChallenge(MOCK_UID, MOCK_USER_NAME);

      expect(
        mockChallengeManager.generateRegistrationChallenge
      ).toHaveBeenCalledWith(MOCK_UID.toString('hex'));

      expect(mockGenerateRegistrationOptions).toHaveBeenCalledWith(
        mockConfig,
        expect.objectContaining({
          uid: MOCK_UID,
          email: MOCK_USER_NAME,
          challenge: MOCK_CHALLENGE,
        })
      );
    });
  });

  describe('createPasskeyFromRegistrationResponse', () => {
    const mockResponse = {} as unknown as RegistrationResponseJSON;

    const mockVerifiedData = {
      credentialId: MOCK_CREDENTIAL_ID,
      publicKey: MOCK_PUBLIC_KEY,
      signCount: 0,
      transports: ['internal'] as any,
      aaguid: MOCK_AAGUID_ZEROS,
      backupEligible: false,
      backupState: false,
    };

    beforeEach(() => {
      mockChallengeManager.consumeRegistrationChallenge.mockResolvedValue({
        challenge: MOCK_CHALLENGE,
        type: 'registration',
        uid: MOCK_UID.toString('hex'),
        createdAt: Date.now() - 1000,
        expiresAt: Date.now() + 299000,
      });
      mockVerifyRegistrationResponse.mockResolvedValue({
        verified: true,
        data: mockVerifiedData,
      });
      mockManager.registerPasskey.mockResolvedValue(undefined);
      mockManager.listPasskeysForUser.mockResolvedValue([]);
    });

    it('throws passkeyChallengeNotFound AppError and does not call adapter when challenge is invalid', async () => {
      mockChallengeManager.consumeRegistrationChallenge.mockResolvedValue(null);
      await expect(
        service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toMatchObject({
        errno: 229,
        message: 'Passkey challenge not found',
        code: 404,
      });
      expect(mockVerifyRegistrationResponse).not.toHaveBeenCalled();
    });

    it('throws passkeyRegistrationFailed AppError when adapter returns verified: false', async () => {
      mockVerifyRegistrationResponse.mockResolvedValue({ verified: false });
      await expect(
        service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toMatchObject({
        errno: 228,
        message: 'Passkey registration failed',
        code: 500,
      });
    });

    it('throws passkeyRegistrationFailed AppError when adapter throws', async () => {
      mockVerifyRegistrationResponse.mockRejectedValue(
        new Error('Invalid attestation format')
      );
      await expect(
        service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toMatchObject({
        errno: 228,
        message: 'Passkey registration failed',
        code: 500,
      });
    });

    it('calls challengeManager.consumeRegistrationChallenge with challenge and uid', async () => {
      await service.createPasskeyFromRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(
        mockChallengeManager.consumeRegistrationChallenge
      ).toHaveBeenCalledWith(MOCK_CHALLENGE, MOCK_UID.toString('hex'));
    });

    it('calls passkeyManager.registerPasskey with correct NewPasskey shape', async () => {
      await service.createPasskeyFromRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );

      expect(mockManager.registerPasskey).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: MOCK_UID,
          credentialId: MOCK_CREDENTIAL_ID,
          publicKey: MOCK_PUBLIC_KEY,
          signCount: 0,
          transports: JSON.stringify(['internal']),
          aaguid: MOCK_AAGUID_ZEROS,
          lastUsedAt: null,
          backupEligible: 0,
          backupState: 0,
        })
      );
    });

    it('sets backupEligible=1 and backupState=1 when flags are true', async () => {
      mockVerifyRegistrationResponse.mockResolvedValue({
        verified: true,
        data: { ...mockVerifiedData, backupEligible: true, backupState: true },
      });
      await service.createPasskeyFromRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );

      expect(mockManager.registerPasskey).toHaveBeenCalledWith(
        expect.objectContaining({ backupEligible: 1, backupState: 1 })
      );
    });

    it('emits correct metrics and logs on success', async () => {
      await service.createPasskeyFromRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'passkey.registration.success'
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'passkey.registered',
        expect.objectContaining({ uid: MOCK_UID.toString('hex') })
      );
    });

    it('propagates PasskeyAlreadyRegisteredError from registerPasskey without wrapping', async () => {
      mockManager.registerPasskey.mockRejectedValue(
        AppError.passkeyAlreadyRegistered()
      );

      await expect(
        service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(AppError.passkeyAlreadyRegistered());
    });

    it('propagates passkeyLimitReached AppError from registerPasskey without wrapping', async () => {
      mockManager.registerPasskey.mockRejectedValue(
        AppError.passkeyLimitReached(1)
      );

      await expect(
        service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toMatchObject(AppError.passkeyLimitReached(1));
    });

    describe('passkey name generation (via createPasskeyFromRegistrationResponse)', () => {
      async function getRegisteredPasskeyName(
        transports: string[],
        aaguid: Buffer = MOCK_AAGUID_ZEROS
      ): Promise<string> {
        mockVerifyRegistrationResponse.mockResolvedValue({
          verified: true,
          data: { ...mockVerifiedData, transports, aaguid },
        });
        await service.createPasskeyFromRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        );
        const call = mockManager.registerPasskey.mock.calls[0][0];
        return call.name;
      }

      it('returns "Platform Passkey" for transport ["internal"]', async () => {
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey'
        );
      });

      it('returns "Security Key" for transport ["usb"]', async () => {
        expect(await getRegisteredPasskeyName(['usb'])).toBe('Security Key');
      });

      it('returns "NFC Security Key" for transport ["nfc"]', async () => {
        expect(await getRegisteredPasskeyName(['nfc'])).toBe(
          'NFC Security Key'
        );
      });

      it.each([
        { transports: ['hybrid'], label: 'hybrid' },
        { transports: ['usb', 'nfc'], label: 'mixed/multiple transports' },
        { transports: [] as string[], label: 'empty transports array' },
        { transports: ['ble'], label: 'unknown single transport' },
      ])('returns "Passkey" for $label', async ({ transports }) => {
        expect(await getRegisteredPasskeyName(transports)).toBe('Passkey');
      });

      it('appends " 2" when a passkey with the same base name already exists', async () => {
        mockManager.listPasskeysForUser.mockResolvedValue([
          { name: 'Platform Passkey' },
        ]);
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey 2'
        );
      });

      it('appends " 3" when base name and " 2" both exist', async () => {
        mockManager.listPasskeysForUser.mockResolvedValue([
          { name: 'Platform Passkey' },
          { name: 'Platform Passkey 2' },
        ]);
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey 3'
        );
      });

      it('does not enumerate when existing passkeys have a different base name', async () => {
        mockManager.listPasskeysForUser.mockResolvedValue([
          { name: 'Security Key' },
          { name: 'Security Key 2' },
        ]);
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey'
        );
      });

      it('increments past the highest suffix, never reuses a gap left by a rename', async () => {
        mockManager.listPasskeysForUser.mockResolvedValue([
          { name: 'Platform Passkey' },
          { name: 'Platform Passkey 3' },
        ]);
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey 4'
        );
      });

      it('ignores user-renamed passkeys when computing the next suffix', async () => {
        mockManager.listPasskeysForUser.mockResolvedValue([
          { name: 'Platform Passkey' },
          { name: 'My Yubikey' },
        ]);
        expect(await getRegisteredPasskeyName(['internal'])).toBe(
          'Platform Passkey 2'
        );
      });
    });
  });

  describe('generateAuthenticationChallenge', () => {
    const mockOptions = {
      challenge: MOCK_CHALLENGE,
      allowCredentials: [],
      timeout: 60000,
      rpId: 'accounts.firefox.com',
      userVerification: 'required',
    };

    beforeEach(() => {
      mockChallengeManager.generateAuthenticationChallenge.mockResolvedValue(
        MOCK_CHALLENGE
      );
      (
        webauthnAdapter.generateAuthenticationOptions as jest.Mock
      ).mockResolvedValue(mockOptions);
    });

    it('returns WebAuthn authentication options', async () => {
      const result = await service.generateAuthenticationChallenge();
      expect(result).toBe(mockOptions);
    });

    it('generates a challenge via ChallengeManager', async () => {
      await service.generateAuthenticationChallenge();
      expect(
        mockChallengeManager.generateAuthenticationChallenge
      ).toHaveBeenCalledTimes(1);
    });

    it('calls generateAuthenticationOptions with empty allowCredentials when no uid', async () => {
      await service.generateAuthenticationChallenge();
      expect(
        webauthnAdapter.generateAuthenticationOptions
      ).toHaveBeenCalledWith(mockConfig, {
        challenge: MOCK_CHALLENGE,
        allowCredentials: [],
      });
    });

    it('does not call listPasskeysForUser when uid is not provided', async () => {
      await service.generateAuthenticationChallenge();
      expect(mockManager.listPasskeysForUser).not.toHaveBeenCalled();
    });

    it('includes user credential IDs in allowCredentials when uid is provided', async () => {
      mockManager.listPasskeysForUser.mockResolvedValue([mockPasskey]);

      await service.generateAuthenticationChallenge(MOCK_UID);

      expect(mockManager.listPasskeysForUser).toHaveBeenCalledWith(MOCK_UID);
      expect(
        webauthnAdapter.generateAuthenticationOptions
      ).toHaveBeenCalledWith(mockConfig, {
        challenge: MOCK_CHALLENGE,
        allowCredentials: [MOCK_CREDENTIAL_ID],
      });
    });

    it('passes empty allowCredentials when user has no passkeys', async () => {
      mockManager.listPasskeysForUser.mockResolvedValue([]);

      await service.generateAuthenticationChallenge(MOCK_UID);

      expect(
        webauthnAdapter.generateAuthenticationOptions
      ).toHaveBeenCalledWith(mockConfig, {
        challenge: MOCK_CHALLENGE,
        allowCredentials: [],
      });
    });
  });

  describe('verifyAuthenticationResponse', () => {
    beforeEach(() => {
      mockManager.findPasskeyByCredentialId.mockResolvedValue(mockPasskey);
      mockChallengeManager.consumeAuthenticationChallenge.mockResolvedValue(
        mockStoredChallenge
      );
      mockManager.updatePasskeyAfterAuth.mockResolvedValue(true);
      (
        webauthnAdapter.verifyAuthenticationResponse as jest.Mock
      ).mockResolvedValue({
        verified: true,
        data: { newSignCount: 6, backupState: false },
      });
    });

    it('returns uid on successful verification', async () => {
      const result = await service.verifyAuthenticationResponse(
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(result).toEqual({ uid: MOCK_UID });
    });

    it('looks up passkey by credential ID decoded from response.id', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(mockManager.findPasskeyByCredentialId).toHaveBeenCalledWith(
        MOCK_CREDENTIAL_ID
      );
    });

    it('validates the challenge as authentication type', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(
        mockChallengeManager.consumeAuthenticationChallenge
      ).toHaveBeenCalledWith(MOCK_CHALLENGE);
    });

    it('calls verifyAuthenticationResponse adapter with correct passkey data', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(webauthnAdapter.verifyAuthenticationResponse).toHaveBeenCalledWith(
        mockConfig,
        {
          response: mockResponse,
          challenge: MOCK_CHALLENGE,
          credentialId: mockPasskey.credentialId,
          publicKey: mockPasskey.publicKey,
          signCount: mockPasskey.signCount,
        }
      );
    });

    it('updates passkey with new signCount and backupState after verification', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(mockManager.updatePasskeyAfterAuth).toHaveBeenCalledWith(
        MOCK_UID,
        MOCK_CREDENTIAL_ID,
        6,
        false
      );
    });

    it('increments the authentication success metric', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'passkey.authentication.success'
      );
    });

    it('logs a security event on success', async () => {
      await service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'passkey.authenticated',
        expect.objectContaining({ uid: MOCK_UID.toString('hex') })
      );
    });

    it('succeeds when expectedUid matches the passkey owner', async () => {
      const result = await service.verifyAuthenticationResponse(
        mockResponse,
        MOCK_CHALLENGE,
        MOCK_UID
      );
      expect(result).toEqual({ uid: MOCK_UID });
    });

    it('throws a passkeyNotFound AppError when the credential is not registered', async () => {
      mockManager.findPasskeyByCredentialId.mockResolvedValue(undefined);

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 224 });
    });

    it('throws a passkeyChallengeNotFound AppError when the challenge is not found or expired', async () => {
      mockChallengeManager.consumeAuthenticationChallenge.mockResolvedValue(
        null
      );

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 229 });
    });

    it('throws a passkeyAuthenticationFailed AppError when the assertion is not verified', async () => {
      (
        webauthnAdapter.verifyAuthenticationResponse as jest.Mock
      ).mockResolvedValue({ verified: false });

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 227 });
    });

    it('throws a passkeyAuthenticationFailed AppError when the adapter throws', async () => {
      (
        webauthnAdapter.verifyAuthenticationResponse as jest.Mock
      ).mockRejectedValue(new Error('crypto error'));

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 227 });
    });

    it('throws a passkeyAuthenticationFailed AppError when expectedUid does not match the passkey owner', async () => {
      const wrongUid = Buffer.from('0000000000000000', 'hex');

      await expect(
        service.verifyAuthenticationResponse(
          mockResponse,
          MOCK_CHALLENGE,
          wrongUid
        )
      ).rejects.toMatchObject({ errno: 227 });

      // do not consumeAuthenticationChallenge when uid does not match, so the challenge is not burned.
      expect(
        mockChallengeManager.consumeAuthenticationChallenge
      ).not.toHaveBeenCalled();
    });

    it('logs a signCount rollback warning when simplewebauthn throws a counter error', async () => {
      (
        webauthnAdapter.verifyAuthenticationResponse as jest.Mock
      ).mockRejectedValue(
        // Exact message thrown by @simplewebauthn/server
        new Error('Response counter value 2 was lower than expected 5')
      );

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 227 });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'passkey.signCount.rollback',
        expect.objectContaining({
          uid: MOCK_UID.toString('hex'),
          credentialId: MOCK_CREDENTIAL_ID.toString('hex'),
          oldCount: mockPasskey.signCount,
        })
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'passkey.signCount.rollback'
      );
    });

    it('does not log a rollback warning for non-counter adapter errors', async () => {
      (
        webauthnAdapter.verifyAuthenticationResponse as jest.Mock
      ).mockRejectedValue(new Error('Invalid signature'));

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 227 });

      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        'passkey.signCount.rollback',
        expect.anything()
      );
      expect(mockMetrics.increment).not.toHaveBeenCalledWith(
        'passkey.signCount.rollback'
      );
    });

    it('throws a passkeyAuthenticationFailed AppError and logs when updatePasskeyAfterAuth returns false', async () => {
      mockManager.updatePasskeyAfterAuth.mockResolvedValue(false);

      await expect(
        service.verifyAuthenticationResponse(mockResponse, MOCK_CHALLENGE)
      ).rejects.toMatchObject({ errno: 227 });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'passkey.updateAfterAuth.failed',
        expect.objectContaining({
          uid: MOCK_UID.toString('hex'),
          credentialId: MOCK_CREDENTIAL_ID.toString('hex'),
          newSignCount: 6,
        })
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'passkey.authentication.failed',
        { reason: 'updateFailed' }
      );
    });
  });
});
