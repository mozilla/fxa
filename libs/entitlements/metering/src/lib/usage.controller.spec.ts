/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException, Logger } from '@nestjs/common';
import {
  EXCEPTION_FILTERS_METADATA,
  GUARDS_METADATA,
} from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import {
  AuthenticatedMeteringClientFactory,
  IngestUsageRequestFactory,
  UsageQueryParamsFactory,
  UsageQueryResponseFactory,
} from './factories';
import { MeteringAuthGuard } from './metering-auth.guard';
import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  MeterNotConfiguredError,
  MeteringBufferOverflowError,
} from './metering.error';
import { UsageController } from './usage.controller';
import { UsageService } from './usage.service';

describe('UsageController', () => {
  let usageController: UsageController;
  let usageService: jest.Mocked<UsageService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsageController],
      providers: [
        {
          provide: UsageService,
          useValue: {
            ingestUsage: jest.fn(),
            queryUsage: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: { error: jest.fn() },
        },
      ],
    })
      .overrideGuard(MeteringAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    usageController = moduleRef.get(UsageController);
    usageService = moduleRef.get(UsageService);
  });

  it('registers MeteringAuthGuard', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, UsageController) ?? [];
    expect(guards).toContain(MeteringAuthGuard);
  });

  it('registers MeteringExceptionFilter', () => {
    const filters =
      Reflect.getMetadata(EXCEPTION_FILTERS_METADATA, UsageController) ?? [];
    expect(filters).toContain(MeteringExceptionFilter);
  });

  describe('ingest', () => {
    it('forwards the parsed request to the service, stripping unknown fields', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const ingestUsageRequest = IngestUsageRequestFactory();

      const result = await usageController.ingest(
        { ...ingestUsageRequest, unexpected: 'dropped' },
        authenticatedMeteringClient
      );

      expect(usageService.ingestUsage).toHaveBeenCalledWith(ingestUsageRequest);
      expect(result).toBeUndefined();
    });

    it('rejects an invalid body with BadRequestException and does not call the service', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();

      await expect(
        usageController.ingest(
          { slug: 'INVALID UPPER' },
          authenticatedMeteringClient
        )
      ).rejects.toThrow(BadRequestException);
      expect(usageService.ingestUsage).not.toHaveBeenCalled();
    });

    it('propagates a domain error thrown by the service', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const ingestUsageRequest = IngestUsageRequestFactory();
      usageService.ingestUsage.mockRejectedValue(
        new MeteringBufferOverflowError()
      );

      await expect(
        usageController.ingest(ingestUsageRequest, authenticatedMeteringClient)
      ).rejects.toThrow(MeteringBufferOverflowError);
    });
  });

  describe('query', () => {
    it('validates the path params and returns the service result', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const params = UsageQueryParamsFactory();
      const expected = UsageQueryResponseFactory();
      usageService.queryUsage.mockResolvedValue(expected);

      const result = await usageController.query(
        params.userIdentifier,
        params.slug,
        authenticatedMeteringClient
      );

      expect(usageService.queryUsage).toHaveBeenCalledWith(params);
      expect(result).toBe(expected);
    });

    it('rejects a malformed slug with BadRequestException and does not call the service', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();

      await expect(
        usageController.query(
          'user-1',
          'NOT VALID',
          authenticatedMeteringClient
        )
      ).rejects.toThrow(BadRequestException);
      expect(usageService.queryUsage).not.toHaveBeenCalled();
    });

    it('propagates a domain error thrown by the service', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const params = UsageQueryParamsFactory();
      usageService.queryUsage.mockRejectedValue(
        new MeterNotConfiguredError(params.slug)
      );

      await expect(
        usageController.query(
          params.userIdentifier,
          params.slug,
          authenticatedMeteringClient
        )
      ).rejects.toThrow(MeterNotConfiguredError);
    });
  });
});
