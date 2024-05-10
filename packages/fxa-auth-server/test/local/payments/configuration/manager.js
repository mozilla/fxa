/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const { assert } = require('chai');
const { default: Container } = require('typedi');
const cloneDeep = require('lodash/cloneDeep');
const retry = require('async-retry');
const { deleteCollection } = require('../util');
const {
  mergeConfigs,
} = require('fxa-shared/subscriptions/configuration/utils');

const sandbox = sinon.createSandbox();

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
const {
  ProductConfig,
} = require('fxa-shared/subscriptions/configuration/product');
const { PlanConfig } = require('fxa-shared/subscriptions/configuration/plan');

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
    productConfigsFirestore: {
      schemaValidation: {
        cdnUrlRegex: '^https://',
      },
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
  productSet: ['foo'],
  styles: {
    webIconBackground: '#fff',
  },
  support: {},
  uiContent: {},
  urls: {
    successActionButton: 'https://download.com',
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
  productSet: ['foo'],
  styles: {
    webIconBackground: '#fff',
  },
  support: {},
  uiContent: {},
};

describe('#integration - PaymentConfigManager', () => {
  let paymentConfigManager;
  let testProductId;
  let testPlanId;
  let testPlanConfig;
  let productConfigDbRef;
  let planConfigDbRef;
  let mergedConfig;

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

    // Ensure the collections are clean in case anything else might
    // not have cleaned up properly. This helps reduce flaky tests.
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

    await productConfigDbRef.doc(testProductId).set(productConfig);
    testPlanConfig = {
      ...planConfig,
      id: testPlanId,
      productId: 'test-product',
      productConfigId: testProductId,
    };
    await planConfigDbRef.doc(testPlanId).set(testPlanConfig);

    // Ensure all the plans/products have loaded. Some delays may occur
    // due to triggering of the firestore listeners.
    await retry(
      async () => {
        await paymentConfigManager.maybeLoad();
        assert.lengthOf(await paymentConfigManager.allProducts(), 1);
        assert.lengthOf(await paymentConfigManager.allPlans(), 1);
      },
      {
        retries: 50,
        minTimeout: 10,
      }
    );
    mergedConfig = mergeConfigs(testPlanConfig, productConfig);
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

    it.skip('registers new/updates plans and products (Fix required as of 2024/02/12 (see FXA-9111))', async () => {
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

  describe('validateProductConfig', () => {
    it('validate a product config', async () => {
      const newProduct = cloneDeep(productConfig);
      const spy = sandbox.spy(ProductConfig, 'validate');

      await paymentConfigManager.validateProductConfig(newProduct);

      assert(spy.calledOnce);
    });

    it('throw error on invalid product config', async () => {
      const newProduct = cloneDeep(productConfig);
      delete newProduct.urls;

      try {
        await paymentConfigManager.validateProductConfig(newProduct);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('validatePlanConfig', () => {
    it('validate a plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      const spy = sandbox.spy(PlanConfig, 'validate');

      await paymentConfigManager.validatePlanConfig(newPlan, product.id);

      assert(spy.calledOnce);
    });

    it('throw error on invalid plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      delete newPlan.active;

      try {
        await paymentConfigManager.validatePlanConfig(newPlan, randomUUID());
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('throw error if the plan has an invalid product id', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      delete newPlan.active;

      try {
        await paymentConfigManager.validatePlanConfig(newPlan, product.id);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
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
      const actual = paymentConfigManager.getMergedConfig(planConfig);
      assert.deepEqual(actual, mergedConfig);
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

  describe('getMergedPlanConfiguration', () => {
    it('returns undefined when the plan is not found', async () => {
      const actual = await paymentConfigManager.getMergedPlanConfiguration(
        '404'
      );
      assert.isUndefined(actual);
    });

    it('returns a merge config from getMergedConfig', async () => {
      const actual = await paymentConfigManager.getMergedPlanConfiguration(
        testPlanConfig.stripePriceId
      );
      assert.deepEqual(actual, mergedConfig);
    });
  });
});
