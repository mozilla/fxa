/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AppleIapStoreManager } from './apple-iap-store.manager';
import { AppleIapClient } from './apple-iap.client';
import {
  decodeNotificationPayload,
  decodeTransaction,
  Environment,
} from 'app-store-server-api';
import { FirestoreService } from '@fxa/shared/db/firestore';
import { MockAppleIapClientConfigProvider } from './apple-iap.client.config';

jest.mock('app-store-server-api', () => {
  const actual = jest.requireActual('app-store-server-api');
  return {
    Environment: actual.Environment,
    SubscriptionStatus: actual.SubscriptionStatus,
    decodeNotificationPayload: jest.fn(),
    decodeTransaction: jest.fn(),
    AppStoreServerAPI: jest.fn().mockImplementation(() => ({})),
  };
});

describe('AppleIapStoreManager', () => {
  let manager: AppleIapStoreManager;
  let appleIapClient: AppleIapClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AppleIapStoreManager,
        AppleIapClient,
        MockAppleIapClientConfigProvider,
        {
          provide: FirestoreService,
          useValue: {
            collection: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    manager = module.get(AppleIapStoreManager);
    appleIapClient = module.get(AppleIapClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('decodeNotificationPayload', () => {
    const payload = faker.string.sample();
    const signedTransactionInfo = faker.string.sample();
    const bundleId = faker.string.sample();
    const originalTransactionId = faker.string.uuid();

    it('decodes the payload and returns expected data', async () => {
      const mockDecodedPayload = {
        data: {
          signedTransactionInfo,
        },
      };

      (decodeNotificationPayload as jest.Mock).mockResolvedValue(
        mockDecodedPayload
      );
      (decodeTransaction as jest.Mock).mockResolvedValue({
        bundleId,
        originalTransactionId,
      });

      const result = await manager.decodeNotificationPayload(payload);

      expect(decodeNotificationPayload).toHaveBeenCalledWith(payload);
      expect(decodeTransaction).toHaveBeenCalledWith(signedTransactionInfo);
      expect(result).toEqual({
        bundleId,
        decodedPayload: mockDecodedPayload,
        originalTransactionId,
      });
    });

    it('throws if decoded payload has no data', async () => {
      (decodeNotificationPayload as jest.Mock).mockResolvedValue({});

      await expect(manager.decodeNotificationPayload(payload)).rejects.toThrow(
        'Decoded payload contains no data'
      );
    });
  });

  describe('getSubscriptionStatuses', () => {
    it('calls appleIapClient.getSubscriptionStatuses with correct params', async () => {
      const bundleId = faker.string.sample();
      const originalTransactionId = faker.string.uuid();
      const mockResult = {
        data: [],
        environment: Environment.Sandbox,
        appAppleId: faker.string.uuid(),
        bundleId: faker.string.uuid(),
      };
      const spy = jest
        .spyOn(appleIapClient, 'getSubscriptionStatuses')
        .mockResolvedValue(mockResult);

      const result = await manager.getSubscriptionStatuses(
        bundleId,
        originalTransactionId
      );

      expect(spy).toHaveBeenCalledWith(bundleId, originalTransactionId);
      expect(result).toEqual(mockResult);
    });
  });
});
