/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Generate SQS Traffic for local event-broker testing.
 *
 * Utilizes the `chance` library to generate random FxA
 * Service Notifications for the event-broker to consume.
 *
 * @module
 */

import AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';
import { Chance } from 'chance';
import mozlog from 'mozlog';

import Config from '../config';
import { ClientCapabilityService } from '../lib/selfUpdatingService/clientCapabilityService';
import { FactoryBot, LoginEvent, SubscriptionEvent } from '../test/service-notifications';

AWS.config.update({
  region: 'us-east-1'
});

/** Total messages to generate before stopping.
 * @constant {number}
 * @default
 */
const MESSAGE_COUNT = 10_000;

const chance = new Chance();

const sqs = new SQS();
const queueUrl = Config.get('serviceNotificationQueueUrl');
const logger = mozlog(Config.get('log'))('generate-sqs-traffic');

// Promisify the AWS send message, the Node promisify mangled the TS signature
const sqsSendMessage = (params: SQS.SendMessageRequest): Promise<SQS.SendMessageResult> =>
  new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

/**
 * Queue a SQS message.
 *
 * @param message Object to send via SQS
 */
async function queueMessage(message: object): Promise<SQS.SendMessageResult> {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl
  };
  return sqsSendMessage(params);
}

/**
 * Start the SQS generation, this will run until `MESSAGE_COUNT` messages
 * have been inserted into the SQS queue.
 */
async function main() {
  const capabilityService = new ClientCapabilityService(
    logger,
    Config.get('clientCapabilityFetch')
  );

  await capabilityService.start();
  await capabilityService.stop();
  const clientData = capabilityService.serviceData();

  let i = 0;
  while (i < MESSAGE_COUNT) {
    const clientId = chance.pickone(Object.keys(clientData));
    const capabilities = clientData[clientId].map(cap => `${clientId}:${cap}`);
    const loginEvent = FactoryBot.build<LoginEvent>('loginEvent', { clientId });
    const loginResult = await queueMessage(loginEvent);
    logger.info('main', { ...loginEvent, messageId: loginResult.MessageId });
    const subEvent = FactoryBot.build<SubscriptionEvent>('subscriptionEvent', {
      isActive: true,
      productCapabilities: capabilities,
      uid: loginEvent.uid
    });
    const subResult = await queueMessage(subEvent);
    logger.info('main', { ...subEvent, messageId: subResult.MessageId });
    i += 1;
  }
}

main().then(() => {
  logger.info('main', { message: 'Shutting down' });
});
