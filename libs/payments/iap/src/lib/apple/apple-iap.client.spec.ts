/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test, TestingModule } from '@nestjs/testing';
import { AppleIapClient } from './apple-iap.client';
import { AppleIapMissingCredentialsError } from './apple-iap.error';
import { Environment, StatusResponse } from 'app-store-server-api';
import {
  AppleIapClientConfig,
  MockAppleIapClientConfigProvider,
} from './apple-iap.client.config';
import assert from 'assert';
import { faker } from '@faker-js/faker';

jest.mock('app-store-server-api', () => {
  const actual = jest.requireActual('app-store-server-api');
  return {
    Environment: actual.Environment,
    AppStoreServerAPI: jest.fn().mockImplementation(() => ({
      getSubscriptionStatuses: jest.fn(),
    })),
  };
});

describe('AppleIapClient', () => {
  let appleIapClient: AppleIapClient;
  let appleIapClientConfig: AppleIapClientConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockAppleIapClientConfigProvider, AppleIapClient],
    }).compile();

    appleIapClient = module.get(AppleIapClient);
    appleIapClientConfig = module.get(AppleIapClientConfig);
  });

  describe('getSubscriptionStatuses', () => {
    it('should return subscription status', async () => {
      const mockTransactionId = faker.string.uuid();
      const mockStatusResponse = {
        environment: Environment.Sandbox,
      } as StatusResponse;
      const mockApiInstance = appleIapClient.appStoreServerApiClients
        .values()
        .next().value;
      assert(mockApiInstance);

      jest
        .spyOn(mockApiInstance, 'getSubscriptionStatuses')
        .mockResolvedValue(mockStatusResponse);

      const result = await appleIapClient.getSubscriptionStatuses(
        appleIapClientConfig.credentials[0].bundleId,
        mockTransactionId
      );

      expect(result).toEqual(mockStatusResponse);
      expect(mockApiInstance.getSubscriptionStatuses).toHaveBeenCalledWith(
        mockTransactionId
      );
    });

    it('should throw AppleIapMissingCredentialsError if no credentials exist for bundleId', () => {
      const mockTransactionId = faker.string.uuid();
      const mockBundleId = faker.string.uuid();

      expect(async () =>
        appleIapClient.getSubscriptionStatuses(mockBundleId, mockTransactionId)
      ).rejects.toThrowError(AppleIapMissingCredentialsError);
    });
  });
});
