/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const created = Date.now();

/**
 * Takes a date as ticks and adds X number of days to it.
 * @param startDate - A date as ticks, e.g. Date.now()
 * @param days - The number of days to add.
 * @returns The start date plus the number of days
 */
export function addDays(startDate: number, days: number) {
  const day = 3600 * 1000 * 24;
  return new Date(startDate + day * days).getTime();
}
