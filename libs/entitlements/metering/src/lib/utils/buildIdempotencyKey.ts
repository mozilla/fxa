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

export function buildIdempotencyKey(material: IdempotencyKeyMaterial): string {
  const joined = [
    material.slug,
    material.userIdentifier,
    material.windowStart.toISOString(),
    material.threshold,
  ].join('|');
  return crypto.createHash('sha256').update(joined).digest('hex');
}
