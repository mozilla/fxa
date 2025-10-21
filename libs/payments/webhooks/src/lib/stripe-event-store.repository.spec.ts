/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CollectionReference,
  DocumentReference,
  QuerySnapshot,
  Timestamp,
  type DocumentSnapshot,
} from '@google-cloud/firestore';
import {
  StripeEventStoreEntryFactory,
  StripeEventStoreEntryFirestoreRecordFactory,
} from './factories';
import {
  createStripeEventStoreEntry,
  deleteStripeEventStoreEntry,
  getStripeEventStoreEntry,
  updateStripeEventStoreEntry,
} from './stripe-event-store.repository';
import {
  StripeEventStoreEntryAlreadyExistsError,
  StripeEventStoreEntryCreateError,
  StripeEventStoreEntryDeleteError,
  StripeEventStoreEntryMissingRequiredError,
  StripeEventStoreEntryMissingUpdateParamsError,
  StripeEventStoreEntryNotFoundError,
} from './stripe-event-store.error';

describe('Stripe Event Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockDoc: jest.Mocked<DocumentReference>;

  const mockStripeEventStoreEntry = StripeEventStoreEntryFactory();
  const mockStripeEventStoreEntryFirestoreRecord =
    StripeEventStoreEntryFirestoreRecordFactory({
      eventId: mockStripeEventStoreEntry.eventId,
      processedAt: Timestamp.fromDate(mockStripeEventStoreEntry.processedAt),
      eventDetails: mockStripeEventStoreEntry.eventDetails,
    });
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { eventId, ...mockStripeEventStoreEntryUpdate } =
    mockStripeEventStoreEntry;

  beforeEach(() => {
    mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest
        .fn()
        .mockResolvedValue({
          data: () => mockStripeEventStoreEntryFirestoreRecord,
        }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DocumentReference>;

    mockDb = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          {
            ref: mockDoc,
            data: () => mockStripeEventStoreEntryFirestoreRecord,
          },
        ],
      } as unknown as QuerySnapshot),
    } as unknown as jest.Mocked<CollectionReference>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createStripeEventStoreEntry', () => {
    beforeEach(() => {
      mockDoc.get.mockResolvedValueOnce({
        data: () => undefined,
      } as unknown as DocumentSnapshot);
    });

    it('creates a stripe event record successfully', async () => {
      const result = await createStripeEventStoreEntry(
        mockDb,
        mockStripeEventStoreEntry
      );
      expect(result).toEqual(mockStripeEventStoreEntry);
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockStripeEventStoreEntry.eventId
      );
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: mockStripeEventStoreEntryFirestoreRecord.eventId,
          processedAt: mockStripeEventStoreEntryFirestoreRecord.processedAt,
          eventDetails: mockStripeEventStoreEntryFirestoreRecord.eventDetails,
        })
      );
    });

    it('throws an error if the record is not created', async () => {
      mockDoc.get = jest.fn().mockResolvedValueOnce({
        data: () => mockStripeEventStoreEntryFirestoreRecord,
      } as unknown as DocumentSnapshot);

      await expect(
        createStripeEventStoreEntry(mockDb, mockStripeEventStoreEntry)
      ).rejects.toThrow(StripeEventStoreEntryAlreadyExistsError);
    });

    it('throws an error if the record is not created', async () => {
      mockDoc.get.mockRejectedValue(
        new StripeEventStoreEntryNotFoundError('test')
      );

      await expect(
        createStripeEventStoreEntry(mockDb, mockStripeEventStoreEntry)
      ).rejects.toThrow(StripeEventStoreEntryCreateError);
    });
  });

  describe('getStripeEventStoreEntry', () => {
    it('succeeds', async () => {
      const result = await getStripeEventStoreEntry(
        mockDb,
        mockStripeEventStoreEntry.eventId
      );
      expect(result).toEqual(mockStripeEventStoreEntry);
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockStripeEventStoreEntry.eventId
      );
    });

    it('throws an error if no record is found', async () => {
      mockDoc.get.mockResolvedValueOnce({
        data: () => undefined,
      } as unknown as DocumentSnapshot);

      await expect(
        getStripeEventStoreEntry(mockDb, mockStripeEventStoreEntry.eventId)
      ).rejects.toThrow(StripeEventStoreEntryNotFoundError);
    });

    it('throws an error if required fields are missing', async () => {
      mockDoc.get.mockResolvedValueOnce({
        data: () => {
          return {
            ...mockStripeEventStoreEntryFirestoreRecord,
            processedAt: undefined,
          };
        },
      } as unknown as DocumentSnapshot);

      await expect(
        getStripeEventStoreEntry(mockDb, mockStripeEventStoreEntry.eventId)
      ).rejects.toThrow(StripeEventStoreEntryMissingRequiredError);
    });
  });

  describe('updateStripeEventStoreEntry', () => {
    it('succeeds', async () => {
      const result = await updateStripeEventStoreEntry(
        mockDb,
        mockStripeEventStoreEntry.eventId,
        mockStripeEventStoreEntryUpdate
      );
      expect(result).toEqual(mockStripeEventStoreEntry);
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockStripeEventStoreEntry.eventId
      );
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          processedAt: mockStripeEventStoreEntryFirestoreRecord.processedAt,
          eventDetails: mockStripeEventStoreEntryFirestoreRecord.eventDetails,
        })
      );
    });

    it('throws an error if no update params are provided', async () => {
      await expect(
        updateStripeEventStoreEntry(
          mockDb,
          mockStripeEventStoreEntry.eventId,
          {}
        )
      ).rejects.toThrow(StripeEventStoreEntryMissingUpdateParamsError);
    });
  });

  describe('deleteStripeEventStoreEntry', () => {
    beforeEach(() => {
      mockDoc.get.mockResolvedValueOnce({
        data: () => undefined,
      } as unknown as DocumentSnapshot);
    });

    it('succeeds', async () => {
      const result = await deleteStripeEventStoreEntry(
        mockDb,
        mockStripeEventStoreEntry.eventId
      );
      expect(result).toBeTruthy();
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockStripeEventStoreEntry.eventId
      );
    });

    it('thows an error if record is not deleted', async () => {
      mockDoc.get = jest.fn().mockResolvedValueOnce({
        data: () => mockStripeEventStoreEntryFirestoreRecord,
      } as unknown as DocumentSnapshot);

      await expect(
        deleteStripeEventStoreEntry(mockDb, mockStripeEventStoreEntry.eventId)
      ).rejects.toThrow(StripeEventStoreEntryDeleteError);
    });
  });
});
