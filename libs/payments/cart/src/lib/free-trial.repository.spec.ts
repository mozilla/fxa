/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Timestamp,
  type CollectionReference,
  type DocumentReference,
  type QuerySnapshot,
} from '@google-cloud/firestore';
import { faker } from '@faker-js/faker';
import {
  upsertFreeTrialRecord,
  getFreeTrialRecordData,
} from './free-trial.repository';

describe('Free Trial Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockDoc: jest.Mocked<DocumentReference>;

  const mockRecord = {
    uid: faker.string.uuid(),
    freeTrialConfigId: faker.string.uuid(),
    startedAt: Timestamp.now(),
  };

  const emptyQueryResult = {
    empty: true,
    size: 0,
    docs: [],
  } as unknown as QuerySnapshot;

  const nonEmptyQueryResult = (data: any) =>
    ({
      empty: false,
      size: 1,
      docs: [
        {
          ref: mockDoc,
          data: () => data,
        },
      ],
    } as unknown as QuerySnapshot);

  beforeEach(() => {
    mockDoc = {
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DocumentReference>;

    mockDb = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'newDocId' }),
    } as unknown as jest.Mocked<CollectionReference>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('upsertFreeTrialRecord', () => {
    it('creates a new record when none exists', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(emptyQueryResult);

      await upsertFreeTrialRecord(mockDb, mockRecord);

      expect(mockDb.add).toHaveBeenCalledWith({
        uid: mockRecord.uid,
        freeTrialConfigId: mockRecord.freeTrialConfigId,
        startedAt: mockRecord.startedAt,
      });
      expect(mockDb.where).toHaveBeenCalledWith('uid', '==', mockRecord.uid);
      expect(mockDb.where).toHaveBeenCalledWith(
        'freeTrialConfigId',
        '==',
        mockRecord.freeTrialConfigId
      );
    });

    it('updates startedAt when record already exists', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockRecord)
      );

      const newStartedAt = Timestamp.now();
      await upsertFreeTrialRecord(mockDb, {
        ...mockRecord,
        startedAt: newStartedAt,
      });

      expect(mockDoc.update).toHaveBeenCalledWith({ startedAt: newStartedAt });
      expect(mockDb.add).not.toHaveBeenCalled();
    });
  });

  describe('getFreeTrialRecordData', () => {
    it('returns most recent record when found', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockRecord)
      );

      const result = await getFreeTrialRecordData(
        mockDb,
        mockRecord.uid,
        mockRecord.freeTrialConfigId
      );

      expect(result).toEqual(mockRecord);
      expect(mockDb.where).toHaveBeenCalledWith('uid', '==', mockRecord.uid);
      expect(mockDb.where).toHaveBeenCalledWith(
        'freeTrialConfigId',
        '==',
        mockRecord.freeTrialConfigId
      );
      expect(mockDb.orderBy).toHaveBeenCalledWith('startedAt', 'desc');
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it('returns null when no record exists', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(emptyQueryResult);

      const result = await getFreeTrialRecordData(
        mockDb,
        mockRecord.uid,
        mockRecord.freeTrialConfigId
      );

      expect(result).toBeNull();
    });
  });
});
