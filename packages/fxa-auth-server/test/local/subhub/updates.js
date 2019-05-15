/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const EventEmitter = require('events').EventEmitter;
const sinon = require('sinon');
const { mockDB, mockLog } = require('../../mocks');
const subhubUpdates = require('../../../lib/subhub/updates');

const mockDeliveryQueue = new EventEmitter();
mockDeliveryQueue.start = function start() { };

function mockMessage(msg) {
  msg.del = sinon.spy();
  return msg;
}

const baseMessage = {
  uid: 'bogusid',
  subscriptionId: '1234',
  active: false,
  productName: 'fx_pro',
  eventId: 'st_ev_1234',
  eventCreatedAt: 1557265730749,
  messageCreatedAt: 1557265730949
};

function mockSubHubUpdates(log, db) {
  return handleSubHubUpdates(log)(mockDeliveryQueue, db);
}

describe('profile updates', () => {
  let db;
  let log;

  beforeEach(() => {
    db = mockDB();
    log = mockLog();
  });

  it(
    'should log errors',
    async () => {
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage(
        Object.assign({}, baseMessage, { subscriptionId: null })
      ));
      assert.equal(log.error.callCount, 1);
    }
  );

  it(
    'should activate an account',
    async () => {
      const uid = '1e2122ba';
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage(
        Object.assign({}, baseMessage, { uid })
      ));
      // FIXME: figure out what side effect we expect
      assert.calledWithExactly(
        db.createAccountSubscription,
        uid, baseMessage.subscriptionId, baseMessage.productName, baseMessage.createdAt);
      assert.equal(log.error.callCount, 0);
      const statuses = await db.getAccountSubscriptions(uid);
      assert.equal(statuses.length, 1);
      assert.equal(statuses[0].subscriptionId, baseMessage.subscriptionId);
      assert.equal(statuses[0].productName, baseMessage.productName);
      assert.equal(statuses[0].createdAt, baseMessage.createdAt);
    }
  );

  it(
    'should de-activate an account',
    async () => {
      const uid = '1e2122ba';
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage(
        Object.assign({}, baseMessage, { uid })
      ));
      // FIXME: figure out what side effect we expect
      assert.calledWithExactly(db.deleteAccountSubscription, uid, baseMessage.subscriptionId);
      assert.equal(log.error.callCount, 0);
    }
  );

  it(
    'should ignore a message that is out of order',
    async () => {
      const realFirstMessage = Object.assign({}, baseMessage, {createdAt: baseMessage.createdAt, active: false});
      const realSecondMessage = Object.assign({}, baseMessage, {createdAt: baseMessage.createdAt + 1000, active: true});
      const updates = mockSubHubUpdates(log, db);
      updates.handleSubHubUpdates(mockMessage(realSecondMessage));
      // First message should be ignored, because we've received a newer message before it:
      updates.handleSubHubUpdates(mockMessage(realFirstMessage));
      const statuses = await db.getAccountSubscriptions(realFirstMessage.uid);
      assert.equal(statuses.length, 1);
    }
  );

});
