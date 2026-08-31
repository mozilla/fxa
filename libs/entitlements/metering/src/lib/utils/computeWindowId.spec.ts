/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { computeWindowId } from './computeWindowId';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

describe('computeWindowId', () => {
  it('identifies a calendar window by its start', () => {
    expect(
      computeWindowId(
        { kind: 'calendar', period: 'monthly' },
        new Date('2026-05-01T00:00:00.000Z')
      )
    ).toBe('calendar:monthly:2026-05-01T00:00:00.000Z');
  });

  it('identifies a session window by its start', () => {
    expect(
      computeWindowId(
        { kind: 'session', durationMs: FIVE_HOURS_MS },
        new Date('2026-05-07T13:00:00.000Z')
      )
    ).toBe('session:2026-05-07T13:00:00.000Z');
  });

  it('returns null for a sliding window, which has no stable identity', () => {
    expect(
      computeWindowId(
        { kind: 'sliding', durationMs: FIVE_HOURS_MS },
        new Date('2026-05-07T10:23:45.000Z')
      )
    ).toBeNull();
  });

  it('distinguishes consecutive calendar windows', () => {
    const may = computeWindowId(
      { kind: 'calendar', period: 'monthly' },
      new Date('2026-05-01T00:00:00.000Z')
    );
    const june = computeWindowId(
      { kind: 'calendar', period: 'monthly' },
      new Date('2026-06-01T00:00:00.000Z')
    );
    expect(may).not.toBe(june);
  });
});
