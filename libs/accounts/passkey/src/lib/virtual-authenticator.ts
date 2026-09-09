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
  createHmac,
  createSign,
  generateKeyPairSync,
  randomBytes,
  type KeyObject,
} from 'crypto';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticationExtensionsClientInputs,
  AuthenticationExtensionsClientOutputs,
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
  /**
   * Whether this authenticator can evaluate a PRF. False models a working
   * authenticator with no `hmac-secret` support: `prf.enabled: false` and never
   * an output, so the relying party must fall back to a password.
   */
  prfSupported: boolean;
}

/**
 * PRF eval salt, base64url-encoded as the server issues it. The spec allows a
 * `second` salt; FxA only ever sends `first`, so it isn't modelled.
 */
export interface PrfEvalInputJSON {
  first: string;
}

/**
 * Client extension inputs for a ceremony, in the base64url JSON shape the
 * server issues — pass the server's `options.extensions` straight through.
 */
export interface VirtualCeremonyExtensions {
  prf?: {
    eval?: PrfEvalInputJSON;
  };
}

export interface CeremonyInput {
  challenge: string;
  origin: string;
  rpId: string;
  /**
   * Client extension inputs; takes the server's `options.extensions` directly.
   * Extensions other than `prf` are ignored, as an authenticator ignores ones
   * it doesn't implement.
   */
  extensions?: VirtualCeremonyExtensions & AuthenticationExtensionsClientInputs;
}

/** Per-ceremony knobs shared by both response builders. */
export interface CeremonyOpts {
  /** Clear the UV flag (default: UV performed). */
  userVerified?: boolean;
}

/** The `prf` client extension output, absent from SimpleWebAuthn's types. */
interface PrfExtensionOutputs {
  prf?: {
    enabled?: boolean;
    results?: { first: string };
  };
}

const PRF_SECRET_DOMAIN = 'fxa-virtual-authenticator-prf';

/**
 * Domain-separation prefix a real client prepends before hashing the RP's salt
 * into the value the authenticator evaluates.
 */
const PRF_INPUT_PREFIX = Buffer.concat([
  Buffer.from('WebAuthn PRF', 'utf8'),
  Buffer.from([0x00]),
]);

/**
 * Stand-in for the per-credential secret a real authenticator keeps for the
 * CTAP `hmac-secret` extension. Derived from the private key so the same
 * credential always yields the same PRF outputs, and two credentials never
 * collide.
 *
 * Not keyed on UV state, unlike CTAP 2.1: FxA requires UV at both ceremonies
 * and rejects a no-UV assertion server-side, so there is no reachable no-UV
 * output to model. Revisit if a flow ever requests `userVerification:
 * 'preferred'`, which is what would make a no-UV assertion reachable.
 */
function prfSecret(cred: VirtualCredential): Buffer {
  return createHash('sha256')
    .update(PRF_SECRET_DOMAIN)
    .update(cred.privateKey.export({ format: 'der', type: 'pkcs8' }))
    .digest();
}

/**
 * Derive the PRF output a virtual credential produces for a salt. Test-only:
 * deterministic per credential and salt, which is what makes wrap round-trip
 * assertions possible, but not the derivation a real authenticator performs.
 *
 * The salt is hashed under the `WebAuthn PRF` prefix first, as a real client
 * does — that step is also what guarantees the authenticator sees the 32 bytes
 * CTAP requires, whatever length salt the server sent.
 *
 * @param cred - the credential evaluating the PRF
 * @param salt - base64url eval salt, as sent by the server
 * @returns the 32-byte output
 */
export function derivePrfOutput(cred: VirtualCredential, salt: string): Buffer {
  const input = createHash('sha256')
    .update(PRF_INPUT_PREFIX)
    .update(Buffer.from(salt, 'base64url'))
    .digest();
  return createHmac('sha256', prfSecret(cred)).update(input).digest();
}

/**
 * `prf` output for a registration ceremony. Returns `{}` unless the ceremony
 * requested PRF, so ceremonies that don't ask see no change.
 */
function registrationPrfOutput(
  cred: VirtualCredential,
  input: CeremonyInput
): AuthenticationExtensionsClientOutputs & PrfExtensionOutputs {
  if (!input.extensions?.prf) {
    return {};
  }
  // Capability only: a CTAP2 device yields secrets at assertion, not here.
  return { prf: { enabled: cred.prfSupported } };
}

/**
 * `prf` output for an assertion: the evaluated results only. `enabled` is a
 * registration-time output — a real client does not repeat it here, and code
 * that reads it at sign-in would be reading something production never sends.
 */
function assertionPrfOutput(
  cred: VirtualCredential,
  input: CeremonyInput
): AuthenticationExtensionsClientOutputs & PrfExtensionOutputs {
  const evalInput = input.extensions?.prf?.eval;
  if (!evalInput?.first || !cred.prfSupported) {
    return {};
  }

  return {
    prf: {
      results: {
        first: derivePrfOutput(cred, evalInput.first).toString('base64url'),
      },
    },
  };
}

/**
 * Test-only virtual WebAuthn authenticator.
 *
 * Generates ES256 key pairs and builds cryptographically valid WebAuthn
 * attestation and assertion responses for use in tests.
 */
export class VirtualAuthenticator {
  /**
   * Create a fresh ES256 credential with a random 32-byte ID. Pass
   * `prfSupported: false` for an authenticator that cannot evaluate a PRF.
   */
  static createCredential(
    opts: { prfSupported?: boolean } = {}
  ): VirtualCredential {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    return {
      id: randomBytes(32),
      privateKey,
      publicKey,
      signCount: 0,
      prfSupported: opts.prfSupported !== false,
    };
  }

  /**
   * Build a "none"-format attestation response; pass `userVerified: false` to
   * clear the UV flag (default true). Pass `input.extensions` to request PRF,
   * which reports `prf.enabled` — the capability flag the server records.
   */
  static createAttestationResponse(
    cred: VirtualCredential,
    input: CeremonyInput,
    opts: CeremonyOpts = {}
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
    // UP + AT (+ UV unless suppressed)
    const flags = Buffer.from([
      0x41 | (opts.userVerified !== false ? 0x04 : 0x00),
    ]);
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
      clientExtensionResults: registrationPrfOutput(cred, input),
      authenticatorAttachment: 'platform',
    };
  }

  /**
   * Build a signed assertion response; pass `userVerified: false` to clear the
   * UV flag (default true). Pass `input.extensions` to request PRF, which
   * yields the deterministic `prf.results` output that wraps `kB`.
   */
  static createAssertionResponse(
    cred: VirtualCredential,
    input: CeremonyInput,
    opts: CeremonyOpts = {}
  ): AuthenticationResponseJSON {
    cred.signCount++;

    const rpIdHash = createHash('sha256').update(input.rpId).digest();
    // UP (+ UV unless suppressed)
    const flags = Buffer.from([
      0x01 | (opts.userVerified !== false ? 0x04 : 0x00),
    ]);
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
      clientExtensionResults: assertionPrfOutput(cred, input),
    };
  }
}
