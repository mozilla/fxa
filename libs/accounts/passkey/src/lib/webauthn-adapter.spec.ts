/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { randomBytes } from 'crypto';
import {
  generateWebauthnRegistrationOptions,
  verifyWebauthnRegistrationResponse,
  generateWebauthnAuthenticationOptions,
  verifyWebauthnAuthenticationResponse,
} from './webauthn-adapter';
import { PasskeyConfig } from './passkey.config';
import { VirtualAuthenticator } from './virtual-authenticator';

const TEST_RP_ID = 'accounts.firefox.com';
const TEST_ORIGIN = 'https://accounts.firefox.com';

function testConfig(overrides: Partial<PasskeyConfig> = {}): PasskeyConfig {
  return new PasskeyConfig({
    enabled: true,
    rpId: TEST_RP_ID,
    allowedOrigins: [TEST_ORIGIN],
    userVerification: 'required',
    residentKey: 'preferred',
    maxPasskeysPerUser: 10,
    challengeTimeout: 30_000,
    ...overrides,
  });
}

/**
 * Full registration roundtrip returning the virtual credential (retains
 * the private key for subsequent assertions) and the stored data from
 * verifyWebauthnRegistrationResponse.
 */
async function registerCredential(config: PasskeyConfig) {
  const cred = VirtualAuthenticator.createCredential();
  const challenge = randomBytes(32).toString('base64url');

  const options = await generateWebauthnRegistrationOptions(config, {
    uid: Buffer.alloc(16, 0xaa).toString('hex'),
    email: 'test@example.com',
    challenge,
  });

  const attestation = VirtualAuthenticator.createAttestationResponse(cred, {
    challenge: options.challenge,
    origin: config.allowedOrigins[0],
    rpId: config.rpId,
  });

  const result = await verifyWebauthnRegistrationResponse(config, {
    response: attestation,
    challenge,
  });

  if (!result.verified) throw new Error('registration setup failed');
  return { cred, stored: result.data };
}

describe('generateWebauthnRegistrationOptions', () => {
  it('returns the original base64url challenge unchanged', async () => {
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnRegistrationOptions(testConfig(), {
      uid: Buffer.alloc(16, 0xaa).toString('hex'),
      email: 'test@example.com',
      challenge,
    });

    expect(options.challenge).toBe(challenge);
  });

  it('sets rp info from config', async () => {
    const options = await generateWebauthnRegistrationOptions(
      testConfig({ rpId: 'example.com' }),
      {
        uid: Buffer.alloc(16).toString('hex'),
        email: 'alice@example.com',
        challenge: randomBytes(32).toString('base64url'),
      }
    );

    expect(options.rp.id).toBe('example.com');
    expect(options.rp.name).toBe('example.com');
  });

  it('maps authenticatorSelection from config', async () => {
    const options = await generateWebauthnRegistrationOptions(
      testConfig({
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      }),
      {
        uid: Buffer.alloc(16).toString('hex'),
        email: 'alice@example.com',
        challenge: randomBytes(32).toString('base64url'),
      }
    );

    expect(options.authenticatorSelection).toEqual(
      expect.objectContaining({
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      })
    );
  });

  it('sets user name from email', async () => {
    const options = await generateWebauthnRegistrationOptions(testConfig(), {
      uid: Buffer.alloc(16, 0xbb).toString('hex'),
      email: 'bob@example.com',
      challenge: randomBytes(32).toString('base64url'),
    });

    expect(options.user.name).toBe('bob@example.com');
  });
});

describe('verifyWebauthnRegistrationResponse', () => {
  const config = testConfig();

  it('succeeds with a valid attestation and extracts credential data', async () => {
    const cred = VirtualAuthenticator.createCredential();
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnRegistrationOptions(config, {
      uid: Buffer.alloc(16, 0xaa).toString('hex'),
      email: 'test@example.com',
      challenge,
    });

    const attestation = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    const result = await verifyWebauthnRegistrationResponse(config, {
      response: attestation,
      challenge,
    });

    expect(result.verified).toBe(true);
    if (!result.verified) throw new Error('narrowing');

    expect(typeof result.data.credentialId).toBe('string');
    expect(result.data.credentialId).toBe(cred.id.toString('base64url'));
    expect(result.data.publicKey).toBeInstanceOf(Buffer);
    expect(result.data.signCount).toBe(0);
    expect(result.data.transports).toEqual(['internal']);
    expect(typeof result.data.aaguid).toBe('string');
    expect(result.data.aaguid).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.data.backupEligible).toBe(false);
    expect(result.data.backupState).toBe(false);
    expect(result.data.prfEnabled).toBe(false);
  });

  it('rejects a mismatched challenge', async () => {
    const cred = VirtualAuthenticator.createCredential();
    const realChallenge = randomBytes(32).toString('base64url');
    const wrongChallenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnRegistrationOptions(config, {
      uid: Buffer.alloc(16, 0xaa).toString('hex'),
      email: 'test@example.com',
      challenge: realChallenge,
    });

    const attestation = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    await expect(
      verifyWebauthnRegistrationResponse(config, {
        response: attestation,
        challenge: wrongChallenge,
      })
    ).rejects.toThrow();
  });

  it('rejects a wrong origin', async () => {
    const cred = VirtualAuthenticator.createCredential();
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnRegistrationOptions(config, {
      uid: Buffer.alloc(16, 0xaa).toString('hex'),
      email: 'test@example.com',
      challenge,
    });

    const attestation = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: 'https://evil.example.com',
      rpId: TEST_RP_ID,
    });

    await expect(
      verifyWebauthnRegistrationResponse(config, {
        response: attestation,
        challenge,
      })
    ).rejects.toThrow();
  });

  it('rejects a wrong rpId', async () => {
    const cred = VirtualAuthenticator.createCredential();
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnRegistrationOptions(config, {
      uid: Buffer.alloc(16, 0xaa).toString('hex'),
      email: 'test@example.com',
      challenge,
    });

    const attestation = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: 'evil.example.com',
    });

    await expect(
      verifyWebauthnRegistrationResponse(config, {
        response: attestation,
        challenge,
      })
    ).rejects.toThrow();
  });
});

