/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Minimal virtual WebAuthn authenticator for tests.
 *
 * Builds cryptographically valid "none"-format attestation and signed
 * assertion responses so that tests can exercise the real
 * @simplewebauthn/server library without a browser.
 */

import {
  createHash,
  createSign,
  generateKeyPairSync,
  randomBytes,
  type KeyObject,
} from 'crypto';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';

// ---------------------------------------------------------------------------
// Minimal CBOR encoder – just enough for attestationObject + COSE keys
// ---------------------------------------------------------------------------

function cborEncodeLength(majorType: number, length: number): Buffer {
  const major = majorType << 5;
  if (length < 24) return Buffer.from([major | length]);
  if (length < 256) return Buffer.from([major | 24, length]);
  if (length < 65536) {
    const buf = Buffer.alloc(3);
    buf[0] = major | 25;
    buf.writeUInt16BE(length, 1);
    return buf;
  }
  throw new Error('CBOR length > 65535 not supported');
}

function cborEncodeValue(value: unknown): Buffer {
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value >= 0) return cborEncodeLength(0, value);
    return cborEncodeLength(1, -1 - value);
  }
  if (typeof value === 'string') {
    const strBuf = Buffer.from(value, 'utf8');
    return Buffer.concat([cborEncodeLength(3, strBuf.length), strBuf]);
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    const bytes = Buffer.from(value);
    return Buffer.concat([cborEncodeLength(2, bytes.length), bytes]);
  }
  if (value instanceof Map) {
    const header = cborEncodeLength(5, value.size);
    const entries: Buffer[] = [header];
    for (const [k, v] of value) {
      entries.push(cborEncodeValue(k), cborEncodeValue(v));
    }
    return Buffer.concat(entries);
  }
  throw new Error(`Unsupported CBOR value: ${typeof value}`);
}

// ---------------------------------------------------------------------------
// Virtual authenticator
// ---------------------------------------------------------------------------

export interface VirtualCredential {
  id: Buffer;
  privateKey: KeyObject;
  publicKey: KeyObject;
  signCount: number;
}

/**
 * Test-only virtual WebAuthn authenticator.
 *
 * Generates ES256 key pairs and builds cryptographically valid WebAuthn
 * attestation and assertion responses for use in tests.
 */
export class VirtualAuthenticator {
  /** Create a fresh ES256 credential with a random 32-byte ID. */
  static createCredential(): VirtualCredential {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    return { id: randomBytes(32), privateKey, publicKey, signCount: 0 };
  }

  /** Build a valid "none"-format attestation response for registration. */
  static createAttestationResponse(
    cred: VirtualCredential,
    input: { challenge: string; origin: string; rpId: string }
  ): RegistrationResponseJSON {
    const jwk = cred.publicKey.export({ format: 'jwk' });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const x = Buffer.from(jwk.x!, 'base64url');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const y = Buffer.from(jwk.y!, 'base64url');

    const coseKey = new Map<number, unknown>([
      [1, 2], // kty: EC2
      [3, -7], // alg: ES256
      [-1, 1], // crv: P-256
      [-2, x],
      [-3, y],
    ]);

    const rpIdHash = createHash('sha256').update(input.rpId).digest();
    const flags = Buffer.from([0x45]); // UP + UV + AT
    const signCountBuf = Buffer.alloc(4);
    const credIdLen = Buffer.alloc(2);
    credIdLen.writeUInt16BE(cred.id.length, 0);

    const authData = Buffer.concat([
      rpIdHash,
      flags,
      signCountBuf,
      Buffer.alloc(16), // aaguid (zeros)
      credIdLen,
      cred.id,
      cborEncodeValue(coseKey),
    ]);

    const attestationObject = cborEncodeValue(
      new Map<string, unknown>([
        ['fmt', 'none'],
        ['attStmt', new Map()],
        ['authData', authData],
      ])
    );

    const clientDataJSON = JSON.stringify({
      type: 'webauthn.create',
      challenge: input.challenge,
      origin: input.origin,
    });

    return {
      id: cred.id.toString('base64url'),
      rawId: cred.id.toString('base64url'),
      response: {
        clientDataJSON: Buffer.from(clientDataJSON).toString('base64url'),
        attestationObject: attestationObject.toString('base64url'),
        transports: ['internal'],
      },
      type: 'public-key',
      clientExtensionResults: {},
      authenticatorAttachment: 'platform',
    };
  }

  /** Build a valid signed assertion response for authentication. */
  static createAssertionResponse(
    cred: VirtualCredential,
    input: { challenge: string; origin: string; rpId: string }
  ): AuthenticationResponseJSON {
    cred.signCount++;

    const rpIdHash = createHash('sha256').update(input.rpId).digest();
    const flags = Buffer.from([0x05]); // UP + UV
    const signCountBuf = Buffer.alloc(4);
    signCountBuf.writeUInt32BE(cred.signCount, 0);

    const authenticatorData = Buffer.concat([rpIdHash, flags, signCountBuf]);

    const clientDataJSON = Buffer.from(
      JSON.stringify({
        type: 'webauthn.get',
        challenge: input.challenge,
        origin: input.origin,
      })
    );
    const clientDataHash = createHash('sha256').update(clientDataJSON).digest();

    const signature = createSign('SHA256')
      .update(Buffer.concat([authenticatorData, clientDataHash]))
      .sign(cred.privateKey);

    return {
      id: cred.id.toString('base64url'),
      rawId: cred.id.toString('base64url'),
      response: {
        clientDataJSON: clientDataJSON.toString('base64url'),
        authenticatorData: authenticatorData.toString('base64url'),
        signature: signature.toString('base64url'),
      },
      type: 'public-key',
      clientExtensionResults: {},
    };
  }
}
