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

const {
  sanitizePlans,
  handleAuth,
  DirectStripeRoutes,
} = require('../../../lib/routes/subscriptions');

const subscription2 = require('../payments/fixtures/subscription2.json');
const customerFixture = require('../payments/fixtures/customer1.json');
const multiPlanSubscription = require('../payments/fixtures/subscription_multiplan.json');
const emptyCustomer = require('../payments/fixtures/customer_new.json');
const subscriptionCreated = require('../payments/fixtures/subscription_created.json');
const subscriptionCreatedIncomplete = require('../payments/fixtures/subscription_created_incomplete.json');
const subscriptionDeleted = require('../payments/fixtures/subscription_deleted.json');
const subscriptionUpdated = require('../payments/fixtures/subscription_updated.json');
const subscriptionUpdatedFromIncomplete = require('../payments/fixtures/subscription_updated_from_incomplete.json');
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
  subhub,
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
const CUSTOMER = {
  payment_type: 'card',
  last4: 8675,
  exp_month: 8,
  exp_year: 2020,
};
const PLAN_ID_1 = 'plan_G93lTs8hfK7NNG';
const PLANS = [
  {
    plan_id: 'firefox_pro_basic_823',
    plan_name: 'Firefox Pro Basic Weekly',
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
    plan_name: 'Firefox Pro Pro Monthly',
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
    plan_name: 'Basic FN',
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
const PAYMENT_TOKEN_VALID = '8675309-foobarbaz';
const PAYMENT_TOKEN_NEW = 'new-8675309';
const PAYMENT_TOKEN_BAD = 'thisisabadtoken';
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
    subhub,
    profile,
    payments
  );
  route = getRoute(routes, routePath, requestOptions.method || 'GET');
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}));

  return route.handler(request);
}

