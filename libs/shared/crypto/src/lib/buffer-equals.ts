/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timingSafeEqual } from 'crypto';

/**
 * Constant-time equality check for secrets, tokens, and HMACs.
 *
 * Unlike raw `crypto.timingSafeEqual`, this never throws: null/undefined or
 * unequal-length inputs return `false` instead of a `RangeError`. That matters
 * on unauthenticated endpoints, where an attacker-controlled length would
 * otherwise crash the request. Comparison of equal-length inputs is
 * constant-time via `timingSafeEqual`.
 */
export function bufferEqualsConstantTime(
  a: Buffer | string | null | undefined,
  b: Buffer | string | null | undefined
): boolean {
  if (a == null || b == null) {
    return false;
  }
  const bufA = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bufB = Buffer.isBuffer(b) ? b : Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
