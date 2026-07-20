/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { bufferEqualsConstantTime } from './buffer-equals';

describe('bufferEqualsConstantTime', () => {
  it('returns true for equal-length identical buffers', () => {
    expect(
      bufferEqualsConstantTime(Buffer.from('abcd', 'hex'), Buffer.from('abcd', 'hex'))
    ).toBe(true);
  });

  it('returns false for equal-length differing buffers', () => {
    expect(
      bufferEqualsConstantTime(Buffer.from('abcd', 'hex'), Buffer.from('abce', 'hex'))
    ).toBe(false);
  });

  it('returns false without throwing for unequal-length buffers', () => {
    expect(() =>
      bufferEqualsConstantTime(Buffer.alloc(2), Buffer.alloc(4))
    ).not.toThrow();
    expect(bufferEqualsConstantTime(Buffer.alloc(2), Buffer.alloc(4))).toBe(
      false
    );
  });

  it('returns true for identical strings', () => {
    expect(bufferEqualsConstantTime('s3cr3t', 's3cr3t')).toBe(true);
  });

  it('returns false for differing strings of equal length', () => {
    expect(bufferEqualsConstantTime('s3cr3t', 'X3cr3t')).toBe(false);
  });

  it('matches a string against a Buffer of equal byte length', () => {
    expect(bufferEqualsConstantTime('abc', Buffer.from('abc'))).toBe(true);
  });

  it('returns false when the first argument is null', () => {
    expect(bufferEqualsConstantTime(null, 'secret')).toBe(false);
  });

  it('returns false when the second argument is undefined', () => {
    expect(bufferEqualsConstantTime('secret', undefined)).toBe(false);
  });

  it('returns false without throwing when both arguments are null', () => {
    expect(() => bufferEqualsConstantTime(null, null)).not.toThrow();
    expect(bufferEqualsConstantTime(null, null)).toBe(false);
  });
});
