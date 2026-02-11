/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  DecodedNotificationPayload,
  NotificationSubtype,
  NotificationType,
} from 'app-store-server-api';

import { FirestoreService } from '@fxa/shared/db/firestore';
import { AppleIapClient } from './apple-iap.client';
import { MockAppleIapClientConfigProvider } from './apple-iap.client.config';
import {
  AppleIapConflictError,
  AppleIapInvalidOriginalTransactionIdError,
} from './apple-iap.error';
import { AppleIapPurchaseManager } from './apple-iap-purchase.manager';
import { AppleIapService } from './apple-iap.service';
import { NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES } from './constants';
import { AppStoreSubscriptionPurchase } from './subscription-purchase';

jest.mock('app-store-server-api', () => {
  const actual = jest.requireActual('app-store-server-api');
  return {
    Environment: actual.Environment,
    NotificationSubtype: actual.NotificationSubtype,
    NotificationType: actual.NotificationType,
    AppStoreServerAPI: jest.fn().mockImplementation(() => ({})),
  };
});

describe('AppleIapService', () => {
  let appleIapPurchaseManager: AppleIapPurchaseManager;
  let appleIapService: AppleIapService;

  const mockLogger = {
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockAppleIapClientConfigProvider,
        AppleIapClient,
        AppleIapPurchaseManager,
        AppleIapService,
        {
          provide: FirestoreService,
          useValue: {
            collection: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    appleIapPurchaseManager = module.get(AppleIapPurchaseManager);
    appleIapService = module.get(AppleIapService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerToUserAccount', () => {
    it('registers a purchase to a user', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockUserId = faker.string.uuid();
      const mockPurchase = { userId: mockUserId };
      jest
        .spyOn(appleIapService, 'getSubscriptionPurchase')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);
      jest
        .spyOn(appleIapPurchaseManager, 'forceRegisterToUser')
        .mockResolvedValue();

      const result = await appleIapService.registerToUserAccount(
        mockBundleId,
        mockOriginalTransactionId,
        mockUserId
      );
      expect(result).toEqual(mockPurchase);
    });

    it('throws an error when attempting to query purchase - invalid original transaction id', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockUserId = faker.string.uuid();

      jest
        .spyOn(appleIapService, 'getSubscriptionPurchase')
        .mockResolvedValue(undefined);

      await expect(() =>
        appleIapService.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          mockUserId
        )
      ).rejects.toThrowError(AppleIapInvalidOriginalTransactionIdError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(AppleIapInvalidOriginalTransactionIdError)
      );
    });

    it('throws an error when purchase record is already registered to another user', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockUserId = faker.string.uuid();
      const mockPurchase = { userId: faker.string.uuid() };
      jest
        .spyOn(appleIapService, 'getSubscriptionPurchase')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);

      await expect(() =>
        appleIapService.registerToUserAccount(
          mockBundleId,
          mockOriginalTransactionId,
          mockUserId
        )
      ).rejects.toThrowError(AppleIapConflictError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(AppleIapConflictError)
      );
    });
  });

  describe('processNotification', () => {
    it('returns null for not application notifications', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockNotification = {
        notificationType: NOTIFICATION_TYPES_FOR_NON_SUBSCRIPTION_PURCHASES[0],
      } as DecodedNotificationPayload;
      const mockPurchase = { userId: faker.string.uuid() };

      jest
        .spyOn(appleIapPurchaseManager, 'getFromAppStoreAPI')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);
      const result = await appleIapService.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns null for new subscriptions', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockNotification = {
        notificationType: NotificationType.Subscribed,
        subtype: NotificationSubtype.InitialBuy,
      } as DecodedNotificationPayload;
      const mockPurchase = { userId: faker.string.uuid() };

      jest
        .spyOn(appleIapPurchaseManager, 'getFromAppStoreAPI')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);
      const result = await appleIapService.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      const mockBundleId = faker.string.sample();
      const mockOriginalTransactionId = faker.string.uuid();
      const mockNotification = {
        notificationType: NotificationType.DidRenew,
      } as DecodedNotificationPayload;
      const mockPurchase = { userId: faker.string.uuid() };

      jest
        .spyOn(appleIapPurchaseManager, 'getFromAppStoreAPI')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);
      const result = await appleIapService.processNotification(
        mockBundleId,
        mockOriginalTransactionId,
        mockNotification
      );
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('getSubscriptionPurchase', () => {
    it('returns subscription purchase', async () => {
      const mockOriginalTransactionId = faker.string.uuid();
      const mockPurchase = { userId: faker.string.uuid() };
      jest
        .spyOn(appleIapPurchaseManager, 'getStaleCached')
        .mockResolvedValue(mockPurchase as AppStoreSubscriptionPurchase);

      const result = await appleIapService.getSubscriptionPurchase(
        mockOriginalTransactionId
      );
      expect(result).toEqual(mockPurchase);
    });
  });
});
