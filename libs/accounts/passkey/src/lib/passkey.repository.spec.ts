/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  aaguidToBuffer,
  base64urlToBuffer,
  bufferToAaguid,
} from './passkey.repository';

describe('aaguidToBuffer', () => {
  it('converts a standard AAGUID UUID string to a 16-byte Buffer', () => {
    const result = aaguidToBuffer('adce0002-35bc-c60a-648b-0b25f1f05503');

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(16);
    expect(result[0]).toBe(0xad);
    expect(result[1]).toBe(0xce);
    expect(result[2]).toBe(0x00);
    expect(result[3]).toBe(0x02);
  });

  it('converts the all-zeros AAGUID to a 16-byte zero Buffer', () => {
    const result = aaguidToBuffer('00000000-0000-0000-0000-000000000000');

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(16);
    expect(result.equals(Buffer.alloc(16, 0))).toBe(true);
  });

  it('strips hyphens correctly regardless of position', () => {
    const uuid = 'f1d0f1d0-f1d0-f1d0-f1d0-f1d0f1d0f1d0';
    const result = aaguidToBuffer(uuid);

    expect(result.length).toBe(16);
    for (let i = 0; i < 16; i++) {
      expect(result[i]).toBe(i % 2 === 0 ? 0xf1 : 0xd0);
    }
  });

  it.each([
    ['empty string', ''],
    ['missing hyphens', 'adce000235bcc60a648b0b25f1f05503'],
    ['too short', 'adce0002-35bc-c60a-648b-0b25f1f0550'],
    ['too long', 'adce0002-35bc-c60a-648b-0b25f1f055033'],
    ['non-hex characters', 'zzce0002-35bc-c60a-648b-0b25f1f05503'],
    ['wrong separators', 'adce0002_35bc_c60a_648b_0b25f1f05503'],
  ])('throws on malformed input (%s)', (_label, input) => {
    expect(() => aaguidToBuffer(input)).toThrow('Invalid aaguid format');
  });
});

describe('bufferToAaguid', () => {
  it('converts a 16-byte Buffer back to a hyphenated UUID string', () => {
    const buf = Buffer.from('adce000235bcc60a648b0b25f1f05503', 'hex');
    expect(bufferToAaguid(buf)).toBe('adce0002-35bc-c60a-648b-0b25f1f05503');
  });

  it('round-trips the all-zeros aaguid', () => {
    expect(bufferToAaguid(Buffer.alloc(16, 0))).toBe(
      '00000000-0000-0000-0000-000000000000'
    );
  });

  it('round-trips via aaguidToBuffer', () => {
    const uuid = 'f1d0f1d0-f1d0-f1d0-f1d0-f1d0f1d0f1d0';
    expect(bufferToAaguid(aaguidToBuffer(uuid))).toBe(uuid);
  });
});

describe('base64urlToBuffer', () => {
  it('decodes a valid base64url string to a Buffer', () => {
    const buf = base64urlToBuffer('aGVsbG8td29ybGQ');
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.toString('utf8')).toBe('hello-world');
  });

  it.each([
    ['empty string', ''],
    ['contains +', 'aGVsbG8+d29ybGQ'],
    ['contains /', 'aGVsbG8/d29ybGQ'],
    ['contains =', 'aGVsbG8td29ybGQ='],
    ['non-alphabet character', 'aGVsbG8*d29ybGQ'],
  ])('throws on malformed input (%s)', (_label, input) => {
    expect(() => base64urlToBuffer(input)).toThrow('Invalid base64url data');
  });
});
