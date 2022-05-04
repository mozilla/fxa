/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { Container } = require('typedi');

const { mockLog } = require('../../../mocks');
const {
  AuthFirestore,
  AuthLogger,
  AppConfig,
} = require('../../../../lib/types');
const {
  IAPConfig,
  getIapPurchaseType,
} = require('../../../../lib/payments/iap/iap-config');
const {
  PlayStoreSubscriptionPurchase,
} = require('../../../../lib/payments/iap/google-play/subscription-purchase');
const {
  AppStoreSubscriptionPurchase,
} = require('../../../../lib/payments/iap/apple-app-store/subscription-purchase');
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
};

describe('getIapPurchaseType', () => {
  let expected;
  let purchase;
  let actual;
  beforeEach(() => {
    purchase = {};
  });
  it('returns IAP_GOOGLE for a Play Store purchase', () => {
    purchase = new PlayStoreSubscriptionPurchase();
    purchase.purchaseToken = '123';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_GOOGLE;
    assert.equal(actual, expected);
  });
  it('returns IAP_APPLE for an App Store purchase', () => {
    purchase = new AppStoreSubscriptionPurchase();
    purchase.originalTransactionId = '1000000000000';
    actual = getIapPurchaseType(purchase);
    expected = MozillaSubscriptionTypes.IAP_APPLE;
    assert.equal(actual, expected);
  });
  it('throws an error if the purchase is neither Google nor Apple', () => {
    try {
      getIapPurchaseType(purchase);
      assert.fail();
    } catch (error) {
      assert.equal(
        error.message,
        'Purchase is not recognized as either Google or Apple IAP.'
      );
    }
  });
});

describe('IAPConfig', () => {
  let sandbox;
  let firestore;
  let log;
  let iapConfig;
  let planDbRefMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    planDbRefMock = {};
    const collectionMock = sinon.stub();
    collectionMock.returns(planDbRefMock);
    firestore = {
      collection: collectionMock,
    };
    log = mockLog();
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, log);
    Container.set(AppConfig, mockConfig);
    Container.remove(IAPConfig);
  });

  afterEach(() => {
    Container.reset();
    sandbox.restore();
  });

  it('can be instantiated', () => {
    const iapConfig = Container.get(IAPConfig);
    assert.strictEqual(iapConfig.log, log);
    assert.strictEqual(iapConfig.firestore, firestore);
    assert.strictEqual(iapConfig.prefix, 'mock-fxa-iap-');
  });

  describe('plans', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({ plans: 'testObject' }),
        }),
      });
      const result = await iapConfig.plans();
      assert.strictEqual(result, 'testObject');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.plans('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'IAP Plans document does not exist for testApp'
        );
      }
    });
  });

  describe('packageName', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({
            packageName: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await iapConfig.packageName('testApp');
      assert.strictEqual(result, 'org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.packageName('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'IAP Plans document does not exist for testApp'
        );
      }
    });
  });

  describe('getBundleId', () => {
    beforeEach(() => {
      // Create and set a new one per test
      iapConfig = new IAPConfig();
      Container.set(IAPConfig, iapConfig);
    });

    it('returns successfully', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: true,
          data: sinon.fake.returns({
            bundleId: 'org.mozilla.testApp',
            plans: 'testObject',
          }),
        }),
      });
      const result = await iapConfig.getBundleId('testApp');
      assert.strictEqual(result, 'org.mozilla.testApp');
    });

    it('throws error with no document found', async () => {
      planDbRefMock.doc = sinon.fake.returns({
        get: sinon.fake.resolves({
          exists: false,
        }),
      });
      try {
        await iapConfig.getBundleId('testApp');
        assert.fail('Expected exception thrown.');
      } catch (err) {
        assert.strictEqual(
          err.message,
          'IAP Plans document does not exist for testApp'
        );
      }
    });
  });
});
