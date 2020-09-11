/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { PubSub } from '@google-cloud/pubsub';
import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS, { SQS } from 'aws-sdk';
import { StatsD } from 'hot-shots';
import { Consumer } from 'sqs-consumer';

import { ClientCapabilityService } from '../client-capability/client-capability.service';
import { AppConfig } from '../config';
import { FirestoreService } from '../firestore/firestore.service';
import { MozLoggerService } from '../logger/logger.service';
import { ServiceNotification } from './service-notification.interface';
import * as dto from './sqs.dto';

function extractRegionFromUrl(url: string) {
  const matchResult = url.match(/(?:.*\/sqs\.)([^\.]+)/i);
  if (!matchResult || matchResult.length !== 2) {
    return undefined;
  } else {
    return matchResult[1];
  }
}

@Injectable()
export class QueueworkerService
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private region: string;
  private topicPrefix: string;
  private readonly app: Consumer;
  private disableQueueWorker: boolean;

  public queueName: string;
  public sqs: SQS;

  constructor(
    private configService: ConfigService<AppConfig>,
    private log: MozLoggerService,
    @Inject('METRICS') private metrics: StatsD,
    @Inject('GOOGLEPUBSUB') private pubsub: PubSub,
    private firestore: FirestoreService,
    private clientCapability: ClientCapabilityService
  ) {
    const env = this.configService.get<string>('env');
    this.queueName = configService.get('serviceNotificationQueueUrl') as string;
    this.disableQueueWorker =
      this.configService.get<boolean>('disableQueueWorker') ?? false;
    if (env === 'development' && this.queueName.includes('localhost:4100')) {
      AWS.config.update({
        accessKeyId: 'fake',
        ['endpoint' as any]: 'localhost:4100',
        secretAccessKey: 'fake',
        sslEnabled: false,
      });
    }
    this.topicPrefix = configService.get('topicPrefix') as string;

    const region = extractRegionFromUrl(this.queueName);
    this.region = region || 'us-east-1';
    this.sqs = new SQS({ region: this.region });
    this.app = Consumer.create({
      batchSize: 10,
      handleMessage: (message: SQS.Message) => {
        return this.handleMessage(message);
      },
      queueUrl: this.queueName,
      sqs: this.sqs,
    });
    this.app.on('error', (err) => {
      this.log.error('consumerError', { err });
    });

    this.app.on('processing_error', (err) => {
      this.log.error('processingError', { err });
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    const env = this.configService.get<string>('env');
    if (env === 'development' && this.queueName.includes('localhost:4100')) {
      // Verify that the queue exists
      const queueParts = this.queueName.split('/');
      const queueName = queueParts[queueParts.length - 1];
      const queues = await this.sqs.listQueues().promise();

      if (!queues.QueueUrls || !queues.QueueUrls.includes(queueName)) {
        await this.sqs
          .createQueue({
            QueueName: queueName,
          })
          .promise();
      }
    } else {
      // Production queue names must have the region in them.
      const region = extractRegionFromUrl(this.queueName);
      if (!region) {
        this.log.error('invalidServiceUrl', {
          message: 'Cant find region in service url',
          serviceNotificationQueueUrl: this.queueName,
        });
        process.exit(8);
      }
    }
    if (!this.disableQueueWorker) {
      this.app.start();
    }
  }

  onApplicationShutdown(): void {
    if (!this.disableQueueWorker) {
      this.app.stop();
    }
  }

  /**
   * Generic fan-out of the message to the pubsub clientId queues.
   *
   * @param message Incoming SQS message type supported for generic fanout.
   * @param eventType Event type to use for metrics
   */
  private async handleMessageFanout(
    message: dto.deleteSchema | dto.profileSchema | dto.passwordSchema,
    eventType: string
  ) {
    this.metrics.increment('message.type', { eventType });
    const clientIds = await this.firestore.fetchClientIds(message.uid);
    for (const clientId of clientIds) {
      const topicName = this.topicPrefix + clientId;
      const messageId = await this.pubsub.topic(topicName).publishJSON({
        changeTime: message.timestamp ? message.timestamp : message.ts * 1000,
        event: message.event,
        timestamp: Date.now(),
        uid: message.uid,
      });
      this.log.debug('publishedMessage', { topicName, messageId });
    }
  }

  /**
   * Save login to RP to datastore.
   *
   * Logins are not distributed to RPs as they already know if a user has
   * logged in. They are used to keep track of what RPs a user has authenticated
   * to for future event distribution.
   *
   * @param message Incoming SQS Message
   */
  private async handleLoginEvent(message: dto.loginSchema) {
    // Sync and some logins don't emit a clientId, so we have nothing to track
    if (!message.clientId) {
      this.log.debug('unwantedMessage', {
        message,
      });
      return;
    }
    this.metrics.increment('message.type', { eventType: 'login' });
    // In case a SQS source capitalized the client id, lower-case it for consistency.
    await this.firestore.storeLogin(
      message.uid,
      message.clientId.toLowerCase()
    );
  }

  /**
   * Process and fan out subscription state messages.
   *
   * Determines all the capabilities to distribute to each RP that the user
   * has logged into, then fans the messages out to their PubSub queues.
   *
   * @param message Incoming SQS Message
   */
  private async handleSubscriptionEvent(message: dto.subscriptionUpdateSchema) {
    this.metrics.increment('message.type', { eventType: 'subscription' });
    const clientIds = await this.firestore.fetchClientIds(message.uid);
    const clientCapabilities = this.clientCapability.capabilities;

    // Split the product capabilities by clientId each capability goes to
    const notifyClientIds: { [clientId: string]: string[] } = {};
    message.productCapabilities.forEach((capability) =>
      Object.entries(clientCapabilities)
        .filter(([, capabilities]) => capabilities.includes(capability))
        .forEach(([clientId]) => {
          notifyClientIds[clientId] = (notifyClientIds[clientId] || []).concat([
            capability,
          ]);
        })
    );

    const baseMessage = {
      capabilities: [],
      // Stripe eventCreatedAt is stored as seconds, and changeTime should be in milliseconds
      changeTime: message.eventCreatedAt * 1000,
      event: message.event,
      isActive: message.isActive,
      uid: message.uid,
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
            timestamp: Date.now(),
          }
        );

        const messageId = await this.pubsub
          .topic(topicName)
          .publishJSON(rpMessage);
        this.log.debug('publishedMessage', { topicName, messageId });
      });
    await Promise.all(notifyClientPromises);
  }

  /**
   * Process a SQS message, dispatch based on message event type.
   *
   * @param sqsMessage Incoming SQS Message
   */
  private async handleMessage(sqsMessage: SQS.Message) {
    const processingStart = Date.now();
    const body = JSON.parse(sqsMessage.Body || '{}');
    const message = ServiceNotification.from(this.log, body);
    if (!message) {
      // Anything that isn't a message we want
      this.log.debug('unwantedMessage', { message: body });
      return;
    }
    const msgTimestamp = message.timestamp
      ? message.timestamp
      : message.ts * 1000;
    this.metrics.timing('message.queueDelay', processingStart - msgTimestamp);
    switch (message.event) {
      case dto.LOGIN_EVENT: {
        await this.handleLoginEvent(message);
        break;
      }
      case dto.SUBSCRIPTION_UPDATE_EVENT: {
        await this.handleSubscriptionEvent(message);
        this.metrics.timing(
          'message.sub.eventDelay',
          processingStart - message.eventCreatedAt * 1000
        );
        break;
      }
      case dto.DELETE_EVENT: {
        await this.handleMessageFanout(message, 'delete');
        break;
      }
      case dto.PRIMARY_EMAIL_EVENT:
      case dto.PROFILE_CHANGE_EVENT: {
        await this.handleMessageFanout(message, 'profile');
        break;
      }
      case dto.PASSWORD_CHANGE_EVENT:
      case dto.PASSWORD_RESET_EVENT: {
        await this.handleMessageFanout(message, 'password');
        break;
      }
      default:
        unhandledEventType(message);
    }
    const processingEnd = Date.now();
    this.metrics.timing(
      'message.processing.total',
      processingEnd - processingStart
    );
  }
}

function unhandledEventType(e: ServiceNotification) {
  throw new Error('Unhandled message event type: ' + e);
}
