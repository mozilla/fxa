/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Dedupe replays of Strapi's static bearer token; longer than realistic retry intervals.
const DEDUPE_TTL_MS = 60_000;
const DEDUPE_MAX_ENTRIES = 1000;

/**
 * Returns true if `key` was already seen within the TTL (a replay to ignore).
 * Otherwise records it against `now` and returns false. Mutates `seen`, which
 * the caller owns so state stays out of this helper.
 */
export function isDuplicateAccessWebhook(
  seen: Map<string, number>,
  key: string,
  now: number
): boolean {
  const expiresAt = seen.get(key);
  if (expiresAt !== undefined && expiresAt > now) {
    return true;
  }
  if (seen.size >= DEDUPE_MAX_ENTRIES) {
    for (const [k, exp] of seen) {
      if (exp <= now) seen.delete(k);
    }
  }
  seen.set(key, now + DEDUPE_TTL_MS);
  return false;
}
