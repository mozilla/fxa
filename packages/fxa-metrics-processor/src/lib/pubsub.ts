/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Service, Inject } from 'typedi';
import { v1, Message, PubSub } from '@google-cloud/pubsub';
import * as Sentry from '@sentry/node';
import { EventEmitter, once } from 'events';

import Config from '../config';
import { MessageProcessor } from '../lib/message-processor';

const queueConfig = Config.getProperties().queues;

@Service()
export class QueueProcessor {
  private subClient: any;
  private pubSubClient: PubSub;
  private formattedRawEventSubscription: any;
  private shouldStop = false;
  private emitter = new EventEmitter();
  private sentry = Sentry;

  @Inject()
  private messageProcessor!: MessageProcessor;

  constructor() {
    this.subClient = new v1.SubscriberClient();
    this.pubSubClient = new PubSub({ projectId: queueConfig.pubsubProjectId });
    this.formattedRawEventSubscription = this.subClient.subscriptionPath(
      queueConfig.pubsubProjectId,
      queueConfig.rawEvents
    );
  }

  /**
   * Retrieve a given batch of messages from the raw event queue.
   */
  private async pullMessageBatch(): Promise<Message[]> {
    const request = {
      subscription: this.formattedRawEventSubscription,
      maxMessages: queueConfig.maxEventsPerBatch
    };
    const [response] = await this.subClient.pull(request);
    return response.receivedMessages;
  }

  /**
   * Handle an error from the message transformation.
   *
   * @param message Message that caused the error
   * @param err Error processing the message
   */
  private async handleMessageError(message: Message, err: Error): Promise<boolean> {
    let messageId: string | undefined;
    let handled = true;
    try {
      messageId = await this.pubSubClient.topic(queueConfig.deadLetterTopic).publish(message.data);
    } catch (publishErr) {
      // Replace our error and link to the original one
      publishErr.cause = err;
      err = publishErr;
      handled = false;
    }
    this.sentry.withScope(scope => {
      scope.setContext('message', {
        id: message.id,
        deadLetterId: messageId,
        publishTime: message.publishTime,
        data: message.data.toString(),
        attributes: JSON.stringify(message.attributes)
      });
      this.sentry.captureException(err);
    });
    return handled;
  }

  /**
   * Process a batch of messages with the `messageProcessor` from the PubSub
   * topic.
   *
   * For a given message batch, for each message this will:
   *   1. Apply the messageProcessor to transform/filter the raw message
   *   2. Handle messageProcessor errors by sending them to a dead letter topic
   *      and report them to Sentry.
   *   3. Acknowledge the batch of messages.
   */
  private async processBatch() {
    const messages = await this.pullMessageBatch();
    const ackIds: string[] = [];
    for (const message of messages) {
      try {
        const newMessage = this.messageProcessor.processMessage(message);
        if (newMessage) {
          await this.pubSubClient.topic(queueConfig.amplitudeTopic).publishJSON(newMessage);
        }
        ackIds.push(message.ackId);
      } catch (err) {
        const handled = await this.handleMessageError(message, err);
        // Only after we're sure we published this to the dead letter topic
        // and reported it can we ack it.
        if (handled) {
          ackIds.push(message.ackId);
        }
      }
    }
    const ackRequest = {
      subscription: this.formattedRawEventSubscription,
      ackIds
    };
    await this.subClient.acknowledge(ackRequest);
  }

  public async start() {
    while (!this.shouldStop) {
      await this.processBatch();
    }
    this.emitter.emit('stopped');
  }

  public async stop() {
    this.shouldStop = true;
    await once(this.emitter, 'stopped');
  }
}