describe('sanitizePlans', () => {
  it('removes capabilities from product & plan metadata', () => {
    const expected = [
      {
        plan_id: 'firefox_pro_basic_823',
        plan_name: 'Firefox Pro Basic Weekly',
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
        plan_name: 'Firefox Pro Pro Monthly',
        product_id: 'firefox_pro_pro',
        product_name: 'Firefox Pro Pro',
        interval: 'month',
        amount: '456',
        currency: 'usd',
        product_metadata: {},
      },
      {
        plan_id: PLAN_ID_1,
        plan_name: 'Basic FN',
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

describe('subscriptions - subhub integration', () => {
  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
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
    subhub = mocks.mockSubHub({
      getCustomer: sinon.spy(async () => CUSTOMER),
      listPlans: sinon.spy(async () => PLANS),
      createSubscription: sinon.spy(async (uid, token, plan_id) => ({
        subscriptions: [{ subscription_id: SUBSCRIPTION_ID_1 }],
      })),
      cancelSubscription: sinon.spy(async (uid, subscriptionId) => true),
      updateCustomer: sinon.spy(async (uid, token) => ({})),
      updateSubscription: sinon.spy(
        async (uid, subscriptionId, planId) => ({})
      ),
    });

    profile = mocks.mockProfile({
      deleteCache: sinon.spy(async uid => ({})),
    });

    requestOptions = {
      metricsContext: mocks.mockMetricsContext(),
      credentials: {
        user: UID,
        email: TEST_EMAIL,
        scope: MOCK_SCOPES,
      },
      log: log,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
    };
  });

  describe('with config.subscriptions.enabled = false', () => {
    it('should not set up any routes', async () => {
      config.subscriptions.enabled = false;
      routes = require('../../../lib/routes/subscriptions')(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        subhub,
        profile
      );
      assert.deepEqual(routes, []);
    });
  });

  describe('GET /oauth/subscriptions/plans', () => {
    it('should list available subscription plans', async () => {
      const res = await runTest('/oauth/subscriptions/plans', requestOptions);
      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(res, sanitizePlans(PLANS));
    });

    it('should correctly handle payment backend failure', async () => {
      subhub.listPlans = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/plans', requestOptions);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });

    it('should filter out capabilities from plan or product metadata', async () => {
      subhub.listPlans = sinon.spy(async () =>
        PLANS.map(plan => ({
          ...plan,
          product_metadata: {
            'capabilities:abcdef': '123done,321done',
            'capabilities:fdecba': '123456,654321',
          },
          plan_metadata: {
            'capabilities:123456': '123done,321done',
            'capabilities:8675309': '123456,654321',
          },
        }))
      );

      const res = await runTest('/oauth/subscriptions/plans', requestOptions);
      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(
        res,
        PLANS.map(plan => ({
          ...plan,
          product_metadata: {},
          plan_metadata: {},
        }))
      );
    });
  });

  describe('GET /oauth/subscriptions/active', () => {
    it('should list active subscriptions', async () => {
      const res = await runTest('/oauth/subscriptions/active', requestOptions);
      assert.equal(db.fetchAccountSubscriptions.callCount, 1);
      assert.equal(db.fetchAccountSubscriptions.args[0][0], UID);
      assert.deepEqual(res, ACTIVE_SUBSCRIPTIONS);
    });
  });

  describe('GET /oauth/subscriptions/customer', () => {
    it('should fetch customer information', async () => {
      const res = await runTest(
        '/oauth/subscriptions/customer',
        requestOptions
      );
      assert.equal(subhub.getCustomer.callCount, 1);
      assert.equal(subhub.getCustomer.args[0][0], UID);
      assert.deepEqual(res, CUSTOMER);
    });

    it('should report error for unknown customer', async () => {
      subhub.getCustomer = sinon.spy(async () => {
        throw error.unknownCustomer(UID);
      });
      try {
        await runTest('/oauth/subscriptions/customer', requestOptions);
        assert.fail();
      } catch (err) {
        assert.equal(subhub.getCustomer.callCount, 1);
        assert.equal(subhub.getCustomer.args[0][0], UID);
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('should correctly handle payment backend failure', async () => {
      subhub.getCustomer = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/customer', requestOptions);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });
  });

  describe('POST /oauth/subscriptions/active', () => {
    it('should support creation of a new subscription', async () => {
      const res = await runTest('/oauth/subscriptions/active', {
        ...requestOptions,
        method: 'POST',
        payload: {
          ...requestOptions.payload,
          planId: PLANS[0].plan_id,
          displayName: DISPLAY_NAME,
          paymentToken: PAYMENT_TOKEN_VALID,
        },
      });

      assert.equal(customs.check.callCount, 1, 'calls customs.check');

      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(subhub.createSubscription.args, [
        [UID, PAYMENT_TOKEN_VALID, PLANS[0].plan_id, DISPLAY_NAME, TEST_EMAIL],
      ]);
      assert.equal(db.createAccountSubscription.callCount, 1);

      const createArgs = db.createAccountSubscription.args[0][0];
      assert.deepEqual(createArgs, {
        uid: UID,
        subscriptionId: SUBSCRIPTION_ID_1,
        productId: PLANS[0].product_id,
        createdAt: createArgs.createdAt,
      });
      assert.deepEqual(res, { subscriptionId: SUBSCRIPTION_ID_1 });

      assert.equal(
        push.notifyProfileUpdated.callCount,
        1,
        'call push.notifyProfileUpdated'
      );
      assert.equal(log.notifyAttachedServices.callCount, 1, 'logs verified');
      assert.equal(log.notifyAttachedServices.args[0][0], 'profileDataChanged');
      assert.deepEqual(log.notifyAttachedServices.args[0][2], {
        uid: UID,
        email: TEST_EMAIL,
      });
      assert.equal(profile.deleteCache.args[0][0], UID);

      assert.equal(mailer.sendDownloadSubscriptionEmail.callCount, 1);
      const args = mailer.sendDownloadSubscriptionEmail.args[0];
      assert.lengthOf(args, 3);
      assert.isArray(args[0]);
      assert.equal(args[1].uid, UID);
      assert.deepEqual(args[2], {
        acceptLanguage: ACCOUNT_LOCALE,
        planDownloadURL: PLANS[0].product_metadata.downloadURL,
        planEmailIconURL: PLANS[0].product_metadata.emailIconURL,
        planId: PLANS[0].plan_id,
        productId: PLANS[0].product_id,
        productName: PLANS[0].product_name,
      });
    });

    it('should correctly handle payment backend failure on listing plans', async () => {
      subhub.listPlans = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(subhub.createSubscription.callCount, 0);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment backend failure on create', async () => {
      subhub.createSubscription = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle an unknown plan', async () => {
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: 'thisisnotaplan',
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment token rejection', async () => {
      subhub.createSubscription = sinon.spy(async (uid, token, plan_id) => {
        throw error.rejectedSubscriptionPaymentToken(token);
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_BAD,
          },
        });
        assert.fail();
      } catch (err) {
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });
  });

  describe('POST /oauth/subscriptions/updatePayment', () => {
    it('should allow updating of payment method', async () => {
      // TODO: TBD subhub response for updatePayment, do something with it?
      await runTest('/oauth/subscriptions/updatePayment', {
        ...requestOptions,
        method: 'POST',
        payload: { paymentToken: PAYMENT_TOKEN_NEW },
      });
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.updateCustomer.args, [[UID, PAYMENT_TOKEN_NEW]]);
    });

    it('should correctly handle subscription backend failure', async () => {
      subhub.updateCustomer = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/updatePayment', {
          ...requestOptions,
          method: 'POST',
          payload: { paymentToken: PAYMENT_TOKEN_NEW },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment token rejection', async () => {
      subhub.updateCustomer = sinon.spy(async (uid, token) => {
        throw error.rejectedSubscriptionPaymentToken(token);
      });
      try {
        await runTest('/oauth/subscriptions/updatePayment', {
          ...requestOptions,
          method: 'POST',
          payload: { paymentToken: PAYMENT_TOKEN_BAD },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(subhub.updateCustomer.args, [
          [UID, PAYMENT_TOKEN_BAD],
        ]);
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
      }
    });
  });

  describe('PUT /oauth/subscriptions/active/{subscriptionId}', () => {
    it('should allow updating of subscription plan', async () => {
      await runTest('/oauth/subscriptions/active/{subscriptionId}', {
        ...requestOptions,
        method: 'PUT',
        payload: { planId: PLAN_ID_1 },
        params: { subscriptionId: SUBSCRIPTION_ID_1 },
      });
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.updateSubscription.args, [
        [UID, SUBSCRIPTION_ID_1, PLAN_ID_1],
      ]);
      assert.deepEqual(db.deleteAccountSubscription.args[0], [
        UID,
        SUBSCRIPTION_ID_1,
      ]);
      const createArgs = db.createAccountSubscription.args[0][0];
      assert.deepEqual(createArgs, {
        uid: UID,
        subscriptionId: SUBSCRIPTION_ID_1,
        productId: PLANS[2].product_id,
        createdAt: createArgs.createdAt,
      });
    });

    it('should correctly handle an error from subhub', async () => {
      subhub.updateSubscription = sinon.fake.throws(
        error.subscriptionAlreadyChanged()
      );
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'PUT',
          payload: { planId: PLAN_ID_1 },
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
      }
    });

    describe('with direct Stripe', () => {
      let payments;

      beforeEach(() => {
        payments = sinon.stub({});
        payments.verifyPlanUpgradeForSubscription = sinon.fake();
        payments.changeSubscriptionPlan = sinon.fake.returns(subscription2);
        payments.refreshCachedCustomer = sinon.fake();
        payments.subscriptionForCustomer = sinon.fake.returns({
          id: SUBSCRIPTION_ID_1,
          plan: { product: PLANS[0].product_id },
        });
      });

      it('should allow updating of subscription plan', async () => {
        await runTest(
          '/oauth/subscriptions/active/{subscriptionId}',
          {
            ...requestOptions,
            method: 'PUT',
            payload: { planId: PLAN_ID_1 },
            params: { subscriptionId: SUBSCRIPTION_ID_1 },
          },
          payments
        );
        assert.equal(customs.check.callCount, 1, 'calls customs.check');
        assert.deepEqual(payments.verifyPlanUpgradeForSubscription.args, [
          [PLANS[0].id, PLAN_ID_1],
        ]);
      });

      it('should correctly handle an error from stripeHelper', async () => {
        payments.verifyPlanUpgradeForSubscription = sinon.fake.throws(
          error.unknownSubscriptionPlan()
        );
        try {
          await runTest(
            '/oauth/subscriptions/active/{subscriptionId}',
            {
              ...requestOptions,
              method: 'PUT',
              payload: { planId: PAYMENT_TOKEN_NEW },
              params: { subscriptionId: SUBSCRIPTION_ID_1 },
            },
            payments
          );
          assert.fail();
        } catch (err) {
          assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        }
      });
    });
  });

  describe('DELETE /oauth/subscriptions/active/{subscriptionId}', () => {
    it('should support cancellation of an existing subscription', async () => {
      const res = await runTest(
        '/oauth/subscriptions/active/{subscriptionId}',
        {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        }
      );
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.cancelSubscription.args, [
        [UID, SUBSCRIPTION_ID_1],
      ]);
      assert.equal(db.deleteAccountSubscription.callCount, 0);
      assert.equal(db.cancelAccountSubscription.callCount, 1);
      const args = db.cancelAccountSubscription.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);
      assert.isAbove(args[2], Date.now() - 1000);
      assert.isAtMost(args[2], Date.now());
      assert.deepEqual(res, { subscriptionId: 'sub-8675309' });

      assert.equal(
        push.notifyProfileUpdated.callCount,
        1,
        'call push.notifyProfileUpdated'
      );
      assert.equal(log.notifyAttachedServices.callCount, 1, 'logs verified');
      assert.equal(log.notifyAttachedServices.args[0][0], 'profileDataChanged');
      assert.deepEqual(log.notifyAttachedServices.args[0][2], {
        uid: UID,
        email: TEST_EMAIL,
      });
      assert.equal(profile.deleteCache.args[0][0], UID);
    });

    it('should report error for unknown subscription', async () => {
      const badSub = 'notasub';
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: badSub },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(db.getAccountSubscription.args, [[UID, badSub]]);
        assert.deepEqual(subhub.cancelSubscription.args, []);
        assert.deepEqual(db.deleteAccountSubscription.args, []);
        assert.equal(db.cancelAccountSubscription.callCount, 0);
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }
    });

    it('should report error for subscription already cancelled', async () => {
      db.cancelAccountSubscription = sinon.spy(() =>
        P.reject({ statusCode: 404, errno: 116 })
      );
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.equal(db.cancelAccountSubscription.callCount, 1);
        assert.deepEqual(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CANCELLED);
      }
    });

    it('should not delete subscription from DB after payment backend failure', async () => {
      subhub.cancelSubscription = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(db.getAccountSubscription.args, [
          [UID, SUBSCRIPTION_ID_1],
        ]);
        assert.deepEqual(subhub.cancelSubscription.args, [
          [UID, SUBSCRIPTION_ID_1],
        ]);
        assert.deepEqual(db.deleteAccountSubscription.args, []);
        assert.equal(db.cancelAccountSubscription.callCount, 0);
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });
  });

  describe('POST /oauth/subscriptions/reactivate', () => {
    it('should reactivate cancelled subscriptions', async () => {
      const res = await runTest('/oauth/subscriptions/reactivate', {
        ...requestOptions,
        method: 'POST',
        payload: { subscriptionId: SUBSCRIPTION_ID_1 },
      });

      assert.equal(customs.check.callCount, 1);

      assert.equal(subhub.reactivateSubscription.callCount, 1);
      let args = subhub.reactivateSubscription.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);

      assert.equal(db.reactivateAccountSubscription.callCount, 1);
      args = db.reactivateAccountSubscription.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);

      assert.equal(push.notifyProfileUpdated.callCount, 1);
      args = push.notifyProfileUpdated.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.isArray(args[1]);

      assert.equal(log.notifyAttachedServices.callCount, 1);
      args = log.notifyAttachedServices.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], 'profileDataChanged');
      assert.isObject(args[1]);
      assert.deepEqual(args[2], {
        uid: UID,
        email: TEST_EMAIL,
      });

      assert.equal(profile.deleteCache.args[0][0], UID);

      assert.deepEqual(res, {});
    });

    it('should fail to reactivate non-existent subscriptions', async () => {
      let failed = false;

      try {
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: 'notasub' },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 0);
        assert.equal(db.reactivateAccountSubscription.callCount, 0);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }

      assert.isTrue(failed);
    });

    it('should propagate errors from subhub', async () => {
      let failed = false;

      try {
        subhub.reactivateSubscription = sinon.spy(async () => {
          throw error.backendServiceFailure();
        });
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 1);
        assert.equal(db.reactivateAccountSubscription.callCount, 0);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }

      assert.isTrue(failed);
    });

    it('should propagate errors from db', async () => {
      let failed = false;

      try {
        db.reactivateAccountSubscription = sinon.spy(async () => {
          throw error.unknownSubscription();
        });
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 1);
        assert.equal(db.reactivateAccountSubscription.callCount, 1);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }

      assert.isTrue(failed);
    });
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

  describe.skip('listActive', () => {
    it('should list active subscriptions', async () => {
      const stripeHelper = mocks.mockStripeHelper(['customer']);

      stripeHelper.customer = sinon.spy(async (uid, customer) => {
        return CUSTOMER;
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

      const res = await directStripeRoutes.listActive(VALID_REQUEST);
      assert.equal(db.fetchAccountSubscriptions.callCount, 1);
      assert.equal(db.fetchAccountSubscriptions.args[0][0], UID);
      assert.deepEqual(res, ACTIVE_SUBSCRIPTIONS);
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

  describe.skip('GET /oauth/subscriptions/customer', () => {
    it('should fetch customer information', async () => {
      const res = await runTest(
        '/oauth/subscriptions/customer',
        requestOptions
      );
      assert.equal(subhub.getCustomer.callCount, 1);
      assert.equal(subhub.getCustomer.args[0][0], UID);
      assert.deepEqual(res, CUSTOMER);
    });

    it('should report error for unknown customer', async () => {
      subhub.getCustomer = sinon.spy(async () => {
        throw error.unknownCustomer(UID);
      });
      try {
        await runTest('/oauth/subscriptions/customer', requestOptions);
        assert.fail();
      } catch (err) {
        assert.equal(subhub.getCustomer.callCount, 1);
        assert.equal(subhub.getCustomer.args[0][0], UID);
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }
    });

    it('should correctly handle payment backend failure', async () => {
      subhub.getCustomer = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/customer', requestOptions);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });
  });

  describe.skip('POST /oauth/subscriptions/active', () => {
    it('should support creation of a new subscription', async () => {
      const res = await runTest('/oauth/subscriptions/active', {
        ...requestOptions,
        method: 'POST',
        payload: {
          ...requestOptions.payload,
          planId: PLANS[0].plan_id,
          displayName: DISPLAY_NAME,
          paymentToken: PAYMENT_TOKEN_VALID,
        },
      });

      assert.equal(customs.check.callCount, 1, 'calls customs.check');

      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(subhub.createSubscription.args, [
        [UID, PAYMENT_TOKEN_VALID, PLANS[0].plan_id, DISPLAY_NAME, TEST_EMAIL],
      ]);
      assert.equal(db.createAccountSubscription.callCount, 1);

      const createArgs = db.createAccountSubscription.args[0][0];
      assert.deepEqual(createArgs, {
        uid: UID,
        subscriptionId: SUBSCRIPTION_ID_1,
        productId: PLANS[0].product_id,
        createdAt: createArgs.createdAt,
      });
      assert.deepEqual(res, { subscriptionId: SUBSCRIPTION_ID_1 });

      assert.equal(
        push.notifyProfileUpdated.callCount,
        1,
        'call push.notifyProfileUpdated'
      );
      assert.equal(log.notifyAttachedServices.callCount, 1, 'logs verified');
      assert.equal(log.notifyAttachedServices.args[0][0], 'profileDataChanged');
      assert.deepEqual(log.notifyAttachedServices.args[0][2], {
        uid: UID,
        email: TEST_EMAIL,
      });
      assert.equal(profile.deleteCache.args[0][0], UID);

      assert.equal(mailer.sendDownloadSubscriptionEmail.callCount, 1);
      const args = mailer.sendDownloadSubscriptionEmail.args[0];
      assert.lengthOf(args, 3);
      assert.isArray(args[0]);
      assert.equal(args[1].uid, UID);
      assert.deepEqual(args[2], {
        acceptLanguage: ACCOUNT_LOCALE,
        planDownloadURL: PLANS[0].product_metadata.downloadURL,
        planEmailIconURL: PLANS[0].product_metadata.emailIconURL,
        planId: PLANS[0].plan_id,
        productId: PLANS[0].product_id,
        productName: PLANS[0].product_name,
      });
    });

    it('should correctly handle payment backend failure on listing plans', async () => {
      subhub.listPlans = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(subhub.createSubscription.callCount, 0);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment backend failure on create', async () => {
      subhub.createSubscription = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle an unknown plan', async () => {
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: 'thisisnotaplan',
            paymentToken: PAYMENT_TOKEN_VALID,
          },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment token rejection', async () => {
      subhub.createSubscription = sinon.spy(async (uid, token, plan_id) => {
        throw error.rejectedSubscriptionPaymentToken(token);
      });
      try {
        await runTest('/oauth/subscriptions/active', {
          ...requestOptions,
          method: 'POST',
          payload: {
            ...requestOptions.payload,
            planId: PLANS[0].plan_id,
            paymentToken: PAYMENT_TOKEN_BAD,
          },
        });
        assert.fail();
      } catch (err) {
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });
  });

  describe.skip('POST /oauth/subscriptions/updatePayment', () => {
    it('should allow updating of payment method', async () => {
      // TODO: TBD subhub response for updatePayment, do something with it?
      await runTest('/oauth/subscriptions/updatePayment', {
        ...requestOptions,
        method: 'POST',
        payload: { paymentToken: PAYMENT_TOKEN_NEW },
      });
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.updateCustomer.args, [[UID, PAYMENT_TOKEN_NEW]]);
    });

    it('should correctly handle subscription backend failure', async () => {
      subhub.updateCustomer = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/updatePayment', {
          ...requestOptions,
          method: 'POST',
          payload: { paymentToken: PAYMENT_TOKEN_NEW },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(db.createAccountSubscription.callCount, 0);
      }
    });

    it('should correctly handle payment token rejection', async () => {
      subhub.updateCustomer = sinon.spy(async (uid, token) => {
        throw error.rejectedSubscriptionPaymentToken(token);
      });
      try {
        await runTest('/oauth/subscriptions/updatePayment', {
          ...requestOptions,
          method: 'POST',
          payload: { paymentToken: PAYMENT_TOKEN_BAD },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(subhub.updateCustomer.args, [
          [UID, PAYMENT_TOKEN_BAD],
        ]);
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
      }
    });
  });

  describe.skip('PUT /oauth/subscriptions/active/{subscriptionId}', () => {
    it('should allow updating of subscription plan', async () => {
      await runTest('/oauth/subscriptions/active/{subscriptionId}', {
        ...requestOptions,
        method: 'PUT',
        payload: { planId: PLAN_ID_1 },
        params: { subscriptionId: SUBSCRIPTION_ID_1 },
      });
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.updateSubscription.args, [
        [UID, SUBSCRIPTION_ID_1, PLAN_ID_1],
      ]);
      assert.deepEqual(db.deleteAccountSubscription.args[0], [
        UID,
        SUBSCRIPTION_ID_1,
      ]);
      const createArgs = db.createAccountSubscription.args[0][0];
      assert.deepEqual(createArgs, {
        uid: UID,
        subscriptionId: SUBSCRIPTION_ID_1,
        productId: PLANS[2].product_id,
        createdAt: createArgs.createdAt,
      });
    });

    it('should correctly handle an error from subhub', async () => {
      subhub.updateSubscription = sinon.fake.throws(
        error.subscriptionAlreadyChanged()
      );
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'PUT',
          payload: { planId: PLAN_ID_1 },
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CHANGED);
      }
    });

    describe('with direct Stripe', () => {
      let payments;

      beforeEach(() => {
        payments = sinon.stub({});
      });

      it('should allow updating of subscription plan', async () => {
        payments.verifyPlanUpgradeForSubscription = sinon.fake();
        payments.changeSubscriptionPlan = sinon.fake.returns(subscription2);
        payments.refreshCachedCustomer = sinon.fake();
        await runTest(
          '/oauth/subscriptions/active/{subscriptionId}',
          {
            ...requestOptions,
            method: 'PUT',
            payload: { planId: PLAN_ID_1 },
            params: { subscriptionId: SUBSCRIPTION_ID_1 },
          },
          payments
        );
        assert.equal(customs.check.callCount, 1, 'calls customs.check');
        assert.deepEqual(payments.verifyPlanUpgradeForSubscription.args, [
          [PLANS[0].product_id, PLAN_ID_1],
        ]);
        assert.equal(payments.refreshCachedCustomer.callCount, 1);
      });

      it('should correctly handle an error from stripeHelper', async () => {
        payments.verifyPlanUpgradeForSubscription = sinon.fake.throws(
          error.unknownSubscriptionPlan()
        );
        try {
          await runTest(
            '/oauth/subscriptions/active/{subscriptionId}',
            {
              ...requestOptions,
              method: 'PUT',
              payload: { planId: PAYMENT_TOKEN_NEW },
              params: { subscriptionId: SUBSCRIPTION_ID_1 },
            },
            payments
          );
          assert.fail();
        } catch (err) {
          assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        }
      });
    });
  });

  describe.skip('DELETE /oauth/subscriptions/active/{subscriptionId}', () => {
    it('should support cancellation of an existing subscription', async () => {
      const res = await runTest(
        '/oauth/subscriptions/active/{subscriptionId}',
        {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        }
      );
      assert.equal(customs.check.callCount, 1, 'calls customs.check');
      assert.deepEqual(subhub.cancelSubscription.args, [
        [UID, SUBSCRIPTION_ID_1],
      ]);
      assert.equal(db.deleteAccountSubscription.callCount, 0);
      assert.equal(db.cancelAccountSubscription.callCount, 1);
      const args = db.cancelAccountSubscription.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);
      assert.isAbove(args[2], Date.now() - 1000);
      assert.isAtMost(args[2], Date.now());
      assert.deepEqual(res, { subscriptionId: 'sub-8675309' });

      assert.equal(
        push.notifyProfileUpdated.callCount,
        1,
        'call push.notifyProfileUpdated'
      );
      assert.equal(log.notifyAttachedServices.callCount, 1, 'logs verified');
      assert.equal(log.notifyAttachedServices.args[0][0], 'profileDataChanged');
      assert.deepEqual(log.notifyAttachedServices.args[0][2], {
        uid: UID,
        email: TEST_EMAIL,
      });
      assert.equal(profile.deleteCache.args[0][0], UID);
    });

    it('should report error for unknown subscription', async () => {
      const badSub = 'notasub';
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: badSub },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(db.getAccountSubscription.args, [[UID, badSub]]);
        assert.deepEqual(subhub.cancelSubscription.args, []);
        assert.deepEqual(db.deleteAccountSubscription.args, []);
        assert.equal(db.cancelAccountSubscription.callCount, 0);
        assert.deepEqual(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }
    });

    it('should report error for subscription already cancelled', async () => {
      db.cancelAccountSubscription = sinon.spy(() =>
        P.reject({ statusCode: 404, errno: 116 })
      );
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.equal(db.cancelAccountSubscription.callCount, 1);
        assert.deepEqual(err.errno, error.ERRNO.SUBSCRIPTION_ALREADY_CANCELLED);
      }
    });

    it('should not delete subscription from DB after payment backend failure', async () => {
      subhub.cancelSubscription = sinon.spy(async () => {
        throw error.backendServiceFailure();
      });
      try {
        await runTest('/oauth/subscriptions/active/{subscriptionId}', {
          ...requestOptions,
          method: 'DELETE',
          params: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
        assert.fail();
      } catch (err) {
        assert.deepEqual(db.getAccountSubscription.args, [
          [UID, SUBSCRIPTION_ID_1],
        ]);
        assert.deepEqual(subhub.cancelSubscription.args, [
          [UID, SUBSCRIPTION_ID_1],
        ]);
        assert.deepEqual(db.deleteAccountSubscription.args, []);
        assert.equal(db.cancelAccountSubscription.callCount, 0);
        assert.deepEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }
    });
  });

  describe.skip('POST /oauth/subscriptions/reactivate', () => {
    it('should reactivate cancelled subscriptions', async () => {
      const res = await runTest('/oauth/subscriptions/reactivate', {
        ...requestOptions,
        method: 'POST',
        payload: { subscriptionId: SUBSCRIPTION_ID_1 },
      });

      assert.equal(customs.check.callCount, 1);

      assert.equal(subhub.reactivateSubscription.callCount, 1);
      let args = subhub.reactivateSubscription.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);

      assert.equal(db.reactivateAccountSubscription.callCount, 1);
      args = db.reactivateAccountSubscription.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.equal(args[1], SUBSCRIPTION_ID_1);

      assert.equal(push.notifyProfileUpdated.callCount, 1);
      args = push.notifyProfileUpdated.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], UID);
      assert.isArray(args[1]);

      assert.equal(log.notifyAttachedServices.callCount, 1);
      args = log.notifyAttachedServices.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], 'profileDataChanged');
      assert.isObject(args[1]);
      assert.deepEqual(args[2], {
        uid: UID,
        email: TEST_EMAIL,
      });

      assert.equal(profile.deleteCache.args[0][0], UID);

      assert.deepEqual(res, {});
    });

    it('should fail to reactivate non-existent subscriptions', async () => {
      let failed = false;

      try {
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: 'notasub' },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 0);
        assert.equal(db.reactivateAccountSubscription.callCount, 0);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }

      assert.isTrue(failed);
    });

    it('should propagate errors from subhub', async () => {
      let failed = false;

      try {
        subhub.reactivateSubscription = sinon.spy(async () => {
          throw error.backendServiceFailure();
        });
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 1);
        assert.equal(db.reactivateAccountSubscription.callCount, 0);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }

      assert.isTrue(failed);
    });

    it('should propagate errors from db', async () => {
      let failed = false;

      try {
        db.reactivateAccountSubscription = sinon.spy(async () => {
          throw error.unknownSubscription();
        });
        await runTest('/oauth/subscriptions/reactivate', {
          ...requestOptions,
          method: 'POST',
          payload: { subscriptionId: SUBSCRIPTION_ID_1 },
        });
      } catch (err) {
        failed = true;

        assert.equal(subhub.reactivateSubscription.callCount, 1);
        assert.equal(db.reactivateAccountSubscription.callCount, 1);
        assert.equal(push.notifyProfileUpdated.callCount, 0);
        assert.equal(log.notifyAttachedServices.callCount, 0);

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }

      assert.isTrue(failed);
    });
  });

  describe.skip('POST /oauth/subscriptions/stripe/event', () => {
    const webhookHandlerPath = '/oauth/subscriptions/stripe/event';
    const customer = {
      id: 'cus_9001',
      email: 'quuz@blackhole.example.io',
      metadata: { userid: 'fxauidishere' },
    };
    const event = {
      type: 'customer.updated',
      data: {
        object: customer,
      },
    };

    it('should check for the "stripe-signature" header', async () => {
      const route = getRoute(routes, webhookHandlerPath, 'POST');
      assert.hasAllKeys(route.options.validate.headers, 'stripe-signature');
    });

    it('should refresh a cached customer on a customer.update event', async () => {
      subhub.stripeHelper = {
        constructWebhookEvent: sinon.stub().returns(event),
        refreshCachedCustomer: sinon.stub(),
      };
      await runTest(webhookHandlerPath, {
        ...requestOptions,
        method: 'POST',
      });
      assert.isTrue(
        subhub.stripeHelper.refreshCachedCustomer.calledOnceWith(
          event.data.object.metadata.userid,
          event.data.object.email
        )
      );
      delete subhub.stripeHelper;
    });

    it('should log an error if the customer does not have a FxA UID', async () => {
      const fakeScope = { setConetxt: sinon.spy() };
      sinon.stub(Sentry, 'withScope');
      sinon.stub(Sentry, 'captureMessage');
      subhub.stripeHelper = {
        constructWebhookEvent: sinon.stub().returns({
          ...event,
          data: { object: { ...customer, metadata: {} } },
        }),
        refreshCachedCustomer: sinon.stub(),
      };
      await runTest(webhookHandlerPath, {
        ...requestOptions,
        method: 'POST',
      });
      // Call the withScope callback with our scope.
      Sentry.withScope.arguments[0][0](fakeScope);
      assert.isTrue(
        fakeScope.setConetxt.calledOnceWith('stripeEvent', {
          customer: { id: event.data.object.id },
          event: { id: event.id, type: event.type },
        })
      );
      assert.isTrue(
        Sentry.captureMessage.calledOnceWith(
          'FxA UID does not exist on customer metadata.',
          Sentry.Severity.Error
        )
      );
      Sentry.withScope.restore();
      Sentry.captureMessage.restore();
      delete subhub.stripeHelper;
    });

    it('should warn about a unhandled event type', async () => {
      const fakeScope = { setConetxt: sinon.spy() };
      sinon.stub(Sentry, 'withScope');
      sinon.stub(Sentry, 'captureMessage');
      subhub.stripeHelper = {
        constructWebhookEvent: sinon.stub().returns({
          ...event,
          type: 'top.secret',
        }),
      };
      await runTest(webhookHandlerPath, {
        ...requestOptions,
        method: 'POST',
      });
      assert.isTrue(
        fakeScope.setConetxt.calledOnceWith('stripeEvent', {
          event: { id: event.id, type: event.type },
        })
      );
      assert.isTrue(
        Sentry.captureMessage.calledOnceWith(
          'Unhandled Stripe event received.',
          Sentry.Severity.Info
        )
      );
      Sentry.withScope.restore();
      Sentry.captureMessage.restore();
      delete subhub.stripeHelper;
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
      },
    };

    beforeEach(() => {
      const subscription = Object.create(subscription2);
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
            plan
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
        const customer = Object.create(customerFixture);
        directStripeRoutesInstance.stripeHelper.fetchCustomer.resolves(
          customer
        );

        actual = await directStripeRoutesInstance.createSubscription(request);
        assert.isTrue(log.begin.calledOnce);
        assert.isTrue(customs.check.calledOnce);
        assert.isTrue(createForNewStub.notCalled);
        assert.isTrue(
          createForExistingStub.calledOnceWith(customer, paymentToken, plan)
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
      directStripeRoutesInstance.stripeHelper.createCustomer.returns(
        emptyCustomer
      );
      directStripeRoutesInstance.stripeHelper.createSubscription.returns(
        subscription2
      );

      const actual = await directStripeRoutesInstance.createSubscriptionNewCustomer(
        UID,
        TEST_EMAIL,
        DISPLAY_NAME,
        PAYMENT_TOKEN_NEW,
        PLANS[0]
      );

      assert.deepEqual(expected, actual);
    });
  });

  describe('createSubscriptionExistingCustomer', () => {
    let customer;
    const selectedPlan = {
      plan_id: 'plan_G93mMKnIFCjZek',
      plan_name: 'Firefox Pro Basic Weekly',
      product_id: 'firefox_pro_basic',
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
      customer = Object.create(emptyCustomer);
    });

    describe('the optional paymentToken parameter', () => {
      beforeEach(() => {
        directStripeRoutesInstance.stripeHelper.updateCustomerPaymentMethod.returns();
      });

      describe('when a payment token is provided', () => {
        it('calls updateCustomerPaymentMethod', async () => {
          const expected = Object.create(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            paymentToken,
            selectedPlan
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
          const expected = Object.create(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan
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
        const expected = Object.create(subscription2);
        directStripeRoutesInstance.stripeHelper.createSubscription.returns(
          expected
        );
        const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
          customer,
          null,
          selectedPlan
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
        existingSubscription = Object.create(subscription2);
        handleStub = sandbox
          .stub(directStripeRoutesInstance, 'handleOpenInvoice')
          .resolves();
      });

      describe('there is no latest invoice', () => {
        it('calls createSubscription', async () => {
          existingSubscription.latest_invoice = null;
          customer.subscriptions.data = [existingSubscription];

          const expected = Object.create(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan
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
          invoice = Object.create(openInvoice);
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan
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
          invoice = Object.create(openInvoice);
          invoice.status = 'paid';
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          return directStripeRoutesInstance
            .createSubscriptionExistingCustomer(customer, null, selectedPlan)
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
          invoice = Object.create(openInvoice);
          invoice.status = 'draft';
          existingSubscription.latest_invoice = invoice;
          customer.subscriptions.data = [existingSubscription];

          const expected = Object.create(subscription2);
          directStripeRoutesInstance.stripeHelper.createSubscription.returns(
            expected
          );
          const actual = await directStripeRoutesInstance.createSubscriptionExistingCustomer(
            customer,
            null,
            selectedPlan
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
  });

  describe('handleOpenInvoice', () => {
    describe('when the payment_intent status requires payment method', () => {
      it('calls payInvoice', async () => {
        const invoice = Object.create(openInvoice);
        invoice.payment_intent = Object.create(openPaymentIntent);

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
        const invoice = Object.create(openInvoice);
        invoice.payment_intent = Object.create(closedPaymementIntent);

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
      const customer = Object.create(customerFixture);
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
      const customer = Object.create(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription];

      it('returns the Subscription when the plan id is found - first in array', () => {
        const expected = customerFixture.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customerFixture,
          'plan_1'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found - not first in array', () => {
        const expected = customerFixture.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customerFixture,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
            customerFixture,
            'plan_3'
          )
        );
      });
    });

    describe('Customer has Multiple Subscriptions', () => {
      const customer = Object.create(customerFixture);
      customer.subscriptions.data = [multiPlanSubscription, subscription2];

      it('returns the Subscription when the plan id is found in the first subscription', () => {
        const expected = customerFixture.subscriptions.data[0];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customerFixture,
          'plan_2'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns the Subscription when the plan id is found in not the first subscription', () => {
        const expected = customerFixture.subscriptions.data[1];
        const actual = directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
          customerFixture,
          'plan_G93mMKnIFCjZek'
        );

        assert.deepEqual(actual, expected);
      });

      it('returns `undefined` when the plan id is not found', () => {
        assert.isUndefined(
          directStripeRoutesInstance.findCustomerSubscriptionByPlanId(
            customerFixture,
            'plan_test2'
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

  describe('listActive', () => {});

  describe('getCustomer', () => {
    describe('customer is found', () => {
      let customer;

      beforeEach(() => {
        customer = Object.create(emptyCustomer);
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
              brand: customer.sources.data[0].brand,
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
      const event = Object.create(subscriptionUpdatedFromIncomplete);
      const subscription = Object.create(subscription2);
      const sub = { id: subscription.id, productId: subscription.plan.product };

      directStripeRoutesInstance.stripeHelper.allPlans.returns(PLANS);

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
            productCapabilities: [],
          }
        ),
        'Expected log.notifyAttachedServices to be called'
      );
    });
  });

  describe('updateCustomerAndSendStatus', () => {
    let event;

    beforeEach(() => {
      event = Object.create(subscriptionUpdatedFromIncomplete);
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
    let sendStub;

    beforeEach(() => {
      directStripeRoutesInstance.stripeHelper.getCustomerUidEmailFromSubscription.resolves(
        { uid: UID, email: TEST_EMAIL }
      );
      sendStub = sandbox
        .stub(directStripeRoutesInstance, 'sendSubscriptionStatusToSqs')
        .resolves(true);
    });

    describe('handleWebhookEvent', () => {
      let subCreatedStub, subUpdatedStub, subDeletedStub;
      let scopeContextSpy, scopeSpy;
      const request = {
        payload: {},
        headers: {
          'stripe-signature': 'stripe_123',
        },
      };
      beforeEach(() => {
        subCreatedStub = sandbox
          .stub(directStripeRoutesInstance, 'handleSubscriptionCreatedEvent')
          .resolves();
        subUpdatedStub = sandbox
          .stub(directStripeRoutesInstance, 'handleSubscriptionUpdatedEvent')
          .resolves();
        subDeletedStub = sandbox
          .stub(directStripeRoutesInstance, 'handleSubscriptionDeletedEvent')
          .resolves();

        scopeContextSpy = sinon.fake();
        scopeSpy = {
          setContext: scopeContextSpy,
        };
        sandbox.replace(Sentry, 'withScope', fn => fn(scopeSpy));
      });

      describe('when the event.type is customer.subscription.created', () => {
        it('only calls handleSubscriptionCreatedEvent', async () => {
          const createdEvent = Object.create(subscriptionCreated);
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            createdEvent
          );
          await directStripeRoutesInstance.handleWebhookEvent(request);

          assert.isTrue(
            subCreatedStub.called,
            'Expected to call handleSubscriptionCreatedEvent'
          );
          assert.isTrue(
            subUpdatedStub.notCalled,
            'Expected to not call handleSubscriptionUpdatedEvent'
          );
          assert.isTrue(
            subDeletedStub.notCalled,
            'Expected to not call handleSubscriptionDeletedEvent'
          );
          assert.isTrue(
            scopeContextSpy.notCalled,
            'Expected to not call Sentry'
          );
        });
      });

      describe('when the event.type is customer.subscription.updated', () => {
        it('only calls handleSubscriptionUpdatedEvent', async () => {
          const event = Object.create(subscriptionUpdated);
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );

          await directStripeRoutesInstance.handleWebhookEvent(request);

          assert.isTrue(
            subCreatedStub.notCalled,
            'Expected to not call handleSubscriptionCreatedEvent'
          );
          assert.isTrue(
            subUpdatedStub.called,
            'Expected to call handleSubscriptionUpdatedEvent'
          );
          assert.isTrue(
            subDeletedStub.notCalled,
            'Expected to not call handleSubscriptionDeletedEvent'
          );
          assert.isTrue(
            scopeContextSpy.notCalled,
            'Expected to not call Sentry'
          );
        });
      });

      describe('when the event.type is customer.subscription.deleted', () => {
        it('only calls handleSubscriptionDeletedEvent', async () => {
          const event = Object.create(subscriptionDeleted);
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );

          await directStripeRoutesInstance.handleWebhookEvent(request);

          assert.isTrue(
            subCreatedStub.notCalled,
            'Expected to not call handleSubscriptionCreatedEvent'
          );
          assert.isTrue(
            subUpdatedStub.notCalled,
            'Expected to not call handleSubscriptionUpdatedEvent'
          );
          assert.isTrue(
            subDeletedStub.called,
            'Expected to call handleSubscriptionDeletedEvent'
          );
          assert.isTrue(
            scopeContextSpy.notCalled,
            'Expected to not call Sentry'
          );
        });
      });

      describe('when the event.type is something else', () => {
        it('only calls sentry', async () => {
          const event = Object.create(subscriptionCreated);
          event.type = 'customer.updated';
          directStripeRoutesInstance.stripeHelper.constructWebhookEvent.returns(
            event
          );

          await directStripeRoutesInstance.handleWebhookEvent(request);

          assert.isTrue(
            subCreatedStub.notCalled,
            'Expected to not call handleSubscriptionCreatedEvent'
          );
          assert.isTrue(
            subUpdatedStub.notCalled,
            'Expected to not call handleSubscriptionUpdatedEvent'
          );
          assert.isTrue(
            subDeletedStub.notCalled,
            'Expected to not call handleSubscriptionDeletedEvent'
          );
          assert.isTrue(scopeContextSpy.calledOnce, 'Expected to call Sentry');
        });
      });
    });

    describe('handleSubscriptionUpdatedEvent', () => {
      it('emits a notification when transitioning from "incomplete" to "active/trialing"', async () => {
        const updatedEvent = Object.create(subscriptionUpdatedFromIncomplete);
        await directStripeRoutesInstance.handleSubscriptionUpdatedEvent(
          {},
          updatedEvent
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.called(profile.deleteCache);
        assert.called(sendStub);
      });

      it('does not emit a notification for any other subscription state change', async () => {
        const updatedEvent = Object.create(subscriptionUpdated);
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
        assert.notCalled(sendStub);
      });
    });

    describe('handleSubscriptionDeletedEvent', () => {
      it('emits a notification when a subscription is deleted', async () => {
        const deletedEvent = Object.create(subscriptionDeleted);
        await directStripeRoutesInstance.handleSubscriptionDeletedEvent(
          {},
          deletedEvent
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.called(profile.deleteCache);
        assert.called(sendStub);
      });
    });

    describe('handleSubscriptionCreatedEvent', () => {
      it('emits a notification when a new subscription is "active" or "trialing"', async () => {
        const createdEvent = Object.create(subscriptionCreated);
        await directStripeRoutesInstance.handleSubscriptionCreatedEvent(
          {},
          createdEvent
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper
            .getCustomerUidEmailFromSubscription
        );
        assert.called(
          directStripeRoutesInstance.stripeHelper.refreshCachedCustomer
        );
        assert.called(profile.deleteCache);
        assert.called(sendStub);
      });

      it('does not emit a notification for incomplete new subscriptions', async () => {
        const createdEvent = Object.create(subscriptionCreatedIncomplete);
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
        assert.notCalled(sendStub);
      });
    });
  });

  describe('getSubscriptions', () => {});

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
