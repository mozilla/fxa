/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import { Container } from 'typedi';
import { deleteCollection, deepCopy } from '../local/payments/util';
import { AuthFirestore, AuthLogger, AppConfig } from '../../lib/types';
import { setupFirestore } from '../../lib/firestore-db';
import { PaymentConfigManager } from '../../lib/payments/configuration/manager';

const plan = require('fxa-auth-server/test/local/payments/fixtures/stripe/plan2.json');
const product = require('fxa-shared/test/fixtures/stripe/product1.json');
const { mockLog, mockStripeHelper } = require('../mocks');

const PLAN_EN_LANG_ERROR = 'Plan specific en metadata';
const GOOGLE_ERROR_MESSAGE = 'Google Translate Error Overload';
const googleTranslateShapedError = {
  code: 403,
  message: GOOGLE_ERROR_MESSAGE,
  response: {
    request: {
      href: 'https://translation.googleapis.com/language/translate/v2/detect',
    },
  },
};

const langFromMetadataStub = jest.fn().mockImplementation((plan: any) => {
  if (plan.nickname.includes('es-ES')) {
    return 'es-ES';
  }
  if (plan.nickname.includes('fr')) {
    return 'fr';
  }
  if (plan.nickname === 'localised en plan') {
    throw new Error(PLAN_EN_LANG_ERROR);
  }
  if (plan.nickname === 'you cannot translate this') {
    throw googleTranslateShapedError;
  }
  return 'en';
});

jest.mock(
  '../../scripts/stripe-products-and-plans-to-firestore-documents/plan-language-tags-guesser',
  () => ({
    getLanguageTagFromPlanMetadata: langFromMetadataStub,
    PLAN_EN_LANG_ERROR: 'Plan specific en metadata',
  })
);

// Must import after jest.mock so the mock is in place
const {
  StripeProductsAndPlansConverter,
} = require('../../scripts/stripe-products-and-plans-to-firestore-documents/stripe-products-and-plans-converter');

const mockSupportedLanguages = ['es-ES', 'fr'];

