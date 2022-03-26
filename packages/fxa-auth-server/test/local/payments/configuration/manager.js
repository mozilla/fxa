/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');
const { cloneDeep } = require('lodash');
const retry = require('async-retry');
const { deleteCollection } = require('../util');

const sandbox = sinon.createSandbox();

const {
  AuthFirestore,
  AuthLogger,
  AppConfig,
} = require('../../../../lib/types');
const mergeConfigsStub = sandbox.stub();
const { PaymentConfigManager } = proxyquire(
  '../../../../lib/payments/configuration/manager',
  {
    'fxa-shared/subscriptions/configuration/utils': {
      mergeConfigs: mergeConfigsStub,
    },
  }
);
const { setupFirestore } = require('../../../../lib/firestore-db');
const { randomUUID } = require('crypto');
const errors = require('../../../../lib/error');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
  subscriptions: {
    playApiServiceAccount: {
      credentials: {
        clientEmail: 'mock-client-email',
      },
      keyFile: 'mock-private-keyfile',
    },
  },
};

const productConfig = {
  active: true,
  stripeProductId: 'test-product',
  capabilities: {
    '*': ['stuff'],
  },
  locales: {},
  styles: {
    webIconBackground: '#fff',
  },
  support: {},
  uiContent: {},
  urls: {
    download: 'https://download.com',
    privacyNotice: 'https://privacy.com',
    termsOfService: 'https://terms.com',
    termsOfServiceDownload: 'https://terms-download.com',
    webIcon: 'https://web-icon.com',
  },
};

const planConfig = {
  active: true,
  stripePriceId: 'mock-stripe-price-id',
  capabilities: {
    '*': ['stuff'],
  },
  locales: {},
  styles: {
    webIconBackground: '#fff',
  },
  support: {},
  uiContent: {},
};

