/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
require('joi/lib/errors');

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');
const { cloneDeep } = require('lodash');
const retry = require('async-retry');
const { deleteCollection } = require('../util');

const {
  AuthFirestore,
  AuthLogger,
  AppConfig,
} = require('../../../../lib/types');
const {
  PaymentConfigManager,
} = require('../../../../lib/payments/configuration/manager');
const { setupFirestore } = require('../../../../lib/firestore-db');
const { randomUUID } = require('crypto');
const errors = require('../../../../lib/error');

const sandbox = sinon.createSandbox();

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
  stripeProductId: 'mock-stripe-product-id',
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
    await planConfigDbRef
      .doc(testPlanId)
      .set({ ...planConfig, productId: 'test-product' });
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
      await paymentConfigManager.load();
      const products = paymentConfigManager.allProducts();
      const plans = paymentConfigManager.allPlans();
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
      await paymentConfigManager.load();

      await paymentConfigManager.startListeners();
      let products = paymentConfigManager.allProducts();
      let plans = paymentConfigManager.allPlans();
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
          products = paymentConfigManager.allProducts();
          plans = paymentConfigManager.allPlans();

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
      paymentConfigManager.allProducts = sandbox.stub().returns([
        {
          ...productConfig,
          id: testProductId,
        },
      ]);
      const actual = paymentConfigManager.getDocumentIdByStripeId(
        productConfig.stripeProductId
      );
      const expected = testProductId;
      assert.deepEqual(actual, expected);
    });
    it('returns a matching plan document id if found', async () => {
      paymentConfigManager.allPlans = sandbox.stub().returns([
        {
          ...planConfig,
          id: testPlanId,
        },
      ]);
      const actual = paymentConfigManager.getDocumentIdByStripeId(
        planConfig.stripePriceId
      );
      const expected = testPlanId;
      assert.deepEqual(actual, expected);
    });
    it('returns null if neither is found', async () => {
      paymentConfigManager.allProducts = sandbox.stub().returns([
        {
          ...productConfig,
          id: testProductId,
        },
      ]);
      paymentConfigManager.allPlans = sandbox.stub().returns([
        {
          ...planConfig,
          id: testPlanId,
        },
      ]);
      const actual = paymentConfigManager.getDocumentIdByStripeId(
        'random-nonmatching-id'
      );
      assert.isNull(actual);
    });
  });

  describe('storeProductConfig', () => {
    it('stores a product config', async () => {
      const newProduct = cloneDeep(productConfig);
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allProducts().length, 1);
      await paymentConfigManager.storeProductConfig(newProduct, randomUUID());
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allProducts().length, 2);
    });

    it('throw if the product is invalid', async () => {
      const newProduct = cloneDeep(productConfig);
      newProduct.id = 'noidallowedhere';
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allProducts().length, 1);
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
      await paymentConfigManager.load();
      const product = paymentConfigManager.allProducts()[0];
      assert.equal(paymentConfigManager.allPlans().length, 1);
      await paymentConfigManager.storePlanConfig(newPlan, product.id);
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allPlans().length, 2);
    });

    it('throws if the plan has an invalid product id', async () => {
      const newPlan = cloneDeep(planConfig);
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allPlans().length, 1);
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
      newPlan.id = 'noidallowedhere';
      await paymentConfigManager.load();
      assert.equal(paymentConfigManager.allPlans().length, 1);
      try {
        await paymentConfigManager.storePlanConfig(newPlan, randomUUID());
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.jse_cause.message, '"id" is not allowed');
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });
});
