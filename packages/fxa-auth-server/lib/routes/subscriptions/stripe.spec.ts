/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');
const uuid = require('uuid');
const mocks = require('../../../test/mocks');
const { AppError: error } = require('@fxa/accounts/errors');
const Sentry = require('@sentry/node');
const sentryModule = require('../../sentry');
const {
  StripeHelper,
  STRIPE_PRICE_METADATA,
} = require('../../payments/stripe');
const { CurrencyHelper } = require('../../payments/currencies');
const {
  PromotionCodeManager,
  CustomerError,
} = require('@fxa/payments/customer');
const uuidv4 = require('uuid').v4;

const { sanitizePlans, handleAuth } = require('.');

// Import the real buildTaxAddress for direct tests (not through the mock)
const { buildTaxAddress: realBuildTaxAddress } = jest.requireActual('./utils');

jest.mock('fxa-shared/db/models/auth', () => ({
  getAccountCustomerByUid: jest.fn(),
}));

jest.mock('../utils/account', () => ({
  deleteAccountIfUnverified: jest.fn(),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  buildTaxAddress: jest.fn(),
}));

const { StripeHandler: DirectStripeRoutes } = require('./stripe');

const accountUtils = require('../utils/account');
const {
  getAccountCustomerByUid: getAccountCustomerByUidStub,
} = require('fxa-shared/db/models/auth');
const { deleteAccountIfUnverified: deleteAccountIfUnverifiedStub } =
  accountUtils;
const { buildTaxAddress: buildTaxAddressStub } = require('./utils');
const { AuthLogger, AppConfig } = require('../../types');
const { CapabilityService } = require('../../payments/capability');
const { PlayBilling } = require('../../payments/iap/google-play');
const {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoicesToSubsequentInvoicePreviewsDTO,
} = require('../../payments/stripe-formatter');

const { filterCustomer, filterSubscription, filterInvoice, filterIntent } =
  require('fxa-shared').subscriptions.stripe;

const subscription2 = require('../../../test/local/payments/fixtures/stripe/subscription2.json');
const cancelledSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_cancelled.json');
const trialSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_trialing.json');
const pastDueSubscription = require('../../../test/local/payments/fixtures/stripe/subscription_past_due.json');
const customerFixture = require('../../../test/local/payments/fixtures/stripe/customer1.json');
const emptyCustomer = require('../../../test/local/payments/fixtures/stripe/customer_new.json');
const openInvoice = require('../../../test/local/payments/fixtures/stripe/invoice_open.json');
const invoicePreviewTax = require('../../../test/local/payments/fixtures/stripe/invoice_preview_tax.json');
const newSetupIntent = require('../../../test/local/payments/fixtures/stripe/setup_intent_new.json');
const paymentMethodFixture = require('../../../test/local/payments/fixtures/stripe/payment_method.json');

const currencyHelper = new CurrencyHelper({
  currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
});
const mockCapabilityService: any = {};
const mockPromotionCodeManager: any = {};

let config: any,
  log: any,
  db: any,
  customs: any,
  push: any,
  mailer: any,
  profile: any;

const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const {
  SubscriptionEligibilityResult,
} = require('fxa-shared/subscriptions/types');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const NOW = Date.now();
const PLAN_ID_1 = 'plan_G93lTs8hfK7NNG';
const PLANS = mocks.mockPlans;
const SUBSCRIPTION_ID_1 = 'sub-8675309';
const ACTIVE_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: SUBSCRIPTION_ID_1,
    productId: PLANS[0].product_id,
    createdAt: NOW,
    cancelledAt: null,
  },
];
const MOCK_CLIENT_ID = '3c49430b43dfba77';
const MOCK_TTL = 3600;
const MOCK_SCOPES = ['profile:email', OAUTH_SCOPE_SUBSCRIPTIONS];
const mockCMSClients = mocks.mockCMSClients;

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

describe('sanitizePlans', () => {
  it('removes capabilities from product & plan metadata', () => {
    const expected = [
      {
        plan_id: 'firefox_pro_basic_823',
        product_id: 'firefox_pro_basic',
        product_name: 'Firefox Pro Basic',
        interval: 'week',
        amount: '123',
        currency: 'usd',
        plan_metadata: {},
        product_metadata: {
          emailIconURL: 'http://example.com/image.jpg',
          successActionButtonURL: 'http://getfirefox.com',
        },
      },
      {
        plan_id: 'firefox_pro_basic_999',
        product_id: 'firefox_pro_pro',
        product_name: 'Firefox Pro Pro',
        interval: 'month',
        amount: '456',
        currency: 'usd',
        plan_metadata: {},
        product_metadata: {},
      },
      {
        plan_id: PLAN_ID_1,
        product_id: 'prod_G93l8Yn7XJHYUs',
        product_name: 'FN Tier 1',
        interval: 'month',
        amount: 499,
        current: 'usd',
        plan_metadata: {},
        product_metadata: {},
      },
    ];

    expect(sanitizePlans(PLANS)).toEqual(expected);
  });
});

/**
 * Stripe integration tests
 */
describe('subscriptions stripeRoutes', () => {
  beforeEach(() => {
    Container.reset();
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        paypalNvpSigCredentials: {
          enabled: false,
        },
        unsupportedLocations: [],
      },
      currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
      support: {
        ticketPayloadLimit: 131072,
      },
    };
    Container.set(AppConfig, config);

    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);

    mockCapabilityService.getClients = jest.fn();
    mockCapabilityService.getClients.mockResolvedValue(mockCMSClients);
    Container.set(CapabilityService, mockCapabilityService);

    log = mocks.mockLog();
    customs = mocks.mockCustoms();

    Container.set(AuthLogger, log);
    Container.set(PlayBilling, {});

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    db.createAccountSubscription = jest.fn(async (data: any) => ({}));
    db.deleteAccountSubscription = jest.fn(
      async (uid: any, subscriptionId: any) => ({})
    );
    db.cancelAccountSubscription = jest.fn(async () => ({}));
    db.fetchAccountSubscriptions = jest.fn(async (uid: any) =>
      ACTIVE_SUBSCRIPTIONS.filter((s) => s.uid === uid)
    );
    db.getAccountSubscription = jest.fn(
      async (uid: any, subscriptionId: any) => {
        const subscription = ACTIVE_SUBSCRIPTIONS.filter(
          (s) => s.uid === uid && s.subscriptionId === subscriptionId
        )[0];
        if (typeof subscription === 'undefined') {
          throw { statusCode: 404, errno: 116 };
        }
        return subscription;
      }
    );

    push = mocks.mockPush();
    mailer = mocks.mockMailer();

    profile = mocks.mockProfile({
      deleteCache: jest.fn(async (uid: any) => ({})),
    });
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  const VALID_REQUEST: any = {
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
    headers: {
      'accept-language': 'en',
    },
  };

  describe('Plans', () => {
    it('should list available subscription plans', async () => {
      const stripeHelper = mocks.mockStripeHelper(['allAbbrevPlans']);

      stripeHelper.allAbbrevPlans = jest.fn(async () => {
        return PLANS;
      });

      const directStripeRoutes = new DirectStripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      );

      const res = await directStripeRoutes.listPlans(VALID_REQUEST);
      expect(res).toEqual(sanitizePlans(PLANS));
    });
  });

  describe('listActive', () => {
    it('should list active subscriptions', async () => {
      const stripeHelper = mocks.mockStripeHelper(['fetchCustomer']);

      stripeHelper.fetchCustomer = jest.fn(async (uid: any, customer: any) => {
        return customerFixture;
      });

      const directStripeRoutes = new DirectStripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      );

      const expected = [
        {
          cancelledAt: null,
          createdAt: 1582765012000,
          productId: 'prod_test1',
          subscriptionId: 'sub_test1',
          uid: UID,
        },
      ];
      const res = await directStripeRoutes.listActive(VALID_REQUEST);
      expect(res).toEqual(expected);
    });
  });
});

