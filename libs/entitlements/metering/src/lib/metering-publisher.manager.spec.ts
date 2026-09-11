/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PubSub } from '@google-cloud/pubsub';
import { Test } from '@nestjs/testing';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  MockMeteringPubSubConfig,
  MeteringPubSubConfig,
} from './metering-pubsub.config';
import { MeteringPublisherManager } from './metering-publisher.manager';
import { PublishError } from './metering.error';
import type { MeteringWireEvent } from './metering.schema';
import { MeteringPubSubClient } from './metering-pubsub.provider';

const EVENT: MeteringWireEvent = {
  id: 'event-1',
  clientId: 'vpn',
  slug: 'tokens',
  userIdentifier: 'user-1',
  amount: 5,
  timestamp: '2026-05-07T15:23:45.123Z',
};

describe('MeteringPublisherManager', () => {
  let manager: MeteringPublisherManager;
  let publishMessage: jest.Mock;
  let topic: jest.Mock;
  let statsd: jest.Mocked<Pick<StatsD, 'increment'>>;

  beforeEach(async () => {
    publishMessage = jest.fn().mockResolvedValue('message-id');
    topic = jest.fn().mockReturnValue({ publishMessage });
    statsd = { increment: jest.fn() };

    const pubsub: Pick<PubSub, 'topic'> = { topic };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringPublisherManager,
        { provide: MeteringPubSubConfig, useValue: MockMeteringPubSubConfig },
        { provide: MeteringPubSubClient, useValue: pubsub },
        { provide: StatsDService, useValue: statsd },
      ],
    }).compile();

    manager = moduleRef.get(MeteringPublisherManager);
  });

  it('configures publisher batching from config', () => {
    expect(topic).toHaveBeenCalledWith(
      MockMeteringPubSubConfig.topicName,
      expect.objectContaining({
        batching: {
          maxMessages: MockMeteringPubSubConfig.publishBatchSize,
          maxMilliseconds: MockMeteringPubSubConfig.publishBatchIntervalMs,
        },
      })
    );
  });

  it('caps how long a publish may block the ingest request', () => {
    expect(topic).toHaveBeenCalledWith(
      MockMeteringPubSubConfig.topicName,
      expect.objectContaining({
        gaxOpts: { timeout: 10_000 },
      })
    );
  });

  it('publishes the event as JSON', async () => {
    await manager.publish(EVENT);

    expect(publishMessage).toHaveBeenCalledWith({ json: EVENT });
  });

  it('resolves only once Pub/Sub has accepted the message', async () => {
    let release: (value: string) => void = () => undefined;
    publishMessage.mockReturnValue(
      new Promise<string>((resolve) => {
        release = resolve;
      })
    );
    let settled = false;

    const publishing = manager.publish(EVENT).then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    release('message-id');
    await publishing;
    expect(settled).toBe(true);
  });

  it('counts a successful publish', async () => {
    await manager.publish(EVENT);

    expect(statsd.increment).toHaveBeenCalledWith(
      'metering.publisher.published'
    );
  });

  it('wraps a publish failure in PublishError', async () => {
    publishMessage.mockRejectedValue(new Error('pubsub unavailable'));

    await expect(manager.publish(EVENT)).rejects.toThrow(PublishError);
  });

  it('counts a failed publish', async () => {
    publishMessage.mockRejectedValue(new Error('pubsub unavailable'));

    await expect(manager.publish(EVENT)).rejects.toThrow(PublishError);
    expect(statsd.increment).toHaveBeenCalledWith(
      'metering.publisher.publish_error'
    );
  });

  it('wraps a non-Error rejection in PublishError', async () => {
    publishMessage.mockRejectedValue('boom');

    await expect(manager.publish(EVENT)).rejects.toThrow(PublishError);
  });
});
