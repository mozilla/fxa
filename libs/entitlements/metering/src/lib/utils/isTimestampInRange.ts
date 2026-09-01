/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MAX_TIMESTAMP_FUTURE_MS,
  MAX_TIMESTAMP_PAST_MS,
} from '../metering.constants';

export function isTimestampInRange(
  timestamp: string,
  now: Date,
  maxPastMs: number = MAX_TIMESTAMP_PAST_MS,
  maxFutureMs: number = MAX_TIMESTAMP_FUTURE_MS
): boolean {
  const parsed = new Date(timestamp).getTime();
  if (Number.isNaN(parsed)) {
    return false;
  }
  const offset = parsed - now.getTime();
  return offset <= maxFutureMs && -offset <= maxPastMs;
}
