/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BlockRecord, Rule } from './models';

/**
 * Generates a redis key
 */
export function getKey(
  type: 'block' | 'attempts',
  rule: Rule,
  blockedValue: string
) {
  const sanitizedBlockedValue = sanitizeKeyValue(blockedValue);
  return `rate-limit:${type}:${rule.blockingOn}=${sanitizedBlockedValue}:${rule.action}:${rule.maxAttempts}-${rule.windowDurationInSeconds}-${rule.blockDurationInSeconds}`;
}

/**
 * Calculates the amount of time that must elapse in seconds before the action can be retried.
 * @param now The current time.
 * @param block The blocked record
 * @returns How log to wait in seconds before trying again.
 */
export function calculateRetryAfter(now: number, block: BlockRecord) {
  return block.duration * 1000 - (now - block.startTime);
}

/**
 * Ensures that value is in valid redis key format
 * @param val
 * @returns sanitized key value
 */
export function sanitizeKeyValue(val: string) {
  return val.replace(':', ' ');
}
