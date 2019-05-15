/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const EventEmitter = require('events').EventEmitter;
const { mockDB, mockLog } = require('../../mocks');
const subhubUpdates = require('../../../lib/subhub/updates');

const mockDeliveryQueue = new EventEmitter();
mockDeliveryQueue.start = function start() { };

const baseMessage = {
  uid: '1e2122ba',
  subscriptionId: '1234',
  productName: 'fx_pro',
  eventId: 'st_ev_1234',
  eventCreatedAt: 1557265730749,
  messageCreatedAt: 1557265730949
};


function mockMessage(messageOverrides) {
  const message = Object.assign({}, baseMessage, messageOverrides);
  message.del = sinon.spy();
  return message;
}

function mockSubHubUpdates(log, db) {
  return subhubUpdates(log)(mockDeliveryQueue, db);
}

describe('subhub updates', () => {
  let db;
  let log;

  beforeEach(() => {
    db = mockDB();
    log = mockLog();
  });

  it(
    'should log validation errors',
    async () => {
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage({subscriptionId: null, active: true}));
      assert.equal(log.error.callCount, 1);
    }
  );

  it(
    'should activate an account',
    async () => {
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage({active: true}));
      // FIXME: figure out what side effect we expect
      assert.equal(log.error.callCount, 0, `Got error: ${log.error.lastCall ? JSON.stringify(log.error.lastCall.args) : ''}`);
      assert.calledWithExactly(
        db.createAccountSubscription,
        baseMessage.uid, baseMessage.subscriptionId, baseMessage.productName, baseMessage.eventCreatedAt);
    }
  );

  it(
    'should de-activate an account',
    async () => {
      await mockSubHubUpdates(log, db).handleSubHubUpdates(mockMessage({active: false}));
      // FIXME: figure out what side effect we expect
      assert.calledWithExactly(db.deleteAccountSubscription, baseMessage.uid, baseMessage.subscriptionId);
      assert.equal(log.error.callCount, 0);
    }
  );

  it(
    'should ignore an UNSUBSCRIBE message that is out of order',
    async () => {
      const message = mockMessage({eventCreatedAt: baseMessage.eventCreatedAt, active: false});
      db.getAccountSubscription = sinon.spy(
        async (uid, subscriptionId) => {
          return {
            uid,
            subscriptionId,
            productName: message.productName,
            // It's a subscription FROM THE FUTURE!
            createdAt: message.eventCreatedAt + 1000,
          };
        }
      );
      await mockSubHubUpdates(log, db).handleSubHubUpdates(message);
      assert.equal(db.getAccountSubscription.callCount, 1, 'db.getAccountSubscription() should be called');
      assert.equal(db.deleteAccountSubscription.callCount, 0, 'db.deleteAccountSubscription() should not be called');
    }
  );

  // FIXME: because we don't keep timestamps of unsubscribes, we can't implement this:
  it.skip(
    'should ignore a SUBSCRIBE message that is out of order',
    async () => {
      const message = mockMessage({eventCreatedAt: baseMessage.eventCreatedAt, active: true});
      db.getAccountSubscription = sinon.spy(
        async (uid, subscriptionId) => {
          return {
            uid,
            subscriptionId,
            productName: message.productName,
            // It's a subscription FROM THE FUTURE!
            createdAt: message.eventCreatedAt + 1000,
          };
        }
      );
      await mockSubHubUpdates(log, db).handleSubHubUpdates(message);
      assert.equal(db.getAccountSubscription.callCount, 1, 'db.getAccountSubscription() should be called');
      assert.equal(db.createAccountSubscription.callCount, 0, 'db.createAccountSubscription() should not be called');
    }
  );

});
