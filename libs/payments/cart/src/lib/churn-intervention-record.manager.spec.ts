/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnInterventionRecordManager } from './churn-intervention-record.manager';
import { ChurnInterventionConfig } from './churn-intervention.config';
import {
  createChurnInterventionEntry,
  getChurnInterventionEntryData,
  updateChurnInterventionEntry,
  deleteChurnInterventionEntry,
} from './churn-intervention.repository';
import { ChurnInterventionEntryFactory } from './churn-intervention.factories';

const mockCollection = { name: 'mockCollection' } as any;
const mockFirestore = {
  collection: jest.fn().mockReturnValue(mockCollection),
} as any;

jest.mock('./churn-intervention.repository', () => ({
  createChurnInterventionEntry: jest.fn(),
  getChurnInterventionEntryData: jest.fn(),
  updateChurnInterventionEntry: jest.fn(),
  deleteChurnInterventionEntry: jest.fn(),
}));

describe('ChurnInterventionRecordManager', () => {
  let manager: ChurnInterventionRecordManager;
  const mockConfig = { collectionName: 'testCollection' } as ChurnInterventionConfig;
  const mockEntry = ChurnInterventionEntryFactory();

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ChurnInterventionRecordManager(mockConfig, mockFirestore);
  });

  describe('collectionRef', () => {
    it('returns the correct collection reference', () => {
      const ref = manager.collectionRef;
      expect(mockFirestore.collection).toHaveBeenCalledWith('testCollection');
      expect(ref).toBe(mockCollection);
    });
  });

  describe('createEntry', () => {
    it('successfully creates', async () => {
      (createChurnInterventionEntry as jest.Mock).mockResolvedValue(mockEntry);

      const result = await manager.createEntry(mockEntry);

      expect(createChurnInterventionEntry).toHaveBeenCalledWith(mockCollection, {
        customerId: mockEntry.customerId,
        churnInterventionId: mockEntry.churnInterventionId,
        redemptionCount: mockEntry.redemptionCount ?? 0,
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('getEntry', () => {
    it('successfully gets data', async () => {
      (getChurnInterventionEntryData as jest.Mock).mockResolvedValue(mockEntry);

      const result = await manager.getEntry(mockEntry.customerId, mockEntry.churnInterventionId);

      expect(getChurnInterventionEntryData).toHaveBeenCalledWith(
        mockCollection,
        mockEntry.customerId,
        mockEntry.churnInterventionId
      );
      expect(result).toEqual({
        customerId: mockEntry.customerId,
        churnInterventionId: mockEntry.churnInterventionId,
        redemptionCount: mockEntry.redemptionCount,
      });
    });
  });

  describe('updateEntry', () => {
    it('successfully udpates', async () => {
      const updated = { ...mockEntry, redemptionCount: mockEntry.redemptionCount + 1 };
      (updateChurnInterventionEntry as jest.Mock).mockResolvedValue(updated);

      const result = await manager.updateEntry(
        mockEntry.customerId,
        mockEntry.churnInterventionId,
        1
      );

      expect(updateChurnInterventionEntry).toHaveBeenCalledWith(
        mockCollection,
        mockEntry.customerId,
        mockEntry.churnInterventionId,
        1
      );
      expect(result).toEqual({
        customerId: updated.customerId,
        churnInterventionId: updated.churnInterventionId,
        redemptionCount: updated.redemptionCount,
      });
    });
  });

  describe('deleteEntry', () => {
    it('successfully deletes', async () => {
      (deleteChurnInterventionEntry as jest.Mock).mockResolvedValue(true);

      const result = await manager.deleteEntry(mockEntry.customerId, mockEntry.churnInterventionId);

      expect(deleteChurnInterventionEntry).toHaveBeenCalledWith(
        mockCollection,
        mockEntry.customerId,
        mockEntry.churnInterventionId
      );
      expect(result).toBe(true);
    });
  });
});
