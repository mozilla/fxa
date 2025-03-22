/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AppleIapPurchaseManager } from './apple-iap-purchase.manager';
import { AppleIapClient } from './apple-iap.client';
import { Logger } from '@nestjs/common';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { MockAppleIapClientConfigProvider } from './apple-iap.client.config';
import * as repository from './apple-iap-purchase.repository';
import { AppStoreSubscriptionPurchase } from './subscription-purchase';
import {
  decodeRenewalInfo,
  decodeTransaction,
  SubscriptionStatus,
  type StatusResponse,
} from 'app-store-server-api';
import { FirestoreAppleIapPurchaseRecordFactory } from '../factories';
import { AppleIapNotFoundError } from './apple-iap.error';

jest.mock('./apple-iap-purchase.repository', () => ({
  getActivePurchasesForUserId: jest.fn(),
  getPurchase: jest.fn(),
  updatePurchase: jest.fn(),
  createPurchase: jest.fn(),
  deletePurchasesByUserId: jest.fn(),
}));

jest.mock('app-store-server-api', () => {
  const actual = jest.requireActual('app-store-server-api');
  return {
    Environment: actual.Environment,
    SubscriptionStatus: actual.SubscriptionStatus,
    decodeTransaction: jest.fn(),
    decodeRenewalInfo: jest.fn(),
    AppStoreServerAPI: jest.fn().mockImplementation(() => ({})),
  };
});

describe('AppleIapPurchaseManager', () => {
  let manager: AppleIapPurchaseManager;
  let appleIapClient: AppleIapClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockAppleIapClientConfigProvider,
        AppleIapPurchaseManager,
        AppleIapClient,
        {
          provide: FirestoreService,
          useValue: {
            collection: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: Logger,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    manager = module.get(AppleIapPurchaseManager);
    appleIapClient = module.get(AppleIapClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getForUser', () => {
    it('returns converted purchase records', async () => {
      const userId = faker.string.uuid();
      const bundleId = faker.string.sample();
      const productId = faker.string.sample();
      const originalTransactionId = faker.string.uuid();

      jest.spyOn(repository, 'getActivePurchasesForUserId').mockResolvedValue([
        FirestoreAppleIapPurchaseRecordFactory({
          originalTransactionId,
        }),
      ]);

      const mockApiResponse = {
        data: [
          {
            lastTransactions: [
              {
                originalTransactionId,
                status: 1,
                signedTransactionInfo: faker.string.sample(),
                signedRenewalInfo: faker.string.sample(),
              },
            ],
          },
        ],
      };

      jest
        .spyOn(appleIapClient, 'getSubscriptionStatuses')
        .mockResolvedValue(mockApiResponse as StatusResponse);
      jest
        .spyOn(repository, 'getPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());
      jest
        .spyOn(repository, 'createPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());

      (decodeTransaction as jest.Mock).mockResolvedValue({
        transactionId: 'abc',
      });
      (decodeRenewalInfo as jest.Mock).mockResolvedValue({
        renewalInfo: 'xyz',
      });

      const result = await manager.getForUser(userId, bundleId, productId);

      expect(repository.getActivePurchasesForUserId).toHaveBeenCalledWith(
        expect.anything(),
        userId,
        { bundleId, productId }
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AppStoreSubscriptionPurchase);
    });

    it('returns only purchases with active entitlements', async () => {
      const userId = faker.string.uuid();
      const originalTransactionId = faker.string.uuid();

      jest.spyOn(repository, 'getActivePurchasesForUserId').mockResolvedValue([
        FirestoreAppleIapPurchaseRecordFactory({
          status: SubscriptionStatus.Expired,
          originalTransactionId,
        }),
      ]);

      jest.spyOn(appleIapClient, 'getSubscriptionStatuses').mockResolvedValue({
        data: [
          {
            lastTransactions: [
              {
                originalTransactionId,
                status: SubscriptionStatus.Expired,
                signedTransactionInfo: faker.string.sample(),
                signedRenewalInfo: faker.string.sample(),
              },
            ],
          },
        ],
      } as StatusResponse);

      const result = await manager.getForUser(userId);

      expect(result).toEqual([]);
    });

    it('returns purchases that are inactive in firestore, but active according to apple', async () => {
      const userId = faker.string.uuid();
      const originalTransactionId = faker.string.uuid();

      jest.spyOn(repository, 'getActivePurchasesForUserId').mockResolvedValue([
        FirestoreAppleIapPurchaseRecordFactory({
          status: SubscriptionStatus.Expired,
          originalTransactionId,
        }),
      ]);

      jest.spyOn(appleIapClient, 'getSubscriptionStatuses').mockResolvedValue({
        data: [
          {
            lastTransactions: [
              {
                originalTransactionId,
                status: SubscriptionStatus.Active,
                signedTransactionInfo: faker.string.sample(),
                signedRenewalInfo: faker.string.sample(),
              },
            ],
          },
        ],
      } as StatusResponse);

      const result = await manager.getForUser(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AppStoreSubscriptionPurchase);
    });

    it('does not throw when subscription cannot be found from Apple', async () => {
      const userId = faker.string.uuid();

      jest
        .spyOn(repository, 'getActivePurchasesForUserId')
        .mockResolvedValue([FirestoreAppleIapPurchaseRecordFactory()]);

      jest
        .spyOn(appleIapClient, 'getSubscriptionStatuses')
        .mockRejectedValue(new AppleIapNotFoundError(''));
      jest
        .spyOn(repository, 'getPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());
      jest
        .spyOn(repository, 'createPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());

      await expect(manager.getForUser(userId)).resolves.not.toThrow();
    });

    it('throws for unknown errors', async () => {
      const userId = faker.string.uuid();

      jest.spyOn(repository, 'getActivePurchasesForUserId').mockResolvedValue([
        FirestoreAppleIapPurchaseRecordFactory({
          status: SubscriptionStatus.Expired,
        }),
      ]);

      jest
        .spyOn(appleIapClient, 'getSubscriptionStatuses')
        .mockRejectedValue(new Error('boom'));
      jest
        .spyOn(repository, 'getPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());
      jest
        .spyOn(repository, 'createPurchase')
        .mockResolvedValue(FirestoreAppleIapPurchaseRecordFactory());

      await expect(() => manager.getForUser(userId)).rejects.toThrow();
    });
  });

  describe('forceRegisterToUser', () => {
    it('updates purchase record with userId', async () => {
      const originalTransactionId = faker.string.uuid();
      const userId = faker.string.uuid();

      await manager.forceRegisterToUser(originalTransactionId, userId);

      expect(repository.updatePurchase).toHaveBeenCalledWith(
        expect.anything(),
        originalTransactionId,
        { userId }
      );
    });
  });

  describe('getStaleCached', () => {
    it('returns converted AppStoreSubscriptionPurchase', async () => {
      const record = { id: faker.string.uuid() };

      jest.spyOn(repository, 'getPurchase').mockResolvedValue(record as any);

      const result = await manager.getStaleCached(record.id);

      expect(result).toBeInstanceOf(AppStoreSubscriptionPurchase);
    });
  });

  describe('deleteForUser', () => {
    it('calls deletePurchasesByUserId', async () => {
      const userId = faker.string.uuid();

      await manager.deleteForUser(userId);

      expect(repository.deletePurchasesByUserId).toHaveBeenCalledWith(
        expect.anything(),
        userId
      );
    });
  });
});
