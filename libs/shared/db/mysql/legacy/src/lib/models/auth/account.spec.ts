/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { constantTimeHexEqual } from './account';

describe('constantTimeHexEqual', () => {
  const hash = 'a'.repeat(64);

  it('returns true for identical hex strings', () => {
    expect(constantTimeHexEqual(hash, hash)).toBe(true);
  });

  it('returns false for different same-length hex strings', () => {
    expect(constantTimeHexEqual(hash, 'b'.repeat(64))).toBe(false);
  });

  it('returns false without throwing for unequal-length hex strings', () => {
    expect(constantTimeHexEqual(hash, 'ab')).toBe(false);
  });

  it('returns false for odd-length hex that would truncate to equal buffers', () => {
    // Buffer.from('abc', 'hex') truncates to 'ab', so a naive compare passes.
    expect(constantTimeHexEqual('abc', 'abc')).toBe(false);
  });

  it('returns false for strings containing non-hex characters', () => {
    expect(constantTimeHexEqual('z'.repeat(64), 'z'.repeat(64))).toBe(false);
    expect(constantTimeHexEqual('a'.repeat(63) + 'z', hash)).toBe(false);
  });

  it('returns false for an undefined operand without throwing', () => {
    expect(constantTimeHexEqual(hash, undefined)).toBe(false);
    expect(constantTimeHexEqual(undefined, hash)).toBe(false);
  });

  it('returns false for a null operand without throwing', () => {
    expect(constantTimeHexEqual(hash, null as unknown as string)).toBe(false);
  });
});
