/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import fs from 'fs';
import { Container } from 'typedi';

import { AuthFirestore, AuthLogger, AppConfig } from '../../lib/types';
import { setupFirestore } from '../../lib/firestore-db';
import { PaymentConfigManager } from '../../lib/payments/configuration/manager';
import { ProductConfig } from 'fxa-shared/subscriptions/configuration/product';
import { PlanConfig } from 'fxa-shared/subscriptions/configuration/plan';
const plan = require('fxa-auth-server/test/local/payments/fixtures/stripe/plan2.json');
const product = require('fxa-shared/test/fixtures/stripe/product1.json');
const { mockLog, mockStripeHelper } = require('../../test/mocks');

function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

const GOOGLE_ERROR_MESSAGE = 'Google Translate Error Overload';
const mockGoogleTranslateShapedError = {
  code: 403,
  message: GOOGLE_ERROR_MESSAGE,
  response: {
    request: {
      href: 'https://translation.googleapis.com/language/translate/v2/detect',
    },
  },
};

jest.mock('./plan-language-tags-guesser', () => {
  const sinon = require('sinon');
  const actual = jest.requireActual('./plan-language-tags-guesser');
  return {
    ...actual,
    getLanguageTagFromPlanMetadata: sinon.stub().callsFake((plan: any) => {
      if (plan.nickname.includes('es-ES')) {
        return 'es-ES';
      }
      if (plan.nickname.includes('fr')) {
        return 'fr';
      }
      if (plan.nickname === 'localised en plan') {
        throw new Error(actual.PLAN_EN_LANG_ERROR);
      }
      if (plan.nickname === 'you cannot translate this') {
        throw mockGoogleTranslateShapedError;
      }
      return 'en';
    }),
  };
});

const {
  StripeProductsAndPlansConverter,
} = require('./stripe-products-and-plans-converter');

const sandbox = sinon.createSandbox();

const mockPaymentConfigManager = {
  startListeners: sandbox.stub(),
};
const mockSupportedLanguages = ['es-ES', 'fr'];

