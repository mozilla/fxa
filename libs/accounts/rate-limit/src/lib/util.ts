/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BlockOn,
  BlockRecord,
  BlockStatus,
  Rule,
  TOO_MANY_ATTEMPTS,
} from './models';

export function getBanKey(blockingOn: BlockOn, blockedValue: string) {
  const sanitizedBlockedValue = sanitizeKeyValue(blockedValue);
  return `rate-limit:ban:${blockingOn}=${sanitizedBlockedValue}`;
}

/**
 * Generates a redis key
 */
export function getKey(
  type: 'attempts' | 'block' | 'ban',
  action: string,
  rule: Rule,
  blockedValue: string
) {
  const sanitizedBlockedValue = sanitizeKeyValue(blockedValue);
  return `rate-limit:${type}:${rule.blockingOn}=${sanitizedBlockedValue}:${action}:${rule.maxAttempts}-${rule.windowDurationInSeconds}-${rule.blockDurationInSeconds}`;
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

export function getLargestRetryAfter(blocks: BlockStatus[]) {
  if (blocks.length > 0) {
    return blocks.reduce((max, x) => (x.retryAfter > max.retryAfter ? x : max));
  }
  return null;
}

export function isBlockRecord(obj: any): obj is BlockRecord {
  const result =
    typeof obj.action === 'string' &&
    typeof obj.blockingOn === 'string' &&
    typeof obj.blockedValue === 'string' &&
    typeof obj.startTime === 'number' &&
    typeof obj.duration === 'number' &&
    typeof obj.reason === 'string' &&
    typeof obj.attempts === 'number' &&
    typeof obj.policy === 'string';
  return result;
}

export function parseBlockRecord(value: string | null): BlockRecord | null {
  if (!value) {
    return null;
  }
  const json = JSON.parse(value);

  if (!json) {
    return null;
  }

  // policy was not initially present and initially all policies were 'block'
  if (json.policy == null) {
    json.policy = 'block';
  }

  if (isBlockRecord(json)) {
    return json as BlockRecord;
  }

  return null;
}

export function createBlockStatus(now: number, block: BlockRecord) {
  return {
    startTime: block.startTime,
    duration: block.duration,
    attempt: block.attempts,
    retryAfter: calculateRetryAfter(now, block),
    reason: block.reason,
    action: block.action,
    blockingOn: block.blockingOn,
    policy: block.policy,
  } satisfies BlockStatus;
}

export function createBlockRecord(
  now: number,
  action: string,
  blockedValue: string,
  attempts: number,
  rule: Rule,
  usedDefaultRule: boolean
) {
  return {
    action: action,
    startTime: now,
    duration: rule.blockDurationInSeconds,
    blockingOn: rule.blockingOn,
    blockedValue: blockedValue,
    reason: TOO_MANY_ATTEMPTS,
    attempts: attempts,
    usedDefaultRule,
    policy: rule.blockPolicy,
  } satisfies BlockRecord;
}
