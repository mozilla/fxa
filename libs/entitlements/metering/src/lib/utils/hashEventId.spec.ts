/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hashEventId } from './hashEventId';

describe('hashEventId', () => {
  it('is deterministic for the same id', () => {
    expect(hashEventId('event-1')).toBe(hashEventId('event-1'));
  });

  it('produces different hashes for different ids', () => {
    expect(hashEventId('event-1')).not.toBe(hashEventId('event-2'));
  });

  it('returns a decimal string so UInt64 survives without precision loss', () => {
    expect(hashEventId('event-1')).toMatch(/^\d+$/);
  });

  it('stays within the unsigned 64-bit range', () => {
    const value = BigInt(hashEventId('event-1'));
    expect(value >= 0n).toBe(true);
    expect(value <= 18446744073709551615n).toBe(true);
  });

  it('handles a maximum-length id', () => {
    expect(hashEventId('a'.repeat(256))).toMatch(/^\d+$/);
  });

  it('handles non-ascii ids', () => {
    expect(hashEventId('événement-🔑')).toMatch(/^\d+$/);
  });
});
