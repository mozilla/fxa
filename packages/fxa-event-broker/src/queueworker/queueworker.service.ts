/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CreateQueueCommand,
  ListQueuesCommand,
  Message,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { PubSub } from '@google-cloud/pubsub';
import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { StatsD } from 'hot-shots';
import { Consumer } from 'sqs-consumer';
import Sentry from '@sentry/node';

import { ClientCapabilityService } from '../client-capability/client-capability.service';
import { ClientWebhooksService } from '../client-webhooks/client-webhooks.service';
import { AppConfig } from '../config';
import { FirestoreService } from '../firestore/firestore.service';
import { ServiceNotification } from './service-notification.interface';
import * as dto from './sqs.dto';

function extractRegionFromUrl(url: string) {
  const matchResult = url.match(/(?:.*\/sqs\.)([^.]+)/i);
  if (!matchResult || matchResult.length !== 2) {
    return undefined;
  } else {
    return matchResult[1];
  }
}

@Injectable()
export class QueueworkerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private region: string;
  private topicPrefix: string;
  private readonly app: Consumer;
  private disableQueueWorker: boolean;

  public queueName: string;
  public sqs: SQSClient;

  constructor(
    private configService: ConfigService<AppConfig>,
    private log: MozLoggerService,
    @Inject('METRICS') private metrics: StatsD,
    @Inject('GOOGLEPUBSUB') private pubsub: PubSub,
    private firestore: FirestoreService,
    private clientCapability: ClientCapabilityService,
    private clientWebhooks: ClientWebhooksService
  ) {
    this.queueName = configService.get('serviceNotificationQueueUrl') as string;
    this.disableQueueWorker =
      this.configService.get<boolean>('disableQueueWorker') ?? false;
    this.topicPrefix = configService.get('topicPrefix') as string;

    const region = extractRegionFromUrl(this.queueName);
    this.region = region || 'us-east-1';
    this.sqs = new SQSClient({
      ...(this.queueName.includes('localhost:4100') && {
        accessKeyId: 'fake',
        ['endpoint' as any]: 'localhost:4100',
        secretAccessKey: 'fake',
        sslEnabled: false,
      }),
      region: this.region,
    });
    this.app = Consumer.create({
      batchSize: 10,
      handleMessage: (message: Message) => {
        return this.handleMessage(message);
      },
      queueUrl: this.queueName,
      sqs: this.sqs,
    });

    this.app.on('error', (err) => {
      this.log.error('consumerError', { err });
      Sentry.captureException(err);
    });

    this.app.on('processing_error', (err) => {
      this.log.error('processingError', { err });
      Sentry.captureException(err);
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.queueName.includes('localhost:4100')) {
      // Verify that the queue exists
      const queueParts = this.queueName.split('/');
      const queueName = queueParts[queueParts.length - 1];
      // This returns paginated results, defaulting to the first 1000.
      // We don't expect to have this many initially that we can read.
      const command = new ListQueuesCommand({});
      const queues = await this.sqs.send(command);

      if (!queues.QueueUrls || !queues.QueueUrls.includes(queueName)) {
        const command = new CreateQueueCommand({ QueueName: queueName });
        await this.sqs.send(command);
      }
    } else {
      // Production queue names must have the region in them.
      const region = extractRegionFromUrl(this.queueName);
      if (!region) {
        Sentry.captureMessage('Cant find region in service url');
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
   * Publish a message to the pubsub topic for the client.
   */
  private async publishMessage(clientId: string, json: any) {
    const topicName = this.topicPrefix + clientId;
    if (this.pubsub.isEmulator) {
      const topics = await this.pubsub.getTopics();
      if (topics && topics[0]) {
        const topic = topics[0].find((t) => t.name.endsWith(topicName));
        if (!topic) {
          const [newTopic] = await this.pubsub.createTopic(topicName);
          await newTopic.createSubscription(`sub-${clientId}`, {
            pushConfig: {
              pushEndpoint: `http://host.docker.internal:8093/v1/proxy/${clientId}`,
            },
          });
        }
      }
    }
    return this.pubsub.topic(topicName).publishMessage({ json });
  }

  /**
   * Merge the clientIds for the user and the resource servers and remove
   * duplicates.
   */
  private async clientIdsForUserAndResourceServers(
    uid: string
  ): Promise<string[]> {
    const userClientIds = await this.firestore.fetchClientIds(uid);
    return [
      ...new Set([...userClientIds, ...this.clientWebhooks.resourceServers]),
    ];
  }

  /**
   * Generic fan-out of the message to the pubsub clientId queues.
   *
   * @param message Incoming SQS message type supported for generic fanout.
   * @param eventType Event type to use for metrics
   */
  private async handleMessageFanout(
    message:
      | dto.deleteSchema
      | dto.profileSchema
      | dto.passwordSchema
      | dto.appleUserMigrationSchema
      | dto.metricsChangeSchema,
    eventType: string
  ) {
    this.metrics.increment('message.type', { eventType });
    const clientIds = await this.clientIdsForUserAndResourceServers(
      message.uid
    );
    for (const clientId of clientIds) {
      const messageId = await this.publishMessage(clientId, {
        changeTime: message.timestamp ? message.timestamp : message.ts * 1000,
        event: message.event,
        timestamp: Date.now(),
        uid: message.uid,
        //@ts-ignore
        email: message.email,
      });
      this.log.debug('publishedMessage', { clientId, messageId });
    }
  }

  /**
   * Send delete event to RPs and delete user record from datastore.
   *
   * @param message
   * @private
   */
  private async handleDeleteEvent(message: dto.deleteSchema) {
    await this.handleMessageFanout(message, 'delete');

    await this.firestore.deleteUser(message.uid);
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
    const clientIds = await this.clientIdsForUserAndResourceServers(
      message.uid
    );
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
        const rpMessage = Object.assign(
          {},
          {
            ...baseMessage,
            capabilities,
            timestamp: Date.now(),
          }
        );

        const messageId = await this.publishMessage(clientId, rpMessage);
        this.log.debug('publishedMessage', { clientId, messageId });
      });
    await Promise.all(notifyClientPromises);
  }

  /**
   * Notify Pocket that a user's Apple account has been migrated.
   *
   * @param message Incoming SQS Message
   */
  private async handleAppleUserMigrationEvent(
    message: dto.appleUserMigrationSchema
  ) {
    // Note the hardcoded Pocket clientId, this value should not change in production
    const clientId = '749818d3f2e7857f';
    this.metrics.increment('message.type', { eventType: 'appleMigration' });
    const rpMessage = {
      timestamp: Date.now(),
      ...message,
    };
    await this.publishMessage(clientId, rpMessage);
  }

  /**
   * Process a SQS message, dispatch based on message event type.
   *
   * @param sqsMessage Incoming SQS Message
   */
  private async handleMessage(sqsMessage: Message) {
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
        await this.handleDeleteEvent(message);
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
      case dto.APPLE_USER_MIGRATION_EVENT: {
        await this.handleAppleUserMigrationEvent(message);
        break;
      }
      case dto.METRICS_CHANGE_EVENT: {
        await this.handleMessageFanout(message, 'metricsOptIn');
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
