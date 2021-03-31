/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = require('chai').assert;
const { Container } = require('typedi');
const uuid = require('uuid');
const { getRoute } = require('../../../routes_helpers');
const mocks = require('../../../mocks');
const error = require('../../../../lib/error');
const { StripeHelper } = require('../../../../lib/payments/stripe');
const { CurrencyHelper } = require('../../../../lib/payments/currencies');
const WError = require('verror').WError;
const uuidv4 = require('uuid').v4;

const {
  sanitizePlans,
  handleAuth,
  DirectStripeRoutes,
} = require('../../../../lib/routes/subscriptions');

const {
  filterCustomer,
  filterSubscription,
  filterInvoice,
  filterIntent,
} = require('fxa-shared').subscriptions.stripe;

const subscription2 = require('../../payments/fixtures/stripe/subscription2.json');
const cancelledSubscription = require('../../payments/fixtures/stripe/subscription_cancelled.json');
const trialSubscription = require('../../payments/fixtures/stripe/subscription_trialing.json');
const pastDueSubscription = require('../../payments/fixtures/stripe/subscription_past_due.json');
const customerFixture = require('../../payments/fixtures/stripe/customer1.json');
const customerPMIExpanded = require('../../payments/fixtures/stripe/customer_new_pmi_default_invoice_expanded.json');
const multiPlanSubscription = require('../../payments/fixtures/stripe/subscription_multiplan.json');
const emptyCustomer = require('../../payments/fixtures/stripe/customer_new.json');
const subscriptionUpdatedFromIncomplete = require('../../payments/fixtures/stripe/subscription_updated_from_incomplete.json');
const openInvoice = require('../../payments/fixtures/stripe/invoice_open.json');
const newSetupIntent = require('../../payments/fixtures/stripe/setup_intent_new.json');
const stripePlan = require('../../payments/fixtures/stripe/plan1.json');
const paymentMethodFixture = require('../../payments/fixtures/stripe/payment_method.json');

const currencyHelper = new CurrencyHelper({
  currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
});
Container.set(CurrencyHelper, currencyHelper);

let config,
  log,
  db,
  customs,
  push,
  mailer,
  profile,
  routes,
  route,
  request,
  requestOptions;

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';

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
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];

