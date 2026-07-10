/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'node:crypto';

export interface ThresholdCheckTaskPayload {
  slug: string;
  userIdentifier: string;
}

/**
 * We hash the slug and userIdentifier rather than stripping out invalid
 * characters. Stripping could map two different users to the same task name,
 * which would dedup one user's check away.
 */
export function buildThresholdTaskId(
  payload: ThresholdCheckTaskPayload,
  now: Date,
  bucketSizeMs: number
): string {
  const bucket = Math.floor(now.getTime() / bucketSizeMs);
  const digest = crypto
    .createHash('sha256')
    .update(JSON.stringify([payload.slug, payload.userIdentifier]))
    .digest('hex');
  return `threshold-${digest}-${bucket}`;
}
