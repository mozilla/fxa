/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {
  FieldValue,
  type CollectionReference,
  type DocumentReference,
  QuerySnapshot,
} from '@google-cloud/firestore';
import {
  ChurnInterventionEntryAlreadyExistsError,
  ChurnInterventionEntryCreateError,
  ChurnInterventionEntryNotFoundError,
  ChurnInterventionEntryMoreThanOneEntryExistsError,
  ChurnInterventionEntryIncorrectUpdateParamsError,
  ChurnInterventionEntryDeleteError,
} from './churn-intervention.error';
import {
  createChurnInterventionEntry,
  getChurnInterventionEntryData,
  updateChurnInterventionEntry,
  deleteChurnInterventionEntry,
} from './churn-intervention.repository';
import {
  ChurnInterventionEntryFactory,
} from './churn-intervention.factories';


describe('Churn Intervention Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockDoc: jest.Mocked<DocumentReference>;

  const mockChurnInterventionEntry = ChurnInterventionEntryFactory();

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
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DocumentReference>;

    mockDb = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'newDocId' }),
    } as unknown as jest.Mocked<CollectionReference>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createChurnInterventionEntry', () => {
    it('creates a churn intervention entry successfully', async () => {
      (mockDb.get as jest.Mock)
      .mockResolvedValueOnce(emptyQueryResult)
      .mockResolvedValueOnce(nonEmptyQueryResult(mockChurnInterventionEntry));

      const result = await createChurnInterventionEntry(
        mockDb,
        mockChurnInterventionEntry
      );
      expect(result).toEqual(mockChurnInterventionEntry);
      expect(mockDb.add).toHaveBeenCalledWith({
        customerId: mockChurnInterventionEntry.customerId,
        churnInterventionId: mockChurnInterventionEntry.churnInterventionId,
        redemptionCount: mockChurnInterventionEntry.redemptionCount ?? 0,
      });
      expect(mockDb.where).toHaveBeenCalledWith(
        'customerId',
        '==',
        mockChurnInterventionEntry.customerId
      );
      expect(mockDb.where).toHaveBeenCalledWith(
        'churnInterventionId',
        '==',
        mockChurnInterventionEntry.churnInterventionId
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it('throws an error if the entry already exists', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );

      await expect(
        createChurnInterventionEntry(mockDb, mockChurnInterventionEntry)
      ).rejects.toThrow(ChurnInterventionEntryAlreadyExistsError);
    });

    it('throws an error if the entry is not created', async () => {
      (mockDb.get as jest.Mock)
      .mockResolvedValueOnce(emptyQueryResult)
      .mockResolvedValueOnce(emptyQueryResult);

      await expect(
        createChurnInterventionEntry(mockDb, mockChurnInterventionEntry)
      ).rejects.toThrow(ChurnInterventionEntryCreateError);
    });

    it('throws an error if the entry is not created', async () => {
      (mockDb.get as jest.Mock)
      .mockResolvedValueOnce(emptyQueryResult)
      .mockRejectedValueOnce(
        new ChurnInterventionEntryNotFoundError('test1', 'test2')
      );

      await expect(
        createChurnInterventionEntry(mockDb, mockChurnInterventionEntry)
      ).rejects.toThrow(ChurnInterventionEntryCreateError);
    });
  });

  describe('getChurnInterventionEntryData', () => {
    it('succeeds', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );

      const result = await getChurnInterventionEntryData(
        mockDb,
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.churnInterventionId
      );

      expect(result).toEqual(mockChurnInterventionEntry);
      expect(mockDb.where).toHaveBeenCalledWith(
        'customerId',
        '==',
        mockChurnInterventionEntry.customerId
      );
      expect(mockDb.where).toHaveBeenCalledWith(
        'churnInterventionId',
        '==',
        mockChurnInterventionEntry.churnInterventionId
      );
      expect(mockDb.limit).toHaveBeenCalledWith(2);
    });

    it('throws an error if no entry is found', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(emptyQueryResult);

      await expect(
        getChurnInterventionEntryData(
          mockDb,
          mockChurnInterventionEntry.customerId,
          mockChurnInterventionEntry.churnInterventionId
        )
      ).rejects.toThrow(ChurnInterventionEntryNotFoundError);
    });

    it('throws an error when multiple records match', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce({
        empty: false,
        size: 2,
        docs: [
          { ref: mockDoc, data: () => mockChurnInterventionEntry },
          { ref: mockDoc, data: () => mockChurnInterventionEntry },
        ],
      } as unknown as QuerySnapshot);

      await expect(
        getChurnInterventionEntryData(
          mockDb,
          mockChurnInterventionEntry.customerId,
          mockChurnInterventionEntry.churnInterventionId
        )
      ).rejects.toThrow(ChurnInterventionEntryMoreThanOneEntryExistsError);
    });
  });

  describe('updateChurnInterventionEntry', () => {
    it('successfully updates', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );

      const updatedEntry = {
        ...mockChurnInterventionEntry,
        redemptionCount: (mockChurnInterventionEntry.redemptionCount ?? 0) + 1,
      };

      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(updatedEntry)
      );

      const result = await updateChurnInterventionEntry(
        mockDb,
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.churnInterventionId,
        1
      );

      expect(mockDoc.update).toHaveBeenCalledWith({
        redemptionCount: FieldValue.increment(1),
      });
      expect(result).toEqual(updatedEntry);
    });

    it('throws an error if called with incorrect update params', async () => {
      await expect(
        updateChurnInterventionEntry(
          mockDb,
          mockChurnInterventionEntry.customerId,
          mockChurnInterventionEntry.churnInterventionId,
          -1
        )
      ).rejects.toThrow(ChurnInterventionEntryIncorrectUpdateParamsError);
    });
  })

  describe('deleteChurnInterventionEntry', () => {
    it('successfully deletes', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        emptyQueryResult
      );

      const result = await deleteChurnInterventionEntry(
        mockDb,
        mockChurnInterventionEntry.customerId,
        mockChurnInterventionEntry.churnInterventionId,
      );

      expect(mockDoc.delete).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledWith(
        'customerId',
        '==',
        mockChurnInterventionEntry.customerId
      );
      expect(mockDb.where).toHaveBeenCalledWith(
        'churnInterventionId',
        '==',
        mockChurnInterventionEntry.churnInterventionId
      );
      expect(result).toEqual(true);
    })

    it('throws an error if could not delete', async () => {
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );
      (mockDb.get as jest.Mock).mockResolvedValueOnce(
        nonEmptyQueryResult(mockChurnInterventionEntry)
      );

      await expect(
        deleteChurnInterventionEntry(
          mockDb,
          mockChurnInterventionEntry.customerId,
          mockChurnInterventionEntry.churnInterventionId,
        )
      ).rejects.toThrow(ChurnInterventionEntryDeleteError);
    });
  })
});
