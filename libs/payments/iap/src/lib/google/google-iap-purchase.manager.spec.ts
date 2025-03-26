/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { GoogleIapPurchaseManager } from './google-iap-purchase.manager';
import { GoogleIapClient } from './google-iap.client';
import { Logger } from '@nestjs/common';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { MockGoogleIapClientConfigProvider } from './google-iap.client.config';
import * as repository from './google-iap-purchase.repository';
import { PlayStoreSubscriptionPurchase } from './subscription-purchase';
import { FirestoreGoogleIapPurchaseRecordFactory } from '../factories';
import { GoogleIapUnknownError } from './google-iap.error';

jest.mock('./google-iap-purchase.repository', () => {
  return {
    getActivePurchasesForUserId: jest.fn(),
    getPurchase: jest.fn(),
    updatePurchase: jest.fn(),
    createPurchase: jest.fn(),
    deletePurchasesByUserId: jest.fn(),
  };
});

describe('GoogleIapPurchaseManager', () => {
  let manager: GoogleIapPurchaseManager;
  let googleIapClient: GoogleIapClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockGoogleIapClientConfigProvider,
        GoogleIapPurchaseManager,
        GoogleIapClient,
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

    manager = module.get(GoogleIapPurchaseManager);
    googleIapClient = module.get(GoogleIapClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getForUser', () => {
    it('returns converted purchases from Firestore and Google', async () => {
      const userId = faker.string.uuid();
      const sku = faker.commerce.product();
      const packageName = faker.internet.domainName();
      const purchaseToken = faker.string.uuid();

      const firestoreRecord = FirestoreGoogleIapPurchaseRecordFactory({
        purchaseToken,
      });

      jest
        .spyOn(repository, 'getActivePurchasesForUserId')
        .mockResolvedValue([firestoreRecord]);

      const subscription =
        PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreRecord);

      jest
        .spyOn(manager, 'getFromPlayStoreApi')
        .mockResolvedValue(subscription);

      const result = await manager.getForUser(userId, sku, packageName);

      expect(repository.getActivePurchasesForUserId).toHaveBeenCalledWith(
        expect.anything(),
        userId,
        { sku, packageName }
      );

      expect(result).toEqual([subscription]);
    });
  });

  describe('getFromPlayStoreApi', () => {
    it('fetches from API, updates Firestore, and returns subscription', async () => {
      const packageName = faker.string.sample();
      const sku = faker.string.sample();
      const token = faker.string.uuid();
      const mockApiResponse = {
        expiryTimeMillis: (Date.now() + 10000).toString(),
      };

      jest
        .spyOn(googleIapClient, 'getSubscriptions')
        .mockResolvedValue(mockApiResponse);

      jest.spyOn(repository, 'getPurchase').mockResolvedValue(undefined);

      jest
        .spyOn(repository, 'createPurchase')
        .mockResolvedValue(FirestoreGoogleIapPurchaseRecordFactory());

      const result = await manager.getFromPlayStoreApi(packageName, sku, token);

      expect(googleIapClient.getSubscriptions).toHaveBeenCalledWith(
        packageName,
        sku,
        token
      );
      expect(result).toBeInstanceOf(PlayStoreSubscriptionPurchase);
    });

    it('throws wrapped error when Firestore fails', async () => {
      const token = faker.string.uuid();
      jest.spyOn(googleIapClient, 'getSubscriptions').mockResolvedValue({});
      jest.spyOn(repository, 'getPurchase').mockImplementation(() => {
        throw new Error('Firestore failure');
      });

      await expect(
        manager.getFromPlayStoreApi('pkg', 'sku', token)
      ).rejects.toThrow(GoogleIapUnknownError);
    });
  });

  describe('forceRegisterToUser', () => {
    it('updates userId on record', async () => {
      const token = faker.string.uuid();
      const userId = faker.string.uuid();

      await manager.forceRegisterToUser(token, userId);

      expect(repository.updatePurchase).toHaveBeenCalledWith(
        expect.anything(),
        token,
        { userId }
      );
    });
  });

  describe('getStaleCached', () => {
    it('returns a converted subscription if record exists', async () => {
      const token = faker.string.uuid();
      const record = FirestoreGoogleIapPurchaseRecordFactory({
        purchaseToken: token,
      });

      jest.spyOn(repository, 'getPurchase').mockResolvedValue(record);

      const result = await manager.getStaleCached(token);

      expect(result).toBeInstanceOf(PlayStoreSubscriptionPurchase);
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
