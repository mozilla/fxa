/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const DELETE_USER_EVENT_REASONS = [
  'user',
  'admin',
  'inactivity',
  'unverified',
] as const;

export type DeleteUserEventReason = (typeof DELETE_USER_EVENT_REASONS)[number];

// statsd metric category labels
export type DeleteUserEventReasonFallback =
  | 'missing'
  | 'unknown_string'
  | 'non_string';

export function isDeleteUserEventReason(
  value: unknown
): value is DeleteUserEventReason {
  return DELETE_USER_EVENT_REASONS.includes(value as DeleteUserEventReason);
}

/**
 * Returns the  reason when it is one of the known values, otherwise a fallback
 * category as a metric tag.
 */
export function narrowDeleteUserEventReason(
  value: unknown
):
  | { reason: DeleteUserEventReason }
  | { fallback: DeleteUserEventReasonFallback } {
  if (isDeleteUserEventReason(value)) {
    return { reason: value };
  }
  if (value === undefined || value === '') {
    return { fallback: 'missing' };
  }
  return {
    fallback: typeof value === 'string' ? 'unknown_string' : 'non_string',
  };
}
