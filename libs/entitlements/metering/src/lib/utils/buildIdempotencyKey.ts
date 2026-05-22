/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'node:crypto';

export interface IdempotencyKeyMaterial {
  slug: string;
  userIdentifier: string;
  windowStart: Date;
  threshold: number;
}

/**
 * Stable idempotency key for a threshold-crossing event. Including
 * `windowStart` ties retries to the current window so the next window's
 * crossing is a distinct delivery; including `threshold` distinguishes 80%
 * from 100% crossings in the same window.
 */
export function buildIdempotencyKey(material: IdempotencyKeyMaterial): string {
  const joined = [
    material.slug,
    material.userIdentifier,
    material.windowStart.toISOString(),
    material.threshold,
  ].join('|');
  return crypto.createHash('sha256').update(joined).digest('hex');
}
