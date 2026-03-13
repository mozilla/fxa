/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
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
import {
  PasskeyAlreadyRegisteredError,
  PasskeyChallengeExpiredError,
  PasskeyLimitReachedError,
  PasskeyRegistrationFailedError,
} from './passkey.errors';

jest.mock('./webauthn-adapter', () => ({
  generateRegistrationOptions: jest.fn(),
  verifyRegistrationResponse: jest.fn(),
}));

import * as webauthnAdapter from './webauthn-adapter';

const mockGenerateRegistrationOptions =
  webauthnAdapter.generateRegistrationOptions as jest.Mock;
const mockVerifyRegistrationResponse =
  webauthnAdapter.verifyRegistrationResponse as jest.Mock;

describe('PasskeyService', () => {
  let service: PasskeyService;
  let manager: PasskeyManager;
  let config: PasskeyConfig;

  const MOCK_UID = Buffer.alloc(16, 0xaa);
  const MOCK_USER_NAME = 'user@example.com';
  const MOCK_CHALLENGE = 'mock-challenge-base64url';
  const MOCK_CREDENTIAL_ID = Buffer.alloc(32, 0xbb);
  const MOCK_PUBLIC_KEY = Buffer.alloc(64, 0xcc);
  const MOCK_AAGUID_ZEROS = Buffer.alloc(16, 0x00);
  const MOCK_AAGUID_NON_ZERO = Buffer.alloc(16, 0x01);

  const mockManager = {
    checkPasskeyCount: jest.fn(),
    registerPasskey: jest.fn(),
  };

  const mockChallengeManager = {
    generateRegistrationChallenge: jest.fn(),
    validateChallenge: jest.fn(),
  };

  const mockMetrics = {
    increment: jest.fn(),
    timing: jest.fn(),
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
    manager = module.get(PasskeyManager);
    config = module.get(PasskeyConfig);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should inject PasskeyManager', () => {
    expect(manager).toBeDefined();
    expect(manager).toBe(mockManager);
  });

  it('should inject PasskeyConfig', () => {
    expect(config).toBeDefined();
    expect(config).toBe(mockConfig);
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

    it('calls challengeManager.generateRegistrationChallenge with hex-encoded uid', async () => {
      await service.generateRegistrationChallenge(MOCK_UID, MOCK_USER_NAME);
      expect(
        mockChallengeManager.generateRegistrationChallenge
      ).toHaveBeenCalledWith({
        uid: MOCK_UID.toString('hex'),
      });
    });

    it('calls generateRegistrationOptions with config, uid, email, and challenge', async () => {
      await service.generateRegistrationChallenge(MOCK_UID, MOCK_USER_NAME);
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

  describe('verifyRegistrationResponse', () => {
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
      mockChallengeManager.validateChallenge.mockResolvedValue({
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
    });

    it('throws PasskeyChallengeExpiredError when validateChallenge returns null', async () => {
      mockChallengeManager.validateChallenge.mockResolvedValue(null);
      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyChallengeExpiredError);
    });

    it('does not call adapter when challenge is invalid', async () => {
      mockChallengeManager.validateChallenge.mockResolvedValue(null);
      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyChallengeExpiredError);

      expect(mockVerifyRegistrationResponse).not.toHaveBeenCalled();
    });

    it('throws PasskeyRegistrationFailedError when adapter returns verified: false', async () => {
      mockVerifyRegistrationResponse.mockResolvedValue({ verified: false });
      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyRegistrationFailedError);
    });

    it('throws PasskeyRegistrationFailedError when adapter throws', async () => {
      mockVerifyRegistrationResponse.mockRejectedValue(
        new Error('Invalid attestation format')
      );
      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyRegistrationFailedError);
    });

    it('calls challengeManager.validateChallenge with challenge and type registration', async () => {
      await service.verifyRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(mockChallengeManager.validateChallenge).toHaveBeenCalledWith(
        MOCK_CHALLENGE,
        'registration'
      );
    });

    it('calls passkeyManager.registerPasskey with correct NewPasskey shape', async () => {
      await service.verifyRegistrationResponse(
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
      await service.verifyRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );

      expect(mockManager.registerPasskey).toHaveBeenCalledWith(
        expect.objectContaining({ backupEligible: 1, backupState: 1 })
      );
    });

    it('defaults transports to [] when adapter returns undefined transports', async () => {
      mockVerifyRegistrationResponse.mockResolvedValue({
        verified: true,
        data: { ...mockVerifiedData, transports: undefined },
      });
      await service.verifyRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );

      expect(mockManager.registerPasskey).toHaveBeenCalledWith(
        expect.objectContaining({ transports: JSON.stringify([]) })
      );
    });

    it('increments passkey.registration.success metric on success', async () => {
      await service.verifyRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        'passkey.registration.success'
      );
    });

    it('logs passkey.registered security event with uid on success', async () => {
      await service.verifyRegistrationResponse(
        MOCK_UID,
        mockResponse,
        MOCK_CHALLENGE
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'passkey.registered',
        expect.objectContaining({ uid: MOCK_UID.toString('hex') })
      );
    });

    it('propagates PasskeyAlreadyRegisteredError from registerPasskey without wrapping', async () => {
      const error = new PasskeyAlreadyRegisteredError({
        uid: MOCK_UID.toString('hex'),
      });
      mockManager.registerPasskey.mockRejectedValue(error);

      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyAlreadyRegisteredError);
    });

    it('propagates PasskeyLimitReachedError from registerPasskey without wrapping', async () => {
      const error = new PasskeyLimitReachedError({
        uid: MOCK_UID.toString('hex'),
      });
      mockManager.registerPasskey.mockRejectedValue(error);

      await expect(
        service.verifyRegistrationResponse(
          MOCK_UID,
          mockResponse,
          MOCK_CHALLENGE
        )
      ).rejects.toThrow(PasskeyLimitReachedError);
    });

    describe('passkey name generation (via verifyRegistrationResponse)', () => {
      async function getRegisteredPasskeyName(
        transports: string[],
        aaguid: Buffer = MOCK_AAGUID_ZEROS
      ): Promise<string> {
        mockVerifyRegistrationResponse.mockResolvedValue({
          verified: true,
          data: { ...mockVerifiedData, transports, aaguid },
        });
        await service.verifyRegistrationResponse(
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

      it('returns "Passkey" for transport ["hybrid"]', async () => {
        expect(await getRegisteredPasskeyName(['hybrid'])).toBe('Passkey');
      });

      it('returns "Passkey" for mixed/multiple transports', async () => {
        expect(await getRegisteredPasskeyName(['usb', 'nfc'])).toBe('Passkey');
      });

      it('returns "Passkey" for empty transports array', async () => {
        expect(await getRegisteredPasskeyName([])).toBe('Passkey');
      });

      it('uses transport-based fallback for non-zero AAGUID (no MDS implemented)', async () => {
        expect(
          await getRegisteredPasskeyName(['internal'], MOCK_AAGUID_NON_ZERO)
        ).toBe('Platform Passkey');
      });

      it('uses transport-based fallback for all-zeros AAGUID', async () => {
        expect(await getRegisteredPasskeyName(['usb'], MOCK_AAGUID_ZEROS)).toBe(
          'Security Key'
        );
      });

      it('returns "Passkey" as final fallback for unknown single transport', async () => {
        expect(await getRegisteredPasskeyName(['ble'])).toBe('Passkey');
      });
    });
  });
});
