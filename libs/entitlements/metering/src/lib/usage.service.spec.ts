/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  MeteringConfigurationManager,
  StrapiMeterFactory,
} from '@fxa/shared/cms';

import {
  IngestUsageRequestFactory,
  UsageQueryParamsFactory,
} from './factories';
import { MeteringIngestManager } from './metering-ingest.manager';
import { MeteringQueryManager } from './metering-query.manager';
import { MeteringThresholdTasksManager } from './metering-threshold-tasks.manager';
import {
  MeterNotConfiguredError,
  MeteringBufferOverflowError,
  OpenMeterQueryError,
} from './metering.error';
import { UsageService } from './usage.service';

describe('UsageService', () => {
  let usageService: UsageService;
  let meteringConfigurationManager: jest.Mocked<MeteringConfigurationManager>;
  let meteringQueryManager: jest.Mocked<MeteringQueryManager>;
  let meteringIngestManager: jest.Mocked<MeteringIngestManager>;
  let meteringThresholdTasksManager: jest.Mocked<MeteringThresholdTasksManager>;
  let logger: jest.Mocked<Pick<LoggerService, 'error'>>;

  beforeEach(async () => {
    logger = { error: jest.fn() };
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
          provide: MeteringQueryManager,
          useValue: {
            queryUsage: jest.fn(),
          },
        },
        {
          provide: MeteringIngestManager,
          useValue: {
            enqueue: jest.fn(),
          },
        },
        {
          provide: MeteringThresholdTasksManager,
          useValue: {
            scheduleThresholdCheck: jest.fn().mockResolvedValue({
              enqueued: true,
              taskId: 't',
              reason: 'created',
            }),
          },
        },
        {
          provide: Logger,
          useValue: logger,
        },
      ],
    }).compile();

    usageService = moduleRef.get(UsageService);
    meteringConfigurationManager = moduleRef.get(MeteringConfigurationManager);
    meteringQueryManager = moduleRef.get(MeteringQueryManager);
    meteringIngestManager = moduleRef.get(MeteringIngestManager);
    meteringThresholdTasksManager = moduleRef.get(
      MeteringThresholdTasksManager
    );
  });

  describe('ingestUsage', () => {
    it('enqueues the event onto the ingest buffer for a configured slug', async () => {
      const meter = StrapiMeterFactory();
      const timestamp = '2026-05-07T12:34:56.000Z';
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
        timestamp,
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(ingestUsageRequest);

      expect(meteringConfigurationManager.getMeterBySlug).toHaveBeenCalledWith(
        meter.slug
      );
      expect(meteringIngestManager.enqueue).toHaveBeenCalledWith({
        id: ingestUsageRequest.id,
        userIdentifier: ingestUsageRequest.userIdentifier,
        amount: ingestUsageRequest.amount,
        timestamp: new Date(timestamp),
        meter,
      });
    });

    it('enqueues with an undefined timestamp when the request omits one', async () => {
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
        timestamp: undefined,
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(ingestUsageRequest);

      expect(meteringIngestManager.enqueue).toHaveBeenCalledWith({
        id: ingestUsageRequest.id,
        userIdentifier: ingestUsageRequest.userIdentifier,
        amount: ingestUsageRequest.amount,
        timestamp: undefined,
        meter,
      });
    });

    it('schedules a threshold-check Cloud Task after the buffer push', async () => {
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);

      await usageService.ingestUsage(ingestUsageRequest);

      expect(
        meteringThresholdTasksManager.scheduleThresholdCheck
      ).toHaveBeenCalledWith({
        slug: meter.slug,
        userIdentifier: ingestUsageRequest.userIdentifier,
      });
    });

    it('does not fail the ingest but logs when scheduling the threshold task throws', async () => {
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
      });
      const schedulingError = new Error('cloud-tasks down');
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringThresholdTasksManager.scheduleThresholdCheck.mockRejectedValueOnce(
        schedulingError
      );

      await expect(
        usageService.ingestUsage(ingestUsageRequest)
      ).resolves.toBeUndefined();
      await new Promise((resolve) => setImmediate(resolve));

      expect(meteringIngestManager.enqueue).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(schedulingError);
    });

    it('rejects unknown slugs with MeterNotConfiguredError', async () => {
      const ingestUsageRequest = IngestUsageRequestFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(
        usageService.ingestUsage(ingestUsageRequest)
      ).rejects.toThrow(MeterNotConfiguredError);
      expect(meteringIngestManager.enqueue).not.toHaveBeenCalled();
      expect(
        meteringThresholdTasksManager.scheduleThresholdCheck
      ).not.toHaveBeenCalled();
    });

    it('propagates MeteringBufferOverflowError and does not schedule a threshold check when the buffer is full', async () => {
      const meter = StrapiMeterFactory();
      const ingestUsageRequest = IngestUsageRequestFactory({
        slug: meter.slug,
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringIngestManager.enqueue.mockImplementation(() => {
        throw new MeteringBufferOverflowError();
      });

      await expect(
        usageService.ingestUsage(ingestUsageRequest)
      ).rejects.toThrow(MeteringBufferOverflowError);
      expect(
        meteringThresholdTasksManager.scheduleThresholdCheck
      ).not.toHaveBeenCalled();
    });
  });

  describe('queryUsage', () => {
    it('returns usage state for the current window', async () => {
      const meter = StrapiMeterFactory({
        unit: 'tokens',
        limit: 1000,
        window: 'monthly',
      });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringQueryManager.queryUsage.mockResolvedValue({
        usage: 250,
        from: new Date('2000-01-01T00:00:00.000Z'),
        to: new Date('2000-01-02T00:00:00.000Z'),
      });

      const now = new Date('2026-05-15T12:00:00.000Z');
      const result = await usageService.queryUsage(params, now);

      expect(meteringQueryManager.queryUsage).toHaveBeenCalledWith({
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

    it('propagates a failure from the query manager', async () => {
      const meter = StrapiMeterFactory({ window: 'monthly' });
      const params = UsageQueryParamsFactory({ slug: meter.slug });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      meteringQueryManager.queryUsage.mockRejectedValue(
        new OpenMeterQueryError(new Error('openmeter down'))
      );

      await expect(usageService.queryUsage(params)).rejects.toThrow(
        OpenMeterQueryError
      );
    });

    it('rejects unknown slugs with MeterNotConfiguredError', async () => {
      const params = UsageQueryParamsFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(usageService.queryUsage(params)).rejects.toThrow(
        MeterNotConfiguredError
      );
    });
  });
});
