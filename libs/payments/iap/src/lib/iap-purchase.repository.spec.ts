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
  getActiveGooglePurchasesForUserId,
  getActiveApplePurchasesForUserId,
  updatePurchase,
  deletePurchasesByUserId,
} from './iap-purchase.repository';
import { FirestorePurchaseRecord } from './types';
import { faker } from '@faker-js/faker';
import { GOOGLE_PLAY_FORM_OF_PAYMENT, SkuType } from './constants';

jest.mock('@google-cloud/firestore');

describe('Purchase Service', () => {
  let mockDb: jest.Mocked<CollectionReference>;
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mocked<DocumentReference>;
  let mockBatch: jest.Mocked<WriteBatch>;

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

  const mockPurchaseRecord: FirestorePurchaseRecord = {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    formOfPayment: GOOGLE_PLAY_FORM_OF_PAYMENT,
    skuType: SkuType.SUBS,
    isMutable: true,
    sku: faker.string.uuid(),
    packageName: faker.string.uuid(),
    productId: faker.string.uuid(),
    bundleId: faker.string.uuid(),
  };

  describe('createPurchase', () => {
    it('should create a purchase record', async () => {
      await createPurchase(mockDb, mockPurchaseRecord);
      expect(mockDb.doc).toHaveBeenCalledWith(mockPurchaseRecord.id);
      expect(mockDoc.set).toHaveBeenCalledWith(mockPurchaseRecord);
    });
  });

  describe('getPurchase', () => {
    it('should fetch a purchase by ID', async () => {
      const result = await getPurchase(mockDb, mockPurchaseRecord.id);
      expect(result).toEqual(mockPurchaseRecord);
    });
  });

  describe('getActiveGooglePurchasesForUserId', () => {
    it('should fetch active Google Play purchases for a user', async () => {
      const result = await getActiveGooglePurchasesForUserId(
        mockDb,
        mockPurchaseRecord.userId
      );
      expect(result).toEqual([mockPurchaseRecord]);
    });
  });

  describe('getActiveApplePurchasesForUserId', () => {
    it('should fetch active Apple purchases for a user', async () => {
      const result = await getActiveApplePurchasesForUserId(
        mockDb,
        mockPurchaseRecord.userId
      );
      expect(result).toEqual([mockPurchaseRecord]);
    });
  });

  describe('updatePurchase', () => {
    it('should update a purchase record', async () => {
      const updateData = { isMutable: false };
      await updatePurchase(mockDb, mockPurchaseRecord.id, updateData);
      expect(mockDb.doc).toHaveBeenCalledWith(mockPurchaseRecord.id);
      expect(mockDoc.update).toHaveBeenCalledWith(updateData);
    });
  });

  describe('deletePurchasesByUserId', () => {
    it('should delete purchases for a user', async () => {
      const mockQuerySnapshot = {
        docs: [{ ref: mockDoc }],
      } as unknown as QuerySnapshot;
      mockDb.get = jest.fn().mockResolvedValue(mockQuerySnapshot);

      mockBatch.delete = jest.fn();
      mockBatch.commit = jest.fn().mockResolvedValue(undefined);

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
