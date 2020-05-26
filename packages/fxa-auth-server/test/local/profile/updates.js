/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const EventEmitter = require('events').EventEmitter;
const { mockDB, mockLog } = require('../../mocks');
const profileUpdates = require('../../../lib/profile/updates');
const P = require('../../../lib/promise');

const mockDeliveryQueue = new EventEmitter();
mockDeliveryQueue.start = function start() {};

function mockMessage(msg) {
  msg.del = sinon.spy();
  return msg;
}

let pushShouldThrow = false;
const mockPush = {
  notifyProfileUpdated: sinon.spy((uid) => {
    assert.ok(typeof uid === 'string');
    if (pushShouldThrow) {
      throw new Error('oops');
    }
    return P.resolve();
  }),
};

function mockProfileUpdates(log) {
  return profileUpdates(log)(mockDeliveryQueue, mockPush, mockDB());
}

describe('profile updates', () => {
  it('should log errors', () => {
    pushShouldThrow = true;
    const log = mockLog();
    return mockProfileUpdates(log)
      .handleProfileUpdated(
        mockMessage({
          uid: 'bogusuid',
        })
      )
      .then(() => {
        assert.equal(mockPush.notifyProfileUpdated.callCount, 1);
        assert.equal(log.error.callCount, 1);
        pushShouldThrow = false;
      });
  });

  it('should send notifications', () => {
    const log = mockLog();
    const uid = '1e2122ba';

    return mockProfileUpdates(log)
      .handleProfileUpdated(
        mockMessage({
          uid: uid,
        })
      )
      .then(() => {
        assert.equal(log.error.callCount, 0);
        assert.equal(mockPush.notifyProfileUpdated.callCount, 2);
        const args = mockPush.notifyProfileUpdated.getCall(1).args;
        assert.equal(args[0], uid);

        assert.ok(
          log.notifyAttachedServices.calledWithExactly(
            'profileDataChanged',
            {},
            { uid }
          )
        );
      });
  });
});
