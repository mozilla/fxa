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
} from './google-iap-purchase.repository';
import { FirestoreGoogleIapPurchaseRecordFactory } from '../factories';

jest.mock('@google-cloud/firestore');

describe('Google IAP Purchase Repository', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mocked<DocumentReference>;
  let mockBatch: jest.Mocked<WriteBatch>;

  const mockPurchaseRecord = FirestoreGoogleIapPurchaseRecordFactory();

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
      expect(mockDb.doc).toHaveBeenCalledWith(mockPurchaseRecord.purchaseToken);
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockPurchaseRecord.userId,
          sku: mockPurchaseRecord.sku,
          formOfPayment: mockPurchaseRecord.formOfPayment,
        })
      );
    });
  });

  describe('getPurchase', () => {
    it('fetches a purchase by token', async () => {
      const result = await getPurchase(
        mockDb,
        mockPurchaseRecord.purchaseToken
      );
      expect(result).toEqual(mockPurchaseRecord);
    });
  });

  describe('getActivePurchasesForUserId', () => {
    it('fetches active Google Play purchases for a user', async () => {
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
      const updateData = { userId: 'updated-user' };
      await updatePurchase(
        mockDb,
        mockPurchaseRecord.purchaseToken,
        updateData
      );
      expect(mockDb.doc).toHaveBeenCalledWith(mockPurchaseRecord.purchaseToken);
      expect(mockDoc.update).toHaveBeenCalledWith(updateData);
    });

    it('throws if no updatable fields are passed', async () => {
      await expect(
        updatePurchase(mockDb, mockPurchaseRecord.purchaseToken, {})
      ).rejects.toThrow('Must provide at least one update param');
    });

    it('persists paymentState and expiryTimeMillis on a refresh', async () => {
      const refresh = FirestoreGoogleIapPurchaseRecordFactory({
        paymentState: 0,
        expiryTimeMillis: 1_700_000_000_000,
      });
      await updatePurchase(mockDb, mockPurchaseRecord.purchaseToken, refresh);
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentState: refresh.paymentState,
          expiryTimeMillis: refresh.expiryTimeMillis,
        })
      );
    });

    it('persists the replacedByAnotherPurchase flag on a partial update', async () => {
      await updatePurchase(mockDb, mockPurchaseRecord.purchaseToken, {
        replacedByAnotherPurchase: true,
        userId: 'replaced-placeholder',
      });
      expect(mockDoc.update).toHaveBeenCalledWith({
        replacedByAnotherPurchase: true,
        userId: 'replaced-placeholder',
      });
    });

    it('drops undefined fields from a partial update', async () => {
      await updatePurchase(mockDb, mockPurchaseRecord.purchaseToken, {
        userId: 'updated-user',
        cancelReason: undefined,
      });
      expect(mockDoc.update).toHaveBeenCalledWith({ userId: 'updated-user' });
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
