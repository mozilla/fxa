/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// DISCOVERY (nshirley/nx-profile-integration): trivial edit to bust the
// fxa-auth-server build/test cache so the integration job takes the full
// cache-miss path and NX_PROFILE captures a representative trace. REMOVE before merge.

export function startOfMinute(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00Z`;
}

/**
 * Convert a time in milliseconds to seconds.
 */
export function msToSec(time: number) {
  return Math.round(time / 1000);
}

function pad(num: number) {
  if (num < 10) {
    return `0${num}`;
  }

  return num;
}
