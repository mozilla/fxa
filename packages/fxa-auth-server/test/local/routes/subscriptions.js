/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');
const { getRoute } = require('../../routes_helpers');
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const P = require('../../../lib/promise');
const Sentry = require('@sentry/node');
const { StripeHelper } = require('../../../lib/payments/stripe');
const WError = require('verror').WError;
const uuidv4 = require('uuid').v4;

const {
  sanitizePlans,
  handleAuth,
  DirectStripeRoutes,
} = require('../../../lib/routes/subscriptions');

const subscription2 = require('../payments/fixtures/subscription2.json');
const cancelledSubscription = require('../payments/fixtures/subscription_cancelled.json');
const trialSubscription = require('../payments/fixtures/subscription_trialing.json');
const pastDueSubscription = require('../payments/fixtures/subscription_past_due.json');
const customerFixture = require('../payments/fixtures/customer1.json');
const multiPlanSubscription = require('../payments/fixtures/subscription_multiplan.json');
const emptyCustomer = require('../payments/fixtures/customer_new.json');
const subscriptionCreated = require('../payments/fixtures/subscription_created.json');
const subscriptionCreatedIncomplete = require('../payments/fixtures/subscription_created_incomplete.json');
const subscriptionDeleted = require('../payments/fixtures/subscription_deleted.json');
const subscriptionUpdated = require('../payments/fixtures/subscription_updated.json');
const subscriptionUpdatedFromIncomplete = require('../payments/fixtures/subscription_updated_from_incomplete.json');
const eventInvoicePaymentSucceeded = require('../payments/fixtures/event_invoice_payment_succeeded.json');
const eventInvoicePaymentFailed = require('../payments/fixtures/event_invoice_payment_failed.json');
const openInvoice = require('../payments/fixtures/invoice_open.json');
const openPaymentIntent = require('../payments/fixtures/paymentIntent_requires_payment_method.json');
const closedPaymementIntent = require('../payments/fixtures/paymentIntent_succeeded.json');

let config,
  log,
  directStripeRoutes,
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
const UID = uuid.v4('binary').toString('hex');
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
  },
];
const SUBSCRIPTION_ID_1 = 'sub-8675309';
//const PAYMENT_TOKEN_VALID = '8675309-foobarbaz';
const PAYMENT_TOKEN_NEW = 'new-8675309';
//const PAYMENT_TOKEN_BAD = 'thisisabadtoken';
const ACTIVE_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: SUBSCRIPTION_ID_1,
    productId: PLANS[0].product_id,
    createdAt: NOW,
    cancelledAt: null,
  },
];
const DISPLAY_NAME = 'Foo Bar';

const MOCK_CLIENT_ID = '3c49430b43dfba77';
const MOCK_TTL = 3600;
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];

function runTest(routePath, requestOptions, payments = null) {
  routes = require('../../../lib/routes/subscriptions')(
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
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}));

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
      },
    ];

    assert.deepEqual(sanitizePlans(PLANS), expected);
  });
});

/**
 * Direct Stripe integration tests
 */