describe('#integration - convert', () => {
  let converter: any;
  let paymentConfigManager: any;
  let productConfigDbRef: any;
  let planConfigDbRef: any;
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
          cdnUrlRegex: ['^http'],
        },
      },
    },
  };
  let products: any;
  let plans: any;
  let args: any;
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
    productSet: ['123done'],
    styles: {
      webIconBackground: 'lime',
    },
    support: {},
    uiContent: {},
    urls: {
      successActionButton: 'http://127.0.0.1:8080/',
      privacyNotice: 'http://127.0.0.1:8080/',
      termsOfService: 'http://127.0.0.1:8080/',
      termsOfServiceDownload: 'http://127.0.0.1:8080/',
      webIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
      emailIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
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
      productSet: 'foo',
      successActionButtonURL: 'https://example.com/download',
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
      successActionButton: 'https://example.com/download',
    },
    productOrder: 2,
    productSet: ['foo'],
  };
  const plan2 = deepCopy({ ...plan1, id: 'plan_456' });
  const planConfig2 = { ...deepCopy(planConfig1), stripePriceId: plan2.id };
  const plan3 = deepCopy({ ...deepCopy(plan1), id: 'plan_789' });
  const planConfig3 = { ...deepCopy(planConfig1), stripePriceId: plan3.id };
  const plan4 = deepCopy({
    ...plan1,
    id: 'plan_infinity',
    nickname: 'localised en plan',
  });
  const planConfig4 = {
    ...deepCopy(planConfig1),
    stripePriceId: plan4.id,
    locales: {
      en: {
        support: {},
        uiContent: {
          upgradeCTA: 'hello <a href="http://example.org">world</a>',
        },
        urls: {
          successActionButton: 'https://example.com/download',
        },
      },
    },
  };
  const plan5 = deepCopy({
    ...plan1,
    id: 'plan_googol',
    nickname: 'you cannot translate this',
  });

  beforeEach(() => {
    mockLog.error = jest.fn().mockReturnValue({});
    mockLog.info = jest.fn().mockReturnValue({});
    mockLog.debug = jest.fn().mockReturnValue({});
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
      target: 'firestore',
      targetDir: 'home/dir',
    };
    async function* productGenerator() {
      yield product1;
      yield product2;
    }
    async function* planGenerator1() {
      yield plan1;
      yield plan2;
      yield plan4;
    }
    async function* planGenerator2() {
      yield plan3;
    }
    converter.stripeHelper.stripe = {
      products: { list: jest.fn().mockReturnValue(productGenerator()) },
      plans: {
        list: jest
          .fn()
          .mockReturnValueOnce(planGenerator1())
          .mockReturnValueOnce(planGenerator2()),
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
    jest.clearAllMocks();
  });

  it('processes new products and plans', async () => {
    await converter.convert(args);
    products = await paymentConfigManager.allProducts();
    plans = await paymentConfigManager.allPlans();
    // We don't care what the values of the Firestore doc IDs as long
    // as they match the expected productConfigId for planConfigs.
    expect(products[0]).toEqual({
      ...productConfig1,
      id: products[0].id,
    });
    expect(products[1]).toEqual({
      ...productConfig2,
      id: products[1].id,
    });
    expect(plans[0]).toEqual({
      ...planConfig1,
      id: plans[0].id,
      productConfigId: products[0].id,
    });
    expect(plans[1]).toEqual({
      ...planConfig2,
      id: plans[1].id,
      productConfigId: products[0].id,
    });
    expect(plans[2]).toEqual({
      ...planConfig4,
      id: plans[2].id,
      productConfigId: products[0].id,
    });
    expect(plans[3]).toEqual({
      ...planConfig3,
      id: plans[3].id,
      productConfigId: products[1].id,
    });
  });

  it('updates existing products and plans', async () => {
    // Put some configs into Firestore
    const productConfigDocId1 =
      await paymentConfigManager.storeProductConfig(productConfig1);
    await paymentConfigManager.storePlanConfig(
      planConfig1,
      productConfigDocId1
    );
    products = await paymentConfigManager.allProducts();
    plans = await paymentConfigManager.allPlans();
    expect(products[0]).toEqual({
      ...productConfig1,
      id: products[0].id,
    });
    expect(plans[0]).toEqual({
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
      products: { list: jest.fn().mockReturnValue(productGeneratorUpdated()) },
      plans: { list: jest.fn().mockReturnValue(planGeneratorUpdated()) },
    };
    await converter.convert(args);
    products = await paymentConfigManager.allProducts();
    plans = await paymentConfigManager.allPlans();
    expect(products[0]).toEqual({
      ...updatedProductConfig,
      id: products[0].id,
    });
    expect(plans[0]).toEqual({
      ...updatedPlanConfig,
      id: plans[0].id,
      productConfigId: products[0].id,
    });
  });

  it('processes only the product with productId when passed', async () => {
    await converter.convert({ ...args, productId: product1.id });
    expect(converter.stripeHelper.stripe.products.list).toHaveBeenCalledTimes(
      1
    );
    expect(converter.stripeHelper.stripe.products.list).toHaveBeenCalledWith({
      ids: [product1.id],
    });
  });

  it('processes successfully and writes to file', async () => {
    const stubFsAccess = jest.spyOn(fs.promises, 'access').mockResolvedValue();
    paymentConfigManager.storeProductConfig = jest.fn();
    paymentConfigManager.storePlanConfig = jest.fn();
    converter.writeToFileProductConfig = jest.fn().mockResolvedValue();
    converter.writeToFilePlanConfig = jest.fn().mockResolvedValue();

    const argsLocal = { ...args, target: 'local' };
    await converter.convert(argsLocal);

    expect(stubFsAccess).toHaveBeenCalled();
    expect(converter.writeToFileProductConfig).toHaveBeenCalled();
    expect(converter.writeToFilePlanConfig).toHaveBeenCalled();
    expect(paymentConfigManager.storeProductConfig).not.toHaveBeenCalled();
    expect(paymentConfigManager.storePlanConfig).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  it('does not update Firestore if dryRun = true', async () => {
    paymentConfigManager.storeProductConfig = jest.fn();
    paymentConfigManager.storePlanConfig = jest.fn();
    converter.writeToFileProductConfig = jest.fn();
    converter.writeToFilePlanConfig = jest.fn();
    const argsDryRun = { ...args, isDryRun: true };
    await converter.convert(argsDryRun);
    expect(paymentConfigManager.storeProductConfig).not.toHaveBeenCalled();
    expect(paymentConfigManager.storePlanConfig).not.toHaveBeenCalled();
    expect(converter.writeToFileProductConfig).not.toHaveBeenCalled();
    expect(converter.writeToFilePlanConfig).not.toHaveBeenCalled();
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
      products: { list: jest.fn().mockReturnValue(productGenerator()) },
      plans: {
        list: jest.fn().mockReturnValue(planGenerator()),
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
    expect(products[0].locales).toEqual(expected);
  });

  it('logs an error and keeps processing if a product fails', async () => {
    const productConfigId = 'test-product-id';
    const planConfigId = 'test-plan-id';
    paymentConfigManager.storeProductConfig = jest
      .fn()
      .mockResolvedValue(productConfigId);
    paymentConfigManager.storePlanConfig = jest
      .fn()
      .mockResolvedValue(planConfigId);
    converter.stripeProductToProductConfig = jest
      .fn()
      .mockImplementationOnce(() => {
        throw { message: 'Something broke!' };
      })
      .mockReturnValueOnce(productConfig2);
    async function* planGenerator() {
      yield plan2;
    }
    converter.stripeHelper.stripe = {
      ...converter.stripeHelper.stripe,
      plans: { list: jest.fn().mockReturnValue(planGenerator()) },
    };

    await converter.convert(args);
    expect(paymentConfigManager.storeProductConfig.mock.calls[0]).toEqual([
      productConfig2,
      null,
    ]);
    expect(paymentConfigManager.storeProductConfig.mock.calls[1]).toEqual([
      productConfig2,
      productConfigId,
    ]);
    expect(paymentConfigManager.storePlanConfig).toHaveBeenCalledTimes(1);
    expect(paymentConfigManager.storePlanConfig).toHaveBeenCalledWith(
      planConfig2,
      productConfigId,
      null
    );
    expect(mockLog.error).toHaveBeenCalledTimes(1);
    expect(mockLog.error).toHaveBeenCalledWith(
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
    paymentConfigManager.storeProductConfig = jest
      .fn()
      .mockResolvedValue(productConfigId);
    paymentConfigManager.storePlanConfig = jest
      .fn()
      .mockResolvedValue(planConfigId);
    converter.stripePlanToPlanConfig = jest
      .fn()
      .mockImplementationOnce(() => {
        throw { message: 'Something else broke!' };
      })
      .mockReturnValueOnce(planConfig2);
    async function* productGenerator() {
      yield product1;
    }
    async function* planGenerator() {
      yield plan1;
      yield plan2;
    }
    converter.stripeHelper.stripe = {
      products: { list: jest.fn().mockReturnValue(productGenerator()) },
      plans: { list: jest.fn().mockReturnValue(planGenerator()) },
    };

    await converter.convert(args);
    expect(paymentConfigManager.storeProductConfig.mock.calls[0]).toEqual([
      productConfig1,
      null,
    ]);
    expect(paymentConfigManager.storeProductConfig.mock.calls[1]).toEqual([
      productConfig1,
      productConfigId,
    ]);
    expect(paymentConfigManager.storePlanConfig.mock.calls[0]).toEqual([
      planConfig2,
      productConfigId,
      null,
    ]);
    expect(mockLog.error).toHaveBeenCalledTimes(1);
    expect(mockLog.error).toHaveBeenCalledWith(
      'StripeProductsAndPlansConverter.convertPlanError',
      {
        error: 'Something else broke!',
        stripePlanId: plan1.id,
        stripeProductId: product1.id,
      }
    );
  });

  it('re-throws an error from Google Translation API', async () => {
    async function* planGenerator() {
      yield plan5;
    }
    async function* productGenerator() {
      yield product1;
    }
    try {
      converter.stripeHelper.stripe = {
        products: { list: jest.fn().mockReturnValue(productGenerator()) },
        plans: {
          list: jest.fn().mockReturnValue(planGenerator()),
        },
      };
      await converter.convert(args);
      throw new Error('An error should have been thrown');
    } catch (err: any) {
      expect(err.message).toBe(
        `Google Translation API error: ${GOOGLE_ERROR_MESSAGE}`
      );
    }
  });
});
