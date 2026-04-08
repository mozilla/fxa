/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const { default: Container } = require('typedi');
const cloneDeep = require('lodash/cloneDeep');
const retry = require('async-retry');
const { deleteCollection } = require('../../../local/payments/util');
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
const { AppError: errors } = require('@fxa/accounts/errors');
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
        cdnUrlRegex: ['^https://'],
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

jest.setTimeout(60000);

const noopLogger = {
  error: () => {},
  info: () => {},
  debug: () => {},
  warn: () => {},
};

describe('#integration - PaymentConfigManager', () => {
  let paymentConfigManager: any;
  let testProductId: string;
  let testPlanId: string;
  let testPlanConfig: any;
  let productConfigDbRef: any;
  let planConfigDbRef: any;
  let mergedConfig: any;

  beforeEach(async () => {
    testProductId = randomUUID();
    testPlanId = randomUUID();
    const firestore = setupFirestore(mockConfig);
    Container.set(AuthFirestore, firestore);
    Container.set(AuthLogger, noopLogger);
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
        expect(await paymentConfigManager.allProducts()).toHaveLength(1);
        expect(await paymentConfigManager.allPlans()).toHaveLength(1);
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

  describe('load', () => {
    it('loads products and plans and returns them', async () => {
      const products = await paymentConfigManager.allProducts();
      const plans = await paymentConfigManager.allPlans();
      expect(products).toHaveLength(1);
      expect(plans).toHaveLength(1);
    });
  });

  describe('listeners', () => {
    it('starts and stops', async () => {
      // Should start/stop without error — if it throws, the test fails
      await paymentConfigManager.startListeners();
      await paymentConfigManager.stopListeners();
    });

    it.skip('registers new/updates plans and products (Fix required as of 2024/02/12 (see FXA-9111))', async () => {
      const newProduct: any = cloneDeep(productConfig);
      newProduct.id = randomUUID();
      const newPlan: any = cloneDeep(planConfig);
      newPlan.id = randomUUID();
      newPlan.productId = newProduct.id;

      await paymentConfigManager.startListeners();
      let products = await paymentConfigManager.allProducts();
      let plans = await paymentConfigManager.allPlans();
      expect(products).toHaveLength(1);
      expect(plans).toHaveLength(1);

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

          expect(products).toHaveLength(2);
          expect(plans).toHaveLength(2);
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
      expect(actual).toEqual(testProductId);
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
      expect(actual).toEqual(testPlanId);
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
      expect(actual).toBeNull();
    });
  });

  describe('validateProductConfig', () => {
    it('validates a product config', async () => {
      const newProduct = cloneDeep(productConfig);
      const spy = sandbox.spy(ProductConfig, 'validate');

      await paymentConfigManager.validateProductConfig(newProduct);

      expect(spy.calledOnce).toBe(true);
    });

    it('throws error on invalid product config', async () => {
      const newProduct = cloneDeep(productConfig);
      delete newProduct.urls;

      try {
        await paymentConfigManager.validateProductConfig(newProduct);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('validatePlanConfig', () => {
    it('validates a plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      const spy = sandbox.spy(PlanConfig, 'validate');

      await paymentConfigManager.validatePlanConfig(newPlan, product.id);

      expect(spy.calledOnce).toBe(true);
    });

    it('throws error on invalid plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      delete newPlan.active;

      try {
        await paymentConfigManager.validatePlanConfig(newPlan, randomUUID());
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('throws error if the plan has an invalid product id', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      delete newPlan.active;

      try {
        await paymentConfigManager.validatePlanConfig(newPlan, product.id);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('storeProductConfig', () => {
    it('stores a product config', async () => {
      const newProduct = cloneDeep(productConfig);
      expect(await paymentConfigManager.allProducts()).toHaveLength(1);
      await paymentConfigManager.storeProductConfig(newProduct, randomUUID());
      expect(await paymentConfigManager.allProducts()).toHaveLength(2);
    });

    it('throws if the product is invalid', async () => {
      const newProduct = cloneDeep(productConfig);
      delete newProduct.urls;
      expect(await paymentConfigManager.allProducts()).toHaveLength(1);
      try {
        await paymentConfigManager.storeProductConfig(newProduct, randomUUID());
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('storePlanConfig', () => {
    it('stores a plan config', async () => {
      const newPlan = cloneDeep(planConfig);
      const product = (await paymentConfigManager.allProducts())[0];
      expect(await paymentConfigManager.allPlans()).toHaveLength(1);
      await paymentConfigManager.storePlanConfig(newPlan, product.id);
      expect(await paymentConfigManager.allPlans()).toHaveLength(2);
    });

    it('throws if the plan has an invalid product id', async () => {
      const newPlan = cloneDeep(planConfig);
      expect(await paymentConfigManager.allPlans()).toHaveLength(1);
      try {
        await paymentConfigManager.storePlanConfig(newPlan, randomUUID());
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.jse_cause.message).toBe('ProductConfig does not exist');
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });

    it('throws if the plan is invalid', async () => {
      const newPlan = cloneDeep(planConfig);
      delete newPlan.active;
      expect(await paymentConfigManager.allPlans()).toHaveLength(1);
      try {
        await paymentConfigManager.storePlanConfig(newPlan, randomUUID());
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.jse_cause.message).toBe('"active" is required');
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('getMergedConfig', () => {
    it('returns a merged config', async () => {
      const plan = (await paymentConfigManager.allPlans())[0];
      const actual = paymentConfigManager.getMergedConfig(plan);
      expect(actual).toEqual(mergedConfig);
    });

    it('throws an error when the product config is not found', async () => {
      const plan = (await paymentConfigManager.allPlans())[0];
      plan.productConfigId = '404';

      try {
        paymentConfigManager.getMergedConfig(plan);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.jse_cause.message).toBe('ProductConfig does not exist');
        expect(err.errno).toBe(errors.ERRNO.INTERNAL_VALIDATION_ERROR);
      }
    });
  });

  describe('getMergedPlanConfiguration', () => {
    it('returns undefined when the plan is not found', async () => {
      const actual =
        await paymentConfigManager.getMergedPlanConfiguration('404');
      expect(actual).toBeUndefined();
    });

    it('returns a merged config from getMergedConfig', async () => {
      const actual = await paymentConfigManager.getMergedPlanConfiguration(
        testPlanConfig.stripePriceId
      );
      expect(actual).toEqual(mergedConfig);
    });
  });
});
