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
  CreateUsageGrantRequestFactory,
  UsageGrantFactory,
} from './factories';
import { MeteringAuthGuard } from './metering-auth.guard';
import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  MeterNotConfiguredError,
  UsageGrantNotFoundError,
} from './metering.error';
import { UsageGrantsController } from './usage-grants.controller';
import { UsageGrantsService } from './usage-grants.service';

describe('UsageGrantsController', () => {
  let controller: UsageGrantsController;
  let usageGrantsService: jest.Mocked<
    Pick<UsageGrantsService, 'createGrant' | 'listGrants' | 'deleteGrant'>
  >;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsageGrantsController],
      providers: [
        {
          provide: UsageGrantsService,
          useValue: {
            createGrant: jest.fn(),
            listGrants: jest.fn(),
            deleteGrant: jest.fn(),
          },
        },
        { provide: Logger, useValue: { error: jest.fn() } },
      ],
    })
      .overrideGuard(MeteringAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(UsageGrantsController);
    usageGrantsService = moduleRef.get(UsageGrantsService);
  });

  it('registers MeteringAuthGuard', () => {
    const guards =
      Reflect.getMetadata(GUARDS_METADATA, UsageGrantsController) ?? [];
    expect(guards).toContain(MeteringAuthGuard);
  });

  it('registers MeteringExceptionFilter', () => {
    const filters =
      Reflect.getMetadata(EXCEPTION_FILTERS_METADATA, UsageGrantsController) ??
      [];
    expect(filters).toContain(MeteringExceptionFilter);
  });

  describe('create', () => {
    it('forwards the parsed request and granting client to the service', async () => {
      const client = AuthenticatedMeteringClientFactory({ clientId: 'rp-1' });
      const request = CreateUsageGrantRequestFactory();
      const grant = UsageGrantFactory();
      usageGrantsService.createGrant.mockResolvedValue(grant);

      const result = await controller.create(request, client);

      expect(usageGrantsService.createGrant).toHaveBeenCalledWith({
        request,
        grantedBy: 'rp-1',
      });
      expect(result).toBe(grant);
    });

    it('defaults a request without a lifetime to an unending grant', async () => {
      const client = AuthenticatedMeteringClientFactory({ clientId: 'rp-1' });
      const requestWithoutLifetime = {
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
      };
      usageGrantsService.createGrant.mockResolvedValue(UsageGrantFactory());

      await controller.create(requestWithoutLifetime, client);

      expect(usageGrantsService.createGrant).toHaveBeenCalledWith({
        request: { ...requestWithoutLifetime, lifetime: { type: 'unending' } },
        grantedBy: 'rp-1',
      });
    });

    it('rejects an invalid body with BadRequestException and does not call the service', async () => {
      const client = AuthenticatedMeteringClientFactory();

      await expect(
        controller.create({ slug: 'tokens', amount: -1 }, client)
      ).rejects.toThrow(BadRequestException);
      expect(usageGrantsService.createGrant).not.toHaveBeenCalled();
    });

    it('propagates a domain error thrown by the service', async () => {
      const client = AuthenticatedMeteringClientFactory();
      const request = CreateUsageGrantRequestFactory();
      usageGrantsService.createGrant.mockRejectedValue(
        new MeterNotConfiguredError(request.slug)
      );

      await expect(controller.create(request, client)).rejects.toThrow(
        MeterNotConfiguredError
      );
    });
  });

  describe('list', () => {
    it('returns the grants for a user filtered by slug', async () => {
      const client = AuthenticatedMeteringClientFactory();
      const grants = [UsageGrantFactory(), UsageGrantFactory()];
      usageGrantsService.listGrants.mockResolvedValue(grants);

      const result = await controller.list('user-1', 'tokens', client);

      expect(usageGrantsService.listGrants).toHaveBeenCalledWith(
        'user-1',
        'tokens'
      );
      expect(result).toEqual({ grants });
    });

    it('passes an undefined slug when no filter is supplied', async () => {
      const client = AuthenticatedMeteringClientFactory();
      usageGrantsService.listGrants.mockResolvedValue([]);

      await controller.list('user-1', undefined, client);

      expect(usageGrantsService.listGrants).toHaveBeenCalledWith(
        'user-1',
        undefined
      );
    });

    it('rejects a malformed slug filter with BadRequestException', async () => {
      const client = AuthenticatedMeteringClientFactory();

      await expect(
        controller.list('user-1', 'NOT VALID', client)
      ).rejects.toThrow(BadRequestException);
      expect(usageGrantsService.listGrants).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('delegates deletion of a grant by id to the service', async () => {
      const client = AuthenticatedMeteringClientFactory();
      usageGrantsService.deleteGrant.mockResolvedValue(undefined);

      await controller.delete('grant-1', client);

      expect(usageGrantsService.deleteGrant).toHaveBeenCalledWith('grant-1');
    });

    it('propagates a not-found error thrown by the service', async () => {
      const client = AuthenticatedMeteringClientFactory();
      usageGrantsService.deleteGrant.mockRejectedValue(
        new UsageGrantNotFoundError('grant-1')
      );

      await expect(controller.delete('grant-1', client)).rejects.toThrow(
        UsageGrantNotFoundError
      );
    });

    it('rejects an empty grantId with BadRequestException and does not call the service', async () => {
      const client = AuthenticatedMeteringClientFactory();

      await expect(controller.delete('', client)).rejects.toThrow(
        BadRequestException
      );
      expect(usageGrantsService.deleteGrant).not.toHaveBeenCalled();
    });

    it('rejects a grantId containing a path separator with BadRequestException', async () => {
      const client = AuthenticatedMeteringClientFactory();

      await expect(controller.delete('a/b/c', client)).rejects.toThrow(
        BadRequestException
      );
      expect(usageGrantsService.deleteGrant).not.toHaveBeenCalled();
    });
  });
});