describe('generateWebauthnAuthenticationOptions', () => {
  const config = testConfig();

  it('returns the original base64url challenge unchanged', async () => {
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [],
    });

    expect(options.challenge).toBe(challenge);
  });

  it('sets rpId and userVerification from config', async () => {
    const options = await generateWebauthnAuthenticationOptions(
      testConfig({ userVerification: 'discouraged' }),
      {
        challenge: randomBytes(32).toString('base64url'),
        allowCredentials: [],
      }
    );

    expect(options.rpId).toBe(TEST_RP_ID);
    expect(options.userVerification).toBe('discouraged');
  });

  it('omits allowCredentials for discoverable flow (empty input)', async () => {
    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge: randomBytes(32).toString('base64url'),
      allowCredentials: [],
    });

    expect(options.allowCredentials).toBeUndefined();
  });

  it('passes base64url credential IDs through to allow-list entries', async () => {
    const credId = Buffer.from('helloworld').toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge: randomBytes(32).toString('base64url'),
      allowCredentials: [credId],
    });

    expect(options.allowCredentials).toEqual([
      expect.objectContaining({ id: credId }),
    ]);
  });
});

describe('verifyWebauthnAuthenticationResponse', () => {
  const config = testConfig();

  it('succeeds with a valid assertion after registration', async () => {
    const { cred, stored } = await registerCredential(config);
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    const result = await verifyWebauthnAuthenticationResponse(config, {
      response: assertion,
      challenge,
      credentialId: stored.credentialId,
      publicKey: stored.publicKey,
      signCount: stored.signCount,
    });

    expect(result.verified).toBe(true);
    if (!result.verified) throw new Error('narrowing');
    expect(result.data.newSignCount).toBe(1);
    expect(result.data.backupState).toBe(false);
  });

  it('tracks incrementing sign counts across assertions', async () => {
    const { cred, stored } = await registerCredential(config);
    let currentSignCount = stored.signCount;

    for (const expectedCount of [1, 2, 3]) {
      const challenge = randomBytes(32).toString('base64url');
      const options = await generateWebauthnAuthenticationOptions(config, {
        challenge,
        allowCredentials: [stored.credentialId],
      });
      const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
        challenge: options.challenge,
        origin: TEST_ORIGIN,
        rpId: TEST_RP_ID,
      });
      const result = await verifyWebauthnAuthenticationResponse(config, {
        response: assertion,
        challenge,
        credentialId: stored.credentialId,
        publicKey: stored.publicKey,
        signCount: currentSignCount,
      });

      expect(result.verified).toBe(true);
      expect(result.data?.newSignCount).toBe(expectedCount);
      if (!result.data) throw Error('narrowing');
      currentSignCount = result.data.newSignCount;
    }
  });

  it('rejects when sign count does not increase', async () => {
    const { cred, stored } = await registerCredential(config);
    stored.signCount += 1;
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    await expect(
      verifyWebauthnAuthenticationResponse(config, {
        response: assertion,
        challenge,
        credentialId: stored.credentialId,
        publicKey: stored.publicKey,
        signCount: stored.signCount,
      })
    ).rejects.toThrow();
  });

  it('accepts sign count 0 -> 0', async () => {
    const { cred, stored } = await registerCredential(config);

    // Set to -1 so that createAssertionResponse's pre-increment emits 0
    cred.signCount = -1;
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    const result = await verifyWebauthnAuthenticationResponse(config, {
      response: assertion,
      challenge,
      credentialId: stored.credentialId,
      publicKey: stored.publicKey,
      signCount: 0,
    });

    expect(result.verified).toBe(true);
  });

  it('rejects a mismatched challenge', async () => {
    const { cred, stored } = await registerCredential(config);
    const realChallenge = randomBytes(32).toString('base64url');
    const wrongChallenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge: realChallenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: TEST_RP_ID,
    });

    await expect(
      verifyWebauthnAuthenticationResponse(config, {
        response: assertion,
        challenge: wrongChallenge,
        credentialId: stored.credentialId,
        publicKey: stored.publicKey,
        signCount: stored.signCount,
      })
    ).rejects.toThrow();
  });

  it('rejects a wrong origin', async () => {
    const { cred, stored } = await registerCredential(config);
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: 'https://evil.example.com',
      rpId: TEST_RP_ID,
    });

    await expect(
      verifyWebauthnAuthenticationResponse(config, {
        response: assertion,
        challenge,
        credentialId: stored.credentialId,
        publicKey: stored.publicKey,
        signCount: stored.signCount,
      })
    ).rejects.toThrow();
  });

  it('rejects a wrong rpId', async () => {
    const { cred, stored } = await registerCredential(config);
    const challenge = randomBytes(32).toString('base64url');

    const options = await generateWebauthnAuthenticationOptions(config, {
      challenge,
      allowCredentials: [stored.credentialId],
    });

    const assertion = VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin: TEST_ORIGIN,
      rpId: 'evil.example.com',
    });

    await expect(
      verifyWebauthnAuthenticationResponse(config, {
        response: assertion,
        challenge,
        credentialId: stored.credentialId,
        publicKey: stored.publicKey,
        signCount: stored.signCount,
      })
    ).rejects.toThrow();
  });
});
