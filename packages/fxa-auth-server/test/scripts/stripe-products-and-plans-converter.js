/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const { deleteCollection } = require('../local/payments/util');
const { AuthFirestore, AuthLogger, AppConfig } = require('../../lib/types');
const { setupFirestore } = require('../../lib/firestore-db');
const { deepCopy } = require('../local/payments/util');
const plan = require('fxa-auth-server/test/local/payments/fixtures/stripe/plan2.json');
const product = require('fxa-shared/test/fixtures/stripe/product1.json');
const { mockLog, mockStripeHelper } = require('../mocks');
const {
  StripeProductsAndPlansConverter,
} = require('../../scripts/stripe-products-and-plans-to-firestore-documents/stripe-products-and-plans-converter');
const {
  PaymentConfigManager,
} = require('../../lib/payments/configuration/manager');
const { Container } = require('typedi');
const {
  ProductConfig,
} = require('fxa-shared/subscriptions/configuration/product');
const { PlanConfig } = require('fxa-shared/subscriptions/configuration/plan');

const sandbox = sinon.createSandbox();

const mockPaymentConfigManager = {
  startListeners: sandbox.stub(),
};
const mockSupportedLanguages = ['es-ES', 'fr'];

describe('StripeProductsAndPlansConverter', () => {
  let converter;

  beforeEach(() => {
    mockLog.error = sandbox.fake.returns({});
    mockLog.info = sandbox.fake.returns({});
    mockLog.debug = sandbox.fake.returns({});
    Container.set(PaymentConfigManager, mockPaymentConfigManager);
    converter = new StripeProductsAndPlansConverter({
      log: mockLog,
      stripeHelper: mockStripeHelper,
      supportedLanguages: mockSupportedLanguages,
    });
  });

  afterEach(() => {
    sandbox.reset();
    Container.reset();
  });

  describe('constructor', () => {
    it('sets the logger, Stripe helper, supported languages and payment config manager', () => {
      assert.strictEqual(converter.log, mockLog);
      assert.strictEqual(converter.stripeHelper, mockStripeHelper);
      assert.deepEqual(
        converter.supportedLanguages,
        mockSupportedLanguages.map((l) => l.toLowerCase())
      );
      assert.strictEqual(
        converter.paymentConfigManager,
        mockPaymentConfigManager
      );
    });
  });

  describe('getArrayOfStringsFromMetadataKeys', () => {
    it('transforms the data', () => {
      const metadata = {
        ...deepCopy(product.metadata),
        'product:details:1': 'wow',
        'product:details:2': 'strong',
        'product:details:3': 'recommend',
      };
      const metadataPrefix = 'product:details';
      const expected = ['wow', 'strong', 'recommend'];
      const result = converter.getArrayOfStringsFromMetadataKeys(
        metadata,
        metadataPrefix
      );
      assert.deepEqual(result, expected);
    });
  });

  describe('capabilitiesMetadataToCapabilityConfig', () => {
    it('transforms the data', () => {
      const testProduct = {
        ...deepCopy(product),
      };
      const expected = {
        '*': ['testForAllClients', 'foo'],
        dcdb5ae7add825d2: ['123donePro', 'gogogo'],
      };
      const result =
        converter.capabilitiesMetadataToCapabilityConfig(testProduct);
      assert.deepEqual(expected, result);
    });
  });

  describe('stylesMetadataToStyleConfig', () => {
    it('transforms the data', () => {
      const testProduct = {
        ...deepCopy(product),
      };
      const expected = {
        webIconBackground: 'lime',
      };
      const result = converter.stylesMetadataToStyleConfig(testProduct);
      assert.deepEqual(expected, result);
    });
  });

  describe('supportMetadataToSupportConfig', () => {
    it('transforms the data', () => {
      const testProduct = {
        ...deepCopy(product),
        metadata: {
          'support:app:{any}': 'linux',
          'support:app:{thing}': 'windows',
          'support:app:{goes}': 'macos',
        },
      };
      const expected = {
        app: ['linux', 'windows', 'macos'],
      };
      const result = converter.supportMetadataToSupportConfig(testProduct);
      assert.deepEqual(expected, result);
    });
  });

  describe('uiContentMetadataToUiContentConfig', () => {
    it('transforms the data', () => {
      const testProduct = {
        ...deepCopy(product),
        metadata: {
          subtitle: 'Wow best product now',
          upgradeCTA: 'hello <a href="http://example.org">world</a>',
          successActionButtonLabel: 'Click here',
          'product:details:1': 'So many benefits',
          'product:details:2': 'Too many to describe',
        },
      };
      const expected = {
        subtitle: 'Wow best product now',
        upgradeCTA: 'hello <a href="http://example.org">world</a>',
        successActionButtonLabel: 'Click here',
        details: ['So many benefits', 'Too many to describe'],
      };
      const result = converter.uiContentMetadataToUiContentConfig(testProduct);
      assert.deepEqual(expected, result);
    });
  });

  describe('urlMetadataToUrlConfig', () => {
    it('transforms the data', () => {
      const testProduct = {
        ...deepCopy(product),
        metadata: {
          ...deepCopy(product.metadata),
          appStoreLink: 'https://www.appstore.com',
          'product:privacyNoticeURL': 'https://www.privacy.wow',
        },
      };
      const expected = {
        download: 'http://127.0.0.1:8080/',
        webIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        emailIcon:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        appStore: 'https://www.appstore.com',
        privacyNotice: 'https://www.privacy.wow',
      };
      const result = converter.urlMetadataToUrlConfig(testProduct);
      assert.deepEqual(expected, result);
    });
  });

  describe('stripeProductToProductConfig', async () => {
    it('returns a valid productConfig', async () => {
      const testProduct = {
        ...deepCopy(product),
        metadata: {
          ...deepCopy(product.metadata),
          'product:privacyNoticeURL': 'http://127.0.0.1:8080/',
          'product:termsOfServiceURL': 'http://127.0.0.1:8080/',
          'product:termsOfServiceDownloadURL': 'http://127.0.0.1:8080/',
        },
        id: 'prod_123',
      };
      const expectedProductConfig = {
        active: true,
        stripeProductId: testProduct.id,
        capabilities: {
          '*': ['testForAllClients', 'foo'],
          dcdb5ae7add825d2: ['123donePro', 'gogogo'],
        },
        locales: {},
        productSet: '123done',
        styles: {
          webIconBackground: 'lime',
        },
        support: {},
        uiContent: {},
        urls: {
          download: 'http://127.0.0.1:8080/',
          privacyNotice: 'http://127.0.0.1:8080/',
          termsOfService: 'http://127.0.0.1:8080/',
          termsOfServiceDownload: 'http://127.0.0.1:8080/',
          webIcon:
            'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
          emailIcon:
            'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        },
      };
      const actualProductConfig =
        converter.stripeProductToProductConfig(testProduct);
      assert.deepEqual(expectedProductConfig, actualProductConfig);
      const { error } = await ProductConfig.validate(actualProductConfig);
      assert.isUndefined(error);
    });
  });

  describe('stripePlanToPlanConfig', async () => {
    it('returns a valid planConfig', async () => {
      const testPlan = deepCopy({
        ...plan,
        metadata: {
          'capabilities:aFakeClientId12345': 'more, comma, separated,  values',
          upgradeCTA: 'hello <a href="http://example.org">world</a>',
          productOrder: '2',
          downloadURL: 'https://example.com/download',
        },
        id: 'plan_123',
      });
      const expectedPlanConfig = {
        active: true,
        stripePriceId: testPlan.id,
        capabilities: {
          aFakeClientId12345: ['more', 'comma', 'separated', 'values'],
        },
        uiContent: {
          upgradeCTA: 'hello <a href="http://example.org">world</a>',
        },
        urls: {
          download: 'https://example.com/download',
        },
        productOrder: 2,
      };
      const actualPlanConfig = converter.stripePlanToPlanConfig(testPlan);
      assert.deepEqual(expectedPlanConfig, actualPlanConfig);
      const { error } = await PlanConfig.validate(actualPlanConfig);
      assert.isUndefined(error);
    });
  });

  describe('findLocaleStringFromStripePlan', () => {
    it('returns a locale from the plan nickname if valid', () => {
      const planWithLocalizedData = {
        ...deepCopy(plan),
        nickname: '123Done Pro Monthly es-ES',
        metadata: {
          'product:details:1': 'Producto nuevo',
        },
      };
      const expected = 'es-ES';
      const actual = converter.findLocaleStringFromStripePlan(
        planWithLocalizedData
      );
      assert.equal(expected, actual);
    });
    it('returns null if no valid locale is found', () => {
      const planWithLocalizedData = {
        ...deepCopy(plan),
        nickname: '123Done Pro Monthly',
        metadata: {
          'product:details:1': 'Producto nuevo',
        },
      };
      const actual = converter.findLocaleStringFromStripePlan(
        planWithLocalizedData
      );
      assert.isNull(actual);
    });
  });

  describe('stripePlanLocalesToProductConfigLocales', () => {
    it('returns a ProductConfig.locales object if a locale is found', () => {
      const planWithLocalizedData = {
        ...deepCopy(plan),
        nickname: '123Done Pro Monthly es-ES',
        metadata: {
          'product:details:1': 'Producto nuevo',
          'product:details:2': 'Mas mejor que el otro',
        },
      };
      const expected = {
        'es-ES': {
          uiContent: {
            details: ['Producto nuevo', 'Mas mejor que el otro'],
          },
          urls: {},
          support: {},
        },
      };
      const actual = converter.stripePlanLocalesToProductConfigLocales(
        planWithLocalizedData
      );
      assert.deepEqual(expected, actual);
    });
    it('returns {} if no locale is found', () => {
      const planWithLocalizedData = {
        ...deepCopy(plan),
        nickname: '123Done Pro Monthly',
        metadata: {
          'product:details:1': 'Producto nuevo',
          'product:details:2': 'Mas mejor que el otro',
        },
      };
      const expected = {};
      const actual = converter.stripePlanLocalesToProductConfigLocales(
        planWithLocalizedData
      );
      assert.deepEqual(expected, actual);
    });
  });

  describe('convert', async () => {
    let converter;
    let paymentConfigManager;
    let productConfigDbRef;
    let planConfigDbRef;
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
    let products;
    let plans;
    let args;
    const product1 = {
      ...deepCopy(product),
      metadata: {
        ...deepCopy(product.metadata),
        'product:privacyNoticeURL': 'http://127.0.0.1:8080/',
        'product:termsOfServiceURL': 'http://127.0.0.1:8080/',
        'product:termsOfServiceDownloadURL': 'http://127.0.0.1:8080/',
      },
      id: 'prod_123',
    };
    const productConfig1 = {
      active: true,
      stripeProductId: product1.id,
      capabilities: {
        '*': ['testForAllClients', 'foo'],
        dcdb5ae7add825d2: ['123donePro', 'gogogo'],
      },
      locales: {},
      productSet: '123done',
      styles: {
        webIconBackground: 'lime',
      },
      support: {},
      uiContent: {},
      urls: {
        download: 'http://127.0.0.1:8080/',
        privacyNotice: 'http://127.0.0.1:8080/',
        termsOfService: 'http://127.0.0.1:8080/',
        termsOfServiceDownload: 'http://127.0.0.1:8080/',
        webIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        emailIcon:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
      },
    };
    const product2 = deepCopy({ ...product1, id: 'prod_456' });
    const productConfig2 = deepCopy({
      ...productConfig1,
      stripeProductId: product2.id,
    });
    const plan1 = deepCopy({
      ...plan,
      metadata: {
        'capabilities:aFakeClientId12345': 'more, comma, separated,  values',
        upgradeCTA: 'hello <a href="http://example.org">world</a>',
        productOrder: '2',
        downloadURL: 'https://example.com/download',
      },
      id: 'plan_123',
    });
    const planConfig1 = {
      active: true,
      stripePriceId: plan1.id,
      capabilities: {
        aFakeClientId12345: ['more', 'comma', 'separated', 'values'],
      },
      uiContent: {
        upgradeCTA: 'hello <a href="http://example.org">world</a>',
      },
      urls: {
        download: 'https://example.com/download',
      },
      productOrder: 2,
    };
    const plan2 = deepCopy({ ...plan1, id: 'plan_456' });
    const planConfig2 = { ...deepCopy(planConfig1), stripePriceId: plan2.id };
    const plan3 = deepCopy({ ...deepCopy(plan1), id: 'plan_789' });
    const planConfig3 = { ...deepCopy(planConfig1), stripePriceId: plan3.id };
    beforeEach(() => {
      const firestore = setupFirestore(mockConfig);
      Container.set(AuthFirestore, firestore);
      Container.set(AuthLogger, {});
      Container.set(AppConfig, mockConfig);
      paymentConfigManager = new PaymentConfigManager();
      Container.set(PaymentConfigManager, paymentConfigManager);
      productConfigDbRef = paymentConfigManager.productConfigDbRef;
      planConfigDbRef = paymentConfigManager.planConfigDbRef;
      converter = new StripeProductsAndPlansConverter({
        log: mockLog,
        stripeHelper: mockStripeHelper,
        supportedLanguages: mockSupportedLanguages,
      });
      args = {
        productId: '',
        isDryRun: false,
      };
      async function* productGenerator() {
        yield product1;
        yield product2;
      }
      async function* planGenerator1() {
        yield plan1;
        yield plan2;
      }
      async function* planGenerator2() {
        yield plan3;
      }
      converter.stripeHelper.stripe = {
        products: { list: sandbox.stub().returns(productGenerator()) },
        plans: {
          list: sandbox
            .stub()
            .onFirstCall()
            .returns(planGenerator1())
            .onSecondCall()
            .returns(planGenerator2()),
        },
      };
    });
    afterEach(async () => {
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
      Container.reset();
      sandbox.reset();
    });

    it('processes new products and plans', async () => {
      await converter.convert(args);
      products = await paymentConfigManager.allProducts();
      plans = await paymentConfigManager.allPlans();
      // We don't care what the values of the Firestore doc IDs as long
      // as they match the expected productConfigId for planConfigs.
      assert.deepEqual(products[0], {
        ...productConfig1,
        id: products[0].id,
      });
      assert.deepEqual(products[1], {
        ...productConfig2,
        id: products[1].id,
      });
      assert.deepEqual(plans[0], {
        ...planConfig1,
        id: plans[0].id,
        productConfigId: products[0].id,
      });
      assert.deepEqual(plans[1], {
        ...planConfig2,
        id: plans[1].id,
        productConfigId: products[0].id,
      });
      assert.deepEqual(plans[2], {
        ...planConfig3,
        id: plans[2].id,
        productConfigId: products[1].id,
      });
    });

    it('updates existing products and plans', async () => {
      // Put some configs into Firestore
      const productConfigDocId1 = await paymentConfigManager.storeProductConfig(
        productConfig1
      );
      await paymentConfigManager.storePlanConfig(
        planConfig1,
        productConfigDocId1
      );
      products = await paymentConfigManager.allProducts();
      plans = await paymentConfigManager.allPlans();
      assert.deepEqual(products[0], {
        ...productConfig1,
        id: products[0].id,
      });
      assert.deepEqual(plans[0], {
        ...planConfig1,
        id: plans[0].id,
        productConfigId: products[0].id,
      });
      // Now update one product and one plan
      const updatedProduct = {
        ...deepCopy(product1),
        metadata: {
          ...product1.metadata,
          webIconBackground: 'pink',
        },
      };
      const updatedProductConfig = {
        ...deepCopy(productConfig1),
        styles: {
          webIconBackground: 'pink',
        },
      };
      const updatedPlan = {
        ...deepCopy(plan1),
        metadata: {
          ...deepCopy(plan1.metadata),
          'product:privacyNoticeURL': 'https://privacy.com',
        },
      };
      const updatedPlanConfig = {
        ...deepCopy(planConfig1),
        urls: {
          ...planConfig1.urls,
          privacyNotice: 'https://privacy.com',
        },
      };
      async function* productGeneratorUpdated() {
        yield updatedProduct;
      }
      async function* planGeneratorUpdated() {
        yield updatedPlan;
      }
      converter.stripeHelper.stripe = {
        products: { list: sandbox.stub().returns(productGeneratorUpdated()) },
        plans: { list: sandbox.stub().returns(planGeneratorUpdated()) },
      };
      await converter.convert(args);
      products = await paymentConfigManager.allProducts();
      plans = await paymentConfigManager.allPlans();
      assert.deepEqual(products[0], {
        ...updatedProductConfig,
        id: products[0].id,
      });
      assert.deepEqual(plans[0], {
        ...updatedPlanConfig,
        id: plans[0].id,
        productConfigId: products[0].id,
      });
    });

    it('processes only the product with productId when passed', async () => {
      await converter.convert({ ...args, productId: product1.id });
      sinon.assert.calledOnceWithExactly(
        converter.stripeHelper.stripe.products.list,
        { ids: [product1.id] }
      );
    });

    it('does not update Firestore if dryRun = true', async () => {
      paymentConfigManager.storeProductConfig = sandbox.stub();
      paymentConfigManager.storePlanConfig = sandbox.stub();
      const argsDryRun = { ...args, isDryRun: true };
      await converter.convert(argsDryRun);
      sinon.assert.notCalled(paymentConfigManager.storeProductConfig);
      sinon.assert.notCalled(paymentConfigManager.storePlanConfig);
    });

    it('moves localized data from plans into the productConfig', async () => {
      const productWithRequiredKeys = {
        ...deepCopy(product1),
        metadata: {
          ...deepCopy(product1.metadata),
          'product:privacyNoticeURL': 'http://127.0.0.1:8080/',
          'product:termsOfServiceURL': 'http://127.0.0.1:8080/',
          'product:termsOfServiceDownloadURL': 'http://127.0.0.1:8080/',
        },
      };
      const planWithLocalizedData1 = {
        ...deepCopy(plan1),
        nickname: '123Done Pro Monthly es-ES',
        metadata: {
          'product:details:1': 'Producto nuevo',
        },
      };
      const planWithLocalizedData2 = {
        ...deepCopy(plan2),
        nickname: '123Done Pro Monthly fr',
        metadata: {
          'product:details:1': 'En euf',
        },
      };
      async function* productGenerator() {
        yield productWithRequiredKeys;
      }
      async function* planGenerator() {
        yield planWithLocalizedData1;
        yield planWithLocalizedData2;
      }
      converter.stripeHelper.stripe = {
        products: { list: sandbox.stub().returns(productGenerator()) },
        plans: {
          list: sandbox.stub().returns(planGenerator()),
        },
      };
      await converter.convert(args);
      products = await paymentConfigManager.allProducts();
      plans = await paymentConfigManager.allPlans();
      const expected = {
        'es-ES': {
          uiContent: {
            details: [planWithLocalizedData1.metadata['product:details:1']],
          },
          urls: {},
          support: {},
        },
        fr: {
          uiContent: {
            details: [planWithLocalizedData2.metadata['product:details:1']],
          },
          urls: {},
          support: {},
        },
      };
      assert.deepEqual(products[0].locales, expected);
    });

    it('logs an error and keeps processing if a product fails', async () => {
      const productConfigId = 'test-product-id';
      const planConfigId = 'test-plan-id';
      paymentConfigManager.storeProductConfig = sandbox
        .stub()
        .resolves(productConfigId);
      paymentConfigManager.storePlanConfig = sandbox
        .stub()
        .resolves(planConfigId);
      converter.stripeProductToProductConfig = sandbox
        .stub()
        .onFirstCall()
        .throws({ message: 'Something broke!' })
        .onSecondCall()
        .returns(productConfig2);
      async function* planGenerator() {
        yield plan2;
      }
      converter.stripeHelper.stripe = {
        ...converter.stripeHelper.stripe,
        plans: { list: sandbox.stub().returns(planGenerator()) },
      };

      await converter.convert(args);
      sinon.assert.calledWithExactly(
        paymentConfigManager.storeProductConfig.firstCall,
        productConfig2,
        null
      );
      sinon.assert.calledWithExactly(
        paymentConfigManager.storeProductConfig.secondCall,
        productConfig2,
        productConfigId
      );
      sinon.assert.calledOnceWithExactly(
        paymentConfigManager.storePlanConfig,
        planConfig2,
        productConfigId,
        null
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'StripeProductsAndPlansConverter.convertProductError',
        {
          error: 'Something broke!',
          stripeProductId: product1.id,
        }
      );
    });

    it('logs an error and keeps processing if a plan fails', async () => {
      const productConfigId = 'test-product-id';
      const planConfigId = 'test-plan-id';
      paymentConfigManager.storeProductConfig = sandbox
        .stub()
        .resolves(productConfigId);
      paymentConfigManager.storePlanConfig = sandbox
        .stub()
        .resolves(planConfigId);
      converter.stripePlanToPlanConfig = sandbox
        .stub()
        .onFirstCall()
        .throws({ message: 'Something else broke!' })
        .onSecondCall()
        .returns(planConfig2);
      async function* productGenerator() {
        yield product1;
      }
      async function* planGenerator() {
        yield plan1;
        yield plan2;
      }
      converter.stripeHelper.stripe = {
        products: { list: sandbox.stub().returns(productGenerator()) },
        plans: { list: sandbox.stub().returns(planGenerator()) },
      };

      await converter.convert(args);
      sinon.assert.calledWithExactly(
        paymentConfigManager.storeProductConfig.firstCall,
        productConfig1,
        null
      );
      sinon.assert.calledWithExactly(
        paymentConfigManager.storeProductConfig.secondCall,
        productConfig1,
        productConfigId
      );
      sinon.assert.calledWithExactly(
        paymentConfigManager.storePlanConfig.firstCall,
        planConfig2,
        productConfigId,
        null
      );
      sinon.assert.calledOnceWithExactly(
        mockLog.error,
        'StripeProductsAndPlansConverter.convertPlanError',
        {
          error: 'Something else broke!',
          stripePlanId: plan1.id,
          stripeProductId: product1.id,
        }
      );
    });
  });
});
