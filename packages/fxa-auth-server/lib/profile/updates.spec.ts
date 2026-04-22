/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';

const { mockDB, mockLog } = require('../../test/mocks');
const profileUpdates = require('./updates');

const mockDeliveryQueue = new EventEmitter();
(mockDeliveryQueue as any).start = function start() {};

function mockMessage(msg: any) {
  msg.del = jest.fn();
  return msg;
}

let pushShouldThrow = false;
const mockPush = {
  notifyProfileUpdated: jest.fn((uid: string) => {
    expect(typeof uid).toBe('string');
    if (pushShouldThrow) {
      throw new Error('oops');
    }
    return Promise.resolve();
  }),
};

function mockProfileUpdates(log: any) {
  return profileUpdates(log)(mockDeliveryQueue, mockPush, mockDB());
}

describe('profile updates', () => {
  beforeEach(() => {
    mockPush.notifyProfileUpdated.mockClear();
    pushShouldThrow = false;
  });

  it('should log errors', async () => {
    pushShouldThrow = true;
    const log = mockLog();
    await mockProfileUpdates(log).handleProfileUpdated(
      mockMessage({
        uid: 'bogusuid',
      })
    );
    expect(mockPush.notifyProfileUpdated).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenCalledTimes(1);
  });

  it('should send notifications', async () => {
    const log = mockLog();
    const uid = '1e2122ba';
    const email = 'foo@mozilla.com';
    const locale = 'en-US';
    const metricsEnabled = true;
    const totpEnabled = false;
    const accountDisabled = false;
    const accountLocked = false;

    await mockProfileUpdates(log).handleProfileUpdated(
      mockMessage({
        uid,
        email,
        locale,
        metricsEnabled,
        totpEnabled,
        accountDisabled,
        accountLocked,
      })
    );

    expect(log.error).toHaveBeenCalledTimes(0);
    expect(mockPush.notifyProfileUpdated).toHaveBeenCalledTimes(1);
    expect(mockPush.notifyProfileUpdated).toHaveBeenCalledWith(
      uid,
      expect.anything()
    );

    expect(log.notifyAttachedServices).toHaveBeenCalledWith(
      'profileDataChange',
      {},
      { uid }
    );
  });
});
