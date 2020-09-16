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
import { NestFactory } from '@nestjs/core';
import { Chance } from 'chance';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { AppModule } from '../app.module';
import { ClientCapabilityService } from '../client-capability/client-capability.service';
import Config from '../config';
import { QueueworkerService } from '../queueworker/queueworker.service';
import {
  FactoryBot,
  LoginEvent,
  SubscriptionEvent,
} from '../test/service-notifications';

/** Total messages to generate before stopping.
 * @constant {number}
 * @default
 */
const MESSAGE_COUNT = parseInt(process.env.MESSAGE_COUNT ?? '10_000');

const chance = new Chance();

/**
 * Start the SQS generation, this will run until `MESSAGE_COUNT` messages
 * have been inserted into the SQS queue.
 */
async function main() {
  // Ensure we disable the queue worker
  Config.set('disableQueueWorker', true);

  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  const capabilityService = app.get(ClientCapabilityService);

  // Setup the logger
  const logger = await app.resolve(MozLoggerService);
  logger.setContext('generate-sqs-traffix');

  // Get SQS related information
  const queueWorker = app.get(QueueworkerService);
  const sqs = queueWorker.sqs;
  const queue = queueWorker.queueName;

  const clientData = capabilityService.capabilities;

  const queueMessage = (message: object) => {
    return sqs
      .sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: queue,
      })
      .promise();
  };

  let i = 0;
  while (i < MESSAGE_COUNT) {
    const clientId = chance.pickone(Object.keys(clientData));
    const capabilities = clientData[clientId].map(
      (cap) => `${clientId}:${cap}`
    );
    const loginEvent = FactoryBot.build<LoginEvent>('loginEvent', { clientId });
    const loginResult = await queueMessage(loginEvent);
    logger.info('main', { ...loginEvent, messageId: loginResult.MessageId });
    const subEvent = FactoryBot.build<SubscriptionEvent>('subscriptionEvent', {
      isActive: true,
      productCapabilities: capabilities,
      uid: loginEvent.uid,
    });
    const subResult = await queueMessage(subEvent);
    logger.info('main', { ...subEvent, messageId: subResult.MessageId });
    i += 1;
  }
  await app.close();
}

main();
