/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MAX_TIMESTAMP_FUTURE_MS,
  MAX_TIMESTAMP_PAST_MS,
} from '../metering.constants';
import { isTimestampInRange } from './isTimestampInRange';

const NOW = new Date('2026-05-15T12:00:00.000Z');

function at(offsetMs: number): string {
  return new Date(NOW.getTime() + offsetMs).toISOString();
}

describe('isTimestampInRange', () => {
  it('accepts the current instant', () => {
    expect(isTimestampInRange(at(0), NOW)).toBe(true);
  });

  it('accepts a timestamp at the past bound', () => {
    expect(isTimestampInRange(at(-MAX_TIMESTAMP_PAST_MS), NOW)).toBe(true);
  });

  it('rejects a timestamp one millisecond beyond the past bound', () => {
    expect(isTimestampInRange(at(-MAX_TIMESTAMP_PAST_MS - 1), NOW)).toBe(false);
  });

  it('accepts a timestamp at the future bound', () => {
    expect(isTimestampInRange(at(MAX_TIMESTAMP_FUTURE_MS), NOW)).toBe(true);
  });

  it('rejects a timestamp one millisecond beyond the future bound', () => {
    expect(isTimestampInRange(at(MAX_TIMESTAMP_FUTURE_MS + 1), NOW)).toBe(
      false
    );
  });

  it('rejects a far-future timestamp that ClickHouse would saturate', () => {
    expect(isTimestampInRange('9999-01-01T00:00:00.000Z', NOW)).toBe(false);
  });

  it('rejects a far-past timestamp that ClickHouse would saturate', () => {
    expect(isTimestampInRange('0001-01-01T00:00:00.000Z', NOW)).toBe(false);
  });

  it('rejects a timestamp before the DateTime64 lower bound', () => {
    expect(isTimestampInRange('1899-06-15T00:00:00.000Z', NOW)).toBe(false);
  });

  it('rejects an unparseable timestamp', () => {
    expect(isTimestampInRange('not-a-date', NOW)).toBe(false);
  });

  it('honours custom bounds', () => {
    expect(isTimestampInRange(at(-2_000), NOW, 1_000, 1_000)).toBe(false);
    expect(isTimestampInRange(at(-500), NOW, 1_000, 1_000)).toBe(true);
  });
});
