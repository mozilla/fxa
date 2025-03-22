/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CollectionReference,
  Firestore,
  DocumentReference,
  QuerySnapshot,
  WriteBatch,
} from '@google-cloud/firestore';
import {
  createPurchase,
  getPurchase,
  getActivePurchasesForUserId,
  updatePurchase,
  deletePurchasesByUserId,
} from './apple-iap-purchase.repository';
import { FirestoreAppleIapPurchaseRecordFactory } from '../factories';

jest.mock('@google-cloud/firestore');

describe('Apple IAP Purchase Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mocked<DocumentReference>;
  let mockBatch: jest.Mocked<WriteBatch>;

  const mockPurchaseRecord = FirestoreAppleIapPurchaseRecordFactory();

  beforeEach(() => {
    mockFirestore = new Firestore() as jest.Mocked<Firestore>;

    mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({ data: () => mockPurchaseRecord }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DocumentReference>;

    mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WriteBatch>;

    mockDb = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [{ ref: mockDoc, data: () => mockPurchaseRecord }],
      } as unknown as QuerySnapshot),
      firestore: mockFirestore,
    } as unknown as jest.Mocked<CollectionReference>;

    mockFirestore.batch = jest.fn().mockReturnValue(mockBatch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPurchase', () => {
    it('creates a purchase record', async () => {
      await createPurchase(mockDb, mockPurchaseRecord);
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockPurchaseRecord.originalTransactionId
      );
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockPurchaseRecord.userId,
          productId: mockPurchaseRecord.productId,
          formOfPayment: mockPurchaseRecord.formOfPayment,
        })
      );
    });
  });

  describe('getPurchase', () => {
    it('fetches a purchase by originalTransactionId', async () => {
      const result = await getPurchase(
        mockDb,
        mockPurchaseRecord.originalTransactionId
      );
      expect(result).toEqual(mockPurchaseRecord);
    });
  });

  describe('getActivePurchasesForUserId', () => {
    it('fetches active Apple purchases for a user', async () => {
      const result = await getActivePurchasesForUserId(
        mockDb,
        mockPurchaseRecord.userId
      );
      expect(mockDb.where).toHaveBeenCalledWith(
        'userId',
        '==',
        mockPurchaseRecord.userId
      );
      expect(result).toEqual([mockPurchaseRecord]);
    });
  });

  describe('updatePurchase', () => {
    it('updates allowed fields of a purchase record', async () => {
      const updateData = { userId: 'new-user-id' };
      await updatePurchase(
        mockDb,
        mockPurchaseRecord.originalTransactionId,
        updateData
      );
      expect(mockDb.doc).toHaveBeenCalledWith(
        mockPurchaseRecord.originalTransactionId
      );
      expect(mockDoc.update).toHaveBeenCalledWith(updateData);
    });

    it('throws if no updatable fields are passed', async () => {
      await expect(
        updatePurchase(mockDb, mockPurchaseRecord.originalTransactionId, {})
      ).rejects.toThrow('Must provide at least one update param');
    });
  });

  describe('deletePurchasesByUserId', () => {
    it('deletes all purchases for a user', async () => {
      const mockQuerySnapshot = {
        docs: [{ ref: mockDoc }],
      } as unknown as QuerySnapshot;

      mockDb.get = jest.fn().mockResolvedValue(mockQuerySnapshot);

      await deletePurchasesByUserId(mockDb, mockPurchaseRecord.userId);

      expect(mockDb.where).toHaveBeenCalledWith(
        'userId',
        '==',
        mockPurchaseRecord.userId
      );
      expect(mockBatch.delete).toHaveBeenCalledWith(mockDoc);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });
});
