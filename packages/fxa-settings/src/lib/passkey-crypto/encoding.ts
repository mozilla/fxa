/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Byte-level plumbing shared by both crypto layers.
 *
 * Internal, like `suite.ts`: only `CredentialContext` is re-exported from
 * `index.ts`, and only as a type.
 */

import { concat } from 'hpke';
import { UID_BYTES } from './constants';

/**
 * The account and credential an envelope is bound to.
 *
 * Callers pass this, not bytes. Assembling the binding at the call site is how
 * you get an envelope that nothing can open, and the failure is
 * indistinguishable from a wrong PRF output.
 */
export type CredentialContext = {
  /** Account id, as the 32-character hex string the clients pass around. */
  uid: string;
  /** WebAuthn credential id, base64url, as stored in `passkeys`. */
  credentialId: string;
};

/**
 * Stored at the wrong size, a field is padded into its fixed-width column and
 * can never be opened again. `name` is the envelope field name, so the message
 * names the column an operator would look at.
 */
export function assertByteLength(
  name: string,
  value: Uint8Array,
  expected: number
): void {
  if (value.length !== expected) {
    throw new Error(`${name} must be ${expected} bytes, got ${value.length}`);
  }
}

/** Big-endian length prefix. Two bytes covers the 1023-byte `credentialId`. */
function frame(...parts: Uint8Array[]): Uint8Array {
  return concat(
    ...parts.flatMap((part) => {
      if (part.length > 0xffff) {
        throw new Error(`binding component must be at most 65535 bytes`);
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

/**
 * The HPKE `info` in `hpke.ts` and the AES-GCM `aad` in `key-wrap.ts`. Each
 * layer prefixes its own label, so sharing these bytes keeps the two distinct.
 *
 * FROZEN FORMAT CONTRACT. As un-migratable as the sizes in `constants.ts`: an
 * envelope sealed under one binding opens under no other.
 *
 * Length-prefixed rather than delimited. `uid || credentialId` is unambiguous
 * only because `uid` is a fixed 16 bytes; the prefixes keep it that way if a
 * variable-length field is ever added.
 */
export function bindingBytes({
  uid,
  credentialId,
}: CredentialContext): Uint8Array {
  const uidBytes = fromHex('uid', uid);
  assertByteLength('uid', uidBytes, UID_BYTES);
  const credentialIdBytes = fromBase64Url('credentialId', credentialId);
  if (credentialIdBytes.length === 0) {
    throw new Error('credentialId must not be empty');
  }

  return frame(uidBytes, credentialIdBytes);
}
