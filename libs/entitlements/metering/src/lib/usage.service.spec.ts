/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';

import {
  AuthenticatedMeteringClientFactory,
  IngestUsageRequestFactory,
  UsageQueryParamsFactory,
} from './factories';
import { MeteringIngestBufferManager } from './metering-ingest-buffer.manager';
import { MeteringManager } from './metering.manager';
import { UsageService } from './usage.service';
import { MeteringConfigurationManager } from './metering-configuration.manager';
import { MeteringThresholdTasksManager } from './metering-threshold-tasks.manager';
import { StrapiMeterFactory } from '@fxa/shared/cms';

describe('UsageService', () => {
  let usageService: UsageService;
  let meteringConfigurationManager: jest.Mocked<MeteringConfigurationManager>;
  let meteringManager: jest.Mocked<MeteringManager>;
  let meteringIngestBufferManager: jest.Mocked<MeteringIngestBufferManager>;
  let meteringThresholdTasksManager: jest.Mocked<MeteringThresholdTasksManager>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsageService,
        {
          provide: MeteringConfigurationManager,
          useValue: {
            getMeterBySlug: jest.fn(),
          },
        },
        {
          provide: MeteringManager,
          useValue: {
            ingest: jest.fn(),
            ingestBatch: jest.fn(),
            queryUsage: jest.fn(),
          },
        },
        {
          provide: MeteringIngestBufferManager,
          useValue: {
            push: jest.fn(),
            flushNow: jest.fn(),
          },
        },
        {
          provide: MeteringThresholdTasksManager,
          useValue: {
            scheduleThresholdCheck: jest
              .fn()
              .mockResolvedValue({ enqueued: true, taskId: 't', reason: 'created' }),
          },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
        MockStatsDProvider,
      ],
    }).compile();

    usageService = moduleRef.get(UsageService);
    meteringConfigurationManager = moduleRef.get(MeteringConfigurationManager);
    meteringManager = moduleRef.get(MeteringManager);
    meteringIngestBufferManager = moduleRef.get(MeteringIngestBufferManager);
    meteringThresholdTasksManager = moduleRef.get(MeteringThresholdTasksManager);
  });

  describe('ingestUsage', () => {
    it('pushes the event onto the ingest buffer when the client owns the slug', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const meter = StrapiMeterFactory();
      const timestamp = '2026-05-07T12:34:56.000Z';
      const ingestUsageRequest = IngestUsageRequestFactory({ slug: meter.slug, timestamp });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(ingestUsageRequest, authenticatedMeteringClient);

      expect(meteringConfigurationManager.getMeterBySlug).toHaveBeenCalledWith(meter.slug);
      expect(meteringIngestBufferManager.push).toHaveBeenCalledWith({
        id: ingestUsageRequest.id,
        userIdentifier: ingestUsageRequest.userIdentifier,
        amount: ingestUsageRequest.amount,
        timestamp: new Date(timestamp),
        meter,
      });
      expect(meteringManager.ingest).not.toHaveBeenCalled();
    });

    it('schedules a threshold-check Cloud Task after the buffer push', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(ingestUsageRequest, authenticatedMeteringClient);

      expect(meteringThresholdTasksManager.scheduleThresholdCheck).toHaveBeenCalledWith({
        slug: meter.slug,
        userIdentifier: ingestUsageRequest.userIdentifier,
      });
    });

    it('does not fail the ingest when scheduling the threshold task throws', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringThresholdTasksManager.scheduleThresholdCheck.mockRejectedValueOnce(
        new Error('cloud-tasks down')
      );

      await expect(usageService.ingestUsage(ingestUsageRequest, authenticatedMeteringClient)).resolves.toBeUndefined();
      expect(meteringIngestBufferManager.push).toHaveBeenCalled();
    });

    it('rejects unknown slugs with NotFoundException', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const ingestUsageRequest = IngestUsageRequestFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(usageService.ingestUsage(ingestUsageRequest, authenticatedMeteringClient)).rejects.toThrow(
        NotFoundException
      );
      expect(meteringIngestBufferManager.push).not.toHaveBeenCalled();
      expect(meteringThresholdTasksManager.scheduleThresholdCheck).not.toHaveBeenCalled();
    });

  });

  describe('queryUsage', () => {
    it('returns usage state for the current window', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const meter = StrapiMeterFactory({
        unit: 'tokens',
        limit: 1000,
        window: 'monthly',
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringManager.queryUsage.mockResolvedValue({
        usage: 250,
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
      });

      const now = new Date('2026-05-15T12:00:00.000Z');
      const result = await usageService.queryUsage(params, authenticatedMeteringClient, now);

      expect(meteringManager.queryUsage).toHaveBeenCalledWith({
        userIdentifier: params.userIdentifier,
        slug: params.slug,
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-06-01T00:00:00.000Z'),
      });
      expect(result).toEqual({
        usage: 250,
        limit: 1000,
        unit: 'tokens',
        windowStart: '2026-05-01T00:00:00.000Z',
        windowEnd: '2026-06-01T00:00:00.000Z',
      });
    });

    it('rejects unknown slugs with NotFoundException', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const params = UsageQueryParamsFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(usageService.queryUsage(params, authenticatedMeteringClient)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
