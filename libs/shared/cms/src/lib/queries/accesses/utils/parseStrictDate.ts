/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Returns start-of-next-day UTC so the named day stays valid in every timezone.
export function parseStrictDate(dateStr: string): Date | undefined {
  if (!YYYY_MM_DD_REGEX.test(dateStr)) return undefined;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // Date.UTC silently rolls invalid dates (e.g. 2026-02-30) — round-trip to detect.
  const startOfDay = new Date(Date.UTC(year, month - 1, day));
  if (
    startOfDay.getUTCFullYear() !== year ||
    startOfDay.getUTCMonth() !== month - 1 ||
    startOfDay.getUTCDate() !== day
  ) {
    return undefined;
  }

  return new Date(Date.UTC(year, month - 1, day + 1));
}
