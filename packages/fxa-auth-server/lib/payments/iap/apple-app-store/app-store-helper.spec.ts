/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

import { AuthLogger, AppConfig } from '../../../types';

const { mockLog } = require('../../../../test/mocks');

// Mock AppStoreServerAPI to avoid PKCS#8 key parsing
const mockAppStoreServerAPI: any = {};
jest.mock('app-store-server-api', () => {
  const actual = jest.requireActual('app-store-server-api');
  return {
    ...actual,
    AppStoreServerAPI: function () {
      return mockAppStoreServerAPI;
    },
  };
});

// Must require after jest.mock
const { AppStoreHelper } = require('./app-store-helper');

const mockBundleIdWithUnderscores = 'org_mozilla_ios_FirefoxVPN';
const mockBundleId = mockBundleIdWithUnderscores.replace(/_/g, '.');
const mockConfig = {
  subscriptions: {
    appStore: {
      credentials: {
        [mockBundleIdWithUnderscores]: {
          issuerId: 'issuer_id',
          serverApiKey: 'key',
          serverApiKeyId: 'key_id',
        },
      },
      sandbox: true,
    },
  },
};

describe('AppStoreHelper', () => {
  let appStoreHelper: any;
  let log: any;

  beforeEach(() => {
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    appStoreHelper = Container.get(AppStoreHelper);
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  it('can be instantiated', () => {
    const appStoreServerApiClients = {
      [mockBundleId]: mockAppStoreServerAPI,
    };
    const credentialsByBundleId = {
      [mockBundleId]:
        mockConfig.subscriptions.appStore.credentials[
          mockBundleIdWithUnderscores
        ],
    };
    expect(appStoreHelper.log).toBe(log);
    expect(appStoreHelper.appStoreServerApiClients).toEqual(
      appStoreServerApiClients
    );
    expect(appStoreHelper.credentialsByBundleId).toEqual(credentialsByBundleId);
    expect(appStoreHelper.environment).toBe('Sandbox');
  });

  describe('clientByBundleId', () => {
    let mockApiClient: any;

    beforeEach(() => {
      mockApiClient = {};
    });

    it('returns the existing API client for the bundleId', () => {
      appStoreHelper.appStoreServerApiClients[mockBundleId] = mockApiClient;
      const actual = appStoreHelper.clientByBundleId(mockBundleId);
      const expected = mockApiClient;
      expect(actual).toEqual(expected);
    });
    it("initializes an API client for a given bundleId if it doesn't exist", () => {
      appStoreHelper.appStoreServerApiClients = {};
      const actual = appStoreHelper.clientByBundleId(mockBundleId);
      const expected = mockAppStoreServerAPI;
      expect(actual).toEqual(expected);
    });
    it('throws an error if no credentials are found for the given bundleId', () => {
      appStoreHelper.appStoreServerApiClients = {};
      appStoreHelper.credentialsByBundleId = {};
      const expectedMessage = `No App Store credentials found for app with bundleId: ${mockBundleId}.`;
      expect(() => appStoreHelper.clientByBundleId(mockBundleId)).toThrow(
        expectedMessage
      );
    });
  });

  describe('getSubscriptionStatuses', () => {
    it('calls the corresponding method on the API client', async () => {
      const mockOriginalTransactionId = '100000000';
      // Mock App Store Client API response
      const expected = { data: 'wow' };
      mockAppStoreServerAPI.getSubscriptionStatuses = jest
        .fn()
        .mockResolvedValue(expected);
      appStoreHelper.clientByBundleId = jest
        .fn()
        .mockReturnValue(mockAppStoreServerAPI);
      const actual = await appStoreHelper.getSubscriptionStatuses(
        mockBundleId,
        mockOriginalTransactionId
      );
      expect(actual).toEqual(expected);

      expect(appStoreHelper.clientByBundleId).toHaveBeenCalledTimes(1);
      expect(appStoreHelper.clientByBundleId).toHaveBeenCalledWith(
        mockBundleId
      );
      expect(
        mockAppStoreServerAPI.getSubscriptionStatuses
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAppStoreServerAPI.getSubscriptionStatuses
      ).toHaveBeenCalledWith(mockOriginalTransactionId);
    });
  });
});
