/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp } from '@google-cloud/firestore';
import { Test } from '@nestjs/testing';

import { MockFirestoreProvider } from '@fxa/shared/db/firestore';

import { UsageGrantRecordFactory } from './factories';
import { MockMeteringConfigProvider } from './metering.config';
import { UsageGrantsManager } from './usage-grants.manager';
import {
  deleteUsageGrant,
  getUsageGrants,
  insertUsageGrant,
} from './usage-grants.repository';

jest.mock('./usage-grants.repository');

describe('UsageGrantsManager', () => {
  let manager: UsageGrantsManager;
  const now = new Date('2026-05-15T12:00:00.000Z');

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsageGrantsManager,
        MockMeteringConfigProvider,
        MockFirestoreProvider,
      ],
    }).compile();
    manager = moduleRef.get(UsageGrantsManager);
  });

  describe('createGrant', () => {
    it('stores an unending grant with a null expiry', async () => {
      (insertUsageGrant as jest.Mock).mockImplementation((_db, record) =>
        Promise.resolve({ id: 'grant-1', ...record })
      );

      await manager.createGrant({
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        expiresAt: null,
      });

      const [, record] = (insertUsageGrant as jest.Mock).mock.calls[0];
      expect(record.expiresAt).toBeNull();
    });

    it('stores the expiry as a Timestamp derived from the provided date', async () => {
      (insertUsageGrant as jest.Mock).mockImplementation((_db, record) =>
        Promise.resolve({ id: 'grant-1', ...record })
      );
      const expiresAt = new Date('2026-06-01T00:00:00.000Z');

      await manager.createGrant({
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        expiresAt,
      });

      const [, record] = (insertUsageGrant as jest.Mock).mock.calls[0];
      expect(record.expiresAt).toEqual(Timestamp.fromDate(expiresAt));
    });

    it('propagates a repository failure', async () => {
      (insertUsageGrant as jest.Mock).mockRejectedValue(
        new Error('firestore down')
      );

      await expect(
        manager.createGrant({
          userIdentifier: 'user-1',
          slug: 'tokens',
          amount: 500,
          grantedBy: 'rp-1',
          expiresAt: null,
        })
      ).rejects.toThrow('firestore down');
    });
  });

  describe('listGrants', () => {
    it('queries by userIdentifier alone and returns all grants when no slug is given', async () => {
      const grants = [
        UsageGrantRecordFactory({ slug: 'tokens' }),
        UsageGrantRecordFactory({ slug: 'seats' }),
      ];
      (getUsageGrants as jest.Mock).mockResolvedValue(grants);

      const result = await manager.listGrants('user-1');

      const call = (getUsageGrants as jest.Mock).mock.calls[0];
      expect(call).toHaveLength(2);
      expect(call[1]).toBe('user-1');
      expect(result).toBe(grants);
    });

    it('filters the fetched grants by slug in memory', async () => {
      (getUsageGrants as jest.Mock).mockResolvedValue([
        UsageGrantRecordFactory({ id: 'a', slug: 'tokens' }),
        UsageGrantRecordFactory({ id: 'b', slug: 'seats' }),
      ]);

      const result = await manager.listGrants('user-1', 'tokens');

      expect(result.map((grant) => grant.id)).toEqual(['a']);
    });

    it('propagates a repository failure', async () => {
      (getUsageGrants as jest.Mock).mockRejectedValue(
        new Error('firestore down')
      );

      await expect(manager.listGrants('user-1')).rejects.toThrow(
        'firestore down'
      );
    });
  });

  describe('deleteGrant', () => {
    it('delegates to the repository with the grant id', async () => {
      (deleteUsageGrant as jest.Mock).mockResolvedValue(undefined);

      await manager.deleteGrant('grant-1');

      const [, idArg] = (deleteUsageGrant as jest.Mock).mock.calls[0];
      expect(idArg).toBe('grant-1');
    });

    it('propagates a repository failure', async () => {
      (deleteUsageGrant as jest.Mock).mockRejectedValue(
        new Error('firestore down')
      );

      await expect(manager.deleteGrant('grant-1')).rejects.toThrow(
        'firestore down'
      );
    });
  });

  describe('getActiveGrantedAmount', () => {
    it('sums only the active grants for the given slug at the given time', async () => {
      (getUsageGrants as jest.Mock).mockResolvedValue([
        UsageGrantRecordFactory({
          slug: 'tokens',
          amount: 100,
          expiresAt: null,
        }),
        UsageGrantRecordFactory({
          slug: 'tokens',
          amount: 50,
          expiresAt: Timestamp.fromDate(new Date('2026-06-01T00:00:00.000Z')),
        }),
        UsageGrantRecordFactory({
          slug: 'tokens',
          amount: 25,
          expiresAt: Timestamp.fromDate(new Date('2026-05-01T00:00:00.000Z')),
        }),
        UsageGrantRecordFactory({
          slug: 'seats',
          amount: 999,
          expiresAt: null,
        }),
      ]);

      const total = await manager.getActiveGrantedAmount(
        'user-1',
        'tokens',
        now
      );

      expect(total).toBe(150);
    });

    it('returns zero when the user has no grants', async () => {
      (getUsageGrants as jest.Mock).mockResolvedValue([]);

      const total = await manager.getActiveGrantedAmount(
        'user-1',
        'tokens',
        now
      );

      expect(total).toBe(0);
    });

    it('propagates a repository failure', async () => {
      (getUsageGrants as jest.Mock).mockRejectedValue(
        new Error('firestore down')
      );

      await expect(
        manager.getActiveGrantedAmount('user-1', 'tokens', now)
      ).rejects.toThrow('firestore down');
    });
  });
});
