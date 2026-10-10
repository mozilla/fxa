/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { MeteringCalendarPeriod, MeteringWindow } from '@fxa/shared/cms';

export interface MeteringWindowBounds {
  windowStart: Date;
  windowEnd: Date;
}

export function resolveWindow(
  window: MeteringWindow,
  now: Date,
  sessionStart?: Date
): MeteringWindowBounds {
  switch (window.kind) {
    case 'calendar':
      return resolveCalendarWindow(window.period, now);
    case 'sliding':
      return {
        windowStart: new Date(now.getTime() - window.durationMs),
        windowEnd: new Date(now.getTime()),
      };
    case 'session':
      return resolveSessionWindow(window.durationMs, now, sessionStart);
  }
}

function resolveSessionWindow(
  durationMs: number,
  now: Date,
  sessionStart?: Date
): MeteringWindowBounds {
  const isOpen =
    sessionStart !== undefined &&
    sessionStart.getTime() + durationMs > now.getTime();
  const startMs = isOpen ? sessionStart.getTime() : now.getTime();

  return {
    windowStart: new Date(startMs),
    windowEnd: new Date(startMs + durationMs),
  };
}

function resolveCalendarWindow(
  period: MeteringCalendarPeriod,
  now: Date
): MeteringWindowBounds {
  switch (period) {
    case 'daily':
      return resolveDailyWindow(now);
    case 'weekly':
      return resolveWeeklyWindow(now);
    case 'monthly':
      return resolveMonthlyWindow(now);
  }
}

function resolveDailyWindow(now: Date): MeteringWindowBounds {
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const windowEnd = new Date(windowStart);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + 1);
  return { windowStart, windowEnd };
}

function resolveWeeklyWindow(now: Date): MeteringWindowBounds {
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

function resolveMonthlyWindow(now: Date): MeteringWindowBounds {
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const windowEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  );
  return { windowStart, windowEnd };
}
