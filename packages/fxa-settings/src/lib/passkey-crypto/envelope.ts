/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The two operations the rest of this module exists to serve: build a v1
 * envelope from `kB` and a passkey's PRF output, and recover `kB` from a stored
 * envelope and the same PRF output.
 *
 * FROZEN FORMAT CONTRACT. The context construction below is as un-migratable as
 * the sizes in `constants.ts`: an envelope sealed under one context opens under
 * no other. This module owns it rather than accepting it from the caller — a
 * caller that assembled it slightly differently at wrap and unwrap time would
 * produce envelopes nothing can open, and the failure looks identical to a
 * wrong PRF output.
 *
 * `skR` never leaves the client, and never leaves this module: the caller sees
 * only the wrapped form.
 */

import type { PasskeyWrapEnvelope } from 'fxa-auth-client/browser';
import { concat } from 'hpke';
import { base64urlToBytes } from '../base64url';
import { assertByteLength } from './assert';
import { CREDENTIAL_ID_MAX_BYTES, UID_BYTES, V1_SIZES } from './constants';
import { openKb, sealKb } from './hpke';
import {
  generateRecipientKeyPair,
  unwrapRecipientPrivateKey,
  wrapRecipientPrivateKey,
} from './key-wrap';

/**
 * The account and credential an envelope belongs to.
 */
export type EnvelopeContext = {
  /** Account id, as the 32-character hex string the clients pass around. */
  uid: string;
  /** WebAuthn credential id, base64url, as stored in `passkeys`. */
  credentialId: string;
};

/**
 * Everything the envelope authenticates travels in the HPKE `info`, so the
 * `aad` slot is unused.
 *
 * FROZEN FORMAT CONTRACT.
 */
const HPKE_AAD = new Uint8Array(0);

/**
 * Every envelope field and the width it must have. A `satisfies` over
 * `Record<keyof PasskeyWrapEnvelope, …>` rather than a list, so adding a field
 * to the envelope fails to compile here instead of silently going unvalidated.
 */
const ENVELOPE_WIDTHS = {
  pkR: V1_SIZES.pkR,
  prfWrappedSkR: V1_SIZES.prfWrappedSkR,
  keyWrapIv: V1_SIZES.keyWrapIv,
  hpkeEncapsulatedSecret: V1_SIZES.hpkeEncapsulatedSecret,
  hpkeSealedKb: V1_SIZES.hpkeSealedKb,
} satisfies Record<keyof PasskeyWrapEnvelope, number>;

/**
 * Big-endian length prefix per part. Two bytes bounds a part at 65535, which
 * every caller is already well under: `uid` is 16 bytes and `credentialId` is
 * capped at `CREDENTIAL_ID_MAX_BYTES`.
 */
function frame(...parts: Uint8Array[]): Uint8Array {
  return concat(
    ...parts.flatMap((part) => [
      Uint8Array.of((part.length >> 8) & 0xff, part.length & 0xff),
      part,
    ])
  );
}

function fromHex(name: string, value: string): Uint8Array {
  if (!/^[0-9a-f]+$/.test(value) || value.length % 2 !== 0) {
    throw new Error(`${name} must be an even-length lowercase hex string`);
  }
  return Uint8Array.from(value.match(/../g) as string[], (byte) =>
    parseInt(byte, 16)
  );
}

function fromBase64Url(name: string, value: string): Uint8Array {
  // Guarded before decoding: the shared decoder tolerates padding, the
  // standard alphabet, and lengths `atob` then rejects unnamed.
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    throw new Error(`${name} must be base64url with no padding`);
  }
  return base64urlToBytes(value);
}

/**
 * Validates an envelope and returns its fields as local-realm copies. Rejects a
 * field that is missing or at the wrong width, naming it: Web Crypto would
 * otherwise fail somewhere downstream with an error that says nothing about
 * which value was wrong.
 */
