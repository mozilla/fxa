/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const EventEmitter = require('events').EventEmitter;
const { mockLog } = require('../../mocks');
const sinon = require('sinon');
const delivery = require('../../../lib/email/delivery');

const mockDeliveryQueue = new EventEmitter();
mockDeliveryQueue.start = function start() {};

function mockMessage(msg) {
  msg.del = sinon.spy();
  msg.headers = {};
  return msg;
}

function mockedDelivery(log) {
  return delivery(log)(mockDeliveryQueue);
}

describe('delivery messages', () => {
  it('should not log an error for headers', () => {
    const log = mockLog();
    return mockedDelivery(log)
      .handleDelivery(mockMessage({ junk: 'message' }))
      .then(() => assert.equal(log.error.callCount, 0));
  });

  it('should log an error for missing headers', () => {
    const log = mockLog();
    const message = mockMessage({
      junk: 'message',
    });
    message.headers = undefined;
    return mockedDelivery(log)
      .handleDelivery(message)
      .then(() => assert.equal(log.error.callCount, 1));
  });

  it('should ignore unknown message types', () => {
    const log = mockLog();
    return mockedDelivery(log)
      .handleDelivery(
        mockMessage({
          junk: 'message',
        })
      )
      .then(() => {
        assert.equal(log.warn.callCount, 1);
        assert.equal(log.warn.args[0][0], 'emailHeaders.keys');
      });
  });

  it('should log delivery', () => {
    const log = mockLog();
    const mockMsg = mockMessage({
      notificationType: 'Delivery',
      delivery: {
        timestamp: '2016-01-27T14:59:38.237Z',
        recipients: ['jane@example.com'],
        processingTimeMillis: 546,
        reportingMTA: 'a8-70.smtp-out.amazonses.com',
        smtpResponse: '250 ok:  Message 64111812 accepted',
        remoteMtaIp: '127.0.2.0',
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
        ],
      },
    });

    return mockedDelivery(log)
      .handleDelivery(mockMsg)
      .then(() => {
        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].domain, 'other');
        assert.equal(log.info.args[0][1].type, 'delivered');
        assert.equal(log.info.args[0][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[1][1].email, 'jane@example.com');
        assert.equal(log.info.args[1][0], 'handleDelivery');
        assert.equal(log.info.args[1][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[1][1].processingTimeMillis, 546);
      });
  });

  it('should emit flow metrics', () => {
    const log = mockLog();
    const mockMsg = mockMessage({
      notificationType: 'Delivery',
      delivery: {
        timestamp: '2016-01-27T14:59:38.237Z',
        recipients: ['jane@example.com'],
        processingTimeMillis: 546,
        reportingMTA: 'a8-70.smtp-out.amazonses.com',
        smtpResponse: '250 ok:  Message 64111812 accepted',
        remoteMtaIp: '127.0.2.0',
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
          {
            name: 'X-Flow-Id',
            value: 'someFlowId',
          },
          {
            name: 'X-Flow-Begin-Time',
            value: '1234',
          },
          {
            name: 'Content-Language',
            value: 'en',
          },
        ],
      },
    });

    return mockedDelivery(log)
      .handleDelivery(mockMsg)
      .then(() => {
        assert.equal(log.flowEvent.callCount, 1);
        assert.equal(
          log.flowEvent.args[0][0].event,
          'email.verifyLoginEmail.delivered'
        );
        assert.equal(log.flowEvent.args[0][0].flow_id, 'someFlowId');
        assert.equal(log.flowEvent.args[0][0].flow_time > 0, true);
        assert.equal(log.flowEvent.args[0][0].time > 0, true);
        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].domain, 'other');
        assert.equal(log.info.args[0][1].type, 'delivered');
        assert.equal(log.info.args[0][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[0][1].flow_id, 'someFlowId');
        assert.equal(log.info.args[1][1].email, 'jane@example.com');
        assert.equal(log.info.args[1][1].domain, 'other');
      });
  });

  it('should log popular email domain', () => {
    const log = mockLog();
    const mockMsg = mockMessage({
      notificationType: 'Delivery',
      delivery: {
        timestamp: '2016-01-27T14:59:38.237Z',
        recipients: ['jane@aol.com'],
        processingTimeMillis: 546,
        reportingMTA: 'a8-70.smtp-out.amazonses.com',
        smtpResponse: '250 ok:  Message 64111812 accepted',
        remoteMtaIp: '127.0.2.0',
      },
      mail: {
        headers: [
          {
            name: 'X-Template-Name',
            value: 'verifyLoginEmail',
          },
          {
            name: 'X-Flow-Id',
            value: 'someFlowId',
          },
          {
            name: 'X-Flow-Begin-Time',
            value: '1234',
          },
          {
            name: 'Content-Language',
            value: 'en',
          },
        ],
      },
    });

    return mockedDelivery(log)
      .handleDelivery(mockMsg)
      .then(() => {
        assert.equal(log.flowEvent.callCount, 1);
        assert.equal(
          log.flowEvent.args[0][0].event,
          'email.verifyLoginEmail.delivered'
        );
        assert.equal(log.flowEvent.args[0][0].flow_id, 'someFlowId');
        assert.equal(log.flowEvent.args[0][0].flow_time > 0, true);
        assert.equal(log.flowEvent.args[0][0].time > 0, true);
        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[0][0], 'emailEvent');
        assert.equal(log.info.args[0][1].domain, 'aol.com');
        assert.equal(log.info.args[0][1].type, 'delivered');
        assert.equal(log.info.args[0][1].template, 'verifyLoginEmail');
        assert.equal(log.info.args[0][1].locale, 'en');
        assert.equal(log.info.args[0][1].flow_id, 'someFlowId');
        assert.equal(log.info.args[1][1].email, 'jane@aol.com');
        assert.equal(log.info.args[1][1].domain, 'aol.com');
      });
  });
});