describe('handleAuth', () => {
  const AUTH_UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
  const AUTH_EMAIL = 'auth@example.com';
  const DB_EMAIL = 'db@example.com';

  const VALID_AUTH = {
    credentials: {
      scope: MOCK_SCOPES,
      user: `${AUTH_UID}`,
      email: `${AUTH_EMAIL}`,
    },
  };

  const INVALID_AUTH = {
    credentials: {
      scope: 'profile',
      user: `${AUTH_UID}`,
      email: `${AUTH_EMAIL}`,
    },
  };

  let db: any;

  beforeAll(() => {
    db = mocks.mockDB({
      uid: AUTH_UID,
      email: DB_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
  });

  it('throws an error when the scope is invalid', async () => {
    return handleAuth(db, INVALID_AUTH).then(
      () => Promise.reject(new Error('Method expected to reject')),
      (err: any) => {
        expect(err).toBeInstanceOf(error);
        expect(err.message).toBe('Requested scopes are not allowed');
      }
    );
  });

  describe('when fetchEmail is set to false', () => {
    it('returns the uid and the email from the auth header', async () => {
      const actual = await handleAuth(db, VALID_AUTH);
      expect(actual.uid).toBe(AUTH_UID);
      expect(actual.email).toBe(AUTH_EMAIL);
    });
  });

  describe('when fetchEmail is set to true', () => {
    it('returns the uid from the auth credentials and fetches the email from the database', async () => {
      const actual = await handleAuth(db, VALID_AUTH, true);
      expect(actual.uid).toBe(AUTH_UID);
      expect(actual.email).toBe(DB_EMAIL);
      expect(actual.account.email).toBe(DB_EMAIL);
    });

    it('should propogate errors from database', async () => {
      let failed = false;

      db.account = jest.fn(async () => {
        throw error.unknownAccount();
      });

      await handleAuth(db, VALID_AUTH, true).then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err: any) => {
          failed = true;
          expect(err.message).toBe('Unknown account');
        }
      );

      expect(failed).toBe(true);
    });
  });
});

