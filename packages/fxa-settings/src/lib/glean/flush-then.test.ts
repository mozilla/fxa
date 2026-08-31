/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import GleanMetrics from '.';
import { flushPingsThen, PING_FLUSH_MS } from './flush-then';

describe('flushPingsThen', () => {
  let isDone: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    isDone.mockRestore();
    jest.useRealTimers();
  });

  it('navigates as soon as the ping queue drains', async () => {
    isDone = jest.spyOn(GleanMetrics, 'isDone').mockResolvedValue(undefined);
    const navigate = jest.fn();

    flushPingsThen(navigate);
    await jest.advanceTimersByTimeAsync(0);

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  // The whole reason this exists: a wedged queue must not strand the user.
  it('navigates after the cap even if the queue never drains', async () => {
    isDone = jest
      .spyOn(GleanMetrics, 'isDone')
      .mockReturnValue(new Promise(() => {}));
    const navigate = jest.fn();

    flushPingsThen(navigate);
    await jest.advanceTimersByTimeAsync(PING_FLUSH_MS - 1);
    expect(navigate).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('asks `proceed` at navigation time, not when the wait starts', async () => {
    isDone = jest
      .spyOn(GleanMetrics, 'isDone')
      .mockReturnValue(new Promise(() => {}));
    const navigate = jest.fn();
    let allowed = true;

    flushPingsThen(navigate, () => allowed);
    allowed = false;
    await jest.advanceTimersByTimeAsync(PING_FLUSH_MS);

    expect(navigate).not.toHaveBeenCalled();
  });
});
