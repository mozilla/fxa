/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import { SQS } from 'aws-sdk';
import { Logger } from 'mozlog';
import { Consumer } from 'sqs-consumer';
import * as joi from 'typesafe-joi';

import { Datastore } from './db';
import { ClientCapabilityService } from './selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from './selfUpdatingService/clientWebhookService';

// Event strings
const LOGIN_EVENT = 'login';
const SUBSCRIPTION_UPDATE_EVENT = 'subscription:update';

// Message schemas
const BASE_MESSAGE_SCHEMA = joi
  .object()
  .keys({
    event: joi.string().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

const LOGIN_SCHEMA = joi
  .object()
  .keys({
    clientId: joi.string().required(),
    deviceCount: joi
      .number()
      .integer()
      .required(),
    email: joi.string().required(),
    event: joi
      .string()
      .valid(LOGIN_EVENT)
      .required(),
    service: joi.string().required(),
    uid: joi.string().required(),
    userAgent: joi.string().required()
  })
  .unknown(true)
  .required();

const SUBSCRIPTION_UPDATE_SCHEMA = joi
  .object()
  .keys({
    event: joi
      .string()
      .valid(SUBSCRIPTION_UPDATE_EVENT)
      .required(),
    isActive: joi.bool().required(),
    productCapabilities: joi
      .array()
      .items(joi.string())
      .required(),
    productName: joi.string().required(),
    subscriptionId: joi.string().required(),
    uid: joi.string().required()
  })
  .unknown(true)
  .required();

class ServiceNotificationProcessor {
  public readonly app: Consumer;
  private readonly db: Datastore;
  private readonly logger: Logger;
  private readonly capabilityService: ClientCapabilityService;
  private readonly webhookService: ClientWebhookService;
  private readonly pubsub: PubSub;

  constructor(
    logger: Logger,
    db: Datastore,
    queueUrl: string,
    sqs: SQS,
    capabilityService: ClientCapabilityService,
    webhookService: ClientWebhookService,
    pubsub: PubSub
  ) {
    this.db = db;
    this.logger = logger;
    this.app = Consumer.create({
      batchSize: 10,
      handleMessage: async (message: SQS.Message) => {
        return await this.handleMessage(message);
      },
      queueUrl,
      sqs
    });

    this.app.on('error', err => {
      logger.error('consumerError', { err });
    });

    this.app.on('processing_error', err => {
      logger.error('processingError', { err });
    });

    this.capabilityService = capabilityService;
    this.webhookService = webhookService;
    this.pubsub = pubsub;
  }

  public start() {
    this.app.start();
    this.capabilityService.start().catch(err => {
      this.logger.error('notificationProcessorStartCapability', { err });
      process.exit(1);
    });
    this.webhookService.start().catch(err => {
      this.logger.error('notificationProcessorStartWebhook', { err });
      process.exit(1);
    });
  }

  public stop() {
    this.app.stop();
    this.capabilityService.stop();
    this.webhookService.stop();
  }

  private async handleMessage(sqsMessage: SQS.Message) {
    const body = JSON.parse(sqsMessage.Body || '{}');
    const message = joi.attempt(body, BASE_MESSAGE_SCHEMA);
    switch (message.event) {
      case LOGIN_EVENT: {
        const loginMessage = joi.attempt(message, LOGIN_SCHEMA);
        await this.db.storeLogin(loginMessage.uid, loginMessage.clientId);
        this.logger.debug('sqs.loginEvent', loginMessage);
        return;
      }
      case SUBSCRIPTION_UPDATE_EVENT: {
        const subMessage = joi.attempt(message, SUBSCRIPTION_UPDATE_SCHEMA);
        const clientIds = await this.db.fetchClientIds(subMessage.uid);

        this.logger.debug('sqs.subEvent', subMessage);

        // Split the product capabilities by clientId each capability goes to
        const notifyClientIds: { [clientId: string]: string[] } = {};
        subMessage.productCapabilities
          .map(item => item.split(':'))
          .forEach(([clientId, capability]) => {
            if (notifyClientIds[clientId]) {
              notifyClientIds[clientId].push(capability);
            } else {
              notifyClientIds[clientId] = [capability];
            }
          });

        const baseMessage = {
          capabilities: [],
          event: subMessage.event,
          isActive: subMessage.isActive,
          uid: subMessage.uid
        };

        Object.entries(notifyClientIds)
          .filter(([clientId]) => clientIds.includes(clientId))
          .forEach(async ([clientId, capabilities]) => {
            const topicName = 'rpQueue-' + clientId;
            const rpMessage = Object.assign(
              {},
              {
                ...baseMessage,
                capabilities
              }
            );

            // TODO: Failures to publish due to missing queue should be Sentry reported.
            const messageId = await this.pubsub.topic(topicName).publishJSON(rpMessage);
            this.logger.debug('publishedMessage', { topicName, messageId });
          });
        return;
      }
    }
    // Anything that isn't a message we want
    this.logger.debug('unwantedMessage', { message });
  }
}

export { ServiceNotificationProcessor };
