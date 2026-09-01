/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Message, PubSub, Subscription } from '@google-cloud/pubsub';
import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  type LoggerService,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringDedupeManager } from './metering-dedupe.manager';
import { MeteringEventsManager } from './metering-events.manager';
import { MeteringPubSubConfig } from './metering-pubsub.config';
import { MeteringPubSubClient } from './metering-pubsub.provider';
import type { MeteringWireEvent } from './metering.schema';
import type { PubSubMessage } from './metering.types';
import { BatchBuffer } from './utils/batchBuffer';
import { hashEventId } from './utils/hashEventId';
import { parseWireEvent } from './utils/parseWireEvent';

interface BufferedMessage {
  message: PubSubMessage;
  event: MeteringWireEvent;
  key: string;
}

interface ClassifiedBatch {
  fresh: BufferedMessage[];
  duplicates: BufferedMessage[];
  pending: BufferedMessage[];
}

@Injectable()
export class MeteringConsumerService
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly subscription: Subscription;
  private readonly buffer: BatchBuffer<BufferedMessage>;
  private started = false;

  constructor(
    private readonly meteringPubSubConfig: MeteringPubSubConfig,
    @Inject(MeteringPubSubClient) pubsub: PubSub,
    private readonly meteringDedupeManager: MeteringDedupeManager,
    private readonly meteringEventsManager: MeteringEventsManager,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    this.subscription = pubsub.subscription(
      this.meteringPubSubConfig.subscriptionName,
      {
        flowControl: {
          maxMessages: this.meteringPubSubConfig.maxOutstandingMessages,
        },
      }
    );
    this.buffer = new BatchBuffer({
      maxSize: this.meteringPubSubConfig.consumerBatchSize,
      flushIntervalMs: this.meteringPubSubConfig.consumerFlushIntervalMs,
      onFlush: (batch) => this.processBatch(batch),
      onError: (err) => this.report('metering.consumer.flush_error', err),
    });
  }

  onApplicationBootstrap(): void {
    if (!this.meteringPubSubConfig.consumerEnabled) {
      return;
    }
    this.subscription.on('message', (message: Message) =>
      this.handleMessage(message)
    );
    this.subscription.on('error', (err: Error) => {
      this.report('metering.consumer.subscription_error', err);
    });
    this.started = true;
  }

  async beforeApplicationShutdown(): Promise<void> {
    if (!this.started) {
      return;
    }
    this.started = false;
    this.subscription.removeAllListeners('message');
    try {
      await this.buffer.drain();
    } finally {
      this.subscription.removeAllListeners('error');
      await this.subscription.close().catch((err: unknown) => {
        this.logger.error(err);
      });
    }
  }

  handleMessage(message: PubSubMessage): void {
    let event: MeteringWireEvent;
    try {
      event = parseWireEvent(message.data);
    } catch (err) {
      this.report('metering.consumer.invalid', err);
      message.ack();
      return;
    }

    this.statsd.increment('metering.consumer.received');
    this.buffer.push({ message, event, key: `${event.clientId}:${event.id}` });
  }

  async flushNow(): Promise<void> {
    await this.buffer.drain();
  }

  private async processBatch(batch: BufferedMessage[]): Promise<void> {
    let classified: ClassifiedBatch;
    try {
      classified = await this.classify(batch);
    } catch (err) {
      this.nackAll(batch, 'metering.consumer.dedupe_error', err);
      return;
    }
    const { fresh, duplicates, pending } = classified;

    if (pending.length > 0) {
      for (const { message } of pending) {
        message.nack();
      }
      this.statsd.increment('metering.consumer.pending', pending.length);
    }

    if (fresh.length > 0) {
      await this.insertFresh(fresh);
    }

    if (duplicates.length > 0) {
      for (const { message } of duplicates) {
        message.ack();
      }
      this.statsd.increment('metering.consumer.duplicate', duplicates.length);
    }
  }

  private async classify(batch: BufferedMessage[]): Promise<ClassifiedBatch> {
    const firstByKey = new Map<string, BufferedMessage>();
    const duplicates: BufferedMessage[] = [];
    for (const buffered of batch) {
      if (firstByKey.has(buffered.key)) {
        duplicates.push(buffered);
      } else {
        firstByKey.set(buffered.key, buffered);
      }
    }

    const candidates = Array.from(firstByKey.values());
    const statuses = await this.meteringDedupeManager.claim(
      candidates.map((candidate) => candidate.key)
    );

    const fresh: BufferedMessage[] = [];
    const pending: BufferedMessage[] = [];
    statuses.forEach((status, index) => {
      if (status === 'claimed') {
        fresh.push(candidates[index]);
      } else if (status === 'duplicate') {
        duplicates.push(candidates[index]);
      } else {
        pending.push(candidates[index]);
      }
    });

    return { fresh, duplicates, pending };
  }

  private async insertFresh(fresh: BufferedMessage[]): Promise<void> {
    const keys = fresh.map((buffered) => buffered.key);
    const ingestedAt = new Date();
    try {
      await this.meteringEventsManager.insertEvents(
        fresh.map(({ event }) => ({
          eventIdHash: hashEventId(event.id),
          clientId: event.clientId,
          slug: event.slug,
          subject: event.userIdentifier,
          amount: event.amount,
          eventTime: new Date(event.timestamp),
          ingestedAt,
        }))
      );
    } catch (err) {
      await this.meteringDedupeManager
        .release(keys)
        .catch((releaseErr: unknown) => {
          this.logger.error(releaseErr);
        });
      this.nackAll(fresh, 'metering.consumer.insert_error', err);
      return;
    }

    try {
      await this.meteringDedupeManager.confirm(keys);
    } catch (err) {
      this.report('metering.consumer.confirm_error', err);
    }

    for (const { message } of fresh) {
      message.ack();
    }
    this.statsd.increment('metering.consumer.inserted', fresh.length);
  }

  private nackAll(
    batch: BufferedMessage[],
    metric: string,
    err: unknown
  ): void {
    for (const { message } of batch) {
      message.nack();
    }
    this.statsd.increment(metric);
    Sentry.withScope((scope) => {
      scope.setExtra('batchSize', batch.length);
      Sentry.captureException(err);
    });
    this.logger.error(err);
  }

  private report(metric: string, err: unknown): void {
    this.statsd.increment(metric);
    Sentry.captureException(err);
    this.logger.error(err);
  }
}
