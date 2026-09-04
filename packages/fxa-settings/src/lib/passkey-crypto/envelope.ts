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
import { assertByteLength } from './assert';
import { UID_BYTES, V1_SIZES } from './constants';
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

/** Big-endian length prefix. Two bytes covers the 1023-byte `credentialId`. */
function frame(...parts: Uint8Array[]): Uint8Array {
  return concat(
    ...parts.flatMap((part) => {
      if (part.length > 0xffff) {
        throw new Error(`context component must be at most 65535 bytes`);
      }
      return [
        Uint8Array.of((part.length >> 8) & 0xff, part.length & 0xff),
        part,
      ];
    })
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
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`${name} must be base64url with no padding`);
  }
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Rejects an envelope with a field missing or at the wrong width, naming the
 * field. Web Crypto would otherwise fail somewhere downstream with an error
 * that says nothing about which value was wrong.
 */
function assertEnvelopeFields(
  envelope: unknown
): asserts envelope is PasskeyWrapEnvelope {
  if (envelope == null || typeof envelope !== 'object') {
    throw new Error('envelope must be an object');
  }
  for (const [field, width] of Object.entries(ENVELOPE_WIDTHS)) {
    const value = (envelope as Record<string, unknown>)[field];
    // Brand check rather than `instanceof`: a Uint8Array crossing a realm
    // boundary — a Node Buffer reaching jsdom under Jest, an iframe in a
    // browser — fails `instanceof` against the local binding while remaining a
    // valid BufferSource. This still rejects DataView and the wider TypedArrays.
    if (Object.prototype.toString.call(value) !== '[object Uint8Array]') {
      throw new Error(`${field} must be a Uint8Array`);
    }
    assertByteLength(field, value as Uint8Array, width);
  }
}

/**
 * Builds the context bound into a v1 envelope, as the HPKE `info` and the `skR`
 * wrap's `aad`.
 *
 * FROZEN FORMAT CONTRACT. Framing is length-prefixed, not delimited:
 * concatenating `uid || credentialId` is ambiguous when `credentialId` is
 * authenticator-chosen and variable-length, so two different pairs could frame
 * to the same bytes. `uid` decodes from hex and `credentialId` from base64url,
 * the forms the client already holds; `golden-envelope.test.ts` pins the result
 * byte-for-byte.
 */
export function buildEnvelopeContext({
  uid,
  credentialId,
}: EnvelopeContext): Uint8Array {
  const uidBytes = fromHex('uid', uid);
  assertByteLength('uid', uidBytes, UID_BYTES);
  const credentialIdBytes = fromBase64Url('credentialId', credentialId);
  if (credentialIdBytes.length === 0) {
    throw new Error('credentialId must not be empty');
  }

  return frame(uidBytes, credentialIdBytes);
}

/**
 * Wraps `kB` for one passkey, returning the envelope to store.
 *
 * `kB` and `prfOut` belong to the caller and are left untouched; the recipient
 * private key is generated here and zeroed before returning, so the only copy
 * that survives is the wrapped one.
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
 * A wrong `prfOut`, a mismatched `uid` or `credentialId`, and a tampered
 * envelope all surface as the underlying decryption failure — AES-GCM and HPKE
 * cannot tell them apart, so neither can this.
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
  assertEnvelopeFields(envelope);
  const context = buildEnvelopeContext({ uid, credentialId });

  const skRRaw = await unwrapRecipientPrivateKey(
    envelope.prfWrappedSkR,
    envelope.keyWrapIv,
    prfOut,
    context
  );

  try {
    return await openKb(
      {
        encapsulatedSecret: envelope.hpkeEncapsulatedSecret,
        ciphertext: envelope.hpkeSealedKb,
      },
      envelope.pkR,
      skRRaw,
      context,
      HPKE_AAD
    );
  } finally {
    skRRaw.fill(0);
  }
}
