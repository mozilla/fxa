/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Integration tests for the webauthn-adapter that exercise the real
 * @simplewebauthn/server library (no mocking). A minimal virtual
 * authenticator builds valid "none"-format attestation responses so
 * we can verify the full challenge roundtrip through generate → verify.
 */

import { randomBytes } from 'crypto';
import {
  generateWebauthnRegistrationOptions,
  verifyWebauthnRegistrationResponse,
} from './webauthn-adapter';
import { PasskeyConfig } from './passkey.config';
import { VirtualAuthenticator } from './virtual-authenticator';

const TEST_RP_ID = 'accounts.firefox.com';
const TEST_ORIGIN = 'https://accounts.firefox.com';

function testConfig(): PasskeyConfig {
  return new PasskeyConfig({
    enabled: true,
    rpId: TEST_RP_ID,
    allowedOrigins: [TEST_ORIGIN],
    maxPasskeysPerUser: 10,
    challengeTimeout: 30_000,
    userVerification: 'required',
    residentKey: 'required',
  });
}

describe('webauthn-adapter (real @simplewebauthn/server)', () => {
  const config = testConfig();

  describe('challenge roundtrip', () => {
    it('generateWebauthnRegistrationOptions returns the original base64url challenge unchanged', async () => {
      const challenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge,
      });

      expect(options.challenge).toBe(challenge);
    });

    it('verifyWebauthnRegistrationResponse succeeds when the challenge matches', async () => {
      const cred = VirtualAuthenticator.createCredential();
      const challenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge,
      });

      const response = VirtualAuthenticator.createAttestationResponse(cred, {
        challenge: options.challenge,
        origin: TEST_ORIGIN,
        rpId: TEST_RP_ID,
      });

      const result = await verifyWebauthnRegistrationResponse(config, {
        response,
        challenge,
      });

      expect(result.verified).toBe(true);
      if (!result.verified) throw new Error('narrowing');
      expect(result.data.credentialId).toBeInstanceOf(Buffer);
      expect(result.data.publicKey).toBeInstanceOf(Buffer);
      expect(result.data.signCount).toBe(0);
      expect(result.data.aaguid).toBeInstanceOf(Buffer);
      expect(result.data.aaguid.length).toBe(16);
    });

    it('verifyWebauthnRegistrationResponse rejects a mismatched challenge', async () => {
      const cred = VirtualAuthenticator.createCredential();
      const realChallenge = randomBytes(32).toString('base64url');
      const wrongChallenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge: realChallenge,
      });

      const response = VirtualAuthenticator.createAttestationResponse(cred, {
        challenge: options.challenge,
        origin: TEST_ORIGIN,
        rpId: TEST_RP_ID,
      });

      // Verify with a different challenge — should fail
      await expect(
        verifyWebauthnRegistrationResponse(config, {
          response,
          challenge: wrongChallenge,
        })
      ).rejects.toThrow();
    });

    it('verifyWebauthnRegistrationResponse rejects a wrong origin', async () => {
      const cred = VirtualAuthenticator.createCredential();
      const challenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge,
      });

      const response = VirtualAuthenticator.createAttestationResponse(cred, {
        challenge: options.challenge,
        origin: 'https://evil.example.com',
        rpId: TEST_RP_ID,
      });

      await expect(
        verifyWebauthnRegistrationResponse(config, { response, challenge })
      ).rejects.toThrow();
    });

    it('verifyWebauthnRegistrationResponse rejects a wrong rpId', async () => {
      const cred = VirtualAuthenticator.createCredential();
      const challenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge,
      });

      const response = VirtualAuthenticator.createAttestationResponse(cred, {
        challenge: options.challenge,
        origin: TEST_ORIGIN,
        rpId: 'evil.example.com',
      });

      await expect(
        verifyWebauthnRegistrationResponse(config, { response, challenge })
      ).rejects.toThrow();
    });
  });

  describe('credential data extraction', () => {
    it('extracts transports and backup flags from a verified response', async () => {
      const cred = VirtualAuthenticator.createCredential();
      const challenge = randomBytes(32).toString('base64url');

      const options = await generateWebauthnRegistrationOptions(config, {
        uid: Buffer.alloc(16, 0xaa),
        email: 'test@example.com',
        challenge,
      });

      const response = VirtualAuthenticator.createAttestationResponse(cred, {
        challenge: options.challenge,
        origin: TEST_ORIGIN,
        rpId: TEST_RP_ID,
      });

      const result = await verifyWebauthnRegistrationResponse(config, {
        response,
        challenge,
      });

      expect(result.verified).toBe(true);
      if (!result.verified) throw new Error('narrowing');
      expect(result.data.credentialId.equals(cred.id)).toBe(true);
      expect(result.data.transports).toEqual(['internal']);
      expect(typeof result.data.backupEligible).toBe('boolean');
      expect(typeof result.data.backupState).toBe('boolean');
    });
  });
});
