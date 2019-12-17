/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import { SQS } from 'aws-sdk';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Consumer } from 'sqs-consumer';

import { Datastore } from './db';
import { ClientCapabilityService } from './selfUpdatingService/clientCapabilityService';
import { ClientWebhookService } from './selfUpdatingService/clientWebhookService';
import { configureSqsSentry } from './sentry';
import {
  DELETE_EVENT,
  deleteSchema,
  LOGIN_EVENT,
  loginSchema,
  PASSWORD_CHANGE_EVENT,
  PASSWORD_RESET_EVENT,
  passwordSchema,
  PRIMARY_EMAIL_EVENT,
  PROFILE_CHANGE_EVENT,
  profileSchema,
  ServiceNotification,
  SUBSCRIPTION_UPDATE_EVENT,
  subscriptionUpdateSchema
} from './serviceNotifications';

function unhandledEventType(e: ServiceNotification) {
  throw new Error('Unhandled message event type: ' + e);
}

class ServiceNotificationProcessor {
  public readonly app: Consumer;

  constructor(
    private readonly logger: Logger,
    private readonly db: Datastore,
    private metrics: StatsD,
    private readonly capabilityService: ClientCapabilityService,
    private readonly webhookService: ClientWebhookService,
    private readonly pubsub: PubSub,
    private readonly topicPrefix: string,
    queueUrl: string,
    sqs: SQS
  ) {
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

    // Sentry error handling
    configureSqsSentry(this.app);

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

  private async handleDeleteEvent(message: deleteSchema) {
    this.metrics.increment('message.type.delete');
    const clientIds = await this.db.fetchClientIds(message.uid);
    for (const clientId of clientIds) {
      const topicName = this.topicPrefix + clientId;
      const messageId = await this.pubsub
        .topic(topicName)
        .publishJSON({ event: message.event, uid: message.uid, timestamp: Date.now() });
      this.logger.debug('publishedMessage', { topicName, messageId });
    }
  }

  private async handleProfileEvent(message: profileSchema) {
    this.metrics.increment('message.type.profile');
    const clientIds = await this.db.fetchClientIds(message.uid);
    for (const clientId of clientIds) {
      const topicName = this.topicPrefix + clientId;
      const messageId = await this.pubsub
        .topic(topicName)
        .publishJSON({ event: message.event, uid: message.uid, timestamp: Date.now() });
      this.logger.debug('publishedMessage', { topicName, messageId });
    }
  }

  private async handlePasswordEvent(message: passwordSchema) {
    this.metrics.increment('message.type.password');
    const clientIds = await this.db.fetchClientIds(message.uid);
    for (const clientId of clientIds) {
      const topicName = this.topicPrefix + clientId;
      const messageId = await this.pubsub.topic(topicName).publishJSON({
        changeTime: message.timestamp ? message.timestamp : message.ts * 1000,
        event: message.event,
        timestamp: Date.now(),
        uid: message.uid
      });
      this.logger.debug('publishedMessage', { topicName, messageId });
    }
  }

  private async handleLoginEvent(message: loginSchema) {
    // Sync and some logins don't emit a clientId, so we have nothing to track
    if (!message.clientId) {
      this.logger.debug('unwantedMessage', {
        message
      });
      return;
    }
    this.metrics.increment('message.type.login');
    await this.db.storeLogin(message.uid, message.clientId);
  }

  private async handleSubscriptionEvent(message: subscriptionUpdateSchema) {
    this.metrics.increment('message.type.subscription');
    const clientIds = await this.db.fetchClientIds(message.uid);

    // Split the product capabilities by clientId each capability goes to
    const notifyClientIds: { [clientId: string]: string[] } = {};
    message.productCapabilities
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
      changeTime: message.eventCreatedAt,
      event: message.event,
      isActive: message.isActive,
      uid: message.uid
    };

    const notifyClientPromises = Object.entries(notifyClientIds)
      .filter(([clientId]) => clientIds.includes(clientId))
      .map(async ([clientId, capabilities]) => {
        const topicName = this.topicPrefix + clientId;
        const rpMessage = Object.assign(
          {},
          {
            ...baseMessage,
            capabilities,
            timestamp: Date.now()
          }
        );

        const messageId = await this.pubsub.topic(topicName).publishJSON(rpMessage);
        this.logger.debug('publishedMessage', { topicName, messageId });
      });
    await Promise.all(notifyClientPromises);
  }

  private async handleMessage(sqsMessage: SQS.Message) {
    const processingStart = Date.now();
    const body = JSON.parse(sqsMessage.Body || '{}');
    const message = ServiceNotification.from(this.logger, body);
    if (!message) {
      // Anything that isn't a message we want
      this.logger.debug('unwantedMessage', { message: body });
      return;
    }
    const msgTimestamp = message.timestamp ? message.timestamp : message.ts * 1000;
    this.metrics.timing('message.queueDelay', processingStart - msgTimestamp);
    switch (message.event) {
      case LOGIN_EVENT: {
        await this.handleLoginEvent(message);
        break;
      }
      case SUBSCRIPTION_UPDATE_EVENT: {
        await this.handleSubscriptionEvent(message);
        this.metrics.timing(
          'message.sub.eventDelay',
          processingStart - message.eventCreatedAt * 1000
        );
        break;
      }
      case DELETE_EVENT: {
        await this.handleDeleteEvent(message);
        break;
      }
      case PRIMARY_EMAIL_EVENT:
      case PROFILE_CHANGE_EVENT: {
        await this.handleProfileEvent(message);
        break;
      }
      case PASSWORD_CHANGE_EVENT:
      case PASSWORD_RESET_EVENT: {
        await this.handlePasswordEvent(message);
        break;
      }
      default:
        unhandledEventType(message);
    }
    const processingEnd = Date.now();
    this.metrics.timing('message.processing.total', processingEnd - processingStart);
  }
}

export { ServiceNotificationProcessor };
