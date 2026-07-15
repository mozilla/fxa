/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Timestamp,
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type QuerySnapshot,
} from '@google-cloud/firestore';

import { UsageGrantNotFoundError } from './metering.error';
import {
  deleteUsageGrant,
  getUsageGrants,
  insertUsageGrant,
  type NewUsageGrant,
} from './usage-grants.repository';

describe('Usage Grants Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockDoc: jest.Mocked<DocumentReference>;

  const newGrant: NewUsageGrant = {
    userIdentifier: 'user-1',
    slug: 'tokens',
    amount: 500,
    grantedBy: 'rp-1',
    createdAt: Timestamp.fromDate(new Date('2026-05-15T12:00:00.000Z')),
    expiresAt: Timestamp.fromDate(new Date('2026-06-01T00:00:00.000Z')),
  };

  const querySnapshot = (
    docs: Array<{ id: string; data: Record<string, unknown> }>
  ) =>
    ({
      docs: docs.map((doc) => ({ id: doc.id, data: () => doc.data })),
    }) as unknown as QuerySnapshot;

  beforeEach(() => {
    mockDoc = {
      get: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<DocumentReference>;
    mockDb = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'grant-1' }),
      doc: jest.fn().mockReturnValue(mockDoc),
    } as unknown as jest.Mocked<CollectionReference>;
  });

  describe('insertUsageGrant', () => {
    it('writes the grant fields and returns the record with the generated id', async () => {
      const result = await insertUsageGrant(mockDb, newGrant);

      expect(mockDb.add).toHaveBeenCalledWith({
        userIdentifier: 'user-1',
        slug: 'tokens',
        amount: 500,
        grantedBy: 'rp-1',
        createdAt: newGrant.createdAt,
        expiresAt: newGrant.expiresAt,
      });
      expect(result).toEqual({ id: 'grant-1', ...newGrant });
    });

    it('omits the reason field entirely when it is undefined', async () => {
      await insertUsageGrant(mockDb, newGrant);

      const [written] = (mockDb.add as jest.Mock).mock.calls[0];
      expect(written).not.toHaveProperty('reason');
    });

    it('persists a reason when one is provided', async () => {
      await insertUsageGrant(mockDb, { ...newGrant, reason: 'support comp' });

      expect(mockDb.add).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'support comp' })
      );
    });

    it('propagates a Firestore write failure', async () => {
      (mockDb.add as jest.Mock).mockRejectedValue(new Error('firestore down'));

      await expect(insertUsageGrant(mockDb, newGrant)).rejects.toThrow(
        'firestore down'
      );
    });
  });

  describe('getUsageGrants', () => {
    it('queries Firestore by userIdentifier alone (slug is filtered in memory by callers)', async () => {
      (mockDb.get as jest.Mock).mockResolvedValue(querySnapshot([]));

      await getUsageGrants(mockDb, 'user-1');

      expect(mockDb.where).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledWith(
        'userIdentifier',
        '==',
        'user-1'
      );
    });

    it('propagates a Firestore read failure', async () => {
      (mockDb.get as jest.Mock).mockRejectedValue(new Error('firestore down'));

      await expect(getUsageGrants(mockDb, 'user-1')).rejects.toThrow(
        'firestore down'
      );
    });

    it('maps documents to records and defaults a missing expiry to null', async () => {
      const expiresAt = Timestamp.fromDate(
        new Date('2026-06-01T00:00:00.000Z')
      );
      const createdAt = Timestamp.fromDate(
        new Date('2026-05-15T12:00:00.000Z')
      );
      (mockDb.get as jest.Mock).mockResolvedValue(
        querySnapshot([
          {
            id: 'grant-1',
            data: {
              userIdentifier: 'user-1',
              slug: 'tokens',
              amount: 500,
              grantedBy: 'rp-1',
              reason: 'support comp',
              createdAt,
              expiresAt,
            },
          },
          {
            id: 'grant-2',
            data: {
              userIdentifier: 'user-1',
              slug: 'tokens',
              amount: 100,
              grantedBy: 'rp-1',
              createdAt,
            },
          },
        ])
      );

      const result = await getUsageGrants(mockDb, 'user-1');

      expect(result).toEqual([
        {
          id: 'grant-1',
          userIdentifier: 'user-1',
          slug: 'tokens',
          amount: 500,
          grantedBy: 'rp-1',
          reason: 'support comp',
          createdAt,
          expiresAt,
        },
        {
          id: 'grant-2',
          userIdentifier: 'user-1',
          slug: 'tokens',
          amount: 100,
          grantedBy: 'rp-1',
          reason: undefined,
          createdAt,
          expiresAt: null,
        },
      ]);
    });
  });

  describe('deleteUsageGrant', () => {
    it('deletes the document when it exists', async () => {
      (mockDoc.get as jest.Mock).mockResolvedValue({
        exists: true,
      } as unknown as DocumentSnapshot);

      await deleteUsageGrant(mockDb, 'grant-1');

      expect(mockDb.doc).toHaveBeenCalledWith('grant-1');
      expect(mockDoc.delete).toHaveBeenCalledTimes(1);
    });

    it('throws UsageGrantNotFoundError and does not delete when the document is missing', async () => {
      (mockDoc.get as jest.Mock).mockResolvedValue({
        exists: false,
      } as unknown as DocumentSnapshot);

      await expect(deleteUsageGrant(mockDb, 'grant-1')).rejects.toThrow(
        UsageGrantNotFoundError
      );
      expect(mockDoc.delete).not.toHaveBeenCalled();
    });

    it('propagates a Firestore delete failure after the existence check passes', async () => {
      (mockDoc.get as jest.Mock).mockResolvedValue({
        exists: true,
      } as unknown as DocumentSnapshot);
      (mockDoc.delete as jest.Mock).mockRejectedValue(
        new Error('firestore down')
      );

      await expect(deleteUsageGrant(mockDb, 'grant-1')).rejects.toThrow(
        'firestore down'
      );
    });
  });
});
