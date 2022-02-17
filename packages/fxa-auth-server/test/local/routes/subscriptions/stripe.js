/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const { Container } = require('typedi');
const uuid = require('uuid');
const mocks = require('../../../mocks');
const error = require('../../../../lib/error');
const Sentry = require('@sentry/node');
const { StripeHelper } = require('../../../../lib/payments/stripe');
const { CurrencyHelper } = require('../../../../lib/payments/currencies');
const WError = require('verror').WError;
const uuidv4 = require('uuid').v4;
const proxyquire = require('proxyquire').noPreserveCache();
const dbStub = {
  getAccountCustomerByUid: sinon.stub(),
};

const {
  sanitizePlans,
  handleAuth,
} = require('../../../../lib/routes/subscriptions');

const { StripeHandler: DirectStripeRoutes } = proxyquire(
  '../../../../lib/routes/subscriptions/stripe',
  {
    'fxa-shared/db/models/auth': dbStub,
  }
);

const { AuthLogger, AppConfig } = require('../../../../lib/types');
const { CapabilityService } = require('../../../../lib/payments/capability');
const { PlayBilling } = require('../../../../lib/payments/google-play');
const {
  stripeInvoiceToFirstInvoicePreviewDTO,
  stripeInvoiceToSubsequentInvoicePreviewDTO,
} = require('../../../../lib/payments/stripe-formatter');

const { filterCustomer, filterSubscription, filterInvoice, filterIntent } =
  require('fxa-shared').subscriptions.stripe;

const subscription2 = require('../../payments/fixtures/stripe/subscription2.json');
const cancelledSubscription = require('../../payments/fixtures/stripe/subscription_cancelled.json');
const trialSubscription = require('../../payments/fixtures/stripe/subscription_trialing.json');
const pastDueSubscription = require('../../payments/fixtures/stripe/subscription_past_due.json');
const customerFixture = require('../../payments/fixtures/stripe/customer1.json');
const emptyCustomer = require('../../payments/fixtures/stripe/customer_new.json');
const openInvoice = require('../../payments/fixtures/stripe/invoice_open.json');
const invoicePreviewTax = require('../../payments/fixtures/stripe/invoice_preview_tax.json');
const newSetupIntent = require('../../payments/fixtures/stripe/setup_intent_new.json');
const paymentMethodFixture = require('../../payments/fixtures/stripe/payment_method.json');

const currencyHelper = new CurrencyHelper({
  currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
});
const mockCapabilityService = {};

let config, log, db, customs, push, mailer, profile;

const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');

const ACCOUNT_LOCALE = 'en-US';
const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const NOW = Date.now();
const PLAN_ID_1 = 'plan_G93lTs8hfK7NNG';
const PLANS = [
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
      downloadURL: 'http://getfirefox.com',
      capabilities: 'exampleCap0',
      'capabilities:client1': 'exampleCap1',
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
    product_metadata: {
      'capabilities:client2': 'exampleCap2, exampleCap4',
    },
  },
  {
    plan_id: PLAN_ID_1,
    product_id: 'prod_G93l8Yn7XJHYUs',
    product_name: 'FN Tier 1',
    interval: 'month',
    amount: 499,
    current: 'usd',
    plan_metadata: {
      'capabilities:client1': 'exampleCap3',
      // NOTE: whitespace in capabilities list should be flexible for human entry
      'capabilities:client2': 'exampleCap5,exampleCap6,   exampleCap7',
    },
    product_metadata: {},
  },
];
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

/**
 * To prevent the modification of the test objects loaded, which can impact other tests referencing the object,
 * a deep copy of the object can be created which uses the test object as a template
 *
 * @param {Object} object
 */
