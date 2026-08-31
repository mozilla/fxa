/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PubSub, Topic } from '@google-cloud/pubsub';
import { Inject, Injectable } from '@nestjs/common';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { PublishError } from './metering.error';
import type { MeteringWireEvent } from './metering.schema';
import { MeteringPubSubConfig } from './metering-pubsub.config';
import { MeteringPubSubClient } from './metering-pubsub.provider';
import { toError } from './utils/toError';

const PUBLISH_TIMEOUT_MS = 10_000;

@Injectable()
export class MeteringPublisherManager {
  private readonly topic: Topic;

  constructor(
    meteringPubSubConfig: MeteringPubSubConfig,
    @Inject(MeteringPubSubClient) pubsub: PubSub,
    @Inject(StatsDService) private readonly statsd: StatsD
  ) {
    this.topic = pubsub.topic(meteringPubSubConfig.topicName, {
      batching: {
        maxMessages: meteringPubSubConfig.publishBatchSize,
        maxMilliseconds: meteringPubSubConfig.publishBatchIntervalMs,
      },
      gaxOpts: { timeout: PUBLISH_TIMEOUT_MS },
    });
  }

  async publish(event: MeteringWireEvent): Promise<void> {
    try {
      await this.topic.publishMessage({ json: event });
      this.statsd.increment('metering.publisher.published');
    } catch (err) {
      this.statsd.increment('metering.publisher.publish_error');
      throw new PublishError(toError(err));
    }
  }
}
