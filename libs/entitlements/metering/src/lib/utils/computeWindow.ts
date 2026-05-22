/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { MeteringWindow } from '@fxa/shared/cms';

export interface MeteringWindowBounds {
  windowStart: Date;
  windowEnd: Date;
}

/**
 * Computes the inclusive [start, end) bounds of the current metering window
 * for `now`. Anchors all windows to UTC: daily windows start at 00:00 UTC,
 * weekly windows start at Monday 00:00 UTC, monthly windows start at the
 * first of the calendar month at 00:00 UTC.
 */
export function computeWindow(
  window: MeteringWindow,
  now: Date
): MeteringWindowBounds {
  switch (window) {
    case 'daily':
      return computeDailyWindow(now);
    case 'weekly':
      return computeWeeklyWindow(now);
    case 'monthly':
      return computeMonthlyWindow(now);
  }
}

function computeDailyWindow(now: Date): MeteringWindowBounds {
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const windowEnd = new Date(windowStart);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 1);
  return { windowStart, windowEnd };
}

function computeWeeklyWindow(now: Date): MeteringWindowBounds {
  // ISO weeks: Monday is day 1, Sunday is day 7. JS getUTCDay returns 0 (Sun) - 6 (Sat).
  const dayOfWeek = now.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  windowStart.setUTCDate(windowStart.getUTCDate() - daysSinceMonday);
  const windowEnd = new Date(windowStart);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 7);
  return { windowStart, windowEnd };
}

function computeMonthlyWindow(now: Date): MeteringWindowBounds {
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const windowEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );
  return { windowStart, windowEnd };
}