function runTest(routePath, requestOptions, payments = null) {
  routes = require('../../../../lib/routes/subscriptions')(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    payments
  );
  route = getRoute(routes, routePath, requestOptions.method || 'GET');
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));

  return route.handler(request);
}

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
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_1234',
        paypalNvpSigCredentials: {
          enabled: true,
        },
      },
      currenciesToCountries: { USD: ['US', 'GB', 'CA'] },
    };

    const currencyHelper = new CurrencyHelper(config);
    Container.set(CurrencyHelper, currencyHelper);

    log = mocks.mockLog();
    customs = mocks.mockCustoms();

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
      const stripeHelper = mocks.mockStripeHelper(['allPlans']);

      stripeHelper.allPlans = sinon.spy(async () => {
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
      const stripeHelper = mocks.mockStripeHelper(['customer']);

      stripeHelper.customer = sinon.spy(async (uid, customer) => {
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

  describe('GET /oauth/subscriptions/search', () => {
    let reqOpts, stripeHelper;
    const customer = deepCopy(customerFixture);

    beforeEach(() => {
      customer.subscriptions.data[0].metadata = {
        previous_plan_id: 'plan_123',
        plan_change_date: '1588962638',
      };
      reqOpts = {
        ...requestOptions,
        method: 'GET',
        query: { uid: UID, email: 'testo@blackhole.example.io' },
        auth: { strategy: 'supportPanelSecret' },
      };

      stripeHelper = sinon.createStubInstance(StripeHelper);
      stripeHelper.customer.resolves(customer);
      stripeHelper.expandResource.resolves(stripePlan);
      stripeHelper.findPlanById.resolves(PLANS[0]);
      stripeHelper.formatSubscriptionsForSupport.restore();
    });

    it('should return a formatted list of subscriptions in the customer response', async () => {
      const sub = customer.subscriptions.data[0];
      const expected = [
        {
          created: sub.created,
          current_period_end: sub.current_period_end,
          current_period_start: sub.current_period_start,
          plan_changed: 1588962638,
          previous_product: PLANS[0].product_name,
          product_name: stripePlan.name,
          status: sub.status,
          subscription_id: sub.id,
        },
      ];

      const response = await runTest(
        '/oauth/subscriptions/search',
        reqOpts,
        stripeHelper
      );
      sinon.assert.calledOnceWithExactly(stripeHelper.customer, {
        uid: reqOpts.query.uid,
        email: reqOpts.query.email,
      });
      assert.deepEqual(response, expected);
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
      const expected = { uid: AUTH_UID, email: AUTH_EMAIL };
      const actual = await handleAuth(db, VALID_AUTH);
      assert.deepEqual(actual, expected);
    });
  });

  describe('when fetchEmail is set to true', () => {
    it('returns the uid from the auth credentials and fetches the email from the database', async () => {
      const expected = { uid: AUTH_UID, email: DB_EMAIL };
      const actual = await handleAuth(db, VALID_AUTH, true);
      assert.deepEqual(actual, expected);
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

  describe('customerChanged', () => {
    it('Creates profile update push notification and logs profile changed event', async () => {
      await directStripeRoutesInstance.customerChanged(
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );

      sinon.assert.calledOnceWithExactly(
        directStripeRoutesInstance.stripeHelper.refreshCachedCustomer,
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
      directStripeRoutesInstance.stripeHelper.allPlans.resolves(PLANS);

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
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
    });

    it('creates a subscription with a payment method', async () => {
      const sourceCountry = 'us';
      directStripeRoutesInstance.stripeHelper.extractSourceCountryFromSubscription.returns(
        sourceCountry
      );
      const expected = deepCopy(subscription2);
      directStripeRoutesInstance.stripeHelper.createSubscriptionWithPMI.resolves(
        expected
      );
      VALID_REQUEST.payload = {
        priceId: 'Jane Doe',
        paymentMethodId: 'pm_asdf',
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

      assert.deepEqual(
        {
          sourceCountry,
          subscription: filterSubscription(expected),
        },
        actual
      );
    });

    it('errors when a customer has not been created', async () => {
      directStripeRoutesInstance.stripeHelper.customer.resolves(undefined);
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
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
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
          paymentMethodId: undefined,
          subIdempotencyKey: `${idempotencyKey}-createSub`,
        }
      );
      sinon.assert.calledWith(
        directStripeRoutesInstance.customerChanged,
        VALID_REQUEST,
        UID,
        TEST_EMAIL
      );
    });
  });

  describe('retryInvoice', () => {
    it('retries the invoice with the payment method', async () => {
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
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
      directStripeRoutesInstance.stripeHelper.customer.resolves(undefined);
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
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
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
    beforeEach(() => {
      const paymentMethod = deepCopy(paymentMethodFixture);
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

      directStripeRoutesInstance.stripeHelper.customer
        .onCall(0)
        .resolves(customer);
      directStripeRoutesInstance.stripeHelper.customer
        .onCall(1)
        .resolves(expected);
      directStripeRoutesInstance.stripeHelper.updateDefaultPaymentMethod.resolves(
        customer
      );
      directStripeRoutesInstance.stripeHelper.removeSources.resolves([
        {},
        {},
        {},
      ]);

      VALID_REQUEST.payload = {
        paymentMethodId,
      };

      const actual = await directStripeRoutesInstance.updateDefaultPaymentMethod(
        VALID_REQUEST
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
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);

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
  });

  describe('detachFailedPaymentMethod', () => {
    it('calls stripe helper to detach the payment method', async () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data[0].status = 'incomplete';
      const paymentMethodId = 'pm_9001';
      const expected = { id: paymentMethodId, isGood: 'yep' };

      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
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

      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
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

  describe('findCustomerSubscriptionByProductId', () => {
    describe('Customer has Single One-Plan Subscription', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [subscription2];
      it('returns the Subscription when the plan id is found', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByProductId(
          customer,
          customer.subscriptions.data[0].items.data[0].plan.product
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByProductId(
            customer,
            'prod_test2'
          )
        );
      });
    });

    describe('Customer has Single Multi-Plan Subscription', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription];

      it('returns the Subscription when the product id is found - first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByProductId(
          customer,
          'prod_GgIk7jEVeDK06M'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the product id is found - not first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByProductId(
          customer,
          'prod_GgIlYvvmpprKAy'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByProductId(
            customer,
            'prod_3'
          )
        );
      });
    });

    describe('Customer has Multiple Subscriptions', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription, subscription2];

      it('returns the Subscription when the product id is found in the first subscription', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByProductId(
          customer,
          'prod_GgIk7jEVeDK06M'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the product id is found in not the first subscription', () => {
        const expected = customer.subscriptions.data[1];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByProductId(
          customer,
          'prod_G93mdk6bGPJ7wy'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the product id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByProductId(
            customer,
            'product_test2'
          )
        );
      });
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
      directStripeRoutesInstance.stripeHelper.customer.resolves(customer);

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
      directStripeRoutesInstance.stripeHelper.allPlans.resolves(PLANS);
      const productId = PLANS[1].product_id;
      const expected = { product_name: PLANS[1].product_name };
      const result = await directStripeRoutesInstance.getProductName({
        auth: {},
        query: { productId },
      });
      assert.deepEqual(expected, result);
    });

    it('should respond with an error for invalid id', async () => {
      directStripeRoutesInstance.stripeHelper.allPlans.resolves(PLANS);
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
    it('returns the available plans when auth headers are valid', async () => {
      const expected = sanitizePlans(PLANS);

      directStripeRoutesInstance.stripeHelper.allPlans.resolves(PLANS);
      const actual = await directStripeRoutesInstance.listPlans(VALID_REQUEST);

      assert.deepEqual(actual, expected);
    });

    it('results in an error when auth headers are invalid', async () => {
      const invalid_request = {
        auth: {
          credentials: {
            scope: ['profile'],
            user: `${UID}`,
            email: `${TEST_EMAIL}`,
          },
        },
      };

      return directStripeRoutesInstance.listPlans(invalid_request).then(
        () => Promise.reject(new Error('Method expected to reject')),
        (err) => {
          assert.instanceOf(err, WError);
          assert.equal(err.message, 'Requested scopes are not allowed');
        }
      );
    });
  });

  describe('getProductCapabilties', () => {
    it('extracts all capabilities for all products', async () => {
      directStripeRoutesInstance.stripeHelper.allPlans.resolves(PLANS);
      assert.deepEqual(
        await directStripeRoutesInstance.getProductCapabilities(
          'firefox_pro_basic'
        ),
        ['exampleCap0', 'exampleCap1']
      );
      assert.deepEqual(
        await directStripeRoutesInstance.getProductCapabilities(
          'prod_G93l8Yn7XJHYUs'
        ),
        ['exampleCap3', 'exampleCap5', 'exampleCap6', 'exampleCap7']
      );
    });
  });

  describe('listActive', () => {
    describe('customer is found', () => {
      describe('customer has no subscriptions', () => {
        it('returns an empty array', async () => {
          directStripeRoutesInstance.stripeHelper.customer.resolves(
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

          directStripeRoutesInstance.stripeHelper.customer.resolves(customer);

          const activeSubscriptions = await directStripeRoutesInstance.listActive(
            VALID_REQUEST
          );

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
        directStripeRoutesInstance.stripeHelper.customer.resolves();
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
      let customer;

      beforeEach(() => {
        customer = deepCopy(emptyCustomer);
        directStripeRoutesInstance.stripeHelper.subscriptionsToResponse.resolves(
          []
        );
        directStripeRoutesInstance.stripeHelper.hasSubscriptionRequiringPaymentMethod.returns(
          false
        );
      });

      describe('customer has payment_provider property', () => {
        it('calls getPaymentProvider once to determine payment_provider', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          await directStripeRoutesInstance.getCustomer(VALID_REQUEST);
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper.getPaymentProvider,
            customer
          );
        });

        it('payment_provider === value returned by getPaymentProvider', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
            'not_chosen'
          );

          const actual = await directStripeRoutesInstance.getCustomer(
            VALID_REQUEST
          );
          assert.strictEqual(actual.payment_provider, 'not_chosen');
        });
      });

      describe('customer has paypal_payment_error', () => {
        it('shows missing agreement when none is present', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
            'paypal'
          );
          directStripeRoutesInstance.stripeHelper.hasSubscriptionRequiringPaymentMethod.returns(
            true
          );
          directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement.returns(
            false
          );
          directStripeRoutesInstance.stripeHelper.hasOpenInvoice.returns(false);

          const actual = await directStripeRoutesInstance.getCustomer(
            VALID_REQUEST
          );
          assert.strictEqual(actual.payment_provider, 'paypal');
          assert.strictEqual(actual.paypal_payment_error, 'missing_agreement');
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper
              .hasSubscriptionRequiringPaymentMethod,
            customer
          );
          sinon.assert.calledWithExactly(
            directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement,
            customer
          );
          sinon.assert.notCalled(
            directStripeRoutesInstance.stripeHelper.hasOpenInvoice
          );
        });

        it('shows funding_source when agreement is present', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
            'paypal'
          );
          directStripeRoutesInstance.stripeHelper.hasSubscriptionRequiringPaymentMethod.returns(
            true
          );
          directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement.returns(
            true
          );
          directStripeRoutesInstance.stripeHelper.hasOpenInvoice.returns(true);

          const actual = await directStripeRoutesInstance.getCustomer(
            VALID_REQUEST
          );
          assert.strictEqual(actual.payment_provider, 'paypal');
          assert.strictEqual(actual.paypal_payment_error, 'funding_source');
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper
              .hasSubscriptionRequiringPaymentMethod,
            customer
          );
          sinon.assert.calledWithExactly(
            directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement,
            customer
          );
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper.hasOpenInvoice,
            customer
          );
        });

        it('shows no error when no open invoice and agreement on file', async () => {
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
            'paypal'
          );
          directStripeRoutesInstance.stripeHelper.hasSubscriptionRequiringPaymentMethod.returns(
            true
          );
          directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement.returns(
            true
          );
          directStripeRoutesInstance.stripeHelper.hasOpenInvoice.returns(false);

          const actual = await directStripeRoutesInstance.getCustomer(
            VALID_REQUEST
          );
          assert.strictEqual(actual.payment_provider, 'paypal');
          assert.isUndefined(actual.paypal_payment_error);
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper
              .hasSubscriptionRequiringPaymentMethod,
            customer
          );
          sinon.assert.calledWithExactly(
            directStripeRoutesInstance.stripeHelper.getCustomerPaypalAgreement,
            customer
          );
          sinon.assert.calledOnceWithExactly(
            directStripeRoutesInstance.stripeHelper.hasOpenInvoice,
            customer
          );
        });
      });

      describe('customer has payment sources', () => {
        describe('default invoice payment method is a card object', () => {
          it('adds payment method data to the response', async () => {
            directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
              customerPMIExpanded
            );
            directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
              'not_chosen'
            );

            const defaultInvoice =
              customerPMIExpanded.invoice_settings.default_payment_method;
            const expected = {
              subscriptions: [],
              billing_name: defaultInvoice.billing_details.name,
              brand: defaultInvoice.card.brand,
              payment_provider: 'not_chosen',
              payment_type: defaultInvoice.card.funding,
              last4: defaultInvoice.card.last4,
              exp_month: defaultInvoice.card.exp_month,
              exp_year: defaultInvoice.card.exp_year,
            };
            const actual = await directStripeRoutesInstance.getCustomer(
              VALID_REQUEST
            );

            assert.deepEqual(actual, expected);
          });
        });
        describe('default invoice payment method is a string', () => {
          it('throws error as it must be expanded', async () => {
            const customerExpanded = deepCopy(customerPMIExpanded);
            customerExpanded.invoice_settings.default_payment_method =
              'pm_1H0FRp2eZvKYlo2CeIZoc0wj';
            directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
              customerExpanded
            );
            try {
              await directStripeRoutesInstance.getCustomer(VALID_REQUEST);
              assert.fail('getCustomer should fail with string payment method');
            } catch (err) {
              assert.strictEqual(
                err.errno,
                error.ERRNO.BACKEND_SERVICE_FAILURE
              );
              assert.strictEqual(
                err.message,
                'A backend service request failed.'
              );
              assert.strictEqual(err.output.payload.service, 'stripe');
            }
          });
        });
        describe('payment source is a card object', () => {
          it('adds source data to the response', async () => {
            directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
              customer
            );
            directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
              'not_chosen'
            );

            const expected = {
              subscriptions: [],
              billing_name: customer.sources.data[0].name,
              brand: customer.sources.data[0].brand,
              payment_provider: 'not_chosen',
              payment_type: customer.sources.data[0].funding,
              last4: customer.sources.data[0].last4,
              exp_month: customer.sources.data[0].exp_month,
              exp_year: customer.sources.data[0].exp_year,
            };
            const actual = await directStripeRoutesInstance.getCustomer(
              VALID_REQUEST
            );

            assert.deepEqual(actual, expected);
          });
        });
        describe('payment source is a source object', () => {
          it('does not add the source data to the response', async () => {
            customer.sources.data[0].object = 'source';
            customer.subscriptions.data = [];
            directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
              customer
            );
            directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
              'not_chosen'
            );

            const expected = {
              subscriptions: [],
              payment_provider: 'not_chosen',
            };
            const actual = await directStripeRoutesInstance.getCustomer(
              VALID_REQUEST
            );

            assert.deepEqual(actual, expected);
          });
        });
      });
      describe('customer has no payment sources', () => {
        it('does not add source information to the response', async () => {
          customer.sources.data = [];
          customer.subscriptions.data = [];
          directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
            customer
          );
          directStripeRoutesInstance.stripeHelper.getPaymentProvider.returns(
            'not_chosen'
          );

          const expected = {
            subscriptions: [],
            payment_provider: 'not_chosen',
          };
          const actual = await directStripeRoutesInstance.getCustomer(
            VALID_REQUEST
          );

          assert.deepEqual(actual, expected);
        });
      });
    });
    describe('customer is not found', () => {
      it('throws an error', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves();

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
      });
    });
  });

  describe('sendSubscriptionStatusToSqs', () => {
    it('notifies attached services', async () => {
      const event = deepCopy(subscriptionUpdatedFromIncomplete);
      const subscription = deepCopy(subscription2);
      const sub = { id: subscription.id, productId: subscription.plan.product };

      directStripeRoutesInstance.stripeHelper.allPlans.resolves([
        ...PLANS,
        {
          plan_id: subscription2.plan.id,
          product_id: subscription2.plan.product,
          product_metadata: {
            capabilities: 'foo, bar, baz',
          },
        },
      ]);

      await directStripeRoutesInstance.sendSubscriptionStatusToSqs(
        VALID_REQUEST,
        UID,
        event,
        sub,
        true
      );

      assert.isTrue(
        directStripeRoutesInstance.log.notifyAttachedServices.calledOnceWith(
          'subscription:update',
          VALID_REQUEST,
          {
            uid: UID,
            eventCreatedAt: event.created,
            subscriptionId: sub.id,
            isActive: true,
            productId: sub.productId,
            productCapabilities: ['foo', 'bar', 'baz'],
          }
        ),
        'Expected log.notifyAttachedServices to be called'
      );
    });
  });

  describe('updateCustomerAndSendStatus', () => {
    let event;

    beforeEach(() => {
      event = deepCopy(subscriptionUpdatedFromIncomplete);
      sinon
        .stub(directStripeRoutesInstance, 'sendSubscriptionStatusToSqs')
        .resolves();
    });

    describe('when the customer is found from the subscription', () => {
      it('calls all the update and notification functions', async () => {
        directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.resolves(
          { uid: UID, email: TEST_EMAIL }
        );

        await directStripeRoutesInstance.updateCustomerAndSendStatus(
          VALID_REQUEST,
          event,
          subscription2,
          true
        );

        sinon.assert.calledOnce(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        sinon.assert.calledOnce(profile.deleteCache);
        sinon.assert.calledOnce(
          directStripeRoutesInstance.sendSubscriptionStatusToSqs
        );
      });
    });

    describe('when the customer is not found from the subscription', () => {
      it('returns without calling anything', async () => {
        directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.resolves(
          { uid: undefined, email: undefined }
        );

        await directStripeRoutesInstance.updateCustomerAndSendStatus(
          VALID_REQUEST,
          event,
          subscription2,
          true
        );

        sinon.assert.notCalled(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        sinon.assert.notCalled(profile.deleteCache);
        sinon.assert.notCalled(
          directStripeRoutesInstance.sendSubscriptionStatusToSqs
        );
      });
    });
  });
});