describe('subscriptions directRoutes', () => {
  beforeEach(() => {
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

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    db.createAccountSubscription = sinon.spy(async data => ({}));
    db.deleteAccountSubscription = sinon.spy(
      async (uid, subscriptionId) => ({})
    );
    db.cancelAccountSubscription = sinon.spy(async () => ({}));
    db.fetchAccountSubscriptions = sinon.spy(async uid =>
      ACTIVE_SUBSCRIPTIONS.filter(s => s.uid === uid)
    );
    db.getAccountSubscription = sinon.spy(async (uid, subscriptionId) => {
      const subscription = ACTIVE_SUBSCRIPTIONS.filter(
        s => s.uid === uid && s.subscriptionId === subscriptionId
      )[0];
      if (typeof subscription === 'undefined') {
        throw { statusCode: 404, errno: 116 };
      }
      return subscription;
    });

    push = mocks.mockPush();
    mailer = mocks.mockMailer();

    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async uid => ({})),
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

      directStripeRoutes = new DirectStripeRoutes(
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

      directStripeRoutes = new DirectStripeRoutes(
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
    const formatter = subs => subs.data.map(s => ({ subscription_id: s.id }));

    beforeEach(() => {
      reqOpts = {
        ...requestOptions,
        method: 'GET',
        query: { uid: UID, email: 'testo@blackhole.example.io' },
        auth: { strategy: 'supportPanelSecret' },
      };
      stripeHelper = {
        customer: sinon.fake.returns(customerFixture),
        subscriptionsToResponse: sinon.fake(formatter),
      };
    });

    it('should return empty list unknown customer', async () => {
      stripeHelper.fetchCustomer = sinon.fake.throws(
        error.unknownCustomer(reqOpts.query.uid)
      );

      const response = await runTest(
        '/oauth/subscriptions/search',
        reqOpts,
        stripeHelper
      );
      assert.isTrue(
        stripeHelper.customer.calledOnceWith(
          reqOpts.query.uid,
          reqOpts.query.email
        )
      );
      assert.deepEqual(response, formatter(customerFixture.subscriptions));
    });

    it('should return a formatted list of subscriptions in the customer response', async () => {
      const response = await runTest(
        '/oauth/subscriptions/search',
        reqOpts,
        stripeHelper
      );
      assert.isTrue(
        stripeHelper.customer.calledOnceWith(
          reqOpts.query.uid,
          reqOpts.query.email
        )
      );
      assert.isTrue(
        stripeHelper.subscriptionsToResponse.calledOnceWith(
          customerFixture.subscriptions
        )
      );
      assert.deepEqual(response, formatter(customerFixture.subscriptions));
    });
  });
});

describe('handleAuth', () => {
  const AUTH_UID = uuid.v4('binary').toString('hex');
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
      err => {
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
        err => {
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
      deleteCache: sinon.spy(async uid => ({})),
    });
    mailer = mocks.mockMailer();

    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
      locale: ACCOUNT_LOCALE,
    });
    const stripeHelperMock = sandbox.createStubInstance(StripeHelper);

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
      assert.isTrue(
        directStripeRoutesInstance.stripeHelper.refreshCachedCustomer.calledOnceWith(
          UID,
          TEST_EMAIL
        ),
        'Expected stripeHelper.refreshCachedCustomer to be called once'
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
      directStripeRoutesInstance.stripeHelper.allPlans.returns(PLANS);

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

  describe('createSubscription', () => {
    let expected, actual;
    let createForNewStub, createForExistingStub;
    const planId = PLAN_ID_1;
    const plan = PLANS[2];
    const paymentToken = 'tok_visa';
    const displayName = DISPLAY_NAME;
    const idempotencyKey = uuidv4();
    const request = {
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
      payload: {
        planId: planId,
        paymentToken: paymentToken,
        displayName: displayName,
        idempotencyKey: idempotencyKey,
      },
    };

    beforeEach(() => {
      const subscription = deepCopy(subscription2);
      expected = { subscriptionId: subscription.id };

      createForNewStub = sandbox
        .stub(directStripeRoutesInstance, 'createSubscriptionNewCustomer')
        .resolves(subscription);
      createForExistingStub = sandbox
        .stub(directStripeRoutesInstance, 'createSubscriptionExistingCustomer')
        .resolves(subscription);

      sandbox.stub(directStripeRoutesInstance, 'customerChanged').resolves();

      directStripeRoutesInstance.stripeHelper.findPlanById.returns(plan);
    });

    describe('when called for a new customer', () => {
      it('creates a new subscription', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves();

        actual = await directStripeRoutesInstance.createSubscription(request);
        assert.isTrue(log.begin.calledOnce);
        assert.isTrue(customs.check.calledOnce);
        assert.isTrue(
          createForNewStub.calledOnceWith(
            UID,
            TEST_EMAIL,
            displayName,
            paymentToken,
            plan,
            idempotencyKey
          )
        );
        assert.isTrue(createForExistingStub.notCalled);
        assert.isTrue(
          directStripeRoutesInstance.customerChanged.calledOnceWith(
            request,
            UID,
            TEST_EMAIL
          )
        );
        assert.isTrue(mailer.sendDownloadSubscriptionEmail.calledOnce);

        assert.isTrue(log.info.calledOnce);
        assert.deepEqual(actual, expected);
      });
    });

    describe('when called for an existing customer', () => {
      it('creates a new subscription', async () => {
        const customer = deepCopy(customerFixture);
        directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
          customer
        );

        actual = await directStripeRoutesInstance.createSubscription(request);
        assert.isTrue(log.begin.calledOnce);
        assert.isTrue(customs.check.calledOnce);
        assert.isTrue(createForNewStub.notCalled);
        assert.isTrue(
          createForExistingStub.calledOnceWith(
            customer,
            paymentToken,
            plan,
            idempotencyKey
          )
        );
        assert.isTrue(
          directStripeRoutesInstance.customerChanged.calledOnceWith(
            request,
            UID,
            TEST_EMAIL
          )
        );
        assert.isTrue(mailer.sendDownloadSubscriptionEmail.calledOnce);

        assert.isTrue(log.info.calledOnce);
        assert.deepEqual(actual, expected);
      });
    });
  });

  describe('createSubscriptionNewCustomer', () => {
    it('creates a stripe customer and a new subscription', async () => {
      const expected = subscription2;
      const customer = deepCopy(emptyCustomer);
      directStripeRoutesInstance.stripeHelper.createCustomer.returns(customer);
      directStripeRoutesInstance.stripeHelper.createSubscription.returns(
        subscription2
      );

      const actual = await directStripeRoutesInstance.createSubscriptionNewCustomer(
        UID,
        TEST_EMAIL,
        DISPLAY_NAME,
        PAYMENT_TOKEN_NEW,
        PLANS[0],
        uuidv4()
      );

      assert.deepEqual(expected, actual);
    });
  });

  describe('createSubscriptionExistingCustomer', () => {
    const idempotencyKey = uuidv4();
    let customer;
    const selectedPlan = {
      plan_id: 'plan_G93mMKnIFCjZek',
      plan_name: 'Firefox Pro Basic Weekly',
      product_id: 'prod_G93mdk6bGPJ7wy',
      product_name: 'Firefox Pro Basic',
      interval: 'week',
      amount: '123',
      currency: 'usd',
      product_metadata: {
        emailIconURL: 'http://example.com/image.jpg',
        downloadURL: 'http://getfirefox.com',
      },
    };
    const paymentToken = 'tok_visa';

    beforeEach(() => {
      customer = deepCopy(emptyCustomer);
    });

    describe('the optional paymentToken parameter', () => {
      beforeEach(() => {
        directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod.returns();
      });

      describe('when a payment token is provided', () => {
        it('calls updateCustomerPaymentMethod', async () => {
          const expected = deepCopy(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            paymentToken,
            selectedPlan,
            idempotencyKey
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod.calledOnceWith(
              customer.id,
              paymentToken
            )
          );

          assert.deepEqual(actual, expected);
        });
      });
      describe('when a payment token is not provided', () => {
        it('does not call updateCustomerPaymentMethod', async () => {
          const expected = deepCopy(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan,
            idempotencyKey
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod
              .notCalled
          );
          assert.deepEqual(actual, expected);
        });
      });
    });

    describe('user with no subscriptions', () => {
      it('calls createSubscription', async () => {
        const expected = deepCopy(subscription2);
        directStripeRoutesInstance.stripeHelper.createSubscription.returns(
          expected
        );
        const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
          customer,
          null,
          selectedPlan,
          idempotencyKey
        );
        assert.isTrue(
          directStripeRoutesInstance.stripeHelper.createSubscription.calledOnceWith(
            customer,
            selectedPlan
          )
        );
        assert.deepEqual(actual, expected);
      });
    });

    describe('user with existing subscription for plan', () => {
      let existingSubscription;
      let invoice;
      let handleStub;
      beforeEach(() => {
        existingSubscription = deepCopy(subscription2);
        handleStub = sandbox
          .stub(directStripeRoutesInstance, 'handleOpenInvoice')
          .resolves();
      });

      describe('there is no latest invoice', () => {
        it('calls createSubscription', async () => {
          existingSubscription.latest_invoice = null;
          customer.subscriptions.data = [existingSubscription];

          const expected = deepCopy(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan,
            idempotencyKey
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.createSubscription.calledOnceWith(
              customer,
              selectedPlan
            )
          );
          assert.deepEqual(actual, expected);
        });
      });

      describe('the latest invoice status is open', () => {
        it('calls handleOpenInvoice', async () => {
          invoice = deepCopy(openInvoice);
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan,
            idempotencyKey
          );

          assert.isTrue(
            handleStub.called,
            'handleOpenInvoice should be called'
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.createSubscription.notCalled
          );
          assert.deepEqual(actual, existingSubscription);
        });
      });

      describe('the latest invoice status is paid', () => {
        it('throws an error', async () => {
          invoice = deepCopy(openInvoice);
          invoice.status = 'paid';
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          return directStripeRoutesInstance
            .createSubscriptionExistingCustomer(
              customer,
              null,
              selectedPlan,
              idempotencyKey
            )
            .then(
              () => Promise.reject(new Error('Method expected to reject')),
              err => {
                assert.instanceOf(err, WError);
                assert.equal(
                  err.errno,
                  error.ERRNO.SUBSCRIPTION_ALREADY_EXISTS
                );
                assert.equal(err.message, 'User already subscribed.');
                assert.isTrue(
                  directStripeRoutesInstance.stripeHelper.createSubscription
                    .notCalled
                );
              }
            );
        });
      });

      describe('the latest invoice status is something else', () => {
        it('calls createSubscription', async () => {
          invoice = deepCopy(openInvoice);
          invoice.status = 'draft';
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          const expected = deepCopy(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan,
            idempotencyKey
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.createSubscription.calledOnceWith(
              customer,
              selectedPlan
            )
          );
          assert.deepEqual(actual, expected);
        });
      });
    });

    describe('user with existing subscription for product', () => {
      it('throws an error', async () => {
        const existingSubscription = deepCopy(subscription2);
        existingSubscription.plan.id = 'plan_123456';
        customer.subscriptions.data = [existingSubscription];

        return directStripeRoutesInstance
          .createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan,
            idempotencyKey
          )
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.instanceOf(err, WError);
              assert.equal(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_EXISTS);
              assert.equal(
                err.message,
                'User already subscribed to product with different plan.'
              );
              assert.isTrue(
                directStripeRoutesInstance.stripeHelper.createSubscription
                  .notCalled
              );
            }
          );
      });
    });
  });

  describe('handleOpenInvoice', () => {
    describe('when the payment_intent status requires payment method', () => {
      it('calls payInvoice', async () => {
        const invoice = deepCopy(openInvoice);
        directStripeRoutesInstance.stripeHelper.fetchPaymentIntentFromInvoice.resolves(
          openPaymentIntent
        );

        directStripeRoutesInstance.stripeHelper.payInvoice.resolves();

        await directStripeRoutesInstance.handleOpenInvoice(invoice);

        assert.isTrue(
          directStripeRoutesInstance.stripeHelper.payInvoice.calledOnceWith(
            invoice.id
          ),
          'Expected stripeHelper.payInvoice to be called'
        );
      });
    });

    describe('when the payment_intent status is in any other state', () => {
      it('thows a backendServiceFailure error', async () => {
        const invoice = deepCopy(openInvoice);
        directStripeRoutesInstance.stripeHelper.fetchPaymentIntentFromInvoice.resolves(
          closedPaymementIntent
        );

        return directStripeRoutesInstance.handleOpenInvoice(invoice).then(
          () => Promise.reject(new Error('Method expected to reject')),
          err => {
            assert.instanceOf(err, WError);
            assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
            assert.equal(err.message, 'A backend service request failed.');
          }
        );
      });
    });
  });

  describe('findCustomerSubscriptionByPlanId', () => {
    describe('Customer has Single One-Plan Subscription', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [subscription2];
      it('returns the Subscription when the plan id is found', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customer,
          customer.subscriptions.data[0].items.data[0].plan.id
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
            customer,
            'plan_test2'
          )
        );
      });
    });

    describe('Customer has Single Multi-Plan Subscription', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription];

      it('returns the Subscription when the plan id is found - first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customer,
          'plan_1'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found - not first in array', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customer,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
            customer,
            'plan_3'
          )
        );
      });
    });

    describe('Customer has Multiple Subscriptions', () => {
      const customer = deepCopy(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription, subscription2];

      it('returns the Subscription when the plan id is found in the first subscription', () => {
        const expected = customer.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customer,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found in not the first subscription', () => {
        const expected = customer.subscriptions.data[1];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customer,
          'plan_G93mMKnIFCjZek'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
            customer,
            'plan_test2'
          )
        );
      });
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

  describe('updatePayment', () => {
    let request;
    const paymentToken = 'tok_visa';

    beforeEach(() => {
      request = { ...VALID_REQUEST, payload: { paymentToken } };

      directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod.returns();
    });

    describe('when the customer exists', () => {
      it('updates the payment method', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.returns(
          customerFixture
        );

        await directStripeRoutesInstance.updatePayment(request);

        assert.isTrue(
          directStripeRoutesInstance.log.begin.calledOnceWith(
            'subscriptions.updatePayment',
            request
          )
        );

        assert.isTrue(
          directStripeRoutesInstance.customs.check.calledOnceWith(
            request,
            TEST_EMAIL,
            'updatePayment'
          )
        );

        assert.isTrue(
          directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod.calledOnceWith(
            customerFixture.id,
            paymentToken
          )
        );

        assert.isTrue(
          directStripeRoutesInstance.log.info.calledOnceWith(
            'subscriptions.updatePayment.success',
            { uid: UID }
          )
        );
      });
    });

    describe('when the customer does not exist', () => {
      it('throws an error', async () => {
        directStripeRoutesInstance.stripeHelper.fetchCustomer.returns();

        try {
          await directStripeRoutesInstance.updatePayment(request);
          assert.fail('Method epected to reject');
        } catch (err) {
          assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
          assert.equal(err.message, 'A backend service request failed.');
          assert.equal(err.output.payload['service'], 'stripe');
          assert.equal(err.output.payload['operation'], 'updatePayment');

          assert.isTrue(
            directStripeRoutesInstance.log.begin.calledOnceWith(
              'subscriptions.updatePayment',
              request
            )
          );

          assert.isTrue(
            directStripeRoutesInstance.customs.check.calledOnceWith(
              request,
              TEST_EMAIL,
              'updatePayment'
            )
          );
          assert.isTrue(
            directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod
              .notCalled
          );

          assert.isTrue(directStripeRoutesInstance.log.info.notCalled);
        }
      });
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
    describe('when the plan is a valid upgrade', () => {
      it('returns the subscription id', async () => {
        const subscriptionId = 'sub_123';
        const expected = { subscriptionId: subscriptionId };

        directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.resolves(
          subscription2
        );
        directStripeRoutesInstance.stripeHelper.verifyPlanUpgradeForSubscription.resolves();
        directStripeRoutesInstance.stripeHelper.changeSubscriptionPlan.resolves();

        sinon.stub(directStripeRoutesInstance, 'customerChanged').resolves();

        VALID_REQUEST.params = { subscriptionId: subscriptionId };
        VALID_REQUEST.payload = { planId: 'plan_123' };

        const actual = await directStripeRoutesInstance.updateSubscription(
          VALID_REQUEST
        );

        assert.deepEqual(actual, expected);
      });
    });

    describe('when the orginal subscription is not found', () => {
      it('throws an exception', async () => {
        directStripeRoutesInstance.stripeHelper.subscriptionForCustomer.resolves();
        VALID_REQUEST.params = { subscriptionId: 'sub_123' };
        VALID_REQUEST.payload = { planId: 'plan_123' };

        return directStripeRoutesInstance
          .updateSubscription(VALID_REQUEST)
          .then(
            () => Promise.reject(new Error('Method expected to reject')),
            err => {
              assert.instanceOf(err, WError);
              assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
              assert.equal(err.message, 'Unknown subscription');
            }
          );
      });
    });
  });

  describe('listPlans', () => {
    it('returns the available plans when auth headers are valid', async () => {
      const expected = sanitizePlans(PLANS);

      directStripeRoutesInstance.stripeHelper.allPlans.returns(PLANS);
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
        err => {
          assert.instanceOf(err, WError);
          assert.equal(err.message, 'Requested scopes are not allowed');
        }
      );
    });
  });

  describe('getProductCapabilties', () => {
    it('extracts all capabilities for all products', async () => {
      directStripeRoutesInstance.stripeHelper.allPlans.returns(PLANS);
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
            activeSubscriptions.find(x => x.subscriptionId === subscription2.id)
          );
          assert.isDefined(
            activeSubscriptions.find(
              x => x.subscriptionId === trialSubscription.id
            )
          );
          assert.isDefined(
            activeSubscriptions.find(
              x => x.subscriptionId === pastDueSubscription.id
            )
          );
          assert.isDefined(
            activeSubscriptions.find(
              x => x.subscriptionId === setToCancelSubscription.id
            )
          );
          assert.isUndefined(
            activeSubscriptions.find(
              x => x.subscriptionId === cancelledSubscription.id
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
      });

      describe('customer has payment sources', () => {
        describe('payment source is a card object', () => {
          it('adds source data to the response', async () => {
            directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
              customer
            );

            const expected = {
              subscriptions: [],
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

            const expected = { subscriptions: [] };
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

          const expected = { subscriptions: [] };
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

      directStripeRoutesInstance.stripeHelper.allPlans.returns([
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
        directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.returns(
          { uid: UID, email: TEST_EMAIL }
        );

        await directStripeRoutesInstance.updateCustomerAndSendStatus(
          VALID_REQUEST,
          event,
          subscription2,
          true
        );

        assert.calledOnce(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.calledOnce(profile.deleteCache);
        assert.calledOnce(
          directStripeRoutesInstance.sendSubscriptionStatusToSqs
        );
      });
    });

    describe('when the customer is not found from the subscription', () => {
      it('returns without calling anything', async () => {
        directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.returns(
          { uid: undefined, email: undefined }
        );

        await directStripeRoutesInstance.updateCustomerAndSendStatus(
          VALID_REQUEST,
          event,
          subscription2,
          true
        );

        assert.notCalled(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.notCalled(profile.deleteCache);
        assert.notCalled(
          directStripeRoutesInstance.sendSubscriptionStatusToSqs
        );
      });
    });
  });

  describe('stripe webhooks', () => {
    let stubSendSubscriptionStatusToSqs;

    beforeEach(() => {
      directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.resolves(
        { uid: UID, email: TEST_EMAIL }
      );
      stubSendSubscriptionStatusToSqs = sandbox
        .stub(directStripeRoutesInstance, 'sendSubscriptionStatusToSqs')
        .resolves(true);
    });

    describe('handleWebhookEvent', () => {
      let scopeContextSpy, scopeSpy;
      const request = {
        payload: {},
        headers: {
          'stripe-signature': 'stripe_123',
        },
      };
      const handlerNames = [
        'handleSubscriptionCreatedEvent',
        'handleSubscriptionUpdatedEvent',
        'handleSubscriptionDeletedEvent',
        'handleInvoicePaymentSucceededEvent',
        'handleInvoicePaymentFailedEvent',
      ];
      const handlerStubs = {};

      beforeEach(() => {
        for (const handlerName of handlerNames) {
          handlerStubs[handlerName] = sandbox
            .stub(directStripeRoutesInstance, handlerName)
            .resolves();
        }
        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', fn => fn(scopeSpy));
      });

      const assertNamedHandlerCalled = (expectedHandlerName = null) => {
        for (const handlerName of handlerNames) {
          const shouldCall =
            expectedHandlerName && handlerName === expectedHandlerName;
          assert.isTrue(
            handlerStubs[handlerName][shouldCall ? 'called' : 'notCalled'],
            `Expected to ${shouldCall ? '' : 'not '}call ${handlerName}`
          );
        }
      };

      const itOnlyCallsThisHandler = (expectedHandlerName, event) =>
        it(`only calls ${expectedHandlerName}`, async () => {
          const createdEvent = deepCopy(event);
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            createdEvent
          );
          await directStripeRoutesInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled(expectedHandlerName);
          assert.isTrue(
            scopeContextSpy.notCalled,
            'Expected to not call Sentry'
          );
        });

      describe('when the event.type is customer.subscription.created', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionCreatedEvent',
          subscriptionCreated
        );
      });

      describe('when the event.type is customer.subscription.updated', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionUpdatedEvent',
          subscriptionUpdated
        );
      });

      describe('when the event.type is customer.subscription.deleted', () => {
        itOnlyCallsThisHandler(
          'handleSubscriptionDeletedEvent',
          subscriptionDeleted
        );
      });

      describe('when the event.type is invoice.payment_succeeded', () => {
        itOnlyCallsThisHandler(
          'handleInvoicePaymentSucceededEvent',
          eventInvoicePaymentSucceeded
        );
      });

      describe('when the event.type is invoice.payment_failed', () => {
        itOnlyCallsThisHandler(
          'handleInvoicePaymentFailedEvent',
          eventInvoicePaymentFailed
        );
      });

      describe('when the event.type is something else', () => {
        it('only calls sentry', async () => {
          const event = deepCopy(subscriptionCreated);
          event.type = 'customer.updated';
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );
          await directStripeRoutesInstance.handleWebhookEvent(request);
          assertNamedHandlerCalled();
          assert.isTrue(scopeContextSpy.calledOnce, 'Expected to call Sentry');
        });
      });
    });

    const assertSendSubscriptionStatusToSqsCalledWith = (event, isActive) =>
      assert.calledWith(
        stubSendSubscriptionStatusToSqs,
        {},
        UID,
        event,
        { id: event.data.object.id, productId: event.data.object.plan.product },
        isActive
      );

    describe('handleSubscriptionUpdatedEvent', () => {
      it('emits a notification when transitioning from "incomplete" to "active/trialing"', async () => {
        const updatedEvent = deepCopy(subscriptionUpdatedFromIncomplete);
        await directStripeRoutesInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        assert.calledWith(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription,
          updatedEvent.data.object
        );
        assert.calledWith(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer,
          UID,
          TEST_EMAIL
        );
        assert.calledWith(profile.deleteCache, UID);
        assertSendSubscriptionStatusToSqsCalledWith(updatedEvent, true);
      });

      it('does not emit a notification for any other subscription state change', async () => {
        const updatedEvent = deepCopy(subscriptionUpdated);
        await directStripeRoutesInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.notCalled(profile.deleteCache);
        assert.notCalled(stubSendSubscriptionStatusToSqs);
      });
    });

    describe('handleSubscriptionDeletedEvent', () => {
      it('sends email and emits a notification when a subscription is deleted', async () => {
        const deletedEvent = deepCopy(subscriptionDeleted);
        const sendSubscriptionDeletedEmailStub = sandbox
          .stub(directStripeRoutesInstance, 'sendSubscriptionDeletedEmail')
          .resolves({ uid: UID, email: TEST_EMAIL });
        await directStripeRoutesInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        assert.calledWith(
          sendSubscriptionDeletedEmailStub,
          deletedEvent.data.object
        );
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.calledWith(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer,
          UID,
          TEST_EMAIL
        );
        assert.calledWith(profile.deleteCache, UID);
        assertSendSubscriptionStatusToSqsCalledWith(deletedEvent, false);
      });
    });

    describe('handleInvoicePaymentSucceededEvent', () => {
      it('sends email and emits a notification when an invoice payment succeeds', async () => {
        const paymentSucceededEvent = deepCopy(eventInvoicePaymentSucceeded);
        const sendSubscriptionInvoiceEmailStub = sandbox
          .stub(directStripeRoutesInstance, 'sendSubscriptionInvoiceEmail')
          .resolves(true);
        const mockSubscription = {
          id: 'test1',
          plan: { product: 'test2' },
        };
        directStripeRoutesInstance.stripeHelper.expandResource.resolves(
          mockSubscription
        );
        await directStripeRoutesInstance.handleInvoicePaymentSucceededEvent(
          {},
          paymentSucceededEvent
        );
        assert.calledWith(
          sendSubscriptionInvoiceEmailStub,
          paymentSucceededEvent.data.object
        );
        assert.notCalled(stubSendSubscriptionStatusToSqs);
      });
    });

    describe('handleInvoicePaymentFailedEvent', () => {
      it('sends email and emits a notification when an invoice payment fails', async () => {
        const paymentFailedEvent = deepCopy(eventInvoicePaymentFailed);
        const sendSubscriptionPaymentFailedEmailStub = sandbox
          .stub(
            directStripeRoutesInstance,
            'sendSubscriptionPaymentFailedEmail'
          )
          .resolves(true);
        const mockSubscription = {
          id: 'test1',
          plan: { product: 'test2' },
        };
        directStripeRoutesInstance.stripeHelper.expandResource.resolves(
          mockSubscription
        );
        await directStripeRoutesInstance.handleInvoicePaymentFailedEvent(
          {},
          paymentFailedEvent
        );
        assert.calledWith(
          sendSubscriptionPaymentFailedEmailStub,
          paymentFailedEvent.data.object
        );
        assert.notCalled(stubSendSubscriptionStatusToSqs);
      });
    });

    describe('handleSubscriptionCreatedEvent', () => {
      it('emits a notification when a new subscription is "active" or "trialing"', async () => {
        const createdEvent = deepCopy(subscriptionCreated);
        await directStripeRoutesInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        assert.calledWith(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription,
          createdEvent.data.object
        );
        assert.calledWith(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer,
          UID,
          TEST_EMAIL
        );
        assert.calledWith(profile.deleteCache, UID);
        assertSendSubscriptionStatusToSqsCalledWith(createdEvent, true);
      });

      it('does not emit a notification for incomplete new subscriptions', async () => {
        const createdEvent = deepCopy(subscriptionCreatedIncomplete);
        await directStripeRoutesInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.notCalled(profile.deleteCache);
        assert.notCalled(stubSendSubscriptionStatusToSqs);
      });
    });
  });

  describe('sendSubscriptionPaymentFailedEmail', () => {
    it('sends the payment failed email', async () => {
      const invoice = deepCopy(eventInvoicePaymentFailed.data.object);

      const mockInvoiceDetails = { uid: '1234', test: 'fake' };
      directStripeRoutesInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
        mockInvoiceDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      directStripeRoutesInstance.db.account = sinon.spy(
        async data => mockAccount
      );

      await directStripeRoutesInstance.sendSubscriptionPaymentFailedEmail(
        invoice
      );
      assert.calledWith(
        directStripeRoutesInstance.mailer.sendSubscriptionPaymentFailedEmail,
        mockAccount.emails,
        mockAccount,
        {
          acceptLanguage: mockAccount.locale,
          ...mockInvoiceDetails,
        }
      );
    });
  });

  describe('sendSubscriptionInvoiceEmail', () => {
    const commonSendSubscriptionInvoiceEmailTest = (
      expectedMethodName,
      billingReason
    ) => async () => {
      const invoice = deepCopy(eventInvoicePaymentSucceeded.data.object);
      invoice.billing_reason = billingReason;

      const mockInvoiceDetails = { uid: '1234', test: 'fake' };
      directStripeRoutesInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
        mockInvoiceDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      directStripeRoutesInstance.db.account = sinon.spy(
        async data => mockAccount
      );

      await directStripeRoutesInstance.sendSubscriptionInvoiceEmail(invoice);
      assert.calledWith(
        directStripeRoutesInstance.mailer[expectedMethodName],
        mockAccount.emails,
        mockAccount,
        {
          acceptLanguage: mockAccount.locale,
          ...mockInvoiceDetails,
        }
      );
    };

    it(
      'sends the initial invoice email for a newly created subscription',
      commonSendSubscriptionInvoiceEmailTest(
        'sendSubscriptionFirstInvoiceEmail',
        'subscription_create'
      )
    );

    it(
      'sends the subsequent invoice email for billing reasons besides creation',
      commonSendSubscriptionInvoiceEmailTest(
        'sendSubscriptionSubsequentInvoiceEmail',
        'subscription_cycle'
      )
    );
  });

  describe('sendSubscriptionDeletedEmail', () => {
    const commonSendSubscriptionDeletedEmailTest = (
      accountFound = true
    ) => async () => {
      const deletedEvent = deepCopy(subscriptionDeleted);
      const subscription = deletedEvent.data.object;

      const mockInvoice = { test: 'fake' };
      directStripeRoutesInstance.stripeHelper.expandResource.resolves(
        mockInvoice
      );

      const mockInvoiceDetails = {
        uid: '1234',
        test: 'fake',
        email: 'test@example.com',
      };
      directStripeRoutesInstance.stripeHelper.extractInvoiceDetailsForEmail.resolves(
        mockInvoiceDetails
      );

      const mockAccount = { emails: 'fakeemails', locale: 'fakelocale' };
      directStripeRoutesInstance.db.account = sinon.spy(async data => {
        if (accountFound) {
          return mockAccount;
        }
        throw error.unknownAccount();
      });

      await directStripeRoutesInstance.sendSubscriptionDeletedEmail(
        subscription
      );

      assert.calledWith(
        directStripeRoutesInstance.stripeHelper.expandResource,
        subscription.latest_invoice,
        'invoices'
      );
      assert.calledWith(
        directStripeRoutesInstance.stripeHelper.extractInvoiceDetailsForEmail,
        mockInvoice
      );

      if (accountFound) {
        assert.calledWith(
          directStripeRoutesInstance.mailer.sendSubscriptionCancellationEmail,
          mockAccount.emails,
          mockAccount,
          {
            acceptLanguage: mockAccount.locale,
            serviceLastActiveDate: new Date(
              subscription.current_period_end * 1000
            ),
            ...mockInvoiceDetails,
          }
        );
      } else {
        const fakeAccount = {
          email: mockInvoiceDetails.email,
          uid: mockInvoiceDetails.uid,
          emails: [{ email: mockInvoiceDetails.email, isPrimary: true }],
        };
        assert.calledWith(
          directStripeRoutesInstance.mailer
            .sendSubscriptionAccountDeletionEmail,
          fakeAccount.emails,
          fakeAccount,
          mockInvoiceDetails
        );
      }
    };

    it(
      'sends a plain cancellation email on subscription deletion',
      commonSendSubscriptionDeletedEmailTest(true)
    );

    it(
      'sends an account deletion specific email on subscription deletion when account is gone',
      commonSendSubscriptionDeletedEmailTest(false)
    );
  });

  describe('getSubscriptions', () => {
    const formatter = subs => subs.data.map(s => ({ subscription_id: s.id }));

    describe('when a customer is found', () => {
      it('returns a formatted version of the customer subscriptions', async () => {
        const customer = deepCopy(emptyCustomer);
        const subscription = deepCopy(subscription2);
        customer.subscriptions.data = [subscription];

        directStripeRoutesInstance.stripeHelper.customer.resolves(customer);
        directStripeRoutesInstance.stripeHelper.subscriptionsToResponse.resolves(
          formatter(customer.subscriptions)
        );

        const expected = formatter(customer.subscriptions);
        const actual = await directStripeRoutesInstance.getSubscriptions(
          VALID_REQUEST
        );

        assert.deepEqual(expected, actual);
        assert.calledOnce(
          directStripeRoutesInstance.stripeHelper.subscriptionsToResponse
        );
      });
    });

    describe('when a customer is not found', () => {
      it('returns an empty array', async () => {
        directStripeRoutesInstance.stripeHelper.customer.resolves(null);

        const expected = [];
        const actual = await directStripeRoutesInstance.getSubscriptions(
          VALID_REQUEST
        );

        assert.deepEqual(expected, actual);
        assert.notCalled(
          directStripeRoutesInstance.stripeHelper.subscriptionsToResponse
        );
      });
    });
  });

  describe('getUidEmail', () => {
    describe('when the auth strategy is supportPanelSecret', () => {
      it('returns the uid and email from reques.query', async () => {
        const expected = { uid: '12345', email: 'test@example.com' };
        const request = {
          auth: {
            strategy: 'supportPanelSecret',
          },
          query: expected,
        };

        const actual = await directStripeRoutesInstance.getUidEmail(request);
        assert.deepEqual(actual, expected);
      });
    });
    describe('when the auth strategy is not supportPanelSecret', () => {
      it('returns the uid and email from handleAuth', async () => {
        const expected = { uid: UID, email: TEST_EMAIL };

        const actual = await directStripeRoutesInstance.getUidEmail(
          VALID_REQUEST
        );
        assert.deepEqual(actual, expected);
      });
    });
  });
});
