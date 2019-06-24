/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub, Topic } from '@google-cloud/pubsub';
import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import * as pEvent from 'p-event';
import { assert, SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { stubInterface, stubObject } from 'ts-sinon';

import { Datastore } from '../../lib/db';
import { ServiceNotificationProcessor } from '../../lib/notificationProcessor';
import { ClientCapabilityService } from '../../lib/selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from '../../lib/selfUpdatingService/clientWebhookService';

const sandbox = sinon.createSandbox();

function stubResolve(value?: any): any {
  return sandbox.stub().returns({ promise: sandbox.stub().resolves(value) });
}

const baseMessage = {
  event: 'login',
  uid: '1e2122ba'
};

const baseLoginMessage = {
  ...baseMessage,
  clientId: '123client',
  deviceCount: 2,
  email: 'test@testuser.com',
  service: '123-client',
  userAgent: 'firefox'
};

const baseSubscriptionUpdateMessage = {
  ...baseMessage,
  event: 'subscription:update',
  isActive: true,
  productCapabilities: ['send:pro', 'vpn:basic'],
  productName: 'firefox-sub',
  subscriptionId: 'sub_123456'
};

describe('ServiceNotificationProcessor', () => {
  let sqs: any;
  let db: Datastore;
  let logger: Logger;
  let consumer: ServiceNotificationProcessor;
  let capabilityService: ClientCapabilityService;
  let webhookService: ClientWebhookService;
  let pubsub: PubSub;

  const response = {
    Messages: [
      {
        Body: '',
        MessageId: '123',
        ReceiptHandle: 'receipt-handle'
      }
    ]
  };

  const updateStubMessage = (message: any) => {
    response.Messages[0].Body = JSON.stringify(message);
  };

  const createConsumer = () => {
    consumer = new ServiceNotificationProcessor(
      logger,
      db,
      'https://sqs.eu-west-1.amazonaws.com/account-id/queue-name',
      sqs,
      capabilityService,
      webhookService,
      pubsub
    );
  };

  beforeEach(() => {
    sqs = sandbox.mock();
    sqs.receiveMessage = stubResolve(response);
    sqs.deleteMessage = stubResolve();
    sqs.deleteMessageBatch = stubResolve();
    sqs.changeMessageVisibility = stubResolve();

    db = stubInterface<Datastore>({
      fetchClientIds: []
    });
    logger = stubInterface<Logger>();
    capabilityService = stubInterface<ClientCapabilityService>({
      serviceData: {},
      start: Promise.resolve()
    });
    webhookService = stubInterface<ClientWebhookService>({
      serviceData: {},
      start: Promise.resolve()
    });
    pubsub = stubObject(new PubSub());
    createConsumer();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('stores on valid login message', async () => {
    updateStubMessage(baseLoginMessage);
    consumer.start();
    await pEvent(consumer.app, 'message_processed');
    consumer.stop();
    assert.calledOnce(db.storeLogin as SinonSpy);
    assert.calledWith(db.storeLogin as SinonSpy, baseLoginMessage.uid, baseLoginMessage.clientId);
  });

  it('fetches on valid subscription message', async () => {
    updateStubMessage(baseSubscriptionUpdateMessage);
    consumer.start();
    await pEvent(consumer.app, 'message_processed');
    consumer.stop();
    assert.calledWith(db.fetchClientIds as SinonSpy);
  });

  it('throws an error on invalid login message', async () => {
    updateStubMessage(Object.assign({}, { ...baseLoginMessage, email: false }));
    consumer.start();
    await pEvent(consumer.app, 'processing_error');
    consumer.stop();
    assert.calledOnce(logger.error as SinonSpy);
    cassert.equal((logger.error as SinonSpy).getCalls()[0].args[0], 'processingError');
  });

  it('throws an error on invalid subscription message', async () => {
    updateStubMessage(Object.assign({}, { ...baseSubscriptionUpdateMessage, productName: false }));
    consumer.start();
    await pEvent(consumer.app, 'processing_error');
    consumer.stop();
    assert.calledOnce(logger.error as SinonSpy);
    assert.calledWithMatch(logger.error as SinonSpy, 'processingError');
  });

  it('logs on message its not interested in', async () => {
    updateStubMessage(Object.assign({}, { ...baseLoginMessage, event: 'logout' }));
    consumer.start();
    await pEvent(consumer.app, 'message_processed');
    consumer.stop();
    assert.calledOnce(logger.debug as SinonSpy);
    assert.calledWithMatch(logger.debug as SinonSpy, 'unwantedMessage');
  });

  it('throws an error if the db is unavailable for a login message', async () => {
    const err = new Error('db login error');
    db.storeLogin = sandbox.stub().throws(err);
    updateStubMessage(baseLoginMessage);
    consumer.start();
    await pEvent(consumer.app, 'processing_error');
    consumer.stop();
    assert.calledOnce(logger.error as SinonSpy);
    assert.calledWithMatch(logger.error as SinonSpy, 'processingError', {
      err
    });
  });

  it('throws an error if the db is unavailable for a subscription message', async () => {
    const err = new Error('db subscription error');
    db.fetchClientIds = sandbox.stub().throws(err);
    updateStubMessage(baseSubscriptionUpdateMessage);
    consumer.start();
    await pEvent(consumer.app, 'processing_error');
    consumer.stop();
    assert.calledOnce(logger.error as SinonSpy);
    assert.calledWithMatch(logger.error as SinonSpy, 'processingError', {
      err
    });
  });

  it('logs a message for each RP to deliver to', async () => {
    webhookService = stubInterface<ClientWebhookService>({
      serviceData: {
        send: ['http://localhost:1234/magic'],
        vpn: ['http://localhost:1234/magic']
      },
      start: Promise.resolve()
    });
    db = stubInterface<Datastore>({
      fetchClientIds: ['send', 'vpn']
    });
    const topicPub = stubObject<Topic>(new Topic(pubsub, 'default'));
    pubsub = stubObject<PubSub>(new PubSub(), { topic: topicPub });
    createConsumer();

    consumer.start();
    await pEvent(consumer.app, 'message_processed');
    consumer.stop();
    assert.calledThrice(logger.debug as SinonSpy);

    // Note that we aren't resetting the sandbox here, so we have 2 log calls thus far
    db = stubInterface<Datastore>({
      fetchClientIds: ['send']
    });
    createConsumer();
    consumer.start();
    await pEvent(consumer.app, 'message_processed');
    consumer.stop();
    (logger.debug as SinonSpy).getCalls()[3].calledWith({
      messageId: undefined,
      topicName: 'rpQueue-send'
    });
  });
});
