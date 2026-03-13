/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Timestamp } from '@google-cloud/firestore';
import { FreeTrialManager } from './free-trial.manager';
import { FreeTrialConfig } from './free-trial.config';
import {
  getLatestFreeTrialRecordData,
  insertFreeTrialRecord,
} from './free-trial.repository';

const mockCollection = { name: 'mockCollection' } as any;
const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockCollection),
} as any;

jest.mock('./free-trial.repository', () => ({
  getLatestFreeTrialRecordData: jest.fn(),
  insertFreeTrialRecord: jest.fn(),
}));

describe('FreeTrialManager', () => {
  let manager: FreeTrialManager;
  const mockConfig = {
    firestoreCollectionName: 'testCollection',
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

  describe('recordFreeTrial', () => {
    it('delegates to repository function', async () => {
      (insertFreeTrialRecord as jest.Mock).mockResolvedValue(undefined);

      await manager.recordFreeTrial('test-uid', 'test-config');

      expect(insertFreeTrialRecord).toHaveBeenCalledWith(mockCollection, {
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: expect.any(Timestamp),
      });
    });
  });

  describe('isBlockedByCooldown', () => {
    it('returns false when no record exists', async () => {
      (getLatestFreeTrialRecordData as jest.Mock).mockResolvedValue(null);

      const result = await manager.isBlockedByCooldown(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(false);
    });

    it('returns false when record is older than cooldown period', async () => {
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

      (getLatestFreeTrialRecordData as jest.Mock).mockResolvedValue({
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: Timestamp.fromDate(sevenMonthsAgo),
      });

      const result = await manager.isBlockedByCooldown(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(false);
    });

    it('returns true when record is within cooldown period', async () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      (getLatestFreeTrialRecordData as jest.Mock).mockResolvedValue({
        uid: 'test-uid',
        freeTrialConfigId: 'test-config',
        startedAt: Timestamp.fromDate(oneMonthAgo),
      });

      const result = await manager.isBlockedByCooldown(
        'test-uid',
        'test-config',
        6
      );

      expect(result).toBe(true);
    });
  });
});
