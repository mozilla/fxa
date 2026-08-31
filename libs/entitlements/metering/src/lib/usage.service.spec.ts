/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import {
  MeteringConfigurationManager,
  StrapiMeterFactory,
} from '@fxa/shared/cms';

import {
  IngestUsageRequestFactory,
  UsageQueryParamsFactory,
} from './metering.factories';
import { MeteringEventsManager } from './metering-events.manager';
import { MeteringPublisherManager } from './metering-publisher.manager';
import {
  ClickHouseError,
  MeterNotConfiguredError,
  PublishError,
  SessionUsageQueryNotSupportedError,
  TimestampOutOfRangeError,
} from './metering.error';
import { UsageGrantsManager } from './usage-grants.manager';
import { UsageService } from './usage.service';

const CLIENT_ID = 'vpn';
const NOW = new Date('2026-05-15T12:00:00.000Z');

describe('UsageService', () => {
  let usageService: UsageService;
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterBySlug'>
  >;
  let meteringPublisherManager: jest.Mocked<
    Pick<MeteringPublisherManager, 'publish'>
  >;
  let meteringEventsManager: jest.Mocked<
    Pick<MeteringEventsManager, 'sumUsage'>
  >;
  let usageGrantsManager: jest.Mocked<
    Pick<UsageGrantsManager, 'getActiveGrantedAmount'>
  >;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsageService,
        {
          provide: MeteringConfigurationManager,
          useValue: { getMeterBySlug: jest.fn() },
        },
        {
          provide: MeteringPublisherManager,
          useValue: { publish: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: MeteringEventsManager,
          useValue: { sumUsage: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: UsageGrantsManager,
          useValue: {
            getActiveGrantedAmount: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    usageService = moduleRef.get(UsageService);
    meteringConfigurationManager = moduleRef.get(MeteringConfigurationManager);
    meteringPublisherManager = moduleRef.get(MeteringPublisherManager);
    meteringEventsManager = moduleRef.get(MeteringEventsManager);
    usageGrantsManager = moduleRef.get(UsageGrantsManager);
  });

  describe('ingestUsage', () => {
    it('publishes the event for a configured slug', async () => {
      const meter = StrapiMeterFactory();
      const timestamp = '2026-05-15T11:34:56.000Z';
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
        timestamp,
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(CLIENT_ID, ingestUsageRequest, NOW);

      expect(meteringConfigurationManager.getMeterBySlug).toHaveBeenCalledWith(
        meter.slug
      );
      expect(meteringPublisherManager.publish).toHaveBeenCalledWith({
        id: ingestUsageRequest.id,
        clientId: CLIENT_ID,
        slug: meter.slug,
        userIdentifier: ingestUsageRequest.userIdentifier,
        amount: ingestUsageRequest.amount,
        timestamp,
      });
    });

    it('attributes the event to the authenticated client', async () => {
      const meter = StrapiMeterFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(
        'relay',
        IngestUsageRequestFactory({ slug: meter.slug }),
        NOW
      );

      expect(meteringPublisherManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 'relay' })
      );
    });

    it('stamps the current time when the request omits a timestamp', async () => {
      const meter = StrapiMeterFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(
        CLIENT_ID,
        IngestUsageRequestFactory({ slug: meter.slug, timestamp: undefined }),
        NOW
      );

      expect(meteringPublisherManager.publish).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: '2026-05-15T12:00:00.000Z' })
      );
    });

    it('rejects unknown slugs with MeterNotConfiguredError and publishes nothing', async () => {
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(
        usageService.ingestUsage(CLIENT_ID, IngestUsageRequestFactory(), NOW)
      ).rejects.toThrow(MeterNotConfiguredError);
      expect(meteringPublisherManager.publish).not.toHaveBeenCalled();
    });

    it('rejects a far-future timestamp that ClickHouse would silently saturate', async () => {
      const meter = StrapiMeterFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await expect(
        usageService.ingestUsage(
          CLIENT_ID,
          IngestUsageRequestFactory({
            slug: meter.slug,
            timestamp: '9999-01-01T00:00:00.000Z',
          }),
          NOW
        )
      ).rejects.toThrow(TimestampOutOfRangeError);
      expect(meteringPublisherManager.publish).not.toHaveBeenCalled();
    });

    it('rejects a timestamp older than the accepted backfill window', async () => {
      const meter = StrapiMeterFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await expect(
        usageService.ingestUsage(
          CLIENT_ID,
          IngestUsageRequestFactory({
            slug: meter.slug,
            timestamp: '2026-05-01T00:00:00.000Z',
          }),
          NOW
        )
      ).rejects.toThrow(TimestampOutOfRangeError);
    });

    it('rejects before looking the meter up, so a bad timestamp costs no CMS call', async () => {
      await expect(
        usageService.ingestUsage(
          CLIENT_ID,
          IngestUsageRequestFactory({ timestamp: '9999-01-01T00:00:00.000Z' }),
          NOW
        )
      ).rejects.toThrow(TimestampOutOfRangeError);
      expect(
        meteringConfigurationManager.getMeterBySlug
      ).not.toHaveBeenCalled();
    });

    it('propagates a publish failure so the caller can retry', async () => {
      const meter = StrapiMeterFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringPublisherManager.publish.mockRejectedValue(
        new PublishError(new Error('pubsub down'))
      );

      await expect(
        usageService.ingestUsage(
          CLIENT_ID,
          IngestUsageRequestFactory({ slug: meter.slug }),
          NOW
        )
      ).rejects.toThrow(PublishError);
    });
  });

  describe('queryUsage', () => {
    it('returns usage state for the current window', async () => {
      const meter = StrapiMeterFactory({
        unit: 'tokens',
        limit: 1000,
        window: { kind: 'calendar', period: 'monthly' },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringEventsManager.sumUsage.mockResolvedValue(250);

      const result = await usageService.queryUsage(CLIENT_ID, params, NOW);

      expect(meteringEventsManager.sumUsage).toHaveBeenCalledWith({
        clientId: CLIENT_ID,
        slug: params.slug,
        subject: params.userIdentifier,
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
      });
      expect(usageGrantsManager.getActiveGrantedAmount).toHaveBeenCalledWith(
        params.userIdentifier,
        params.slug,
        NOW
      );
      expect(result).toEqual({
        usage: 250,
        limit: 1000,
        grantedAmount: 0,
        unit: 'tokens',
        windowStart: '2026-05-01T00:00:00.000Z',
        windowEnd: '2026-06-01T00:00:00.000Z',
      });
    });

    it('scopes the usage read to the authenticated client', async () => {
      const meter = StrapiMeterFactory({
        window: { kind: 'calendar', period: 'monthly' },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.queryUsage('relay', params, NOW);

      expect(meteringEventsManager.sumUsage).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 'relay' })
      );
    });

    it('reads a sliding window relative to now', async () => {
      const meter = StrapiMeterFactory({
        window: { kind: 'sliding', durationMs: 5 * 60 * 60 * 1000 },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      const result = await usageService.queryUsage(CLIENT_ID, params, NOW);

      expect(meteringEventsManager.sumUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          from: new Date('2026-05-15T07:00:00.000Z'),
          to: new Date('2026-05-15T12:00:00.000Z'),
        })
      );
      expect(result.windowStart).toBe('2026-05-15T07:00:00.000Z');
      expect(result.windowEnd).toBe('2026-05-15T12:00:00.000Z');
    });

    it('rejects a session meter without reading usage', async () => {
      const meter = StrapiMeterFactory({
        window: { kind: 'session', durationMs: 30 * 60 * 1000 },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await expect(
        usageService.queryUsage(CLIENT_ID, params, NOW)
      ).rejects.toThrow(SessionUsageQueryNotSupportedError);
      expect(meteringEventsManager.sumUsage).not.toHaveBeenCalled();
    });

    it('raises the reported limit by the active granted amount', async () => {
      const meter = StrapiMeterFactory({
        unit: 'tokens',
        limit: 1000,
        window: { kind: 'calendar', period: 'monthly' },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringEventsManager.sumUsage.mockResolvedValue(250);
      usageGrantsManager.getActiveGrantedAmount.mockResolvedValue(500);

      const result = await usageService.queryUsage(CLIENT_ID, params, NOW);

      expect(result).toEqual({
        usage: 250,
        limit: 1500,
        grantedAmount: 500,
        unit: 'tokens',
        windowStart: '2026-05-01T00:00:00.000Z',
        windowEnd: '2026-06-01T00:00:00.000Z',
      });
    });

    it('propagates a failure from the events manager', async () => {
      const meter = StrapiMeterFactory({
        window: { kind: 'calendar', period: 'monthly' },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringEventsManager.sumUsage.mockRejectedValue(
        new ClickHouseError('query', new Error('clickhouse down'))
      );

      await expect(
        usageService.queryUsage(CLIENT_ID, params, NOW)
      ).rejects.toThrow(ClickHouseError);
    });

    it('propagates a failure from the grants manager', async () => {
      const meter = StrapiMeterFactory({
        window: { kind: 'calendar', period: 'monthly' },
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringEventsManager.sumUsage.mockResolvedValue(250);
      usageGrantsManager.getActiveGrantedAmount.mockRejectedValue(
        new Error('firestore unavailable')
      );

      await expect(
        usageService.queryUsage(CLIENT_ID, params, NOW)
      ).rejects.toThrow('firestore unavailable');
    });

    it('rejects unknown slugs with MeterNotConfiguredError', async () => {
      const params = UsageQueryParamsFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(
        usageService.queryUsage(CLIENT_ID, params, NOW)
      ).rejects.toThrow(MeterNotConfiguredError);
    });
  });
});