function normalizeEnvelope(envelope: unknown): PasskeyWrapEnvelope {
  if (envelope == null || typeof envelope !== 'object') {
    throw new Error('envelope must be an object');
  }
  const fields = envelope as Record<string, unknown>;
  const normalized: Record<string, Uint8Array> = {};

  for (const [field, width] of Object.entries(ENVELOPE_WIDTHS)) {
    const value = fields[field];
    // Checked before the copy, because `new Uint8Array` accepts any array-like
    // and would turn a spoofed one into real zeroed bytes. `assert.ts` carries
    // why both checks are needed.
    if (
      !ArrayBuffer.isView(value) ||
      Object.prototype.toString.call(value) !== '[object Uint8Array]'
    ) {
      throw new Error(`${field} must be a Uint8Array`);
    }
    // Copied into this realm so `hpke`'s own `instanceof` guard passes too.
    const bytes = new Uint8Array(value as Uint8Array);
    assertByteLength(field, bytes, width);
    normalized[field] = bytes;
  }

  return normalized as PasskeyWrapEnvelope;
}

/**
 * Builds the context bound into a v1 envelope, as the HPKE `info` and the `skR`
 * wrap's `aad`.
 *
 * FROZEN FORMAT CONTRACT. Framing is length-prefixed rather than delimited.
 * That is insurance, not a fix for a live ambiguity: `uid` is a fixed 16 bytes,
 * so `uid || credentialId` already splits uniquely today. The prefixes keep it
 * unique if a variable-length field is ever added, where plain concatenation
 * would silently let two different inputs frame to the same bytes.
 *
 * `uid` decodes from lowercase hex and `credentialId` from base64url, the forms
 * the client already holds; `golden-envelope.test.ts` pins the result
 * byte-for-byte.
 */
export function buildEnvelopeContext({
  uid,
  credentialId,
}: EnvelopeContext): Uint8Array {
  const uidBytes = fromHex('uid', uid);
  assertByteLength('uid', uidBytes, UID_BYTES);
  const credentialIdBytes = fromBase64Url('credentialId', credentialId);
  if (credentialIdBytes.length > CREDENTIAL_ID_MAX_BYTES) {
    throw new Error(
      `credentialId must be at most ${CREDENTIAL_ID_MAX_BYTES} bytes, got ${credentialIdBytes.length}`
    );
  }

  return frame(uidBytes, credentialIdBytes);
}

/**
 * Wraps `kB` for one passkey, returning the envelope to store.
 *
 * `kB` and `prfOut` belong to the caller and are left untouched. The recipient
 * private key never leaves in plaintext: the wrapped form is the only copy
 * returned, and the buffers here are zeroed on success and on failure.
 */
export async function createWrapEnvelope({
  kB,
  prfOut,
  uid,
  credentialId,
}: EnvelopeContext & {
  kB: Uint8Array;
  prfOut: Uint8Array;
}): Promise<PasskeyWrapEnvelope> {
  const context = buildEnvelopeContext({ uid, credentialId });
  const { publicKey, privateKeyRaw } = await generateRecipientKeyPair();

  try {
    const { wrapped, iv } = await wrapRecipientPrivateKey(
      privateKeyRaw,
      prfOut,
      context
    );
    const sealed = await sealKb(kB, publicKey, context, HPKE_AAD);

    return {
      pkR: publicKey,
      prfWrappedSkR: wrapped,
      keyWrapIv: iv,
      hpkeEncapsulatedSecret: sealed.encapsulatedSecret,
      hpkeSealedKb: sealed.ciphertext,
    };
  } finally {
    privateKeyRaw.fill(0);
  }
}

/**
 * Recovers `kB` from a stored envelope.
 *
 * Failures surface as the underlying decryption error, unwrapped. A wrong
 * `prfOut` and a mismatched `uid` or `credentialId` are indistinguishable —
 * they all fail the same AEAD tag check — so this cannot report which.
 */
export async function openWrapEnvelope({
  envelope,
  prfOut,
  uid,
  credentialId,
}: EnvelopeContext & {
  envelope: PasskeyWrapEnvelope;
  prfOut: Uint8Array;
}): Promise<Uint8Array> {
  const {
    pkR,
    prfWrappedSkR,
    keyWrapIv,
    hpkeEncapsulatedSecret,
    hpkeSealedKb,
  } = normalizeEnvelope(envelope);
  const context = buildEnvelopeContext({ uid, credentialId });

  const skRRaw = await unwrapRecipientPrivateKey(
    prfWrappedSkR,
    keyWrapIv,
    prfOut,
    context
  );

  try {
    return await openKb(
      { encapsulatedSecret: hpkeEncapsulatedSecret, ciphertext: hpkeSealedKb },
      pkR,
      skRRaw,
      context,
      HPKE_AAD
    );
  } finally {
    skRRaw.fill(0);
  }
}
