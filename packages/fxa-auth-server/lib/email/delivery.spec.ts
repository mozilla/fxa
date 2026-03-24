/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';
import sinon from 'sinon';

const { mockLog, mockGlean } = require('../../test/mocks');
const emailHelpers = require('./utils/helpers');
const delivery = require('./delivery');
const { requestForGlean } = require('../inactive-accounts');

let sandbox: sinon.SinonSandbox;
const mockDeliveryQueue = new EventEmitter() as EventEmitter & {
  start: () => void;
};
(mockDeliveryQueue as any).start = function start() {};

function mockMessage(msg: any) {
  msg.del = sandbox.spy();
  msg.headers = {};
  return msg;
}

function mockedDelivery(log: any, glean: any) {
  return delivery(log, glean)(mockDeliveryQueue);
}

describe('delivery messages', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not log an error for headers', async () => {
    const log = mockLog();
    const glean = mockGlean();
    await mockedDelivery(log, glean).handleDelivery(
      mockMessage({ junk: 'message' })
    );
    expect(log.error.callCount).toBe(0);
  });

  it('should log an error for missing headers', async () => {
    const log = mockLog();
    const glean = mockGlean();
    const message = mockMessage({
      junk: 'message',
    });
    message.headers = undefined;
    await mockedDelivery(log, glean).handleDelivery(message);
    expect(log.error.callCount).toBe(1);
  });

  it('should ignore unknown message types', async () => {
    const log = mockLog();
    const glean = mockGlean();
    await mockedDelivery(log, glean).handleDelivery(
      mockMessage({
        junk: 'message',
      })
    );
    expect(log.warn.callCount).toBe(1);
    expect(log.warn.args[0][0]).toBe('emailHeaders.keys');
  });

  it('should log delivery', async () => {
    const log = mockLog();
    const glean = mockGlean();
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

    await mockedDelivery(log, glean).handleDelivery(mockMsg);
    expect(log.info.callCount).toBe(2);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].domain).toBe('other');
    expect(log.info.args[0][1].type).toBe('delivered');
    expect(log.info.args[0][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[1][1].email).toBe('jane@example.com');
    expect(log.info.args[1][0]).toBe('handleDelivery');
    expect(log.info.args[1][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[1][1].processingTimeMillis).toBe(546);
  });

  it('should emit flow metrics', async () => {
    const log = mockLog();
    const glean = mockGlean();
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

    await mockedDelivery(log, glean).handleDelivery(mockMsg);
    expect(log.flowEvent.callCount).toBe(1);
    expect(log.flowEvent.args[0][0].event).toBe(
      'email.verifyLoginEmail.delivered'
    );
    expect(log.flowEvent.args[0][0].flow_id).toBe('someFlowId');
    expect(log.flowEvent.args[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.args[0][0].time > 0).toBe(true);
    expect(log.info.callCount).toBe(2);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].domain).toBe('other');
    expect(log.info.args[0][1].type).toBe('delivered');
    expect(log.info.args[0][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[0][1].flow_id).toBe('someFlowId');
    expect(log.info.args[1][1].email).toBe('jane@example.com');
    expect(log.info.args[1][1].domain).toBe('other');
  });

  it('should log popular email domain', async () => {
    const log = mockLog();
    const glean = mockGlean();
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

    await mockedDelivery(log, glean).handleDelivery(mockMsg);
    expect(log.flowEvent.callCount).toBe(1);
    expect(log.flowEvent.args[0][0].event).toBe(
      'email.verifyLoginEmail.delivered'
    );
    expect(log.flowEvent.args[0][0].flow_id).toBe('someFlowId');
    expect(log.flowEvent.args[0][0].flow_time > 0).toBe(true);
    expect(log.flowEvent.args[0][0].time > 0).toBe(true);
    expect(log.info.callCount).toBe(2);
    expect(log.info.args[0][0]).toBe('emailEvent');
    expect(log.info.args[0][1].domain).toBe('aol.com');
    expect(log.info.args[0][1].type).toBe('delivered');
    expect(log.info.args[0][1].template).toBe('verifyLoginEmail');
    expect(log.info.args[0][1].locale).toBe('en');
    expect(log.info.args[0][1].flow_id).toBe('someFlowId');
    expect(log.info.args[1][1].email).toBe('jane@aol.com');
    expect(log.info.args[1][1].domain).toBe('aol.com');
  });

  it('should log account email event (emailDelivered)', async () => {
    sandbox
      .stub(emailHelpers, 'logAccountEventFromMessage')
      .returns(Promise.resolve());
    const log = mockLog();
    const glean = mockGlean();
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
            name: 'X-Uid',
            value: 'en',
          },
        ],
      },
    });

    await mockedDelivery(log, glean).handleDelivery(mockMsg);
    sinon.assert.calledOnceWithExactly(
      emailHelpers.logAccountEventFromMessage,
      mockMsg,
      'emailDelivered'
    );
  });

  it('should log glean event for successful email delivery', async () => {
    const log = mockLog();
    const glean = mockGlean();
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
            name: 'X-Uid',
            value: 'en',
          },
        ],
      },
    });

    await mockedDelivery(log, glean).handleDelivery(mockMsg);
    sinon.assert.calledOnceWithExactly(glean.emailDelivery.success, requestForGlean, {
      uid: 'en',
      reason: 'verifyLoginEmail',
    });
  });
});
