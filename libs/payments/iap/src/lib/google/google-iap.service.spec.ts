/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { GoogleIapPurchaseManager } from './google-iap-purchase.manager';
import { GoogleIapService } from './google-iap.service';
import { MockGoogleIapClientConfigProvider } from './google-iap.client.config';
import { GoogleIapClient } from './google-iap.client';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { FirestoreGoogleIapPurchaseRecordFactory } from '../factories';
import { PlayStoreSubscriptionPurchase } from './subscription-purchase';
import { NotificationType } from './types';
import {
  DeveloperNotificationFactory,
  SubscriptionNotificationFactory,
} from './factories';
import assert from 'assert';
import {
  GoogleIapConflictError,
  GoogleIapInvalidPurchaseTokenError,
} from './google-iap.error';

describe('GoogleIapService', () => {
  let service: GoogleIapService;
  let manager: GoogleIapPurchaseManager;
  let logger: Logger;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockGoogleIapClientConfigProvider,
        GoogleIapService,
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
            log: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    manager = module.get(GoogleIapPurchaseManager);
    service = module.get(GoogleIapService);
    logger = module.get(Logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getActiveSubscriptions', () => {
    const purchaseToken = faker.string.uuid();
    const firestoreRecord = FirestoreGoogleIapPurchaseRecordFactory({
      purchaseToken,
    });
    const activeSubscription =
      PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreRecord);
    activeSubscription.isEntitlementActive = jest.fn().mockReturnValue(true);

    it('returns active Google Play subscription purchases', async () => {
      jest.spyOn(manager, 'getForUser').mockResolvedValue([activeSubscription]);

      const result = await service.getActiveSubscriptions('testUserId');

      expect(result).toEqual([activeSubscription]);
    });

    // TODO - Part of FXA-7839
    //it('returns [] if PlayBilling is undefined', async () => {});
  });

  describe('processNotification', () => {
    const mockNotification = DeveloperNotificationFactory();
    const purchaseToken = faker.string.uuid();
    const firestoreRecord = FirestoreGoogleIapPurchaseRecordFactory({
      purchaseToken,
    });
    const subscription =
      PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreRecord);

    beforeEach(() => {
      jest
        .spyOn(manager, 'getFromPlayStoreApi')
        .mockResolvedValue(subscription);
    });

    it('returns null without a notification', async () => {
      const result = await service.processNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toBeNull();
    });

    it('returns null with a SUBSCRIPTION_PURCHASED type', async () => {
      const mockNotification = DeveloperNotificationFactory({
        subscriptionNotification: SubscriptionNotificationFactory({
          notificationType: NotificationType.SUBSCRIPTION_PURCHASED,
        }),
      });
      const result = await service.processNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toBeNull();
      expect(manager.getFromPlayStoreApi).not.toHaveBeenCalled();
    });

    it('returns a subscription for other valid subscription notifications', async () => {
      const mockNotification = DeveloperNotificationFactory({
        subscriptionNotification: SubscriptionNotificationFactory({
          notificationType: NotificationType.SUBSCRIPTION_RENEWED,
        }),
      });
      const result = await service.processNotification(
        'testPackage',
        mockNotification
      );
      expect(result).toEqual(subscription);
      expect(manager.getFromPlayStoreApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerToUserAccount', () => {
    const purchaseToken = faker.string.uuid();
    const mockUserId = faker.string.uuid();
    const firestoreRecord = FirestoreGoogleIapPurchaseRecordFactory({
      purchaseToken,
      userId: undefined,
    });
    const firestoreRecordWithUserId = FirestoreGoogleIapPurchaseRecordFactory({
      purchaseToken,
      userId: mockUserId,
    });
    const subscription =
      PlayStoreSubscriptionPurchase.fromFirestoreObject(firestoreRecord);
    const subscriptionWithUserId =
      PlayStoreSubscriptionPurchase.fromFirestoreObject(
        firestoreRecordWithUserId
      );

    beforeEach(() => {
      subscription.isRegisterable = jest.fn().mockReturnValue(true);
      jest.spyOn(manager, 'getStaleCached').mockResolvedValue(undefined);
      jest
        .spyOn(manager, 'getFromPlayStoreApi')
        .mockResolvedValue(subscription);
      jest.spyOn(manager, 'forceRegisterToUser').mockResolvedValue();
    });

    it('registers successfully for non-cached token', async () => {
      const result = await service.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        mockUserId
      );
      expect(result).toEqual(subscription);
      expect(manager.getFromPlayStoreApi).toHaveBeenCalledTimes(1);
      expect(manager.forceRegisterToUser).toHaveBeenCalledTimes(1);
    });

    it('skips doing anything for cached token', async () => {
      jest
        .spyOn(manager, 'getStaleCached')
        .mockResolvedValue(subscriptionWithUserId);
      const result = await service.registerToUserAccount(
        'testPackage',
        'testSku',
        'testToken',
        mockUserId
      );
      expect(result).toEqual(subscriptionWithUserId);
      expect(manager.getFromPlayStoreApi).not.toHaveBeenCalled();
      expect(manager.forceRegisterToUser).not.toHaveBeenCalled();
    });

    it('throws conflict error for existing token registered to other user', async () => {
      jest
        .spyOn(manager, 'getStaleCached')
        .mockResolvedValue(subscriptionWithUserId);
      try {
        await service.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          `different-${mockUserId}`
        );
        assert.fail('Expected error');
      } catch (err) {
        expect(err).toBeInstanceOf(GoogleIapConflictError);
        expect(logger.log).toHaveBeenCalledTimes(1);
      }
    });

    it('throws invalid token error on non-registerable purchase', async () => {
      subscription.isRegisterable = jest.fn().mockReturnValue(false);
      jest.spyOn(manager, 'getStaleCached').mockResolvedValue(subscription);
      try {
        await service.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        expect(err).toBeInstanceOf(GoogleIapInvalidPurchaseTokenError);
        expect(subscription.isRegisterable).toHaveBeenCalledTimes(1);
      }
    });

    it('throws invalid token error if purchase cant be queried', async () => {
      jest
        .spyOn(manager, 'getFromPlayStoreApi')
        .mockRejectedValue(new Error('Oops'));
      try {
        await service.registerToUserAccount(
          'testPackage',
          'testSku',
          'testToken',
          'testUserId'
        );
        assert.fail('Expected error');
      } catch (err) {
        expect(err).toBeInstanceOf(GoogleIapInvalidPurchaseTokenError);
        expect(err.message).toBe('Oops');
      }
    });
  });
});
