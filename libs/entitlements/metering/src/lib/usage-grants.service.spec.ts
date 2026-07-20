/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp } from '@google-cloud/firestore';
import { Test } from '@nestjs/testing';

import {
  MeteringConfigurationManager,
  StrapiMeterFactory,
} from '@fxa/shared/cms';

import {
  CreateUsageGrantRequestFactory,
  UsageGrantRecordFactory,
} from './factories';
import { MeterNotConfiguredError } from './metering.error';
import { UsageGrantsManager } from './usage-grants.manager';
import { UsageGrantsService } from './usage-grants.service';

describe('UsageGrantsService', () => {
  let service: UsageGrantsService;
  let meteringConfigurationManager: jest.Mocked<
    Pick<MeteringConfigurationManager, 'getMeterBySlug'>
  >;
  let usageGrantsManager: jest.Mocked<
    Pick<UsageGrantsManager, 'createGrant' | 'listGrants' | 'deleteGrant'>
  >;
  const now = new Date('2026-05-15T12:00:00.000Z');

  beforeEach(async () => {
    meteringConfigurationManager = { getMeterBySlug: jest.fn() };
    usageGrantsManager = {
      createGrant: jest.fn(),
      listGrants: jest.fn(),
      deleteGrant: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsageGrantsService,
        {
          provide: MeteringConfigurationManager,
          useValue: meteringConfigurationManager,
        },
        { provide: UsageGrantsManager, useValue: usageGrantsManager },
      ],
    }).compile();

    service = moduleRef.get(UsageGrantsService);
  });

  describe('createGrant', () => {
    it('stamps the granting client and returns the grant as an ISO-serialised DTO', async () => {
      const meter = StrapiMeterFactory({ slug: 'tokens' });
      const request = CreateUsageGrantRequestFactory({
        slug: 'tokens',
        userIdentifier: 'user-1',
        amount: 500,
        lifetime: { type: 'unending' },
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      const record = UsageGrantRecordFactory({
        id: 'grant-1',
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        createdAt: Timestamp.fromDate(new Date('2026-05-15T12:00:00.000Z')),
        expiresAt: null,
      });
      usageGrantsManager.createGrant.mockResolvedValue(record);

      const result = await service.createGrant(
        { request, grantedBy: 'rp-1' },
        now
      );

      expect(usageGrantsManager.createGrant).toHaveBeenCalledWith({
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        reason: undefined,
        expiresAt: null,
      });
      expect(result).toEqual({
        id: 'grant-1',
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        reason: undefined,
        createdAt: '2026-05-15T12:00:00.000Z',
        expiresAt: null,
        active: true,
      });
    });

    it('resolves a currentWindow lifetime to the end of the meter window', async () => {
      const meter = StrapiMeterFactory({ slug: 'tokens', window: 'monthly' });
      const request = CreateUsageGrantRequestFactory({
        slug: 'tokens',
        lifetime: { type: 'currentWindow' },
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      usageGrantsManager.createGrant.mockResolvedValue(
        UsageGrantRecordFactory()
      );

      await service.createGrant({ request, grantedBy: 'rp-1' }, now);

      expect(usageGrantsManager.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: new Date('2026-06-01T00:00:00.000Z'),
        })
      );
    });

    it('resolves an expires lifetime to the supplied timestamp', async () => {
      const meter = StrapiMeterFactory({ slug: 'tokens' });
      const request = CreateUsageGrantRequestFactory({
        slug: 'tokens',
        lifetime: {
          type: 'expires',
          expiresAt: '2026-05-20T00:00:00.000Z',
        },
      });
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(meter);
      usageGrantsManager.createGrant.mockResolvedValue(
        UsageGrantRecordFactory()
      );

      await service.createGrant({ request, grantedBy: 'rp-1' }, now);

      expect(usageGrantsManager.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: new Date('2026-05-20T00:00:00.000Z'),
        })
      );
    });

    it('rejects an unknown slug with MeterNotConfiguredError and creates nothing', async () => {
      const request = CreateUsageGrantRequestFactory();
      meteringConfigurationManager.getMeterBySlug.mockResolvedValue(null);

      await expect(
        service.createGrant({ request, grantedBy: 'rp-1' }, now)
      ).rejects.toThrow(MeterNotConfiguredError);
      expect(usageGrantsManager.createGrant).not.toHaveBeenCalled();
    });
  });

  describe('listGrants', () => {
    it('maps records to DTOs with an active flag computed at the given time', async () => {
      usageGrantsManager.listGrants.mockResolvedValue([
        UsageGrantRecordFactory({
          id: 'active-grant',
          expiresAt: Timestamp.fromDate(new Date('2026-06-01T00:00:00.000Z')),
        }),
        UsageGrantRecordFactory({
          id: 'expired-grant',
          expiresAt: Timestamp.fromDate(new Date('2026-05-01T00:00:00.000Z')),
        }),
      ]);

      const result = await service.listGrants('user-1', 'tokens', now);

      expect(usageGrantsManager.listGrants).toHaveBeenCalledWith(
        'user-1',
        'tokens'
      );
      expect(result.map((grant) => [grant.id, grant.active])).toEqual([
        ['active-grant', true],
        ['expired-grant', false],
      ]);
    });
  });

  describe('deleteGrant', () => {
    it('delegates to the manager', async () => {
      usageGrantsManager.deleteGrant.mockResolvedValue(undefined);

      await service.deleteGrant('grant-1');

      expect(usageGrantsManager.deleteGrant).toHaveBeenCalledWith('grant-1');
    });
  });
});
