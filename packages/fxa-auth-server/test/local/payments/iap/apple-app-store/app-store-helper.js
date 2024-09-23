/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { assert } from 'chai';
import { Container } from 'typedi';
import proxyquireModule from 'proxyquire';
const proxyquire = proxyquireModule.noPreserveCache();

import { mockLog } from '../../../../mocks';
import { AuthLogger, AppConfig } from '../../../../../lib/types';
import { AppStoreServerAPI } from 'app-store-server-api';

const mockAppStoreServerAPI = sinon.createStubInstance(AppStoreServerAPI);
const { AppStoreHelper } = proxyquire(
  '../../../../../lib/payments/iap/apple-app-store/app-store-helper',
  {
    'fxa-shared/payments/iap/apple-app-store/app-store-helper': proxyquire(
      'fxa-shared/payments/iap/apple-app-store/app-store-helper',
      {
        'app-store-server-api': {
          AppStoreServerAPI: function () {
            return mockAppStoreServerAPI;
          },
        },
      }
    ),
  }
);

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
  let appStoreHelper;
  let sandbox;
  let log;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    log = mockLog();
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    appStoreHelper = Container.get(AppStoreHelper);
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
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
    assert.strictEqual(appStoreHelper.log, log);
    assert.deepEqual(
      appStoreHelper.appStoreServerApiClients,
      appStoreServerApiClients
    );
    assert.deepEqual(
      appStoreHelper.credentialsByBundleId,
      credentialsByBundleId
    );
    assert.strictEqual(appStoreHelper.environment, 'Sandbox');
  });

  describe('clientByBundleId', () => {
    let mockApiClient;

    beforeEach(() => {
      mockApiClient = {};
    });

    it('returns the existing API client for the bundleId', () => {
      appStoreHelper.appStoreServerApiClients[mockBundleId] = mockApiClient;
      const actual = appStoreHelper.clientByBundleId(mockBundleId);
      const expected = mockApiClient;
      assert.deepEqual(actual, expected);
    });
    it("initializes an API client for a given bundleId if it doesn't exist", () => {
      appStoreHelper.appStoreServerApiClients = {};
      const actual = appStoreHelper.clientByBundleId(mockBundleId);
      const expected = mockAppStoreServerAPI;
      assert.deepEqual(actual, expected);
    });
    it('throws an error if no credentials are found for the given bundleId', () => {
      appStoreHelper.appStoreServerApiClients = {};
      appStoreHelper.credentialsByBundleId = {};
      const expectedMessage = `No App Store credentials found for app with bundleId: ${mockBundleId}.`;
      try {
        appStoreHelper.clientByBundleId(mockBundleId);
        assert.fail('should throw an error');
      } catch (err) {
        assert.equal(expectedMessage, err.message);
      }
    });
  });

  describe('getSubscriptionStatuses', async () => {
    it('calls the corresponding method on the API client', async () => {
      const mockOriginalTransactionId = '100000000';
      // Mock App Store Client API response
      const expected = { data: 'wow' };
      mockAppStoreServerAPI.getSubscriptionStatuses = sinon
        .stub()
        .resolves(expected);
      appStoreHelper.clientByBundleId = sandbox
        .stub()
        .returns(mockAppStoreServerAPI);
      const actual = await appStoreHelper.getSubscriptionStatuses(
        mockBundleId,
        mockOriginalTransactionId
      );
      assert.deepEqual(actual, expected);

      sinon.assert.calledOnceWithExactly(
        appStoreHelper.clientByBundleId,
        mockBundleId
      );
      sinon.assert.calledOnceWithExactly(
        mockAppStoreServerAPI.getSubscriptionStatuses,
        mockOriginalTransactionId
      );
    });
  });
});
