/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/;

export function hexToUint8(str: string) {
  if (!HEX_STRING.test(str)) {
    throw new Error(`invalid hex string: ${str}`);
  }
  const bytes = str.match(/[a-fA-F0-9]{2}/g) as RegExpMatchArray;
  return new Uint8Array(bytes.map(byte => parseInt(byte, 16)));
}

export function uint8ToHex(array: Uint8Array) {
  return array.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}

export function uint8ToBase64(buffer: Uint8Array) {
  return btoa(String.fromCharCode(...buffer));
}

export function xor(array1: Uint8Array, array2: Uint8Array) {
  return new Uint8Array(array1.map((byte, i) => byte ^ array2[i]));
}
