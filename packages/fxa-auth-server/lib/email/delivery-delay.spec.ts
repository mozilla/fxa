/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';
import sinon from 'sinon';

const { mockLog, mockStatsd } = require('../../test/mocks');
const emailHelpers = require('./utils/helpers');
const deliveryDelay = require('./delivery-delay');

let sandbox: sinon.SinonSandbox;
const mockDeliveryDelayQueue = new EventEmitter() as EventEmitter & {
  start: () => void;
};
(mockDeliveryDelayQueue as any).start = function start() {};

function mockMessage(msg: any) {
  msg.del = sandbox.spy();
  msg.headers = msg.headers || {};
  return msg;
}

function createDeliveryDelayMessage(overrides: any = {}) {
  const defaults = {
    eventType: 'DeliveryDelay',
    deliveryDelay: {
      delayType: 'TransientCommunicationFailure',
      delayedRecipients: [{ emailAddress: 'user@example.com' }],
    },
    mail: {
      timestamp: '2023-12-17T14:59:38.237Z',
      messageId: 'test-message-id',
      source: 'sender@example.com',
      headers: [],
    },
  };
  return mockMessage({ ...defaults, ...overrides });
}

function mockedDeliveryDelay(log: any, statsd: any) {
  return deliveryDelay(log, statsd)(mockDeliveryDelayQueue);
}

describe('delivery delay messages', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not log an error for headers', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(
      mockMessage({ junk: 'message' })
    );
    expect(log.error.callCount).toBe(0);
  });

  it('should log an error for missing headers', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const message = mockMessage({ junk: 'message' });
    message.headers = undefined;
    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(message);
    expect(log.error.callCount).toBe(1);
  });

  it('should log delivery delay with all fields', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage({
      deliveryDelay: {
        delayType: 'TransientCommunicationFailure',
        timestamp: '2023-12-17T14:59:38.237Z',
        delayedRecipients: [
          {
            emailAddress: 'recipient@example.com',
            status: '4.4.7',
            diagnosticCode: 'smtp; 450 4.4.7 Message delayed',
          },
        ],
        expirationTime: '2023-12-18T14:59:38.237Z',
        reportingMTA: 'a1-23.smtp-out.amazonses.com',
      },
      mail: {
        headers: [
          { name: 'X-Template-Name', value: 'verifyLoginEmail' },
          { name: 'Content-Language', value: 'en' },
        ],
      },
    });

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);

    sinon.assert.calledOnceWithExactly(
      statsd.increment,
      'email.deliveryDelay.message',
      {
        delayType: 'TransientCommunicationFailure',
        hasExpiration: 'true',
        template: 'verifyLoginEmail',
      }
    );

    const loggedData = log.info.args[0][1];
    expect(log.info.args[0][0]).toBe('handleDeliveryDelay');
    expect(loggedData).toMatchObject({
      email: 'recipient@example.com',
      domain: 'other',
      delayType: 'TransientCommunicationFailure',
      status: '4.4.7',
      template: 'verifyLoginEmail',
      lang: 'en',
      expirationTime: '2023-12-18T14:59:38.237Z',
      reportingMTA: 'a1-23.smtp-out.amazonses.com',
    });
  });

  it('should handle delivery delay with notificationType', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage({
      notificationType: 'DeliveryDelay',
      eventType: undefined,
      deliveryDelay: {
        delayType: 'MailboxFull',
        delayedRecipients: [
          { emailAddress: 'user@example.com', status: '4.2.2' },
        ],
      },
    });

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);

    expect(statsd.increment.args[0][1].delayType).toBe('MailboxFull');
    expect(log.info.args[0][1]).toMatchObject({
      email: 'user@example.com',
      status: '4.2.2',
    });
  });

  it('should log account email event (emailDelayed)', async () => {
    sandbox
      .stub(emailHelpers, 'logAccountEventFromMessage')
      .returns(Promise.resolve());
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage({
      deliveryDelay: {
        delayType: 'SpamDetected',
        delayedRecipients: [{ emailAddress: 'user@example.com' }],
      },
      mail: { headers: [{ name: 'X-Uid', value: 'test-uid-123' }] },
    });

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);
    sinon.assert.calledOnceWithExactly(
      emailHelpers.logAccountEventFromMessage,
      mockMsg,
      'emailDelayed'
    );
  });

  it('should handle popular email domain', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage({
      deliveryDelay: {
        delayType: 'RecipientServerError',
        delayedRecipients: [{ emailAddress: 'user@yahoo.com' }],
      },
    });

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);

    expect(log.info.args[0][1].domain).toBe('yahoo.com');
  });

  it('should handle missing delayedRecipients gracefully', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage({
      deliveryDelay: {
        delayType: 'Undetermined',
        delayedRecipients: undefined,
      },
    });

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);

    sinon.assert.calledOnce(statsd.increment);
    expect(log.info.callCount).toBe(0);
    sinon.assert.calledOnce(mockMsg.del);
  });

  it('should handle errors and still delete message', async () => {
    const log = mockLog();
    const statsd = mockStatsd();
    const mockMsg = createDeliveryDelayMessage();

    sandbox
      .stub(emailHelpers, 'getAnonymizedEmailDomain')
      .throws(new Error('Test error'));

    await mockedDeliveryDelay(log, statsd).handleDeliveryDelay(mockMsg);

    sinon.assert.calledWith(log.error, 'handleDeliveryDelay.error');
    expect(log.error.args[0][1]).toMatchObject({
      messageId: 'test-message-id',
    });

    sinon.assert.calledWith(statsd.increment, 'email.deliveryDelay.error');
    sinon.assert.calledOnce(mockMsg.del);
  });
});
