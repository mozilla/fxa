/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ThresholdCheckTaskPayload {
  slug: string;
  userIdentifier: string;
}

/**
 * Builds a Cloud Tasks task name suffix that's stable inside a single
 * `bucketSizeMs` window. Two concurrent enqueues for the same
 * `(slug, userIdentifier)` inside the same bucket produce the same task
 * id; Cloud Tasks' name-based dedup then collapses them.
 *
 * Slug and userIdentifier are sanitized to the Cloud Tasks task-name
 * grammar (`[A-Za-z0-9_-]`); the unsanitized values still travel inside
 * the task payload, so the lossy id is only used for dedup, not for
 * routing.
 */
export function buildThresholdTaskId(
  payload: ThresholdCheckTaskPayload,
  now: Date,
  bucketSizeMs: number
): string {
  const bucket = Math.floor(now.getTime() / bucketSizeMs);
  const slug = sanitizeForTaskId(payload.slug);
  const user = sanitizeForTaskId(payload.userIdentifier);
  return `threshold-${slug}-${user}-${bucket}`;
}

function sanitizeForTaskId(input: string): string {
  return input.replace(/[^A-Za-z0-9-_]/g, '_');
}