describe('StripeProductsAndPlansConverter', () => {
  let converter: any;

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
      expect(converter.log).toBe(mockLog);
      expect(converter.stripeHelper).toBe(mockStripeHelper);
      expect(converter.supportedLanguages).toEqual(
        mockSupportedLanguages.map((l: string) => l.toLowerCase())
      );
      expect(converter.paymentConfigManager).toBe(mockPaymentConfigManager);
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
      expect(result).toEqual(expected);
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
      expect(expected).toEqual(result);
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
      expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
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
        successActionButton: 'http://127.0.0.1:8080/',
        webIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        emailIcon:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        appStore: 'https://www.appstore.com',
        privacyNotice: 'https://www.privacy.wow',
      };
      const result = converter.urlMetadataToUrlConfig(testProduct);
      expect(result).toEqual(expected);
    });

    it('transforms the data - without successActionButtonURL', () => {
      const testProduct = {
        ...deepCopy(product),
        metadata: {
          ...deepCopy(product.metadata),
          successActionButtonURL: undefined,
          appStoreLink: 'https://www.appstore.com',
          'product:privacyNoticeURL': 'https://www.privacy.wow',
        },
      };
      const expected = {
        webIcon: 'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        emailIcon:
          'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        appStore: 'https://www.appstore.com',
        privacyNotice: 'https://www.privacy.wow',
      };
      const result = converter.urlMetadataToUrlConfig(testProduct);
      expect(result).toEqual(expected);
    });
  });

  describe('stripeProductToProductConfig', () => {
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
          webIcon:
            'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
          emailIcon:
            'https://123done-stage.dev.lcip.org/img/transparent-logo.png',
        },
      };
      const actualProductConfig =
        converter.stripeProductToProductConfig(testProduct);
      expect(actualProductConfig).toEqual(expectedProductConfig);
      const { error } = await ProductConfig.validate(actualProductConfig, {
        cdnUrlRegex: ['^http'],
      });
      expect(error).toBeUndefined();
    });
  });

  describe('stripePlanToPlanConfig', () => {
    it('returns a valid planConfig', async () => {
      const testPlan = deepCopy({
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
          successActionButton: 'https://example.com/download',
        },
        productOrder: 2,
        productSet: ['foo'],
      };
      const actualPlanConfig = converter.stripePlanToPlanConfig(testPlan);
      expect(actualPlanConfig).toEqual(expectedPlanConfig);
      const { error } = await PlanConfig.validate(actualPlanConfig, {
        cdnUrlRegex: ['^https://'],
      });
      expect(error).toBeUndefined();
    });
  });

  describe('stripePlanLocalesToProductConfigLocales', () => {
    it('returns a ProductConfig.locales object if a locale is found', async () => {
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
      const actual = await converter.stripePlanLocalesToProductConfigLocales(
        planWithLocalizedData
      );
      expect(actual).toEqual(expected);
    });

    it('returns {} if no locale is found', async () => {
      const planWithLocalizedData = {
        ...deepCopy(plan),
        nickname: '123Done Pro Monthly',
        metadata: {
          'product:details:1': 'Producto nuevo',
          'product:details:2': 'Mas mejor que el otro',
        },
      };
      const expected = {};
      const actual = await converter.stripePlanLocalesToProductConfigLocales(
        planWithLocalizedData
      );
      expect(actual).toEqual(expected);
    });
  });

  describe('writeToFileProductConfig', () => {
    let paymentConfigManager: any;
    let converter: any;

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

    beforeEach(() => {
      const firestore = setupFirestore(mockConfig as any);
      Container.set(AuthFirestore, firestore);
      Container.set(AuthLogger, {});
      Container.set(AppConfig, mockConfig);
      paymentConfigManager = new PaymentConfigManager();
      Container.set(PaymentConfigManager, paymentConfigManager);
      converter = new StripeProductsAndPlansConverter({
        log: mockLog,
        stripeHelper: mockStripeHelper,
        supportedLanguages: mockSupportedLanguages,
      });
    });

    afterEach(() => {
      Container.reset();
      sandbox.restore();
    });

    it('Should write the file', async () => {
      const productConfig = deepCopy(product);
      const productConfigId = 'docid_prod_123';
      const testPath = 'home/dir/prod_123';
      const expectedJSON = JSON.stringify(
        {
          ...productConfig,
          id: productConfigId,
        },
        null,
        2
      );

      paymentConfigManager.validateProductConfig = sandbox.stub().resolves();
      const spyWriteFile = sandbox.stub(fs.promises, 'writeFile').resolves();

      await converter.writeToFileProductConfig(
        productConfig,
        productConfigId,
        testPath
      );

      sinon.assert.calledOnce(paymentConfigManager.validateProductConfig);
      sinon.assert.calledWithExactly(spyWriteFile, testPath, expectedJSON);
    });

    it('Throws an error when validation fails', async () => {
      paymentConfigManager.validateProductConfig = sandbox.stub().rejects();
      const spyWriteFile = sandbox.stub(fs.promises, 'writeFile').resolves();
      try {
        await converter.writeToFileProductConfig();
        sinon.assert.fail('An exception is expected to be thrown');
      } catch (err) {
        sinon.assert.calledOnce(paymentConfigManager.validateProductConfig);
        sinon.assert.notCalled(spyWriteFile);
      }
    });
  });

  describe('writeToFilePlanConfig', () => {
    let paymentConfigManager: any;
    let converter: any;

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

    beforeEach(() => {
      const firestore = setupFirestore(mockConfig as any);
      Container.set(AuthFirestore, firestore);
      Container.set(AuthLogger, {});
      Container.set(AppConfig, mockConfig);
      paymentConfigManager = new PaymentConfigManager();
      Container.set(PaymentConfigManager, paymentConfigManager);
      converter = new StripeProductsAndPlansConverter({
        log: mockLog,
        stripeHelper: mockStripeHelper,
        supportedLanguages: mockSupportedLanguages,
      });
    });

    afterEach(() => {
      Container.reset();
      sandbox.restore();
    });

    it('Should write the file', async () => {
      const planConfig = deepCopy(plan);
      const existingPlanConfigId = 'docid_plan_123';
      const testPath = 'home/dir/plan_123';
      const expectedJSON = JSON.stringify(
        {
          ...planConfig,
          id: existingPlanConfigId,
        },
        null,
        2
      );

      paymentConfigManager.validatePlanConfig = sandbox.stub().resolves();
      const spyWriteFile = sandbox.stub(fs.promises, 'writeFile').resolves();

      await converter.writeToFilePlanConfig(
        planConfig,
        planConfig.stripeProductId,
        existingPlanConfigId,
        testPath
      );

      sinon.assert.calledOnce(paymentConfigManager.validatePlanConfig);
      sinon.assert.calledWithExactly(spyWriteFile, testPath, expectedJSON);
    });

    it('Throws an error when validation fails', async () => {
      paymentConfigManager.validatePlanConfig = sandbox.stub().rejects();
      const spyWriteFile = sandbox.stub(fs.promises, 'writeFile').resolves();

      try {
        await converter.writeToFilePlanConfig();
        sinon.assert.fail('An exception is expected to be thrown');
      } catch (err) {
        sinon.assert.calledOnce(paymentConfigManager.validatePlanConfig);
        sinon.assert.notCalled(spyWriteFile);
      }
    });
  });
});
