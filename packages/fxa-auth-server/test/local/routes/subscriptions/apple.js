/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { default: Container } = require('typedi');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');

const mocks = require('../../../mocks');
const {
  AppleIapHandler,
} = require('../../../../lib/routes/subscriptions/apple');
const {
  PurchaseUpdateError,
} = require('../../../../lib/payments/iap/apple-app-store/types/errors');
const error = require('../../../../lib/error');
const { AuthLogger } = require('../../../../lib/types');
const {
  AppleIAP,
} = require('../../../../lib/payments/iap/apple-app-store/apple-iap');
const { IAPConfig } = require('../../../../lib/payments/iap/iap-config');
const { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } = require('fxa-shared/oauth/constants');
const { CapabilityService } = require('../../../../lib/payments/capability');

const MOCK_SCOPES = [OAUTH_SCOPE_SUBSCRIPTIONS_IAP];
const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const VALID_REQUEST = {
  auth: {
    credentials: {
      scope: MOCK_SCOPES,
      user: `uid1234`,
      email: `test@testing.com`,
    },
  },
};

describe('AppleIapHandler', () => {
  let iapConfig;
  let appleIap;
  let log;
  let appleIapHandler;
  let mockCapabilityService;
  let db;

  beforeEach(() => {
    log = mocks.mockLog();
    appleIap = {};
    Container.set(AuthLogger, log);
    iapConfig = {};
    Container.set(IAPConfig, iapConfig);
    Container.set(AppleIAP, appleIap);
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    db.account = sinon.fake.resolves({ primaryEmail: { email: TEST_EMAIL } });
    mockCapabilityService = {};
    mockCapabilityService.iapUpdate = sinon.fake.resolves({});
    Container.set(CapabilityService, mockCapabilityService);
    appleIapHandler = new AppleIapHandler(db);
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  describe('registerOriginalTransactionId', () => {
    const request = {
      ...VALID_REQUEST,
      params: { appName: 'test' },
      payload: { originalTransactionId: 'testTransactionId' },
    };

    it('returns valid with new products', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      const result = await appleIapHandler.registerOriginalTransactionId(
        request
      );
      assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
      assert.calledOnce(iapConfig.getBundleId);
      assert.calledOnce(mockCapabilityService.iapUpdate);
      assert.deepEqual(result, { transactionIdValid: true });
    });

    it('throws on invalid package', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.getBundleId = sinon.fake.resolves(undefined);
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.calledOnce(iapConfig.getBundleId);
        assert.strictEqual(err.errno, error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid transaction id', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID;

      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INVALID_TOKEN);
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INTERNAL_OTHER);
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });

    it('throws on unknown errors', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(new Error('Unknown error')),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });
  });
});