function deepCopy(object) {
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
          downloadURL: 'http://getfirefox.com',
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

    assert.deepEqual(sanitizePlans(PLANS), expected);
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
      },
      currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
      support: {
        ticketPayloadLimit: 131072,
      },
    };
    Container.set(AppConfig, config);

    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);
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
    db.createAccountSubscription = sinon.spy(async (data) => ({}));
    db.deleteAccountSubscription = sinon.spy(
      async (uid, subscriptionId) => ({})
    );
    db.cancelAccountSubscription = sinon.spy(async () => ({}));
    db.fetchAccountSubscriptions = sinon.spy(async (uid) =>
      ACTIVE_SUBSCRIPTIONS.filter((s) => s.uid === uid)
    );
    db.getAccountSubscription = sinon.spy(async (uid, subscriptionId) => {
      const subscription = ACTIVE_SUBSCRIPTIONS.filter(
        (s) => s.uid === uid && s.subscriptionId === subscriptionId
      )[0];
      if (typeof subscription === 'undefined') {
        throw { statusCode: 404, errno: 116 };
      }
      return subscription;
    });

    push = mocks.mockPush();
    mailer = mocks.mockMailer();

    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async (uid) => ({})),
    });
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  const VALID_REQUEST = {
    auth: {
      credentials: {
        scope: MOCK_SCOPES,
        user: `${UID}`,
        email: `${TEST_EMAIL}`,
      },
    },
  };

  describe('Plans', () => {
    it('should list available subscription plans', async () => {
      const stripeHelper = mocks.mockStripeHelper(['allAbbrevPlans']);

      stripeHelper.allAbbrevPlans = sinon.spy(async () => {
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
      assert.deepEqual(res, sanitizePlans(PLANS));
    });
  });

  describe('listActive', () => {
    it('should list active subscriptions', async () => {
      const stripeHelper = mocks.mockStripeHelper(['fetchCustomer']);

      stripeHelper.fetchCustomer = sinon.spy(async (uid, customer) => {
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
      assert.deepEqual(res, expected);
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

  let db;

  before(() => {
    db = mocks.mockDB({
      uid: AUTH_UID,
      email: DB_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
  });

  it('throws an error when the scope is invalid', async () => {
    return handleAuth(db, INVALID_AUTH).then(
      () => Promise.reject(new Error('Method expected to reject')),
      (err) => {
        assert.instanceOf(err, WError);
        assert.equal(err.message, 'Requested scopes are not allowed');
      }
    );
  });

  describe('when fetchEmail is set to false', () => {
    it('returns the uid and the email from the auth header', async () => {
      const actual = await handleAuth(db, VALID_AUTH);
      assert.equal(actual.uid, AUTH_UID);
      assert.equal(actual.email, AUTH_EMAIL);
    });
  });

  describe('when fetchEmail is set to true', () => {
    it('returns the uid from the auth credentials and fetches the email from the database', async () => {
      const actual = await handleAuth(db, VALID_AUTH, true);
      assert.equal(actual.uid, AUTH_UID);
      assert.equal(actual.email, DB_EMAIL);
      assert.equal(actual.account.email, DB_EMAIL);
    });

    it('should propogate errors from database', async () => {
      let failed = false;

      db.account = sinon.spy(async () => {
        throw error.unknownAccount();
      });

      await handleAuth(db, VALID_AUTH, true).then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err) => {
          failed = true;
          assert.equal(err.message, 'Unknown account');
        }
      );

      assert.isTrue(failed);
    });
  });
});

describe('DirectStripeRoutes', () => {
  let sandbox;
  let directStripeRoutesInstance;

  const VALID_REQUEST = {
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
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async (uid) => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
      verifierSetAt: 0,
    });
    const stripeHelperMock = sandbox.createStubInstance(StripeHelper);
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
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('extractPromotionCode', () => {
    it('should extract a valid PromotionCode', async () => {
      const promotionCode = { coupon: { id: 'test-code' } };
      directStripeRoutesInstance.stripeHelper.findValidPromoCode.resolves(
        promotionCode
      );
      const res = await directStripeRoutesInstance.extractPromotionCode(
        'promo1',
        'plan1'
      );
      assert.equal(res, promotionCode);
    });

    it('should throw an error if on invalid promotion code', async () => {
      directStripeRoutesInstance.stripeHelper.findValidPromoCode.resolves(
        undefined
      );
      try {
        await directStripeRoutesInstance.extractPromotionCode(
          'promo1',
          'plan1'
        );
        assert.fail('Expected to throw an error');
      } catch (err) {
        assert.equal(err.message, 'Invalid promotion code');
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

      assert.isTrue(
        directStripeRoutesInstance.profile.deleteCache.calledOnceWith(UID),
        'Expected profile.deleteCache to be called once'
      );

      assert.isTrue(
        directStripeRoutesInstance.push.notifyProfileUpdated.calledOnceWith(
          UID,
          VALID_REQUEST.app.devices
        ),
        'Expected push.notifyProfileUpdated to be called once'
      );

      assert.isTrue(
        directStripeRoutesInstance.log.notifyAttachedServices.calledOnceWith(
          'profileDataChanged',
          VALID_REQUEST,
          { uid: UID, email: TEST_EMAIL }
        ),
        'Expected log.notifyAttachedServices to be called'
      );
    });
  });

  describe('getClients', () => {
    it('returns the clients and their capabilities', async () => {
      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.resolves(PLANS);

      const expected = [
        {
          clientId: 'client1',
          capabilities: ['exampleCap0', 'exampleCap1', 'exampleCap3'],
        },
        {
          clientId: 'client2',
          capabilities: [
            'exampleCap0',
            'exampleCap2',
            'exampleCap4',
            'exampleCap5',
            'exampleCap6',
            'exampleCap7',
          ],
        },
      ];

      const actual = await directStripeRoutesInstance.getClients();
      assert.deepEqual(actual, expected, 'Clients were not returned correctly');
    });
  });

  describe('createCustomer', () => {
    it('creates a stripe customer', async () => {
      const expected = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.createPlainCustomer.resolves(
        expected
      );
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.createCustomer(
        VALID_REQUEST
      );

      assert.deepEqual(filterCustomer(expected), actual);
    });
  });

  describe('previewInvoice', () => {
    it('returns the preview invoice', async () => {
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoice.resolves(expected);
      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {};
      const actual = await directStripeRoutesInstance.previewInvoice(
        VALID_REQUEST
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.customs.checkIpOnly,
        VALID_REQUEST,
        'previewInvoice'
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.previewInvoice,
        { country: 'US', promotionCode: 'promotionCode', priceId: 'priceId' }
      );
      assert.deepEqual(stripeInvoiceToFirstInvoicePreviewDTO(expected), actual);
    });
  });

  describe('subsequentInvoicePreview', () => {
    it('returns the next invoice', async () => {
      const expected = deepCopy(invoicePreviewTax);
      directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId.resolves(
        expected
      );
      VALID_REQUEST.payload = {
        subscriptionId: 'sub_id',
      };
      VALID_REQUEST.app.geo = {};
      const actual = await directStripeRoutesInstance.subsequentInvoicePreview(
        VALID_REQUEST
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.customs.checkIpOnly,
        VALID_REQUEST,
        'subsequentInvoicePreview'
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.previewInvoiceBySubscriptionId,
        { subscriptionId: 'sub_id' }
      );
      assert.deepEqual(
        stripeInvoiceToSubsequentInvoicePreviewDTO(expected),
        actual
      );
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

      directStripeRoutesInstance.stripeHelper.retrieveCouponDetails.resolves(
        expected
      );

      VALID_REQUEST.payload = {
        promotionCode: 'promotionCode',
        priceId: 'priceId',
      };
      VALID_REQUEST.app.geo = {};

      const actual = await directStripeRoutesInstance.retrieveCouponDetails(
        VALID_REQUEST
      );

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.retrieveCouponDetails,
        { country: 'US', promotionCode: 'promotionCode', priceId: 'priceId' }
      );

      assert.deepEqual(actual, expected);
    });
  });

  describe('createSubscriptionWithPMI', () => {
    let plan, paymentMethod;

    beforeEach(() => {
      plan = deepCopy(PLANS[2]);
      plan.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.findPlanById.resolves(plan);
      sandbox.stub(directStripeRoutesInstance, 'customerChanged').resolves();
      paymentMethod = deepCopy(paymentMethodFixture);
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.resolves(
        paymentMethod
      );
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);
      directStripeRoutesInstance.stripeHelper.setCustomerLocation.resolves();
    });

    it('creates a subscription with a payment method', async () => {
      const sourceCountry = 'US';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.returns(false);
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.resolves({});
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.createSubscriptionWithPMI(
        VALID_REQUEST
      );

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod,
        VALID_REQUEST.payload.paymentMethodId
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.taxRateByCountryCode,
        'US'
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.customerTaxId
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation,
        {
          customerId: emptyCustomer.id,
          postalCode: paymentMethod.billing_details.address.postal_code,
          country: 'US',
        }
      );

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );
    });

    it('creates a subscription with a payment method and promotion code', async () => {
      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.returns(false);
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.resolves({});
      directStripeRoutesInstance.extractPromotionCode = sinon.stub().resolves({
        coupon: { id: 'couponId' },
      });
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        promotionCode: 'promotionCode',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.createSubscriptionWithPMI(
        VALID_REQUEST
      );

      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.taxRateByCountryCode,
        'US'
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.customerTaxId
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer
      );

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI,
        {
          customerId: 'cus_new',
          priceId: 'Jane Doe',
          paymentMethodId: 'pm_asdf',
          promotionCode: {
            coupon: { id: 'couponId' },
          },
          subIdempotencyKey: `${VALID_REQUEST.payload.idempotencyKey}-createSub`,
          taxRateId: undefined,
        }
      );
    });

    it('errors when a customer has not been created', async () => {
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(undefined);
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        assert.fail('Create subscription without a customer should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('errors if the planCurrency does not match the paymentMethod country', async () => {
      plan.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.findPlanById.resolves(plan);
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.createSubscriptionWithPMI(
          VALID_REQUEST
        );
        assert.fail('Create subscription with wrong planCurrency should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.INVALID_REGION);
        assert.equal(
          err.message,
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('errors if the paymentMethod country does not match the planCurrency', async () => {
      paymentMethod.card.country = 'FR';
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.resolves(
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
        assert.fail('Create subscription with wrong planCurrency should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.INVALID_REGION);
        assert.equal(
          err.message,
          'Funding source country does not match plan currency.'
        );
      }
    });

    it('creates a subscription without an payment id in the request', async () => {
      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      const idempotencyKey = uuidv4();

      VALID_REQUEST.payload = {
        priceId: 'quux',
        idempotencyKey,
      };

      const actual = await directStripeRoutesInstance.createSubscriptionWithPMI(
        VALID_REQUEST
      );

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI,
        {
          customerId: customer.id,
          priceId: 'quux',
          promotionCode: undefined,
          paymentMethodId: undefined,
          subIdempotencyKey: `${idempotencyKey}-createSub`,
          taxRateId: undefined,
        }
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
    });

    it('sends an email when the fxa account is a stub', async () => {
      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      const idempotencyKey = uuidv4();

      VALID_REQUEST.payload = {
        priceId: 'quux',
        idempotencyKey,
      };
      await directStripeRoutesInstance.createSubscriptionWithPMI(VALID_REQUEST);
      sinon.assert.calledOnce(mailer.sendSubscriptionAccountFinishSetupEmail);
    });

    it('reports to Sentry if when the customer location cannot be set', async () => {
      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');

      delete paymentMethod.billing_details.address;
      const sourceCountry = 'US';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        subscription2
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.returns(false);
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.resolves({});
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.createSubscriptionWithPMI(
        VALID_REQUEST
      );

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod,
        VALID_REQUEST.payload.paymentMethodId
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.taxRateByCountryCode,
        'US'
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.customerTaxId
      );
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer
      );

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );

      // Everything else worked but there was a Sentry error for not settinng the
      // location of the customer
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      );
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'createSubscriptionWithPMI',
        {
          customerId: emptyCustomer.id,
          subscriptionId: subscription2.id,
          paymentMethodId: paymentMethod.id,
        }
      );
      sinon.assert.calledOnceWithExactly(
        Sentry.captureMessage,
        `Cannot find a postal code for customer.`,
        Sentry.Severity.Error
      );
    });

    it('does not report to Sentry if the customer has a payment method on file', async () => {
      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');

      delete paymentMethod.billing_details.address;
      const sourceCountry = 'US';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        subscription2
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.returns(false);
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.resolves({});
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.createSubscriptionWithPMI(
        VALID_REQUEST
      );

      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.taxRateByCountryCode
      );
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.customerTaxId
      );
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer
      );

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      );
      sinon.assert.notCalled(sentryScope.setContext);
      sinon.assert.notCalled(Sentry.captureMessage);
    });

    it('skips location lookup when source country is not needed', async () => {
      const sourceCountry = 'DE';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      directStripeRoutesInstance.stripeHelper.customerTaxId.returns(false);
      directStripeRoutesInstance.stripeHelper.addTaxIdToCustomer.resolves({});
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');

      await directStripeRoutesInstance.createSubscriptionWithPMI(VALID_REQUEST);
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      );
      sinon.assert.notCalled(Sentry.withScope);
    });
  });

  describe('retryInvoice', () => {
    it('retries the invoice with the payment method', async () => {
      const customer = deepCopy(emptyCustomer);
      dbStub.getAccountCustomerByUid.resolves({
        stripeCustomerId: customer.id,
      });
      const expected = deepCopy(openInvoice);
      directStripeRoutesInstance.stripeHelper.retryInvoiceWithPaymentId.resolves(
        expected
      );
      sinon.stub(directStripeRoutesInstance, 'customerChanged').resolves();
      VALID_REQUEST.payload = {
        invoiceId: 'in_testinvoice',
        paymentMethodId: 'pm_asdf',
        idempotencyKey: uuidv4(),
      };

      const actual = await directStripeRoutesInstance.retryInvoice(
        VALID_REQUEST
      );

      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );

      assert.deepEqual(filterInvoice(expected), actual);
    });

    it('errors when a customer has not been created', async () => {
      dbStub.getAccountCustomerByUid.resolves({});
      VALID_REQUEST.payload = {
        displayName: 'Jane Doe',
        idempotencyKey: uuidv4(),
      };
      try {
        await directStripeRoutesInstance.retryInvoice(VALID_REQUEST);
        assert.fail('Create customer should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('createSetupIntent', () => {
    it('creates a new setup intent', async () => {
      const customer = deepCopy(emptyCustomer);
      dbStub.getAccountCustomerByUid.resolves({
        stripeCustomerId: customer.id,
      });
      const expected = deepCopy(newSetupIntent);
      directStripeRoutesInstance.stripeHelper.createSetupIntent.resolves(
        expected
      );
      VALID_REQUEST.payload = {};

      const actual = await directStripeRoutesInstance.createSetupIntent(
        VALID_REQUEST
      );

      assert.deepEqual(filterIntent(expected), actual);
    });

    it('errors when a customer has not been created', async () => {
      VALID_REQUEST.payload = {};
      dbStub.getAccountCustomerByUid.resolves({});
      try {
        await directStripeRoutesInstance.createSetupIntent(VALID_REQUEST);
        assert.fail('Create customer should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('updateDefaultPaymentMethod', () => {
    let paymentMethod;
    beforeEach(() => {
      paymentMethod = deepCopy(paymentMethodFixture);
      directStripeRoutesInstance.stripeHelper.getPaymentMethod.resolves(
        paymentMethod
      );
    });

    it('updates the default payment method', async () => {
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(0)
        .resolves(customer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(1)
        .resolves(expected);
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.resolves(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.resolves([
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

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod,
        VALID_REQUEST.payload.paymentMethodId
      );
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation,
        {
          customerId: customer.id,
          postalCode: paymentMethodFixture.billing_details.address.postal_code,
          country: paymentMethodFixture.card.country,
        }
      );
      assert.deepEqual(filterCustomer(expected), actual);
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.removeSources
      );
    });

    it('errors when a customer currency does not match new paymentMethod country', async () => {
      // Payment method country already set to US in beforeEach;
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);

      try {
        await directStripeRoutesInstance.updateDefaultPaymentMethod(
          VALID_REQUEST
        );
        assert.fail(
          'Update default payment method with new payment method country that does not match customer currency should fail.'
        );
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.INVALID_REGION);
        assert.equal(
          err.message,
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
        assert.fail('Create customer should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('reports to Sentry if when the customer location cannot be set', async () => {
      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');

      delete paymentMethod.billing_details.address;
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(0)
        .resolves(customer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(1)
        .resolves(expected);
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.resolves(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.resolves([
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

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.getPaymentMethod,
        VALID_REQUEST.payload.paymentMethodId
      );
      assert.deepEqual(filterCustomer(expected), actual);
      sinon.assert.calledOnce(
        directStripeRoutesInstance.stripeHelper.removeSources
      );

      // Everything else worked but there was a Sentry error for not settinng
      // the location of the customer
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      );
      sinon.assert.calledOnceWithExactly(
        sentryScope.setContext,
        'updateDefaultPaymentMethod',
        {
          customerId: customer.id,
          paymentMethodId: paymentMethod.id,
        }
      );
      sinon.assert.calledOnceWithExactly(
        Sentry.captureMessage,
        `Cannot find a postal code or country for customer.`,
        Sentry.Severity.Error
      );
    });

    it('skips location lookup when source country is not needed', async () => {
      const customer = deepCopy(emptyCustomer);
      customer.currency = 'USD';
      paymentMethod.card.country = 'GB';
      const paymentMethodId = 'card_1G9Vy3Kb9q6OnNsLYw9Zw0Du';
      const sentryScope = { setContext: sandbox.stub() };
      sandbox.stub(Sentry, 'withScope').callsFake((cb) => cb(sentryScope));
      sandbox.stub(Sentry, 'captureMessage');

      const expected = deepCopy(emptyCustomer);
      expected.invoice_settings.default_payment_method = paymentMethodId;

      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(0)
        .resolves(customer);
      directStripeRoutesInstance.stripeHelper.fetchCustomer
        .onCall(1)
        .resolves(expected);
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.resolves(
        {
          ...customer,
          invoice_settings: { default_payment_method: paymentMethodId },
        }
      );
      directStripeRoutesInstance.stripeHelper.removeSources.resolves([
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

      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.setCustomerLocation
      );
      sinon.assert.notCalled(Sentry.withScope);
    });
  });

  describe('detachFailedPaymentMethod', () => {
    it('calls stripe helper to detach the payment method', async () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data[0].status = 'incomplete';
      const paymentMethodId = 'pm_9001';
      const expected = { id: paymentMethodId, isGood: 'yep' };

      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);
      directStripeRoutesInstance.stripeHelper.detachPaymentMethod.resolves(
        expected
      );

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      const actual = await directStripeRoutesInstance.detachFailedPaymentMethod(
        VALID_REQUEST
      );

      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.detachPaymentMethod,
        paymentMethodId
      );
    });

    it('does not detach if the subscription is not "incomplete"', async () => {
      const customer = deepCopy(customerFixture);
      const paymentMethodId = 'pm_9001';
      const resp = { id: paymentMethodId, isGood: 'yep' };

      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);
      directStripeRoutesInstance.stripeHelper.detachPaymentMethod.resolves(
        resp
      );

      VALID_REQUEST.payload = {
        paymentMethodId,
      };
      const actual = await directStripeRoutesInstance.detachFailedPaymentMethod(
        VALID_REQUEST
      );

      assert.deepEqual(actual, { id: paymentMethodId });
      sinon.assert.notCalled(
        directStripeRoutesInstance.stripeHelper.detachPaymentMethod
      );
    });

    it('errors when a customer has not been created', async () => {
      VALID_REQUEST.payload = { paymentMethodId: 'pm_asdf' };
      try {
        await directStripeRoutesInstance.detachFailedPaymentMethod(
          VALID_REQUEST
        );
        assert.fail(
          'Detaching a payment method from a non-existent customer should fail.'
        );
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });
  });

  describe('deleteSubscription', () => {
    const deleteSubRequest = {
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

      directStripeRoutesInstance.stripeHelper.cancelSubscriptionForCustomer.resolves();
      const actual = await directStripeRoutesInstance.deleteSubscription(
        deleteSubRequest
      );

      assert.deepEqual(actual, expected);
    });
  });

  describe('reactivateSubscription', () => {
    const reactivateRequest = {
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
      directStripeRoutesInstance.stripeHelper.reactivateSubscriptionForCustomer.resolves();
      const actual = await directStripeRoutesInstance.reactivateSubscription(
        reactivateRequest
      );

      assert.isEmpty(actual);
    });
  });

  describe('updateSubscription', () => {
    let plan;

    beforeEach(() => {
      directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.resolves(
        subscription2
      );
      VALID_REQUEST.params = { subscriptionId: subscription2.subscriptionId };

      const customer = deepCopy(customerFixture);
      customer.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(customer);

      plan = deepCopy(PLANS[0]);
      plan.currency = 'USD';
      directStripeRoutesInstance.stripeHelper.findPlanById.resolves(plan);
      VALID_REQUEST.payload = { planId: plan.planId };
    });

    it('returns the subscription id when the plan is a valid upgrade', async () => {
      const subscriptionId = 'sub_123';
      const expected = { subscriptionId: subscriptionId };
      VALID_REQUEST.params = { subscriptionId: subscriptionId };

      directStripeRoutesInstance.stripeHelper.verifyPlanUpdateForSubscription.resolves();
      directStripeRoutesInstance.stripeHelper.changeSubscriptionPlan.resolves();

      sinon.stub(directStripeRoutesInstance, 'customerChanged').resolves();

      const actual = await directStripeRoutesInstance.updateSubscription(
        VALID_REQUEST
      );

      assert.deepEqual(actual, expected);
    });

    it("throws an error when the new plan currency doesn't match the customer's currency.", async () => {
      plan.currency = 'EUR';
      directStripeRoutesInstance.stripeHelper.findPlanById.resolves(plan);

      try {
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);
        assert.fail(
          'Update subscription with wrong plan currency should fail.'
        );
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.INVALID_REGION);
        assert.equal(err.message, 'Changing currencies is not permitted.');
      }
    });

    it('throws an exception when the orginal subscription is not found', async () => {
      directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.resolves();
      try {
        await directStripeRoutesInstance.updateSubscription(VALID_REQUEST);
        assert.fail('Method expected to reject');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
        assert.equal(err.message, 'Unknown subscription');
      }
    });
  });

  describe('getProductName', () => {
    it('should respond with product name for valid id', async () => {
      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.resolves(PLANS);
      const productId = PLANS[1].product_id;
      const expected = { product_name: PLANS[1].product_name };
      const result = await directStripeRoutesInstance.getProductName({
        auth: {},
        query: { productId },
      });
      assert.deepEqual(expected, result);
    });

    it('should respond with an error for invalid id', async () => {
      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.resolves(PLANS);
      const productId = 'this-is-not-valid';
      try {
        await directStripeRoutesInstance.getProductName({
          auth: {},
          query: { productId },
        });
        assert.fail('Getting a product name should fail.');
      } catch (err) {
        assert.instanceOf(err, WError);
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
      }
    });
  });

  describe('listPlans', () => {
    it('returns the available plans without auth headers present', async () => {
      const expected = sanitizePlans(PLANS);
      const request = {};

      directStripeRoutesInstance.stripeHelper.allAbbrevPlans.resolves(PLANS);
      const actual = await directStripeRoutesInstance.listPlans(request);

      assert.deepEqual(actual, expected);
    });
  });

  describe('listActive', () => {
    describe('customer is found', () => {
      describe('customer has no subscriptions', () => {
        it('returns an empty array', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            emptyCustomer
          );
          const expected = [];
          const actual = await directStripeRoutesInstance.listActive(
            VALID_REQUEST
          );
          assert.deepEqual(actual, expected);
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

          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );

          const activeSubscriptions =
            await directStripeRoutesInstance.listActive(VALID_REQUEST);

          assert.lengthOf(activeSubscriptions, 4);
          assert.isDefined(
            activeSubscriptions.find(
              (x) => x.subscriptionId === subscription2.id
            )
          );
          assert.isDefined(
            activeSubscriptions.find(
              (x) => x.subscriptionId === trialSubscription.id
            )
          );
          assert.isDefined(
            activeSubscriptions.find(
              (x) => x.subscriptionId === pastDueSubscription.id
            )
          );
          assert.isDefined(
            activeSubscriptions.find(
              (x) => x.subscriptionId === setToCancelSubscription.id
            )
          );
          assert.isUndefined(
            activeSubscriptions.find(
              (x) => x.subscriptionId === cancelledSubscription.id
            )
          );
        });
      });
    });

    describe('customer is not found', () => {
      it('returns an empty array', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves();
        const expected = [];
        const actual = await directStripeRoutesInstance.listActive(
          VALID_REQUEST
        );
        assert.deepEqual(actual, expected);
      });
    });
  });

  describe('getCustomer', () => {
    describe('customer is found', () => {
      const mockResp = {
        subscriptions: [
          {
            _subscription_type: 'web',
            subscription_id: 'sub_1JhyIYBVqmGyQTMa3XMF6ADj',
          },
        ],
        payment_provider: 'dinersclub',
      };

      it('calls getBillingDetailsAndSubscriptions on StripeHelper', async () => {
        directStripeRoutesInstance.stripeHelper.getBillingDetailsAndSubscriptions.resolves(
          mockResp
        );
        const resp = await directStripeRoutesInstance.getCustomer(
          VALID_REQUEST
        );
        sinon.assert.calledOnceWithExactly(
          directStripeRoutesInstance.stripeHelper
            .getBillingDetailsAndSubscriptions,
          VALID_REQUEST.auth.credentials.user
        );
        assert.deepEqual(resp, mockResp);
      });

      it('throws when the customer has no subscriptions', async () => {
        directStripeRoutesInstance.stripeHelper.getBillingDetailsAndSubscriptions.resolves(
          { ...mockResp, subscriptions: [] }
        );
        try {
          await directStripeRoutesInstance.getCustomer(VALID_REQUEST);
          assert.fail('An error should have been thrown');
        } catch (err) {
          assert.strictEqual(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        }

        sinon.assert.calledOnceWithExactly(
          directStripeRoutesInstance.stripeHelper
            .getBillingDetailsAndSubscriptions,
          VALID_REQUEST.auth.credentials.user
        );
      });
    });

    describe('customer is not found', () => {
      it('throws an error', async () => {
        directStripeRoutesInstance.stripeHelper.getBillingDetailsAndSubscriptions.resolves(
          null
        );

        try {
          await directStripeRoutesInstance.getCustomer(VALID_REQUEST);
          assert.fail(
            'getCustomer should throw an error when a customer is not returned.'
          );
        } catch (err) {
          assert.strictEqual(
            err.errno,
            error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER
          );
          assert.strictEqual(err.message, 'Unknown customer');
          assert.strictEqual(err.output.payload['uid'], UID);
        }
        sinon.assert.calledOnceWithExactly(
          directStripeRoutesInstance.stripeHelper
            .getBillingDetailsAndSubscriptions,
          VALID_REQUEST.auth.credentials.user
        );
      });
    });
  });
});
