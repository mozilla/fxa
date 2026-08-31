/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { resolveWindow } from './resolveWindow';

const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_HOURS_MS = 5 * ONE_HOUR_MS;
const THIRTY_DAYS_MS = 30 * 24 * ONE_HOUR_MS;

describe('resolveWindow', () => {
  describe('calendar windows', () => {
    it('anchors daily windows to UTC midnight', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'daily' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-08T00:00:00.000Z');
    });

    it('rolls a daily window across a month boundary at end of day', () => {
      const now = new Date('2026-05-31T23:59:59.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'daily' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-31T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    });

    it('anchors weekly windows to Monday 00:00 UTC', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'weekly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
    });

    it('handles Sunday correctly for weekly windows', () => {
      const now = new Date('2026-05-10T23:59:59.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'weekly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
    });

    it('keeps the window start on the day when now is itself Monday midnight', () => {
      const now = new Date('2026-05-04T00:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'weekly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
    });

    it('rolls a weekly window back across a month and year boundary', () => {
      const now = new Date('2027-01-01T12:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'weekly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-12-28T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2027-01-04T00:00:00.000Z');
    });

    it('anchors monthly windows to the first of the month', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'monthly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-01T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    });

    it('handles year-end roll-over for monthly windows', () => {
      const now = new Date('2026-12-15T00:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'monthly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2027-01-01T00:00:00.000Z');
    });

    it('spans the full month of February in a leap year', () => {
      const now = new Date('2028-02-29T18:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'monthly' },
        now
      );
      expect(windowStart.toISOString()).toBe('2028-02-01T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2028-03-01T00:00:00.000Z');
    });

    it('ignores a sessionStart argument', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'calendar', period: 'daily' },
        now,
        new Date('2026-05-07T09:00:00.000Z')
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T00:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-08T00:00:00.000Z');
    });
  });

  describe('sliding windows', () => {
    it('spans durationMs back from now', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'sliding', durationMs: FIVE_HOURS_MS },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T10:23:45.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T15:23:45.000Z');
    });

    it('is not anchored to a calendar boundary', () => {
      const now = new Date('2026-05-07T00:30:00.000Z');
      const { windowStart } = resolveWindow(
        { kind: 'sliding', durationMs: ONE_HOUR_MS },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-06T23:30:00.000Z');
    });

    it('spans back across a month boundary for long durations', () => {
      const now = new Date('2026-05-07T12:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'sliding', durationMs: THIRTY_DAYS_MS },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-04-07T12:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T12:00:00.000Z');
    });

    it('preserves millisecond precision', () => {
      const now = new Date('2026-05-07T15:23:45.123Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'sliding', durationMs: ONE_HOUR_MS },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T14:23:45.123Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T15:23:45.123Z');
    });

    it('does not mutate the now argument', () => {
      const now = new Date('2026-05-07T15:23:45.000Z');
      resolveWindow({ kind: 'sliding', durationMs: FIVE_HOURS_MS }, now);
      expect(now.toISOString()).toBe('2026-05-07T15:23:45.000Z');
    });
  });

  describe('session windows', () => {
    it('spans durationMs forward from an open session start', () => {
      const now = new Date('2026-05-07T15:00:00.000Z');
      const sessionStart = new Date('2026-05-07T13:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now,
        sessionStart
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T13:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T18:00:00.000Z');
    });

    it('opens a window at now when no session start is given', () => {
      const now = new Date('2026-05-07T15:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T15:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T20:00:00.000Z');
    });

    it('opens a window at now when the previous session has expired', () => {
      const now = new Date('2026-05-07T15:00:00.000Z');
      const sessionStart = new Date('2026-05-07T02:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now,
        sessionStart
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T15:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T20:00:00.000Z');
    });

    it('treats a session ending exactly at now as expired', () => {
      const now = new Date('2026-05-07T15:00:00.000Z');
      const sessionStart = new Date('2026-05-07T10:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now,
        sessionStart
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T15:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T20:00:00.000Z');
    });

    it('keeps a session open one millisecond before it ends', () => {
      const now = new Date('2026-05-07T14:59:59.999Z');
      const sessionStart = new Date('2026-05-07T10:00:00.000Z');
      const { windowStart, windowEnd } = resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now,
        sessionStart
      );
      expect(windowStart.toISOString()).toBe('2026-05-07T10:00:00.000Z');
      expect(windowEnd.toISOString()).toBe('2026-05-07T15:00:00.000Z');
    });

    it('does not mutate the sessionStart argument', () => {
      const now = new Date('2026-05-07T15:00:00.000Z');
      const sessionStart = new Date('2026-05-07T13:00:00.000Z');
      resolveWindow(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        now,
        sessionStart
      );
      expect(sessionStart.toISOString()).toBe('2026-05-07T13:00:00.000Z');
    });
  });
});
