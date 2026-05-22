/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import {
  AuthenticatedMeteringClientFactory,
  IngestUsageRequestFactory,
  UsageQueryParamsFactory,
  UsageQueryResponseFactory,
} from './factories';
import { MeteringAuthGuard } from './metering-auth.guard';
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
      ],
    })
      .overrideGuard(MeteringAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    usageController = moduleRef.get(UsageController);
    usageService = moduleRef.get(UsageService);
  });

  it('is guarded by MeteringAuthGuard', () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, UsageController) ?? [];
    expect(guards).toContain(MeteringAuthGuard);
  });

  describe('ingest', () => {
    it('validates the body and forwards to the service', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const ingestUsageRequest = IngestUsageRequestFactory();

      const result = await usageController.ingest(
        ingestUsageRequest,
        authenticatedMeteringClient
      );

      expect(usageService.ingestUsage).toHaveBeenCalledWith(
        ingestUsageRequest,
        authenticatedMeteringClient
      );
      expect(result).toBeUndefined();
    });

    it('rejects invalid bodies with BadRequest', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();

      await expect(
        usageController.ingest({ slug: 'INVALID UPPER' }, authenticatedMeteringClient)
      ).rejects.toThrow(BadRequestException);
      expect(usageService.ingestUsage).not.toHaveBeenCalled();
    });
  });

  describe('query', () => {
    it('validates path params and returns the service result', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();
      const params = UsageQueryParamsFactory();
      const expected = UsageQueryResponseFactory();
      usageService.queryUsage.mockResolvedValue(expected);

      const result = await usageController.query(
        params.userIdentifier,
        params.slug,
        authenticatedMeteringClient
      );

      expect(usageService.queryUsage).toHaveBeenCalledWith(params, authenticatedMeteringClient);
      expect(result).toBe(expected);
    });

    it('rejects malformed slugs with BadRequest', async () => {
      const authenticatedMeteringClient = AuthenticatedMeteringClientFactory();

      await expect(
        usageController.query('user-1', 'NOT VALID', authenticatedMeteringClient)
      ).rejects.toThrow(BadRequestException);
      expect(usageService.queryUsage).not.toHaveBeenCalled();
    });
  });
});
