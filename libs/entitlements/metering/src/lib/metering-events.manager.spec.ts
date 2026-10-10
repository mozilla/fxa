/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MeteringEventsManager } from './metering-events.manager';
import { MeteringEventsRepository } from './metering-events.repository';
import { ClickHouseError } from './metering.error';
import { MeteringEventInputFactory } from './metering.factories';

describe('MeteringEventsManager', () => {
  let manager: MeteringEventsManager;
  let meteringEventsRepository: jest.Mocked<
    Pick<MeteringEventsRepository, 'insertEvents' | 'sumUsage'>
  >;

  const sumUsageParams = {
    clientId: 'vpn',
    slug: 'tokens',
    subject: 'user-1',
    from: new Date('2026-05-01T00:00:00.000Z'),
    to: new Date('2026-06-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    meteringEventsRepository = {
      insertEvents: jest.fn().mockResolvedValue(undefined),
      sumUsage: jest.fn().mockResolvedValue(0),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringEventsManager,
        {
          provide: MeteringEventsRepository,
          useValue: meteringEventsRepository,
        },
      ],
    }).compile();

    manager = moduleRef.get(MeteringEventsManager);
  });

  describe('insertEvents', () => {
    it('passes the batch to the repository', async () => {
      const events = [MeteringEventInputFactory()];

      await manager.insertEvents(events);

      expect(meteringEventsRepository.insertEvents).toHaveBeenCalledWith(
        events
      );
    });

    it('propagates a repository failure', async () => {
      meteringEventsRepository.insertEvents.mockRejectedValue(
        new ClickHouseError('insert', new Error('down'))
      );

      await expect(
        manager.insertEvents([MeteringEventInputFactory()])
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('sumUsage', () => {
    it('returns the summed usage from the repository', async () => {
      meteringEventsRepository.sumUsage.mockResolvedValue(250);

      await expect(manager.sumUsage(sumUsageParams)).resolves.toBe(250);
      expect(meteringEventsRepository.sumUsage).toHaveBeenCalledWith(
        sumUsageParams
      );
    });

    it('propagates a repository failure', async () => {
      meteringEventsRepository.sumUsage.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.sumUsage(sumUsageParams)).rejects.toThrow(
        ClickHouseError
      );
    });
  });
});
