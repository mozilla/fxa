/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import eventsFactory from './events';
import logging from './logging';

jest.mock('./logging', () => {
  const logger = {
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return () => logger;
});

const logger = logging('events');

const UID = 'f'.repeat(32);

// The drop runs detached from the event chain, so let its handlers settle.
const settleDetachedHandlers = () =>
  new Promise((resolve) => setImmediate(resolve));

describe('events', () => {
  it.each(['primaryEmailChanged', 'profileDataChange'])(
    '%s should log the failure and still acknowledge the message when the cache drop rejects',
    async (event) => {
      const dropError = new Error('cache unavailable');
      const drop = jest.fn().mockRejectedValue(dropError);
      const del = jest.fn();
      const events = eventsFactory({ methods: { profileCache: { drop } } });

      await events.onData({ event, uid: UID, del });
      await settleDetachedHandlers();

      expect(drop).toHaveBeenCalledWith(UID);
      expect(logger.error).toHaveBeenCalledWith(
        `${event}:cacheClearFailed`,
        dropError
      );
      expect(logger.info).not.toHaveBeenCalledWith(`${event}:cacheCleared`, {
        uid: UID,
      });
      expect(del).toHaveBeenCalledTimes(1);
    }
  );
});
