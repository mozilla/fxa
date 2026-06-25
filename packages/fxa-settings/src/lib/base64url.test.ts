/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { base64urlToBytes, bytesToBase64url } from './base64url';

// Reference encoder built on Node's Buffer — a different implementation from
// the btoa-based code under test, so equality assertions cross-check rather
// than tautologically mirror it.
const ref = (bytes: number[] | Uint8Array): string =>
  Buffer.from(
    bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)
  ).toString('base64url');

describe('bytesToBase64url', () => {
  it('encodes an empty buffer to an empty string', () => {
    expect(bytesToBase64url(new Uint8Array(0))).toBe('');
  });

  it('matches a reference base64url encoder for known bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 255]);
    expect(bytesToBase64url(bytes)).toBe(ref(bytes));
  });

  it('produces url-safe, unpadded output', () => {
    // These bytes would yield + and / and padding in standard base64.
    const out = bytesToBase64url(new Uint8Array([0xfb, 0xff, 0xbf, 0xfe]));
    expect(out).not.toMatch(/[+/=]/);
  });

  it('accepts a raw ArrayBuffer', () => {
    const buf = new Uint8Array([10, 20, 30]).buffer;
    expect(bytesToBase64url(buf)).toBe(ref(new Uint8Array(buf)));
  });

  it('encodes a typed-array view honouring its byteOffset and length', () => {
    const backing = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const view = backing.subarray(2, 6); // bytes [2, 3, 4, 5]
    expect(bytesToBase64url(view)).toBe(ref([2, 3, 4, 5]));
  });

  it('encodes buffers larger than the 0x8000 chunk size', () => {
    const big = new Uint8Array(100_000);
    for (let i = 0; i < big.length; i += 1) {
      big[i] = i % 256;
    }
    expect(bytesToBase64url(big)).toBe(ref(big));
  });
});

describe('base64urlToBytes', () => {
  it('decodes an unpadded base64url string', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 255]);
    expect(base64urlToBytes(ref(bytes))).toEqual(bytes);
  });

  it('decodes url-safe characters that map back to + and /', () => {
    const bytes = new Uint8Array([0xfb, 0xff, 0xbf, 0xfe]);
    expect(base64urlToBytes(bytesToBase64url(bytes))).toEqual(bytes);
  });
});

describe('round-trip', () => {
  it('preserves every byte value through encode then decode', () => {
    const bytes = new Uint8Array(256);
    for (let i = 0; i < 256; i += 1) {
      bytes[i] = i;
    }
    expect(base64urlToBytes(bytesToBase64url(bytes))).toEqual(bytes);
  });
});
