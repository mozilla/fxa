/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHash } from 'crypto';

import type { CollectionReference, Timestamp } from '@google-cloud/firestore';

import type { FreeAccessProjection } from '@fxa/shared/cms';

import {
  deleteFreeAccessProgramPendingNotification,
  getDueFreeAccessProgramPendingNotifications,
  getFreeAccessProgramJournal,
  pendingNotificationId,
  setFreeAccessProgramJournal,
  upsertFreeAccessProgramPendingNotifications,
} from './free-access-program.repository';

describe('free-access-program.repository', () => {
  let docGet: jest.Mock;
  let docSet: jest.Mock;
  let docRef: { get: jest.Mock; set: jest.Mock };
  let db: jest.Mocked<Pick<CollectionReference, 'doc'>>;

  beforeEach(() => {
    docGet = jest.fn();
    docSet = jest.fn().mockResolvedValue(undefined);
    docRef = { get: docGet, set: docSet };
    db = {
      doc: jest.fn().mockReturnValue(docRef),
    } as jest.Mocked<Pick<CollectionReference, 'doc'>>;
  });

  describe('getFreeAccessProgramJournal', () => {
    it('returns null when the journal document does not exist', async () => {
      docGet.mockResolvedValue({ exists: false });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toBeNull();
      expect(db.doc).toHaveBeenCalledWith('state');
    });

    it('returns the projection when the journal document exists', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      docGet.mockResolvedValue({
        exists: true,
        data: () => ({ projection, updatedAt: 1_700_000_000_000 }),
      });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toEqual(projection);
    });

    it('returns an empty projection when the document exists but the field is absent', async () => {
      docGet.mockResolvedValue({
        exists: true,
        data: () => ({ updatedAt: 1_700_000_000_000 }),
      });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toEqual({});
    });
  });

  describe('setFreeAccessProgramJournal', () => {
    it('writes the projection to the state doc with a timestamp', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      const NOW = 1_700_000_000_000;
      jest.spyOn(Date, 'now').mockReturnValue(NOW);

      await setFreeAccessProgramJournal(
        db as unknown as CollectionReference,
        projection
      );

      expect(db.doc).toHaveBeenCalledWith('state');
      expect(docSet).toHaveBeenCalledWith({ projection, updatedAt: NOW });
    });

    it('upserts (set without merge) so the prior journal is fully replaced', async () => {
      await setFreeAccessProgramJournal(
        db as unknown as CollectionReference,
        {}
      );
      // No `merge: true` option passed — confirms full overwrite semantics.
      expect(docSet).toHaveBeenCalledTimes(1);
      expect(docSet.mock.calls[0][1]).toBeUndefined();
    });
  });

  describe('pending notifications', () => {
    const NOT_BEFORE = 1_700_000_360_000;
    const UPDATE_TIME = { seconds: 1, nanoseconds: 0 } as Timestamp;
    const sha256 = (value: string) =>
      createHash('sha256').update(value).digest('hex');

    let pendingDocRef: { delete: jest.Mock };
    let pendingQuery: { orderBy: jest.Mock; limit: jest.Mock; get: jest.Mock };
    let pendingCollection: { doc: jest.Mock; where: jest.Mock };
    let batches: Array<{ set: jest.Mock; commit: jest.Mock }>;
    let pendingDb: {
      doc: jest.Mock;
      firestore: { batch: jest.Mock };
    };

    beforeEach(() => {
      pendingDocRef = { delete: jest.fn().mockResolvedValue(undefined) };
      pendingQuery = {
        orderBy: jest.fn(),
        limit: jest.fn(),
        get: jest.fn(),
      };
      pendingQuery.orderBy.mockReturnValue(pendingQuery);
      pendingQuery.limit.mockReturnValue(pendingQuery);
      pendingCollection = {
        doc: jest.fn((id: string) => ({ ...pendingDocRef, id })),
        where: jest.fn().mockReturnValue(pendingQuery),
      };
      batches = [];
      pendingDb = {
        doc: jest
          .fn()
          .mockReturnValue({ collection: jest.fn(() => pendingCollection) }),
        firestore: {
          batch: jest.fn(() => {
            const batch = {
              set: jest.fn(),
              commit: jest.fn().mockResolvedValue(undefined),
            };
            batches.push(batch);
            return batch;
          }),
        },
      };
    });

    const asCollection = () => pendingDb as unknown as CollectionReference;

    describe('pendingNotificationId', () => {
      it('is the sha256 hex of the lowercased email', () => {
        expect(pendingNotificationId('Alice@Example.com')).toBe(
          sha256('alice@example.com')
        );
      });
    });

    describe('upsertFreeAccessProgramPendingNotifications', () => {
      it('writes one doc per email under state/pending, keyed by the email hash', async () => {
        await upsertFreeAccessProgramPendingNotifications(
          asCollection(),
          ['alice@example.com', 'bob@example.com'],
          NOT_BEFORE
        );

        expect(pendingDb.doc).toHaveBeenCalledWith('state');
        expect(batches).toHaveLength(1);
        const [batch] = batches;
        expect(batch.set).toHaveBeenCalledTimes(2);
        expect(batch.set).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ id: sha256('alice@example.com') }),
          { email: 'alice@example.com', notBefore: NOT_BEFORE }
        );
        expect(batch.set).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({ id: sha256('bob@example.com') }),
          { email: 'bob@example.com', notBefore: NOT_BEFORE }
        );
        expect(batch.commit).toHaveBeenCalledTimes(1);
      });

      it('splits writes into batches of at most 500', async () => {
        const emails = Array.from(
          { length: 501 },
          (_, i) => `user${i}@example.com`
        );

        await upsertFreeAccessProgramPendingNotifications(
          asCollection(),
          emails,
          NOT_BEFORE
        );

        expect(batches).toHaveLength(2);
        expect(batches[0].set).toHaveBeenCalledTimes(500);
        expect(batches[0].commit).toHaveBeenCalledTimes(1);
        expect(batches[1].set).toHaveBeenCalledTimes(1);
        expect(batches[1].commit).toHaveBeenCalledTimes(1);
      });

      it('commits nothing for an empty list', async () => {
        await upsertFreeAccessProgramPendingNotifications(
          asCollection(),
          [],
          NOT_BEFORE
        );

        expect(batches).toHaveLength(0);
      });

      it('propagates a batch commit failure', async () => {
        pendingDb.firestore.batch.mockReturnValueOnce({
          set: jest.fn(),
          commit: jest.fn().mockRejectedValue(new Error('firestore-down')),
        });

        await expect(
          upsertFreeAccessProgramPendingNotifications(
            asCollection(),
            ['alice@example.com'],
            NOT_BEFORE
          )
        ).rejects.toThrow('firestore-down');
      });
    });

    describe('getDueFreeAccessProgramPendingNotifications', () => {
      it('queries due docs oldest first, capped at the limit', async () => {
        pendingQuery.get.mockResolvedValue({ docs: [] });

        await getDueFreeAccessProgramPendingNotifications(
          asCollection(),
          NOT_BEFORE,
          50
        );

        expect(pendingCollection.where).toHaveBeenCalledWith(
          'notBefore',
          '<=',
          NOT_BEFORE
        );
        expect(pendingQuery.orderBy).toHaveBeenCalledWith('notBefore');
        expect(pendingQuery.limit).toHaveBeenCalledWith(50);
      });

      it('returns docs whose notBefore is at or before now', async () => {
        pendingQuery.get.mockResolvedValue({
          docs: [
            {
              id: 'hash-a',
              get: (field: string) =>
                field === 'email' ? 'alice@example.com' : undefined,
              updateTime: UPDATE_TIME,
            },
          ],
        });

        const result = await getDueFreeAccessProgramPendingNotifications(
          asCollection(),
          NOT_BEFORE,
          500
        );

        expect(result).toEqual([
          { id: 'hash-a', email: 'alice@example.com', updateTime: UPDATE_TIME },
        ]);
      });

      it('returns an empty list when nothing is due', async () => {
        pendingQuery.get.mockResolvedValue({ docs: [] });

        await expect(
          getDueFreeAccessProgramPendingNotifications(
            asCollection(),
            NOT_BEFORE,
            500
          )
        ).resolves.toEqual([]);
      });

      it('returns an undefined email for a doc without a string email', async () => {
        pendingQuery.get.mockResolvedValue({
          docs: [
            {
              id: 'hash-bad',
              get: (field: string) => (field === 'email' ? 42 : undefined),
              updateTime: UPDATE_TIME,
            },
          ],
        });

        await expect(
          getDueFreeAccessProgramPendingNotifications(
            asCollection(),
            NOT_BEFORE,
            500
          )
        ).resolves.toEqual([
          { id: 'hash-bad', email: undefined, updateTime: UPDATE_TIME },
        ]);
      });
    });

    describe('deleteFreeAccessProgramPendingNotification', () => {
      it('deletes the doc only if it has not been updated since it was read', async () => {
        await deleteFreeAccessProgramPendingNotification(asCollection(), {
          id: 'hash-a',
          email: 'alice@example.com',
          updateTime: UPDATE_TIME,
        });

        expect(pendingCollection.doc).toHaveBeenCalledWith('hash-a');
        expect(pendingDocRef.delete).toHaveBeenCalledWith({
          lastUpdateTime: UPDATE_TIME,
        });
      });

      it('propagates a failed precondition', async () => {
        pendingDocRef.delete.mockRejectedValue(
          new Error('9 FAILED_PRECONDITION')
        );

        await expect(
          deleteFreeAccessProgramPendingNotification(asCollection(), {
            id: 'hash-a',
            email: 'alice@example.com',
            updateTime: UPDATE_TIME,
          })
        ).rejects.toThrow('FAILED_PRECONDITION');
      });
    });
  });
});
