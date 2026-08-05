/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The `info` and `aad` bound into a v1 envelope, built from credential context.
 *
 * FROZEN FORMAT CONTRACT. These bytes are as un-migratable as the sizes in
 * `constants.ts`: an envelope sealed under one context opens under no other.
 * This module owns the construction rather than accepting it from the caller —
 * a caller that assembled it slightly differently at wrap and unwrap time would
 * produce envelopes nothing can open, and the failure looks identical to a
 * wrong PRF output.
 *
 * Framing is length-prefixed, not delimited. Concatenating `uid || credentialId`
 * is ambiguous when `credentialId` is authenticator-chosen and variable-length,
 * so two different pairs could frame to the same bytes.
 */

import { concat } from 'hpke';
import { assertByteLength } from './assert';
import { UID_BYTES } from './constants';

/**
 * Account and credential context for one envelope.
 */
export type EnvelopeContext = {
  /** Account id, as the 32-character hex string the clients pass around. */
  uid: string;
  /** WebAuthn credential id, base64url, as stored in `passkeys`. */
  credentialId: string;
  /**
   * The account's `keysChangedAt`, identifying the generation of `kB` being
   * sealed. Binds the envelope to one generation so a superseded envelope
   * cannot be replayed to deliver an old `kB` after a password reset.
   */
  keysChangedAt: number;
};

/**
 * The three context values a v1 envelope binds.
 */
export type EnvelopeAad = {
  /** HPKE `info`: the long-lived recipient identity. */
  info: Uint8Array;
  /**
   * HPKE `aad`: the `kB` generation. Separate from `info` because rotation
   * re-seals to the same recipient with a new generation.
   */
  hpkeAad: Uint8Array;
  /**
   * AAD for the `skR` wrap.
   *
   * Deliberately excludes `keysChangedAt`. Rotation re-seals `kB` to the stored
   * `pkR` without the authenticator (tech spec §2.2.1), so it has no
   * `prfOut` and cannot re-wrap `skR`. A generation bound into this layer would
   * make every rotation lock the credential out.
   */
  keyWrapAad: Uint8Array;
};

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
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    throw new Error(`${name} must be an even-length hex string`);
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

/** Unsigned 64-bit big-endian. `keysChangedAt` is milliseconds since epoch. */
function fromTimestamp(name: string, value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value));
  return bytes;
}

/**
 * Builds the context bound into a v1 envelope.
 *
 * Call once and pass the same result to both layers — `info` and `hpkeAad` to
 * `sealKb`/`openKb`, `keyWrapAad` to `wrapRecipientPrivateKey` and
 * `unwrapRecipientPrivateKey`. On rotation, rebuild with the new
 * `keysChangedAt` and re-seal; `keyWrapAad` is unchanged by construction, so
 * the stored `prfWrappedSkR` stays valid.
 */
export function buildEnvelopeContext({
  uid,
  credentialId,
  keysChangedAt,
}: EnvelopeContext): EnvelopeAad {
  const uidBytes = fromHex('uid', uid);
  assertByteLength('uid', uidBytes, UID_BYTES);
  const credentialIdBytes = fromBase64Url('credentialId', credentialId);
  if (credentialIdBytes.length === 0) {
    throw new Error('credentialId must not be empty');
  }

  return {
    info: frame(uidBytes, credentialIdBytes),
    hpkeAad: frame(fromTimestamp('keysChangedAt', keysChangedAt)),
    keyWrapAad: frame(uidBytes, credentialIdBytes),
  };
}
