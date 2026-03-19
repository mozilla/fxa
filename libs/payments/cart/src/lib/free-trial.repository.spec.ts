/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Timestamp,
  type CollectionReference,
  type QuerySnapshot,
} from '@google-cloud/firestore';
import { faker } from '@faker-js/faker';
import {
  insertFreeTrialRecord,
  getLatestFreeTrialRecordData,
} from './free-trial.repository';

describe('Free Trial Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;

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
          data: () => data,
        },
      ],
    } as unknown as QuerySnapshot);

  beforeEach(() => {
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

  describe('insertFreeTrialRecord', () => {
    it('creates a new record', async () => {
      await insertFreeTrialRecord(mockDb, mockRecord);

      expect(mockDb.add).toHaveBeenCalledWith({
        uid: mockRecord.uid,
        freeTrialConfigId: mockRecord.freeTrialConfigId,
        startedAt: mockRecord.startedAt,
      });
    });
  });

  describe('getLatestFreeTrialRecordData', () => {
    it('returns most recent record when found', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockRecord)
      );

      const result = await getLatestFreeTrialRecordData(
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

      const result = await getLatestFreeTrialRecordData(
        mockDb,
        mockRecord.uid,
        mockRecord.freeTrialConfigId
      );

      expect(result).toBeNull();
    });
  });
});
