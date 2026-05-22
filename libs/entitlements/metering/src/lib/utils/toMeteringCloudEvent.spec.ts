/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { METERING_EVENT_SOURCE } from '../metering.types';
import { toMeteringCloudEvent } from './toMeteringCloudEvent';

describe('toMeteringCloudEvent', () => {
  it('puts the slug into `type`, the userIdentifier into `subject`, and the amount under `data.amount`', () => {
    const time = new Date('2026-05-07T12:00:00.000Z');
    const event = toMeteringCloudEvent({
      id: 'evt-1',
      userIdentifier: 'user-1',
      slug: 'tokens_total',
      amount: 42,
      timestamp: time,
    });
    expect(event).toEqual({
      id: 'evt-1',
      source: METERING_EVENT_SOURCE,
      type: 'tokens_total',
      subject: 'user-1',
      time,
      data: { amount: 42 },
    });
  });

  it('defaults `time` to now when no timestamp is supplied', () => {
    const before = Date.now();
    const event = toMeteringCloudEvent({
      id: 'evt-1',
      userIdentifier: 'user-1',
      slug: 'tokens',
      amount: 1,
    });
    const after = Date.now();
    if (!(event.time instanceof Date)) {
      throw new Error('expected event.time to be a Date');
    }
    expect(event.time.getTime()).toBeGreaterThanOrEqual(before);
    expect(event.time.getTime()).toBeLessThanOrEqual(after);
  });
});