describe('PaymentConfigManager', () => {
  let paymentConfigManager;
  let testProductId;
  let testPlanId;
  let productConfigDbRef;
  let planConfigDbRef;

  beforeEach(async () => {
    testProductId = randomUUID();
    testPlanId = randomUUID();
    const firestore = setupFirestore(mockConfig);
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, {});
    Container.set(AppConfig, mockConfig);
    paymentConfigManager = new PaymentConfigManager();
    productConfigDbRef = paymentConfigManager.productConfigDbRef;
    planConfigDbRef = paymentConfigManager.planConfigDbRef;
    await productConfigDbRef.doc(testProductId).set(productConfig);
    await planConfigDbRef.doc(testPlanId).set({
      ...planConfig,
      productId: 'test-product',
      productConfigId: testProductId,
    });
  });

  afterEach(async () => {
    const productConfigDbRef = paymentConfigManager.productConfigDbRef;
    const planConfigDbRef = paymentConfigManager.planConfigDbRef;
    await deleteCollection(
      paymentConfigManager.firestore,
      productConfigDbRef,
      100
    );
    await deleteCollection(
      paymentConfigManager.firestore,
      planConfigDbRef,
      100
    );
    sandbox.reset();
    Container.reset();
  });

  describe('load', async () => {
    it('loads products and plans and returns them', async () => {
      const products = await paymentConfigManager.allProducts();
      const plans = await paymentConfigManager.allPlans();
      assert.equal(products.length, 1);
      assert.equal(plans.length, 1);
    });
  });

  describe('listeners', () => {
    it('starts and stops', async () => {
      // Check that we can start/stop the payment manager without error
      try {
        await paymentConfigManager.startListeners();
        await paymentConfigManager.stopListeners();
      } catch (err) {
        assert.fail('Should stop/start without error.');
      }
    });

    it('registers new/updates plans and products', async () => {
      const newProduct = cloneDeep(productConfig);
      newProduct.id = randomUUID();
      const newPlan = cloneDeep(planConfig);
      newPlan.id = randomUUID();
      newPlan.productId = newProduct.id;

      await paymentConfigManager.startListeners();
      let products = await paymentConfigManager.allProducts();
      let plans = await paymentConfigManager.allPlans();
      assert.equal(products.length, 1);
      assert.equal(plans.length, 1);

      // Insert a new product/plan
      await productConfigDbRef.doc(newProduct.id).set(productConfig);
      await planConfigDbRef.doc(newPlan.id).set(newPlan);

      // Because this may take a variable amount of time and to avoid
      // test flakiness on different machines, we retry until we get the
      // expected number of products/plans within a reasonable time.
      await retry(
        async () => {
          products = await paymentConfigManager.allProducts();
          plans = await paymentConfigManager.allPlans();

          assert.equal(products.length, 2);
          assert.equal(plans.length, 2);
        },
        {
          retries: 10,
          minTimeout: 20,
        }
      );
      await paymentConfigManager.stopListeners();
    });
  });

  describe('getDocumentIdByStripeId', () => {
    it('returns a matching product document id if found', async () => {
      paymentConfigManager.allProducts = sandbox.stub().resolves([
        {
          ...productConfig,
          id: testProductId,
        },
      ]);
      const actual = await paymentConfigManager.getDocumentIdByStripeId(
        productConfig.stripeProductId
      );
      const expected = testProductId;
      assert.deepEqual(actual, expected);
    });
    it('returns a matching plan document id if found', async () => {
      paymentConfigManager.allPlans = sandbox.stub().resolves([
        {
          ...planConfig,
          id: testPlanId,
        },
      ]);
      const actual = await paymentConfigManager.getDocumentIdByStripeId(
        planConfig.stripePriceId
      );
      const expected = testPlanId;
      assert.deepEqual(actual, expected);
    });
    it('returns null if neither is found', async () => {
      paymentConfigManager.allProducts = sandbox.stub().resolves([
        {
          ...productConfig,
          id: testProductId,
        },
      ]);
      paymentConfigManager.allPlans = sandbox.stub().resolves([
        {
          ...planConfig,
          id: testPlanId,
        },
      ]);
      const actual = await paymentConfigManager.getDocumentIdByStripeId(
        'random-nonmatching-id'
      );
      assert.isNull(actual);
    });
  });

  describe('storeProductConfig', () => {
    it('stores a product config', async () => {
      const newProduct = cloneDeep(productConfig);
      assert.equal((await paymentConfigManager.allProducts()).length, 1);
      await paymentConfigManager.storeProductConfig(newProduct, randomUUID());
      assert.equal((await paymentConfigManager.allProducts()).length, 2);
    });

    it('throw if the product is invalid', async () => {
      const newProduct = cloneDeep(productConfig);
      delete newProduct.urls;
      assert.equal((await paymentConfigManager.allProducts()).length, 1);
      try {
        await paymentConfigManager.storeProductConfig(newProduct, randomUUID());
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('storePlanConfig', () => {
    it('stores a plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      assert.equal((await paymentConfigManager.allPlans()).length, 1);
      await paymentConfigManager.storePlanConfig(newPlan, product.id);
      assert.equal((await paymentConfigManager.allPlans()).length, 2);
    });

    it('throws if the plan has an invalid product id', async () => {
      const newPlan = cloneDeep(planConfig);
      assert.equal((await paymentConfigManager.allPlans()).length, 1);
      try {
        await paymentConfigManager.storePlanConfig(newPlan, randomUUID());
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.jse_cause.message, 'ProductConfig does not exist');
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('throws if the plan is invalid', async () => {
      const newPlan = cloneDeep(planConfig);
      delete newPlan.active;
      assert.equal((await paymentConfigManager.allPlans()).length, 1);
      try {
        await paymentConfigManager.storePlanConfig(newPlan, randomUUID());
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.jse_cause.message, '"active" is required');
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('getMergedConfig', () => {
    it('returns a merged config', async () => {
      const planConfig = (await paymentConfigManager.allPlans())[0];
      const productConfig = (await paymentConfigManager.allProducts())[0];
      paymentConfigManager.getMergedConfig(planConfig);
      sinon.assert.calledOnceWithExactly(
        mergeConfigsStub,
        planConfig,
        productConfig
      );
    });

    it('throws an error when the product config is not found', async () => {
      const planConfig = (await paymentConfigManager.allPlans())[0];
      planConfig.productConfigId = '404';

      try {
        paymentConfigManager.getMergedConfig(planConfig);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.jse_cause.message, 'ProductConfig does not exist');
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });
});
