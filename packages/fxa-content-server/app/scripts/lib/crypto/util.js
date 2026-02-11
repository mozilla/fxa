/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Converts base64url to a Uint8Array
 * @param {String} base64
 * @returns {Uint8Array}
 */
export function base64urlToUint8Array(base64 = '') {
  base64 = base64.replace(/-/g, '+'); // 62nd char of encoding
  base64 = base64.replace(/_/g, '/'); // 63rd char of encoding
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Pulled over from fxa-auth-client/lib/utils.ts.
// TODO: expose this via fxa-auth-client instead?
export function uint8ToHex(uint8Array = []) {
  return uint8Array.reduce(
    (str, byte) => str + ('00' + byte.toString(16)).slice(-2),
    ''
  );
}

export default {
  base64urlToUint8Array,
  uint8ToHex,
};
