/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: The Hawk signing implementation was deleted as part of the FXA-9392
// Bearer migration (ADR-0022). In-monorepo callers now derive credentials
// here and let `bearerHeader` (lib/bearer.ts) build the Authorization
// header. The HKDF derivation below stays because it's scheme-neutral —
// the id/authKey/bundleKey triple is what Bearer, Hawk (server-side
// legacy), and bundleKey-based payload unwrap all still use.
//
// The filename is kept to avoid churn on external imports of
// `@fxa/auth-client/lib/hawk` and to preserve the legacy
// `deriveHawkCredentials` export.

import { hexToUint8, uint8ToHex } from './utils';
import { NAMESPACE } from './salt';

const encoder = () => new TextEncoder();

export async function deriveHawkCredentials(token: hexstring, context: string) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    hexToUint8(token),
    'HKDF',
    false,
    ['deriveBits']
  );
  const keyMaterial = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: new Uint8Array(0),
      // @ts-ignore
      info: encoder().encode(`${NAMESPACE}${context}`),
      hash: 'SHA-256',
    },
    baseKey,
    32 * 3 * 8
  );
  const id = new Uint8Array(keyMaterial.slice(0, 32));
  const authKey = new Uint8Array(keyMaterial.slice(32, 64));
  const bundleKey = new Uint8Array(keyMaterial.slice(64));

  return {
    id: uint8ToHex(id),
    key: authKey,
    bundleKey: uint8ToHex(bundleKey),
  };
}

// HKDF derivation is not Hawk-specific — it produces the id/authKey/bundleKey
// used by both Hawk signing and the Bearer scheme (FXA-9392). Exposed under
// a scheme-neutral name; the original export stays for back-compat.
export const deriveTokenCredentials = deriveHawkCredentials;