describe('DirectStripeRoutes', () => {
  let directStripeRoutesInstance: any;

  const VALID_REQUEST: any = {
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
    app: {
      devices: ['deviceId1', 'deviceId2'],
      clientAddress: '127.0.0.1',
    },
  };

  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        productConfigsFirestore: { enabled: false },
        unsupportedLocations: ['CN'],
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    profile = mocks.mockProfile({
      deleteCache: jest.fn(async (uid: any) => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
      verifierSetAt: 0,
    });
    const stripeHelperMock: any = {};
    // Mock all methods from the prototype chain (including parent classes)
    let proto = StripeHelper.prototype;
    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach((m) => {
        if (m !== 'constructor' && !stripeHelperMock[m]) {
          stripeHelperMock[m] = jest.fn();
        }
      });
      proto = Object.getPrototypeOf(proto);
    }
    stripeHelperMock.currencyHelper = currencyHelper;
    stripeHelperMock.stripe = {
      subscriptions: {
        del: jest.fn(async (uid: any) => undefined),
        cancel: jest.fn(async () => undefined),
      },
    };
    mockCapabilityService.getPlanEligibility = jest.fn();
    mockCapabilityService.getPlanEligibility.mockResolvedValue({
      subscriptionEligibilityResult: SubscriptionEligibilityResult.CREATE,
    });
    mockCapabilityService.getClients = jest.fn();
    mockCapabilityService.getClients.mockResolvedValue(mockCMSClients);
    Container.set(CapabilityService, mockCapabilityService);

    const mockSubscription = deepCopy(subscription2);
    mockPromotionCodeManager.applyPromoCodeToSubscription = jest.fn();
    mockPromotionCodeManager.applyPromoCodeToSubscription.mockResolvedValue(
      mockSubscription
    );
    Container.set(PromotionCodeManager, mockPromotionCodeManager);
    buildTaxAddressStub.mockReset();
    buildTaxAddressStub.mockReturnValue({
      countryCode: 'US',
      postalCode: '92841',
    });

    directStripeRoutesInstance = new DirectStripeRoutes(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      stripeHelperMock
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractPromotionCode', () => {
    it('should extract a valid PromotionCode', async () => {
      const promotionCode = { coupon: { id: 'test-code' } };
      directStripeRoutesInstance.stripeHelper.findValidPromoCode.mockResolvedValue(
        promotionCode
      );
      const res = await directStripeRoutesInstance.extractPromotionCode(
        'promo1',
        'plan1'
      );
      expect(res).toBe(promotionCode);
    });

    it('should throw an error if on invalid promotion code', async () => {
      directStripeRoutesInstance.stripeHelper.findValidPromoCode.mockResolvedValue(
        undefined
      );
      try {
        await directStripeRoutesInstance.extractPromotionCode(
          'promo1',
          'plan1'
        );
        throw new Error('Expected to throw an error');
      } catch (err: any) {
        expect(err.message).toBe('Invalid promotion code');
      }
    });
  });

  describe('customerChanged', () => {
    it('Creates profile update push notification and logs profile changed event', async () => {
      await directStripeRoutesInstance.customerChanged(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );

      expect(
        directStripeRoutesInstance.profile.deleteCache
      ).toHaveBeenCalledWith(UID);

      expect(
        directStripeRoutesInstance.push.notifyProfileUpdated
      ).toHaveBeenCalledWith(UID, VALID_REQUEST.app.devices);

      expect(
        directStripeRoutesInstance.profile.deleteCache
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.profile.deleteCache
      ).toHaveBeenCalledWith(UID);

      expect(
        directStripeRoutesInstance.log.notifyAttachedServices
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.log.notifyAttachedServices
      ).toHaveBeenCalledWith('profileDataChange', VALID_REQUEST, { uid: UID });
    });
  });

  describe('getClients', () => {
    it('returns client capabilities', async () => {
      const expected = await mockCapabilityService.getClients();
      const res = await directStripeRoutesInstance.getClients();
      expect(res).toEqual(expected);
    });
  });

  describe('createCustomer', () => {
    it('creates a stripe customer', async () => {
      const expected = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.createPlainCustomer.mockResolvedValue(
        expected
      );
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      VALID_REQUEST.app.geo = {};
      buildTaxAddressStub.mockReturnValue(undefined);

      const actual =
        await directStripeRoutesInstance.createCustomer(VALID_REQUEST);
      const callArgs =
        directStripeRoutesInstance.stripeHelper.createPlainCustomer.mock
          .calls[0][0];
      expect(callArgs.taxAddress).toBe(undefined);

      expect(actual).toEqual(filterCustomer(expected));
    });

    it('creates a stripe customer with the shipping address on automatic tax', async () => {
      const expected = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.createPlainCustomer.mockResolvedValue(
        expected
      );
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      VALID_REQUEST.app.geo = {
        location: {
          countryCode: 'US',
          postalCode: '92841',
        },
      };
      buildTaxAddressStub.mockReturnValue({
        countryCode: 'US',
        postalCode: '92841',
      });

      const actual =
        await directStripeRoutesInstance.createCustomer(VALID_REQUEST);
      const callArgs =
        directStripeRoutesInstance.stripeHelper.createPlainCustomer.mock
          .calls[0][0];
      expect(callArgs.taxAddress?.countryCode).toBe('US');
      expect(callArgs.taxAddress?.postalCode).toBe('92841');
      expect(actual).toEqual(filterCustomer(expected));
    });
  });

  describe('previewInvoice', () => {
    it('returns the preview invoice', async () => {
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoice.mockResolvedValue([
        expected,
        undefined,
      ]);
      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {};
      buildTaxAddressStub.mockReturnValue(undefined);
      const actual =
        await directStripeRoutesInstance.previewInvoice(VALID_REQUEST);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(VALID_REQUEST, UID, TEST_EMAIL, 'previewInvoice');
      expect(
        directStripeRoutesInstance.stripeHelper.fetchCustomer
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.fetchCustomer
      ).toHaveBeenCalledWith(UID, ['subscriptions', 'tax']);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledWith({
        customer: undefined,
        promotionCode: 'promotionCode',
        priceId: 'priceId',
        taxAddress: undefined,
        isUpgrade: false,
        sourcePlan: undefined,
      });
      expect(actual).toEqual(
        stripeInvoiceToFirstInvoicePreviewDTO([expected, undefined])
      );
    });

    it('returns the preview invoice when Stripe tax is enabled', async () => {
      const mockCustomer = deepCopy(customerFixture);
      mockCustomer.tax = {
        automatic_tax: 'supported',
      };
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        mockCustomer
      );
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoice.mockResolvedValue([
        expected,
        undefined,
      ]);
      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {};
      buildTaxAddressStub.mockReturnValue(undefined);
      const actual =
        await directStripeRoutesInstance.previewInvoice(VALID_REQUEST);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(VALID_REQUEST, UID, TEST_EMAIL, 'previewInvoice');
      expect(
        directStripeRoutesInstance.stripeHelper.fetchCustomer
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.fetchCustomer
      ).toHaveBeenCalledWith(UID, ['subscriptions', 'tax']);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledWith({
        customer: mockCustomer,
        promotionCode: 'promotionCode',
        priceId: 'priceId',
        taxAddress: undefined,
        isUpgrade: false,
        sourcePlan: undefined,
      });
      expect(actual).toEqual(
        stripeInvoiceToFirstInvoicePreviewDTO([expected, undefined])
      );
    });

    it('returns the preview invoice even if fetch customer errors', async () => {
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoice.mockResolvedValue([
        expected,
        undefined,
      ]);

      const fetchError = new Error('test');
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockImplementation(
        () => {
          throw fetchError;
        }
      );

      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {
        location: {
          countryCode: 'US',
          postalCode: '92841',
        },
      };
      buildTaxAddressStub.mockReturnValue({
        countryCode: 'US',
        postalCode: '92841',
      });

      const actual =
        await directStripeRoutesInstance.previewInvoice(VALID_REQUEST);

      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(VALID_REQUEST, UID, TEST_EMAIL, 'previewInvoice');
      expect(directStripeRoutesInstance.log.error).toHaveBeenCalledTimes(1);
      expect(directStripeRoutesInstance.log.error).toHaveBeenCalledWith(
        'previewInvoice.fetchCustomer',
        {
          error: fetchError,
          uid: UID,
        }
      );

      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledWith({
        customer: undefined,
        promotionCode: 'promotionCode',
        priceId: 'priceId',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
        isUpgrade: false,
        sourcePlan: undefined,
      });
      expect(actual).toEqual(
        stripeInvoiceToFirstInvoicePreviewDTO([expected, undefined])
      );
    });

    it('does not call fetchCustomer if no credentials are provided, and returns invoice preview', async () => {
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoice.mockResolvedValue([
        expected,
        undefined,
      ]);

      const request = deepCopy(VALID_REQUEST);
      request.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      request.app = {
        clientAddress: '1.1.1.1',
        geo: {
          location: {
            country: 'DE',
            countryCode: 'DE',
            postalCode: '92841',
          },
        },
      };
      request.auth.credentials = undefined;
      buildTaxAddressStub.mockReturnValue({
        countryCode: 'DE',
        postalCode: '92841',
      });

      const actual = await directStripeRoutesInstance.previewInvoice(request);

      expect(
        directStripeRoutesInstance.customs.checkIpOnly
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkIpOnly
      ).toHaveBeenCalledWith(request, 'previewInvoice');
      expect(
        directStripeRoutesInstance.stripeHelper.fetchCustomer
      ).not.toHaveBeenCalled();

      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoice
      ).toHaveBeenCalledWith({
        customer: undefined,
        promotionCode: 'promotionCode',
        priceId: 'priceId',
        taxAddress: {
          countryCode: 'DE',
          postalCode: '92841',
        },
        isUpgrade: false,
        sourcePlan: undefined,
      });
      expect(actual).toEqual(
        stripeInvoiceToFirstInvoicePreviewDTO([expected, undefined])
      );
    });

    it('error with AppError invalidInvoicePreviewRequest', async () => {
      const appError: any = new Error('Stripe error');
      appError.type = 'StripeInvalidRequestError';
      directStripeRoutesInstance.stripeHelper.previewInvoice.mockRejectedValue(
        appError
      );

      const request = deepCopy(VALID_REQUEST);

      try {
        await directStripeRoutesInstance.previewInvoice(request);
        throw new Error('Preview Invoice should fail');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_INVOICE_PREVIEW_REQUEST);
      }
    });

    it('errors when country code is an unsupported location', async () => {
      const request = deepCopy(VALID_REQUEST);
      buildTaxAddressStub.mockReturnValue({ countryCode: 'CN' });

      try {
        await directStripeRoutesInstance.previewInvoice(request);
        throw new Error('Preview Invoice should fail');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNSUPPORTED_LOCATION);
        expect(err.message).toBe(
          'Location is not supported according to our Terms of Service.'
        );
      }
    });
  });

  async function successInvoices(
    customerSubscriptions: any,
    expectedPreviewInvoiceBySubscriptionId: any
  ) {
    const expected = deepCopy(invoicePreviewTax);
    directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId.mockResolvedValue(
      expected
    );
    directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue({
      id: 'cus_id',
      subscriptions: customerSubscriptions,
    });
    VALID_REQUEST.app.geo = {
      location: {
        countryCode: 'US',
        postalCode: '92841',
      },
    };

    const actual =
      await directStripeRoutesInstance.subsequentInvoicePreviews(VALID_REQUEST);

    expect(
      directStripeRoutesInstance.customs.checkAuthenticated
    ).toHaveBeenCalledTimes(1);
    expect(
      directStripeRoutesInstance.customs.checkAuthenticated
    ).toHaveBeenCalledWith(
      VALID_REQUEST,
      UID,
      TEST_EMAIL,
      'subsequentInvoicePreviews'
    );
    expect(
      directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId
    ).toHaveBeenCalledTimes(2);
    expect(
      directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId
    ).toHaveBeenCalledWith(expectedPreviewInvoiceBySubscriptionId[0]);
    expect(
      directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId
    ).toHaveBeenCalledWith(expectedPreviewInvoiceBySubscriptionId[1]);
    expect(actual).toEqual(
      stripeInvoicesToSubsequentInvoicePreviewsDTO([expected, expected])
    );
  }

  describe('subsequentInvoicePreviews', () => {
    it('returns array of next invoices', async () => {
      await successInvoices(
        {
          data: [{ id: 'sub_id1' }, { id: 'sub_id2' }],
        },
        [
          {
            subscriptionId: 'sub_id1',
            includeCanceled: false,
          },
          {
            subscriptionId: 'sub_id2',
            includeCanceled: false,
          },
        ]
      );
    });

    it('filter out subscriptions that have already been cancelled', async () => {
      await successInvoices(
        {
          data: [{ id: 'sub_id1', canceled_at: 1646244417 }, { id: 'sub_id2' }],
        },
        [
          {
            subscriptionId: 'sub_id1',
            includeCanceled: true,
          },
          {
            subscriptionId: 'sub_id2',
            includeCanceled: false,
          },
        ]
      );
    });

    it('return empty array if customer has no subscriptions', async () => {
      const expected: any[] = [];
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue({
        id: 'cus_id',
        subscriptions: {
          data: [],
        },
      });
      VALID_REQUEST.app.geo = {};

      const actual =
        await directStripeRoutesInstance.subsequentInvoicePreviews(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL,
        'subsequentInvoicePreviews'
      );
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId
      ).not.toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });

    it('returns empty array if customer is not found', async () => {
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        null
      );
      VALID_REQUEST.app.geo = {};
      const expected: any[] = [];
      const actual =
        await directStripeRoutesInstance.subsequentInvoicePreviews(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL,
        'subsequentInvoicePreviews'
      );
      expect(
        directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId
      ).not.toHaveBeenCalled();
      expect(actual).toEqual(expected);
    });
  });

  describe('retrieveCouponDetails', () => {
    it('returns the coupon details when the promoCode is valid', async () => {
      const expected = {
        promotionCode: 'FRIENDS10',
        type: 'forever',
        valid: true,
        discountAmount: 50,
      };

      directStripeRoutesInstance.stripeHelper.retrieveCouponDetails.mockResolvedValue(
        expected
      );

      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {
        location: {
          countryCode: 'US',
          postalCode: '92841',
        },
      };
      const actual =
        await directStripeRoutesInstance.retrieveCouponDetails(VALID_REQUEST);

      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL,
        'retrieveCouponDetails'
      );
      expect(
        directStripeRoutesInstance.customs.checkIpOnly
      ).not.toHaveBeenCalled();
      expect(
        directStripeRoutesInstance.stripeHelper.retrieveCouponDetails
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.retrieveCouponDetails
      ).toHaveBeenCalledWith({
        promotionCode: 'promotionCode',
        priceId: 'priceId',
        taxAddress: {
          countryCode: 'US',
          postalCode: '92841',
        },
      });

      expect(actual).toEqual(expected);
    });

    it('calls customs checkIpOnly for unauthenticated customer', async () => {
      const request = deepCopy(VALID_REQUEST);
      request.auth.credentials = undefined;
      await directStripeRoutesInstance.retrieveCouponDetails(request);

      expect(
        directStripeRoutesInstance.customs.checkIpOnly
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkIpOnly
      ).toHaveBeenCalledWith(request, 'retrieveCouponDetails');
      expect(directStripeRoutesInstance.customs.check).not.toHaveBeenCalled();
    });
  });

  describe('applyPromotionCodeToSubscription', () => {
    it('throws error if customer is not found', async () => {
      const mockSubscription = deepCopy(subscription2);

      VALID_REQUEST.payload = {
        promotionId: 'promo_code123',
        subscriptionId: mockSubscription.id,
      };

      try {
        await directStripeRoutesInstance.applyPromotionCodeToSubscription(
          VALID_REQUEST
        );
        throw new Error('Unknown customer');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('errors with AppError subscriptionPromotionCodeNotApplied if CustomerError returned from StripeService', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage');

      let mockSub = deepCopy(subscription2);
      const mockCustomer = deepCopy(customerFixture);
      mockSub.customer = mockCustomer.id;
      const mockPrice = {
        price: {
          metadata: {
            [STRIPE_PRICE_METADATA.PROMOTION_CODES]: 'promo_code1',
          },
        },
      };
      mockSub = {
        ...mockSub,
        ...mockPrice,
      };

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        mockCustomer
      );

      VALID_REQUEST.payload = {
        promotionId: 'promo_code1',
        subscriptionId: mockSub.id,
      };

      const stripeError = new CustomerError('Oh no.');
      mockPromotionCodeManager.applyPromoCodeToSubscription = jest.fn();
      mockPromotionCodeManager.applyPromoCodeToSubscription.mockRejectedValue(
        stripeError
      );

      try {
        await directStripeRoutesInstance.applyPromotionCodeToSubscription(
          VALID_REQUEST
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.SUBSCRIPTION_PROMO_CODE_NOT_APPLIED);
      }

      expect(Sentry.withScope).not.toHaveBeenCalled();
    });

    it('throws error if fails', async () => {
      const mockSubscription = deepCopy(subscription2);
      const mockCustomer = mockSubscription.customer;

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        mockCustomer
      );

      VALID_REQUEST.payload = {
        promotionId: 'promo_code1',
        subscriptionId: mockSubscription.id,
      };

      const testError = new Error('Something went wrong');
      mockPromotionCodeManager.applyPromoCodeToSubscription = jest.fn();
      mockPromotionCodeManager.applyPromoCodeToSubscription.mockRejectedValue(
        testError
      );

      try {
        await directStripeRoutesInstance.applyPromotionCodeToSubscription(
          VALID_REQUEST
        );
      } catch (err: any) {
        expect(err.message).toBe('Something went wrong');
        expect(err.errno).not.toBe(
          error.ERRNO.SUBSCRIPTION_PROMO_CODE_NOT_APPLIED
        );
      }
    });

    it('returns the updated subscription', async () => {
      const mockSubscription = deepCopy(subscription2);
      const mockCustomer = deepCopy(customerFixture);
      mockSubscription.customer = mockCustomer.id;

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        mockCustomer
      );

      VALID_REQUEST.payload = {
        promotionId: 'promo_code1',
        subscriptionId: mockSubscription.id,
      };

      mockPromotionCodeManager.applyPromoCodeToSubscription = jest.fn();
      mockPromotionCodeManager.applyPromoCodeToSubscription.mockResolvedValue(
        mockSubscription
      );

      const actual =
        await directStripeRoutesInstance.applyPromotionCodeToSubscription(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.customs.checkAuthenticated
      ).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL,
        'applyPromotionCodeToSubscription'
      );

      expect(
        mockPromotionCodeManager.applyPromoCodeToSubscription
      ).toHaveBeenCalledTimes(1);
      expect(
        mockPromotionCodeManager.applyPromoCodeToSubscription
      ).toHaveBeenCalledWith(
        mockCustomer.id,
        mockSubscription.id,
        'promo_code1'
      );

      expect(actual).toEqual(mockSubscription);
    });
  });

  describe('createSubscriptionWithPMI', () => {
    let plan: any, paymentMethod: any, customer: any;

    beforeEach(() => {
      plan = deepCopy(PLANS[2]);
      plan.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.findAbbrevPlanById.mockResolvedValue(
        plan
      );
      jest
        .spyOn(directStripeRoutesInstance, 'customerChanged')
        .mockResolvedValue();
      paymentMethod = deepCopy(paymentMethodFixture);
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );
      directStripeRoutesInstance.stripeHelper.findCustomerSubscriptionByPlanId.mockReturnValue(
        undefined
      );
      directStripeRoutesInstance.stripeHelper.setCustomerLocation.mockResolvedValue();
    });

    function setupCreateSuccessWithTaxIds() {
      const sourceCountry = 'US';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.mockReturnValue(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.mockResolvedValue(
        expected
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.mockReturnValue(
        false
      );
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.mockResolvedValue(
        {}
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };
      return { sourceCountry, expected };
    }

    function assertSuccess(sourceCountry: any, actual: any, expected: any) {
      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledWith(VALID_REQUEST.payload.paymentMethodId);
      expect(directStripeRoutesInstance.customerChanged).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );

      expect(actual).toEqual({
        sourceCountry,
        subscription: filterSubscription(expected),
      });
    }

    it('creates a subscription with a payment method and promotion code', async () => {
      const { sourceCountry, expected } = setupCreateSuccessWithTaxIds();
      directStripeRoutesInstance.stripeHelper.isCustomerTaxableWithSubscriptionCurrency.mockReturnValue(
        true
      );
      directStripeRoutesInstance.extractPromotionCode = jest
        .fn()
        .mockResolvedValue({
          coupon: { id: 'couponId' },
        });
      const actual =
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledWith({
        customerId: 'cus_new',
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        promotionCode: {
          coupon: { id: 'couponId' },
        },
        automaticTax: true,
      });
      assertSuccess(sourceCountry, actual, expected);
    });

    it('creates a subscription with a payment method', async () => {
      const { sourceCountry, expected } = setupCreateSuccessWithTaxIds();
      directStripeRoutesInstance.stripeHelper.isCustomerTaxableWithSubscriptionCurrency.mockReturnValue(
        true
      );
      const actual =
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledWith({
        customerId: 'cus_new',
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        promotionCode: undefined,
        automaticTax: true,
      });
      assertSuccess(sourceCountry, actual, expected);
    });

    it('creates a subscription with a payment method using automatic tax but in an unsupported region', async () => {
      const { sourceCountry, expected } = setupCreateSuccessWithTaxIds();
      directStripeRoutesInstance.stripeHelper.isCustomerTaxableWithSubscriptionCurrency.mockReturnValue(
        false
      );
      const actual =
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledWith({
        customerId: 'cus_new',
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        promotionCode: undefined,
        automaticTax: false,
      });
      assertSuccess(sourceCountry, actual, expected);
    });

    it('errors when country code is an unsupported location', async () => {
      const request = deepCopy(VALID_REQUEST);
      buildTaxAddressStub.mockReturnValue({ countryCode: 'CN' });

      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(request);
        throw new Error('Create subscription should fail');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNSUPPORTED_LOCATION);
        expect(err.message).toBe(
          'Location is not supported according to our Terms of Service.'
        );
      }
    });

    it('errors when a customer has not been created', async () => {
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        undefined
      );
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error('Create subscription without a customer should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('errors when customer is already subscribed to plan', async () => {
      mockCapabilityService.getPlanEligibility.mockResolvedValue(
        SubscriptionEligibilityResult.INVALID
      );

      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription when already subscribed should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.SUBSCRIPTION_ALREADY_EXISTS);
        expect(
          directStripeRoutesInstance.stripeHelper.cancelSubscription
        ).not.toHaveBeenCalled();
      }
    });

    it('errors if the planCurrency does not match the paymentMethod country', async () => {
      plan.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.findAbbrevPlanById.mockResolvedValue(
        plan
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
        expect(err.message).toBe(
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('errors if the paymentMethod country does not match the planCurrency', async () => {
      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
        expect(err.message).toBe(
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('calls deleteAccountIfUnverified when there is an error', async () => {
      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      deleteAccountIfUnverifiedStub.mockReset();
      deleteAccountIfUnverifiedStub.mockReturnValue(null);

      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
      }
    });

    it('ignores account exists error from deleteAccountIfUnverified', async () => {
      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      deleteAccountIfUnverifiedStub.mockReset();
      deleteAccountIfUnverifiedStub.mockImplementation(() => {
        throw error.accountExists(null);
      });

      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
      }
    });

    it('ignores verified email error from deleteAccountIfUnverified', async () => {
      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      deleteAccountIfUnverifiedStub.mockReset();
      deleteAccountIfUnverifiedStub.mockImplementation(() => {
        throw error.verifiedSecondaryEmailAlreadyExists();
      });

      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(deleteAccountIfUnverifiedStub).toHaveBeenCalledTimes(1);
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
      }
    });

    it('skips calling deleteAccountIfUnverified if verifiedSetAt is greater than 0', async () => {
      config = {
        subscriptions: {
          enabled: true,
          managementClientId: MOCK_CLIENT_ID,
          managementTokenTTL: MOCK_TTL,
          stripeApiKey: 'sk_test_1234',
          unsupportedLocations: [],
        },
      };

      log = mocks.mockLog();
      customs = mocks.mockCustoms();
      profile = mocks.mockProfile({
        deleteCache: jest.fn(async (uid: any) => ({})),
      });
      mailer = mocks.mockMailer();

      db = mocks.mockDB({
        uid: UID,
        email: TEST_EMAIL,
        locale: ACCOUNT_LOCALE,
      });
      const stripeHelperMock: any = {};
      for (
        let p = StripeHelper.prototype;
        p && p !== Object.prototype;
        p = Object.getPrototypeOf(p)
      ) {
        Object.getOwnPropertyNames(p).forEach((m) => {
          if (m !== 'constructor' && !stripeHelperMock[m])
            stripeHelperMock[m] = jest.fn();
        });
      }
      stripeHelperMock.currencyHelper = currencyHelper;

      directStripeRoutesInstance = new DirectStripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelperMock
      );

      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const thrownError = error.verifiedSecondaryEmailAlreadyExists();
      const localDeleteStub = jest
        .spyOn(accountUtils, 'deleteAccountIfUnverified')
        .mockImplementation(() => {
          throw thrownError;
        });

      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        throw new Error(
          'Create subscription with wrong planCurrency should fail.'
        );
      } catch (err: any) {
        expect(localDeleteStub.mock.calls.length === 1).toBe(false);
      }
    });

    it('creates a subscription without an payment id in the request', async () => {
      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.mockReturnValue(
        sourceCountry
      );
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );
      directStripeRoutesInstance.stripeHelper.isCustomerTaxableWithSubscriptionCurrency.mockReturnValue(
        true
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.mockResolvedValue(
        expected
      );
      const idempotencyKey = uuidv4();

      VALID_REQUEST.payload = {
        priceId: 'quux',
        idempotencyKey,
      };

      const actual =
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );

      expect(actual).toEqual({
        sourceCountry,
        subscription: filterSubscription(expected),
      });
      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledWith({
        customerId: customer.id,
        priceId: 'quux',
        promotionCode: undefined,
        paymentMethodId: undefined,
        automaticTax: true,
      });
      expect(directStripeRoutesInstance.customerChanged).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
    });

    it('deletes incomplete subscription when creating new subscription', async () => {
      const invalidSubscriptionId = 'example';
      directStripeRoutesInstance.stripeHelper.findCustomerSubscriptionByPlanId.mockReturnValue(
        {
          id: invalidSubscriptionId,
          status: 'incomplete',
        }
      );

      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.mockReturnValue(
        sourceCountry
      );
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );
      directStripeRoutesInstance.stripeHelper.isCustomerTaxableWithSubscriptionCurrency.mockReturnValue(
        true
      );
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.mockResolvedValue(
        deepCopy(subscription2)
      );

      VALID_REQUEST.payload = {
        priceId: 'quux',
        idempotencyKey: uuidv4(),
      };

      await directStripeRoutesInstance.createSubscriptionWithPMI(VALID_REQUEST);

      expect(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI
      ).toHaveBeenCalledWith({
        customerId: customer.id,
        priceId: 'quux',
        promotionCode: undefined,
        paymentMethodId: undefined,
        automaticTax: true,
      });
      expect(
        directStripeRoutesInstance.stripeHelper.cancelSubscription
      ).toHaveBeenCalledWith(invalidSubscriptionId);
    });

    it('does not report to Sentry if the customer has a payment method on file', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage');

      delete paymentMethod.billing_details.address;
      const sourceCountry = 'US';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.mockReturnValue(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.mockResolvedValue(
        subscription2
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.mockReturnValue(
        false
      );
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.mockResolvedValue(
        {}
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };

      const actual =
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).not.toHaveBeenCalled();
      expect(directStripeRoutesInstance.customerChanged).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
      expect(
        directStripeRoutesInstance.stripeHelper.taxRateByCountryCode
      ).not.toHaveBeenCalled();
      expect(
        directStripeRoutesInstance.stripeHelper.customerTaxId
      ).not.toHaveBeenCalled();
      expect(
        directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer
      ).not.toHaveBeenCalled();

      expect(actual).toEqual({
        sourceCountry,
        subscription: filterSubscription(expected),
      });
      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).not.toHaveBeenCalled();
      expect(sentryScope.setContext).not.toHaveBeenCalled();
      expect(sentryModule.reportSentryMessage).not.toHaveBeenCalled();
    });

    it('skips location lookup when source country is not needed', async () => {
      const sourceCountry = 'DE';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.mockReturnValue(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.mockResolvedValue(
        expected
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.mockReturnValue(
        false
      );
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.mockResolvedValue(
        {}
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage');

      await directStripeRoutesInstance.createSubscriptionWithPMI(VALID_REQUEST);
      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).not.toHaveBeenCalled();
      expect(Sentry.withScope).not.toHaveBeenCalled();
    });
  });

  describe('retryInvoice', () => {
    it('retries the invoice with the payment method', async () => {
      const customer = deepCopy(emptyCustomer);
      getAccountCustomerByUidStub.mockResolvedValue({
        stripeCustomerId: customer.id,
      });
      const expected = deepCopy(openInvoice);
      directStripeRoutesInstance.stripeHelper.retryInvoiceWithPaymentId.mockResolvedValue(
        expected
      );
      jest
        .spyOn(directStripeRoutesInstance, 'customerChanged')
        .mockResolvedValue();
      VALID_REQUEST.payload = {
        invoiceId: 'in_testinvoice',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const actual =
        await directStripeRoutesInstance.retryInvoice(VALID_REQUEST);

      expect(directStripeRoutesInstance.customerChanged).toHaveBeenCalledWith(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );

      expect(actual).toEqual(filterInvoice(expected));
    });

    it('errors when a customer has not been created', async () => {
      getAccountCustomerByUidStub.mockResolvedValue({});
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.retryInvoice(VALID_REQUEST);
        throw new Error('Create customer should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('createSetupIntent', () => {
    it('creates a new setup intent', async () => {
      const customer = deepCopy(emptyCustomer);
      getAccountCustomerByUidStub.mockResolvedValue({
        stripeCustomerId: customer.id,
      });
      const expected = deepCopy(newSetupIntent);
      directStripeRoutesInstance.stripeHelper.createSetupIntent.mockResolvedValue(
        expected
      );
      VALID_REQUEST.payload = {};

      const actual =
        await directStripeRoutesInstance.createSetupIntent(VALID_REQUEST);

      expect(actual).toEqual(filterIntent(expected));
    });

    it('errors when a customer has not been created', async () => {
      VALID_REQUEST.payload = {};
      getAccountCustomerByUidStub.mockResolvedValue({});
      try {
        await directStripeRoutesInstance.createSetupIntent(VALID_REQUEST);
        throw new Error('Create customer should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('updateDefaultPaymentMethod', () => {
    let paymentMethod: any;
    beforeEach(() => {
      paymentMethod = deepCopy(paymentMethodFixture);
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.mockResolvedValue(
        paymentMethod
      );
    });

    it('updates the default payment method', async () => {
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        customer
      );
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        expected
      );
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.mockResolvedValue(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.mockResolvedValue([
        {},
        {},
        {},
      ]);

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      const actual =
        await directStripeRoutesInstance.updateDefaultPaymentMethod(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledWith(VALID_REQUEST.payload.paymentMethodId);
      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).toHaveBeenCalledWith({
        customerId: customer.id,
        postalCode: paymentMethodFixture.billing_details.address.postal_code,
        country: paymentMethodFixture.card.country,
      });
      expect(actual).toEqual(filterCustomer(expected));
      expect(
        directStripeRoutesInstance.stripeHelper.removeSources
      ).toHaveBeenCalledTimes(1);
    });

    it('errors when a customer currency does not match new paymentMethod country', async () => {
      // Payment method country already set to US in beforeEach;
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );

      try {
        await directStripeRoutesInstance.updateDefaultPaymentMethod(
          VALID_REQUEST
        );
        throw new Error(
          'Update default payment method with new payment method country that does not match customer currency should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_REGION);
        expect(err.message).toBe(
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('errors when a customer has not been created', async () => {
      VALID_REQUEST.payload = { paymentMethodId: 'pm_asdf' };
      try {
        await directStripeRoutesInstance.updateDefaultPaymentMethod(
          VALID_REQUEST
        );
        throw new Error('Create customer should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('reports to Sentry if when the customer location cannot be set', async () => {
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage');

      delete paymentMethod.billing_details.address;
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        customer
      );
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        expected
      );
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.mockResolvedValue(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.mockResolvedValue([
        {},
        {},
        {},
      ]);

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      const actual =
        await directStripeRoutesInstance.updateDefaultPaymentMethod(
          VALID_REQUEST
        );

      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      ).toHaveBeenCalledWith(VALID_REQUEST.payload.paymentMethodId);
      expect(actual).toEqual(filterCustomer(expected));
      expect(
        directStripeRoutesInstance.stripeHelper.removeSources
      ).toHaveBeenCalledTimes(1);

      // Everything else worked but there was a Sentry error for not settinng
      // the location of the customer
      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).not.toHaveBeenCalled();
      expect(sentryScope.setContext).toHaveBeenCalledTimes(1);
      expect(sentryScope.setContext).toHaveBeenCalledWith(
        'updateDefaultPaymentMethod',
        {
          customerId: customer.id,
          paymentMethodId: paymentMethod.id,
        }
      );
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledTimes(1);
      expect(sentryModule.reportSentryMessage).toHaveBeenCalledWith(
        `Cannot find a postal code or country for customer.`,
        'error'
      );
    });

    it('skips location lookup when source country is not needed', async () => {
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      paymentMethod.card.country = 'GB';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';
      const sentryScope = { setContext: jest.fn() };
      jest
        .spyOn(Sentry, 'withScope')
        .mockImplementation((cb: any) => cb(sentryScope));
      jest.spyOn(sentryModule, 'reportSentryMessage');

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        customer
      );
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValueOnce(
        expected
      );
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.mockResolvedValue(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.mockResolvedValue([
        {},
        {},
        {},
      ]);

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      await directStripeRoutesInstance.updateDefaultPaymentMethod(
        VALID_REQUEST
      );

      expect(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      ).not.toHaveBeenCalled();
      expect(Sentry.withScope).not.toHaveBeenCalled();
    });
  });

  describe('detachFailedPaymentMethod', () => {
    it('calls stripe helper to detach the payment method', async () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data[0].status = 'incomplete';
      const paymentMethodId = 'pm_9001';
      const expected = { id: paymentMethodId, isGood: 'yep' };

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );
      directStripeRoutesInstance.stripeHelper.detachPaymentMethod.mockResolvedValue(
        expected
      );

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      const actual =
        await directStripeRoutesInstance.detachFailedPaymentMethod(
          VALID_REQUEST
        );

      expect(actual).toEqual(expected);
      expect(
        directStripeRoutesInstance.stripeHelper.detachPaymentMethod
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.detachPaymentMethod
      ).toHaveBeenCalledWith(paymentMethodId);
    });

    it('does not detach if the subscription is not "incomplete"', async () => {
      const customer = deepCopy(customerFixture);
      const paymentMethodId = 'pm_9001';
      const resp = { id: paymentMethodId, isGood: 'yep' };

      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );
      directStripeRoutesInstance.stripeHelper.detachPaymentMethod.mockResolvedValue(
        resp
      );

      VALID_REQUEST.payload = {
        paymentMethodId,
      };
      const actual =
        await directStripeRoutesInstance.detachFailedPaymentMethod(
          VALID_REQUEST
        );

      expect(actual).toEqual({ id: paymentMethodId });
      expect(
        directStripeRoutesInstance.stripeHelper.detachPaymentMethod
      ).not.toHaveBeenCalled();
    });

    it('errors when a customer has not been created', async () => {
      VALID_REQUEST.payload = { paymentMethodId: 'pm_asdf' };
      try {
        await directStripeRoutesInstance.detachFailedPaymentMethod(
          VALID_REQUEST
        );
        throw new Error(
          'Detaching a payment method from a non-existent customer should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('deleteSubscription', () => {
    const deleteSubRequest: any = {
      auth: {
        credentials: {
          scope: MOCK_SCOPES,
          user: `${UID}`,
          email: `${TEST_EMAIL}`,
        },
      },
      app: {
        devices: ['deviceId1', 'deviceId2'],
      },
      params: { subscriptionId: subscription2.id },
    };

    it('returns the subscription id', async () => {
      const expected = { subscriptionId: subscription2.id };

      directStripeRoutesInstance.stripeHelper.cancelSubscriptionForCustomer.mockResolvedValue();
      const actual =
        await directStripeRoutesInstance.deleteSubscription(deleteSubRequest);

      expect(actual).toEqual(expected);
    });
  });

  describe('reactivateSubscription', () => {
    const reactivateRequest: any = {
      auth: {
        credentials: {
          scope: MOCK_SCOPES,
          user: `${UID}`,
          email: `${TEST_EMAIL}`,
        },
      },
      app: {
        devices: ['deviceId1', 'deviceId2'],
      },
      payload: { subscriptionId: subscription2.id },
    };

    it('returns an empty object', async () => {
      directStripeRoutesInstance.stripeHelper.reactivateSubscriptionForCustomer.mockResolvedValue();
      const actual =
        await directStripeRoutesInstance.reactivateSubscription(
          reactivateRequest
        );

      expect(actual).toEqual({});
    });
  });

  describe('updateSubscription', () => {
    let plan: any;

    beforeEach(() => {
      directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.mockResolvedValue(
        subscription2
      );
      VALID_REQUEST.params = { subscriptionId: subscription2.subscriptionId };

      const customer = deepCopy(customerFixture);
      customer.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
        customer
      );

      plan = deepCopy(PLANS[0]);
      plan.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.findAbbrevPlanById.mockResolvedValue(
        plan
      );
      VALID_REQUEST.payload = { planId: plan.planId };
    });

    it('returns the subscription id when the plan is a valid upgrade', async () => {
      const subscriptionId = 'sub_123';
      const expected = { subscriptionId: subscriptionId };
      VALID_REQUEST.params = { subscriptionId: subscriptionId };

      mockCapabilityService.getPlanEligibility = jest.fn();
      mockCapabilityService.getPlanEligibility.mockResolvedValue({
        subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
        eligibleSourcePlan: subscription2,
      });

      directStripeRoutesInstance.stripeHelper.changeSubscriptionPlan.mockResolvedValue();

      jest
        .spyOn(directStripeRoutesInstance, 'customerChanged')
        .mockResolvedValue();

      const actual =
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);

      expect(actual).toEqual(expected);
    });

    it('cancels redundant subscriptions when upgrading', async () => {
      const subscriptionId = 'sub_123';
      VALID_REQUEST.params = { subscriptionId: subscriptionId };

      mockCapabilityService.getPlanEligibility = jest.fn();
      mockCapabilityService.getPlanEligibility.mockResolvedValue({
        subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
        eligibleSourcePlan: subscription2,
        redundantOverlaps: [
          {
            eligibleSourcePlan: {
              plan_id:
                customerFixture.subscriptions.data[0].items.data[0].plan.id,
            },
          },
        ],
      });

      directStripeRoutesInstance.stripeHelper.changeSubscriptionPlan.mockResolvedValue();
      directStripeRoutesInstance.stripeHelper.updateSubscriptionAndBackfill.mockResolvedValue();

      jest
        .spyOn(directStripeRoutesInstance, 'customerChanged')
        .mockResolvedValue();

      await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);

      expect(
        directStripeRoutesInstance.stripeHelper.updateSubscriptionAndBackfill
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.updateSubscriptionAndBackfill
      ).toHaveBeenCalledWith(customerFixture.subscriptions.data[0], {
        metadata: {
          redundantCancellation: 'true',
          autoCancelledRedundantFor: subscription2.id,
          cancelled_for_customer_at: Math.floor(Date.now() / 1000),
        },
      });

      expect(
        directStripeRoutesInstance.stripeHelper.stripe.subscriptions.cancel
      ).toHaveBeenCalledTimes(1);
      expect(
        directStripeRoutesInstance.stripeHelper.stripe.subscriptions.cancel.mock
          .calls[0][0]
      ).toBe(customerFixture.subscriptions.data[0].id);
    });

    it('throws an error when the new plan is not an upgrade', async () => {
      directStripeRoutesInstance.stripeHelper.findAbbrevPlanById.mockResolvedValue(
        plan
      );

      mockCapabilityService.getPlanEligibility = jest.fn();
      mockCapabilityService.getPlanEligibility.mockResolvedValue([
        SubscriptionEligibilityResult.INVALID,
      ]);

      try {
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);
        throw new Error('Update subscription with invalid plan should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_PLAN_UPDATE);
        expect(err.message).toBe('Subscription plan is not a valid update');
      }
    });

    it("throws an error when the new plan currency doesn't match the customer's currency.", async () => {
      plan.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.findAbbrevPlanById.mockResolvedValue(
        plan
      );

      mockCapabilityService.getPlanEligibility = jest.fn();
      mockCapabilityService.getPlanEligibility.mockResolvedValue({
        subscriptionEligibilityResult: SubscriptionEligibilityResult.UPGRADE,
        eligibleSourcePlan: subscription2,
      });

      try {
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);
        throw new Error(
          'Update subscription with wrong plan currency should fail.'
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.INVALID_CURRENCY);
        expect(err.message).toBe('Changing currencies is not permitted.');
      }
    });

    it('throws an exception when the orginal subscription is not found', async () => {
      directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.mockResolvedValue();
      try {
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);
        throw new Error('Method expected to reject');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION);
        expect(err.message).toBe('Unknown subscription');
      }
    });
  });

  describe('getProductName', () => {
    it('should respond with product name for valid id', async () => {
      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.mockResolvedValue(
        PLANS
      );
      const productId = PLANS[1].product_id;
      const expected = { product_name: PLANS[1].product_name };
      const result = await directStripeRoutesInstance.getProductName({
        auth: {},
        query: { productId },
      });
      expect(result).toEqual(expected);
    });

    it('should respond with an error for invalid id', async () => {
      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.mockResolvedValue(
        PLANS
      );
      const productId = 'this-is-not-valid';
      try {
        await directStripeRoutesInstance.getProductName({
          auth: {},
          query: { productId },
        });
        throw new Error('Getting a product name should fail.');
      } catch (err: any) {
        expect(err).toBeInstanceOf(error);
        expect(err.errno).toBe(error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
      }
    });
  });

  describe('listPlans', () => {
    it('returns the available plans without auth headers present', async () => {
      const expected = sanitizePlans(PLANS);
      const request = {};

      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.mockResolvedValue(
        PLANS
      );
      const actual = await directStripeRoutesInstance.listPlans(request);

      expect(actual).toEqual(expected);
    });
  });

  describe('listActive', () => {
    describe('customer is found', () => {
      describe('customer has no subscriptions', () => {
        it('returns an empty array', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
            emptyCustomer
          );
          const expected: any[] = [];
          const actual =
            await directStripeRoutesInstance.listActive(VALID_REQUEST);
          expect(actual).toEqual(expected);
        });
      });
      describe('customer has subscriptions', () => {
        it('returns only subscriptions that are trialing, active, or past_due', async () => {
          const customer = deepCopy(emptyCustomer);
          const setToCancelSubscription = deepCopy(cancelledSubscription);
          setToCancelSubscription.status = 'active';
          setToCancelSubscription.id = 'sub_123456';
          customer.subscriptions.data = [
            subscription2,
            trialSubscription,
            pastDueSubscription,
            cancelledSubscription,
            setToCancelSubscription,
          ];

          directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue(
            customer
          );

          const activeSubscriptions =
            await directStripeRoutesInstance.listActive(VALID_REQUEST);

          expect(activeSubscriptions).toHaveLength(4);
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === subscription2.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === trialSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === pastDueSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === setToCancelSubscription.id
            )
          ).toBeDefined();
          expect(
            activeSubscriptions.find(
              (x: any) => x.subscriptionId === cancelledSubscription.id
            )
          ).toBeUndefined();
        });
      });
    });

    describe('customer is not found', () => {
      it('returns an empty array', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.mockResolvedValue();
        const expected: any[] = [];
        const actual =
          await directStripeRoutesInstance.listActive(VALID_REQUEST);
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('buildTaxAddress', () => {
    beforeEach(() => {
      log = mocks.mockLog();
    });

    it('returns tax location if complete', () => {
      const location = {
        countryCode: 'US',
        postalCode: '92841',
      };

      const taxAddress = realBuildTaxAddress(log, '127.0.0.1', location);

      expect(taxAddress).toEqual({
        countryCode: 'US',
        postalCode: '92841',
      });
    });

    it('returns undefined tax location incomplete', () => {
      const location = {
        postalCode: '92841',
      };

      const taxAddress = realBuildTaxAddress(log, '127.0.0.1', location);

      expect(taxAddress).toEqual(undefined);
    });
  });
});
