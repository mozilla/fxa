/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PubSub } from '@google-cloud/pubsub';
import { Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  MockMeteringPubSubConfig,
  MeteringPubSubConfig,
} from './metering-pubsub.config';
import { MeteringConsumerService } from './metering-consumer.service';
import { MeteringDedupeManager } from './metering-dedupe.manager';
import { MeteringEventsManager } from './metering-events.manager';
import { ClickHouseError, DedupeError } from './metering.error';
import type { DedupeStatus, PubSubMessage } from './metering.types';
import { MeteringPubSubClient } from './metering-pubsub.provider';
import { hashEventId } from './utils/hashEventId';

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback: (scope: unknown) => void) =>
    callback({ setExtra: jest.fn() })
  ),
}));

function messageFor(payload: unknown): PubSubMessage & {
  ack: jest.Mock;
  nack: jest.Mock;
} {
  return {
    data: Buffer.from(JSON.stringify(payload), 'utf8'),
    ack: jest.fn(),
    nack: jest.fn(),
  };
}

const WIRE_EVENT = {
  id: 'event-1',
  clientId: 'vpn',
  slug: 'tokens',
  userIdentifier: 'user-1',
  amount: 5,
  timestamp: '2026-05-07T15:23:45.123Z',
};

describe('MeteringConsumerService', () => {
  let service: MeteringConsumerService;
  let meteringDedupeManager: jest.Mocked<
    Pick<MeteringDedupeManager, 'claim' | 'confirm' | 'release'>
  >;
  let meteringEventsManager: jest.Mocked<
    Pick<MeteringEventsManager, 'insertEvents'>
  >;
  let statsd: jest.Mocked<Pick<StatsD, 'increment'>>;
  let logger: jest.Mocked<Pick<LoggerService, 'error'>>;
  let subscriptionOn: jest.Mock;
  let subscriptionClose: jest.Mock;
  let removeAllListeners: jest.Mock;

  async function build(
    pubsubOverrides: Partial<MeteringPubSubConfig> = {}
  ): Promise<void> {
    subscriptionOn = jest.fn();
    subscriptionClose = jest.fn().mockResolvedValue(undefined);
    removeAllListeners = jest.fn();
    meteringDedupeManager = {
      claim: jest
        .fn()
        .mockImplementation((keys: string[]) =>
          Promise.resolve(keys.map((): DedupeStatus => 'claimed'))
        ),
      confirm: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };
    meteringEventsManager = {
      insertEvents: jest.fn().mockResolvedValue(undefined),
    };
    statsd = { increment: jest.fn() };
    logger = { error: jest.fn() };

    const pubsub: Pick<PubSub, 'subscription'> = {
      subscription: jest.fn().mockReturnValue({
        on: subscriptionOn,
        close: subscriptionClose,
        removeAllListeners,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringConsumerService,
        {
          provide: MeteringPubSubConfig,
          useValue: { ...MockMeteringPubSubConfig, ...pubsubOverrides },
        },
        { provide: MeteringPubSubClient, useValue: pubsub },
        { provide: MeteringDedupeManager, useValue: meteringDedupeManager },
        { provide: MeteringEventsManager, useValue: meteringEventsManager },
        { provide: StatsDService, useValue: statsd },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    service = moduleRef.get(MeteringConsumerService);
  }

  beforeEach(async () => {
    jest.useFakeTimers();
    await build({ consumerBatchSize: 2, consumerFlushIntervalMs: 5_000 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('onApplicationBootstrap', () => {
    it('does not subscribe when the consumer is disabled', () => {
      service.onApplicationBootstrap();

      expect(subscriptionOn).not.toHaveBeenCalled();
    });

    it('subscribes to messages when enabled', async () => {
      await build({ consumerEnabled: true });

      service.onApplicationBootstrap();

      expect(subscriptionOn).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('subscribes to subscription errors when enabled', async () => {
      await build({ consumerEnabled: true });

      service.onApplicationBootstrap();

      expect(subscriptionOn).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
  });

  describe('handleMessage', () => {
    it('flushes and acks once the batch size is reached', async () => {
      const first = messageFor(WIRE_EVENT);
      const second = messageFor({ ...WIRE_EVENT, id: 'event-2' });

      service.handleMessage(first);
      expect(meteringEventsManager.insertEvents).not.toHaveBeenCalled();

      service.handleMessage(second);
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).toHaveBeenCalledTimes(1);
      expect(first.ack).toHaveBeenCalled();
      expect(second.ack).toHaveBeenCalled();
    });

    it('maps the wire event onto ClickHouse row inputs', async () => {
      service.handleMessage(messageFor(WIRE_EVENT));
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).toHaveBeenCalledWith([
        {
          eventIdHash: hashEventId('event-1'),
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          amount: 5,
          eventTime: new Date('2026-05-07T15:23:45.123Z'),
          ingestedAt: expect.any(Date),
        },
      ]);
    });

    it('flushes on the interval when the batch stays under size', async () => {
      service.handleMessage(messageFor(WIRE_EVENT));

      jest.advanceTimersByTime(5_000);
      await Promise.resolve();

      expect(meteringDedupeManager.claim).toHaveBeenCalledTimes(1);
    });

    it('acks and drops a message that is not valid JSON', () => {
      const message: PubSubMessage & { ack: jest.Mock; nack: jest.Mock } = {
        data: Buffer.from('{not json', 'utf8'),
        ack: jest.fn(),
        nack: jest.fn(),
      };

      service.handleMessage(message);

      expect(message.ack).toHaveBeenCalled();
      expect(message.nack).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.invalid'
      );
    });

    it('acks and drops a message that fails schema validation', () => {
      const message = messageFor({ ...WIRE_EVENT, amount: -1 });

      service.handleMessage(message);

      expect(message.ack).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    it('acks and drops a message with a fractional amount', () => {
      const message = messageFor({ ...WIRE_EVENT, amount: 1.5 });

      service.handleMessage(message);

      expect(message.ack).toHaveBeenCalled();
    });
  });

  describe('dedupe', () => {
    it('claims one key per unique event, scoped by client id', async () => {
      service.handleMessage(messageFor(WIRE_EVENT));
      service.handleMessage(
        messageFor({ ...WIRE_EVENT, id: 'event-2', clientId: 'relay' })
      );
      await service.flushNow();

      expect(meteringDedupeManager.claim).toHaveBeenCalledWith([
        'vpn:event-1',
        'relay:event-2',
      ]);
    });

    it('inserts one row and acks both copies of an in-batch duplicate', async () => {
      const first = messageFor(WIRE_EVENT);
      const copy = messageFor(WIRE_EVENT);

      service.handleMessage(first);
      service.handleMessage(copy);
      await service.flushNow();

      expect(meteringDedupeManager.claim).toHaveBeenCalledWith(['vpn:event-1']);
      expect(meteringEventsManager.insertEvents).toHaveBeenCalledTimes(1);
      expect(meteringEventsManager.insertEvents.mock.calls[0][0]).toHaveLength(
        1
      );
      expect(first.ack).toHaveBeenCalled();
      expect(copy.ack).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.duplicate',
        1
      );
    });

    it('treats the same id under two client ids as two distinct events', async () => {
      service.handleMessage(messageFor(WIRE_EVENT));
      service.handleMessage(messageFor({ ...WIRE_EVENT, clientId: 'relay' }));
      await service.flushNow();

      expect(meteringEventsManager.insertEvents.mock.calls[0][0]).toHaveLength(
        2
      );
    });

    it('acks an already-stored duplicate without inserting it', async () => {
      meteringDedupeManager.claim.mockResolvedValue(['duplicate']);
      const message = messageFor(WIRE_EVENT);

      service.handleMessage(message);
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).not.toHaveBeenCalled();
      expect(message.ack).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.duplicate',
        1
      );
    });

    it('nacks an event whose key is claimed by an unfinished batch', async () => {
      meteringDedupeManager.claim.mockResolvedValue(['pending']);
      const message = messageFor(WIRE_EVENT);

      service.handleMessage(message);
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).not.toHaveBeenCalled();
      expect(message.nack).toHaveBeenCalled();
      expect(message.ack).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.pending',
        1
      );
    });

    it('nacks the whole batch and inserts nothing when redis is down', async () => {
      meteringDedupeManager.claim.mockRejectedValue(
        new DedupeError('claim', new Error('connection closed'))
      );
      const first = messageFor(WIRE_EVENT);
      const second = messageFor({ ...WIRE_EVENT, id: 'event-2' });

      service.handleMessage(first);
      service.handleMessage(second);
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).not.toHaveBeenCalled();
      expect(first.nack).toHaveBeenCalled();
      expect(second.nack).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.dedupe_error'
      );
    });

    it('confirms the claims after a successful insert', async () => {
      service.handleMessage(messageFor(WIRE_EVENT));
      await service.flushNow();

      expect(meteringDedupeManager.confirm).toHaveBeenCalledWith([
        'vpn:event-1',
      ]);
    });

    it('still acks the batch when confirming the claims fails', async () => {
      meteringDedupeManager.confirm.mockRejectedValue(
        new DedupeError('confirm', new Error('connection closed'))
      );
      const message = messageFor(WIRE_EVENT);

      service.handleMessage(message);
      await service.flushNow();

      expect(message.ack).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.confirm_error'
      );
    });

    it('counts only inserted survivors in the inserted metric', async () => {
      meteringDedupeManager.claim.mockResolvedValue(['claimed', 'duplicate']);

      service.handleMessage(messageFor(WIRE_EVENT));
      service.handleMessage(messageFor({ ...WIRE_EVENT, id: 'event-2' }));
      await service.flushNow();

      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.inserted',
        1
      );
    });
  });

  describe('insert failure', () => {
    it('releases the claims and nacks the batch when the insert fails', async () => {
      meteringEventsManager.insertEvents.mockRejectedValue(
        new ClickHouseError('insert', new Error('down'))
      );
      const message = messageFor(WIRE_EVENT);

      service.handleMessage(message);
      await service.flushNow();

      expect(meteringDedupeManager.release).toHaveBeenCalledWith([
        'vpn:event-1',
      ]);
      expect(message.nack).toHaveBeenCalled();
      expect(message.ack).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.consumer.insert_error'
      );
    });

    it('still acks duplicates when the insert of fresh events fails', async () => {
      meteringDedupeManager.claim.mockResolvedValue(['claimed', 'duplicate']);
      meteringEventsManager.insertEvents.mockRejectedValue(
        new ClickHouseError('insert', new Error('down'))
      );
      const fresh = messageFor(WIRE_EVENT);
      const duplicate = messageFor({ ...WIRE_EVENT, id: 'event-2' });

      service.handleMessage(fresh);
      service.handleMessage(duplicate);
      await service.flushNow();

      expect(fresh.nack).toHaveBeenCalled();
      expect(duplicate.ack).toHaveBeenCalled();
    });

    it('nacks the batch even when releasing the claims also fails', async () => {
      meteringEventsManager.insertEvents.mockRejectedValue(
        new ClickHouseError('insert', new Error('down'))
      );
      meteringDedupeManager.release.mockRejectedValue(
        new DedupeError('release', new Error('connection closed'))
      );
      const message = messageFor(WIRE_EVENT);

      service.handleMessage(message);
      await service.flushNow();

      expect(message.nack).toHaveBeenCalled();
    });
  });

  describe('flushNow', () => {
    it('does nothing when the buffer is empty', async () => {
      await service.flushNow();

      expect(meteringEventsManager.insertEvents).not.toHaveBeenCalled();
    });
  });

  describe('beforeApplicationShutdown', () => {
    it('does nothing when the consumer never started', async () => {
      await service.beforeApplicationShutdown();

      expect(subscriptionClose).not.toHaveBeenCalled();
    });

    it('closes the subscription and flushes buffered messages', async () => {
      await build({ consumerEnabled: true, consumerBatchSize: 100 });
      service.onApplicationBootstrap();
      const message = messageFor(WIRE_EVENT);
      service.handleMessage(message);

      await service.beforeApplicationShutdown();

      expect(removeAllListeners).toHaveBeenCalled();
      expect(subscriptionClose).toHaveBeenCalled();
      expect(meteringEventsManager.insertEvents).toHaveBeenCalledTimes(1);
      expect(message.ack).toHaveBeenCalled();
    });
  });
});
