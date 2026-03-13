/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp } from '@google-cloud/firestore';
import { FreeTrialManager } from './free-trial.manager';
import { FreeTrialConfig } from './free-trial.config';
import {
  getFreeTrialRecordData,
  upsertFreeTrialRecord,
} from './free-trial.repository';

const mockCollection = { name: 'mockCollection' } as any;
const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockCollection),
} as any;

jest.mock('./free-trial.repository', () => ({
  getFreeTrialRecordData: jest.fn(),
  upsertFreeTrialRecord: jest.fn(),
}));

describe('FreeTrialManager', () => {
  let manager: FreeTrialManager;
  const mockConfig = {
    collectionName: 'testCollection',
  } as FreeTrialConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new FreeTrialManager(mockConfig, mockFirestore);
  });

  describe('collectionRef', () => {
    it('returns the correct collection reference', () => {
      const ref = manager.collectionRef;
      expect(mockFirestore.collection).toHaveBeenCalledWith('testCollection');
      expect(ref).toBe(mockCollection);
    });
  });

  describe('getRecord', () => {
    it('delegates to repository function', async () => {
      const mockRecord = {
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: Timestamp.now(),
      };
      (getFreeTrialRecordData as jest.Mock).mockResolvedValue(mockRecord);

      const result = await manager.getRecord('test-uid', 'test-config');

      expect(getFreeTrialRecordData).toHaveBeenCalledWith(
        mockCollection,
        'test-uid',
        'test-config'
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('upsertRecord', () => {
    it('delegates to repository function', async () => {
      (upsertFreeTrialRecord as jest.Mock).mockResolvedValue(undefined);

      await manager.upsertRecord('test-uid', 'test-config');

      expect(upsertFreeTrialRecord).toHaveBeenCalledWith(mockCollection, {
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: expect.any(Timestamp),
      });
    });
  });

  describe('isCooldownElapsed', () => {
    it('returns true when no record exists', async () => {
      (getFreeTrialRecordData as jest.Mock).mockResolvedValue(null);

      const result = await manager.isCooldownElapsed(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(true);
    });

    it('returns true when record is older than cooldown period', async () => {
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

      (getFreeTrialRecordData as jest.Mock).mockResolvedValue({
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: Timestamp.fromDate(sevenMonthsAgo),
      });

      const result = await manager.isCooldownElapsed(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(true);
    });

    it('returns false when record is within cooldown period', async () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      (getFreeTrialRecordData as jest.Mock).mockResolvedValue({
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: Timestamp.fromDate(oneMonthAgo),
      });

      const result = await manager.isCooldownElapsed(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(false);
    });
  });
});
