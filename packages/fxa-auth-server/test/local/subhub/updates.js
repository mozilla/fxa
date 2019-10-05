/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const EventEmitter = require('events').EventEmitter;
const { mockDB, mockLog, mockMailer } = require('../../mocks');
const subhubUpdates = require('../../../lib/subhub/updates');

const mockDeliveryQueue = new EventEmitter();
mockDeliveryQueue.start = function start() {};

const baseMessage = {
  uid: '1e2122ba',
  subscriptionId: '1234',
  productName: 'fx_pro',
  eventId: 'st_ev_1234',
  eventCreatedAt: 1557265730749,
  messageCreatedAt: 1557265730949,
};

function mockMessage(messageOverrides) {
  const message = Object.assign({}, baseMessage, messageOverrides);
  message.del = sinon.spy();
  return message;
}

function mockSubHubUpdates(log, config, db, mailer) {
  return subhubUpdates(log, config)(mockDeliveryQueue, db, mailer);
}

describe('subhub updates', () => {
  let config;
  let db;
  let log;
  let mailer;

  beforeEach(() => {
    config = {
      subscriptions: {
        productCapabilities: {
          fx_pro: ['foo', 'bar'],
        },
      },
    };
    db = mockDB({
      email: 'foo@example.com',
      locale: 'flub',
      uid: baseMessage.uid,
    });
    log = mockLog();
    mailer = mockMailer();
  });

  it('should log validation errors', async () => {
    await mockSubHubUpdates(log, config, db, mailer).handleSubHubUpdates(
      mockMessage({ subscriptionId: null, active: true })
    );
    assert.equal(log.error.callCount, 1);
    assert.equal(db.createAccountSubscription.callCount, 0);
    assert.equal(db.getAccountSubscription.callCount, 0);
    assert.equal(db.deleteAccountSubscription.callCount, 0);
    assert.equal(log.notifyAttachedServices.callCount, 0);
    assert.equal(mailer.sendDownloadSubscriptionEmail.callCount, 0);
  });

  it('should activate an account', async () => {
    await mockSubHubUpdates(log, config, db, mailer).handleSubHubUpdates(
      mockMessage({ active: true })
    );
    // FIXME: figure out what side effect we expect
    assert.equal(
      log.error.callCount,
      0,
      `Got error: ${
        log.error.lastCall ? JSON.stringify(log.error.lastCall.args) : ''
      }`
    );
    assert.calledWithExactly(db.createAccountSubscription, {
      uid: baseMessage.uid,
      subscriptionId: baseMessage.subscriptionId,
      productId: baseMessage.productName,
      createdAt: baseMessage.eventCreatedAt,
    });

    assert.equal(log.notifyAttachedServices.callCount, 1);
    let args = log.notifyAttachedServices.args[0];
    assert.lengthOf(args, 3);
    assert.equal(args[0], 'subscription:update');
    assert.isObject(args[1]);
    assert.isFunction(args[1].gatherMetricsContext);
    assert.isFunction(args[1].gatherMetricsContext().then);
    assert.deepEqual(args[2], {
      eventCreatedAt: baseMessage.eventCreatedAt,
      uid: baseMessage.uid,
      subscriptionId: baseMessage.subscriptionId,
      isActive: true,
      productId: baseMessage.productName,
      productCapabilities: ['foo', 'bar'],
    });

    assert.equal(mailer.sendDownloadSubscriptionEmail.callCount, 1);
    args = mailer.sendDownloadSubscriptionEmail.args[0];
    assert.lengthOf(args, 3);
    assert.isArray(args[0]);
    assert.equal(args[1].uid, baseMessage.uid);
    assert.deepEqual(args[2], {
      acceptLanguage: 'flub',
      productId: baseMessage.productName,
    });
  });

  it('should de-activate an account', async () => {
    await mockSubHubUpdates(log, config, db, mailer).handleSubHubUpdates(
      mockMessage({ active: false })
    );
    // FIXME: figure out what side effect we expect
    assert.calledWithExactly(
      db.deleteAccountSubscription,
      baseMessage.uid,
      baseMessage.subscriptionId
    );
    assert.equal(log.error.callCount, 0);

    assert.equal(log.notifyAttachedServices.callCount, 1);
    const args = log.notifyAttachedServices.args[0];
    assert.lengthOf(args, 3);
    assert.equal(args[0], 'subscription:update');
    assert.isObject(args[1]);
    assert.isFunction(args[1].gatherMetricsContext);
    assert.isFunction(args[1].gatherMetricsContext().then);
    assert.deepEqual(args[2], {
      eventCreatedAt: baseMessage.eventCreatedAt,
      uid: baseMessage.uid,
      subscriptionId: baseMessage.subscriptionId,
      isActive: false,
      productId: baseMessage.productName,
      productCapabilities: ['foo', 'bar'],
    });
  });

  it('should ignore an UNSUBSCRIBE message that is out of order', async () => {
    const message = mockMessage({
      eventCreatedAt: baseMessage.eventCreatedAt,
      active: false,
    });
    db.getAccountSubscription = sinon.spy(async (uid, subscriptionId) => {
      return {
        uid,
        subscriptionId,
        productId: message.productName,
        // It's a subscription FROM THE FUTURE!
        createdAt: message.eventCreatedAt + 1000,
      };
    });
    await mockSubHubUpdates(log, config, db, mailer).handleSubHubUpdates(
      message
    );
    assert.equal(
      db.getAccountSubscription.callCount,
      1,
      'db.getAccountSubscription() should be called'
    );
    assert.equal(
      db.deleteAccountSubscription.callCount,
      0,
      'db.deleteAccountSubscription() should not be called'
    );
    assert.equal(log.notifyAttachedServices.callCount, 0);
  });

  // FIXME: because we don't keep timestamps of unsubscribes, we can't implement this:
  it.skip('should ignore a SUBSCRIBE message that is out of order', async () => {
    const message = mockMessage({
      eventCreatedAt: baseMessage.eventCreatedAt,
      active: true,
    });
    db.getAccountSubscription = sinon.spy(async (uid, subscriptionId) => {
      return {
        uid,
        subscriptionId,
        productId: message.productName,
        // It's a subscription FROM THE FUTURE!
        createdAt: message.eventCreatedAt + 1000,
      };
    });
    await mockSubHubUpdates(log, config, db, mailer).handleSubHubUpdates(
      message
    );
    assert.equal(
      db.getAccountSubscription.callCount,
      1,
      'db.getAccountSubscription() should be called'
    );
    assert.equal(
      db.createAccountSubscription.callCount,
      0,
      'db.createAccountSubscription() should not be called'
    );
    assert.equal(log.notifyAttachedServices.callCount, 0);
  });
});
