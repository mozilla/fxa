/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { computeWindow } from './computeWindow';

describe('computeWindow', () => {
  it('anchors daily windows to UTC midnight', () => {
    const now = new Date('2026-05-07T15:23:45.000Z');
    const { windowStart, windowEnd } = computeWindow('daily', now);
    expect(windowStart.toISOString()).toBe('2026-05-07T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-05-08T00:00:00.000Z');
  });

  it('anchors weekly windows to Monday 00:00 UTC', () => {
    const now = new Date('2026-05-07T15:23:45.000Z');
    const { windowStart, windowEnd } = computeWindow('weekly', now);
    expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
  });

  it('handles Sunday correctly for weekly windows', () => {
    const now = new Date('2026-05-10T23:59:59.000Z');
    const { windowStart, windowEnd } = computeWindow('weekly', now);
    expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
  });

  it('keeps the window start on the day when now is itself Monday midnight', () => {
    const now = new Date('2026-05-04T00:00:00.000Z');
    const { windowStart, windowEnd } = computeWindow('weekly', now);
    expect(windowStart.toISOString()).toBe('2026-05-04T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-05-11T00:00:00.000Z');
  });

  it('rolls a weekly window back across a month and year boundary', () => {
    // 2027-01-01 is a Friday; its Monday is 2026-12-28
    const now = new Date('2027-01-01T12:00:00.000Z');
    const { windowStart, windowEnd } = computeWindow('weekly', now);
    expect(windowStart.toISOString()).toBe('2026-12-28T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2027-01-04T00:00:00.000Z');
  });

  it('anchors monthly windows to the first of the month', () => {
    const now = new Date('2026-05-07T15:23:45.000Z');
    const { windowStart, windowEnd } = computeWindow('monthly', now);
    expect(windowStart.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });

  it('handles year-end roll-over for monthly windows', () => {
    const now = new Date('2026-12-15T00:00:00.000Z');
    const { windowStart, windowEnd } = computeWindow('monthly', now);
    expect(windowStart.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('spans the full month of February in a leap year', () => {
    const now = new Date('2028-02-29T18:00:00.000Z');
    const { windowStart, windowEnd } = computeWindow('monthly', now);
    expect(windowStart.toISOString()).toBe('2028-02-01T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2028-03-01T00:00:00.000Z');
  });

  it('rolls a daily window across a month boundary at end of day', () => {
    const now = new Date('2026-05-31T23:59:59.000Z');
    const { windowStart, windowEnd } = computeWindow('daily', now);
    expect(windowStart.toISOString()).toBe('2026-05-31T00:00:00.000Z');
    expect(windowEnd.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });
});
