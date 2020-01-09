/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const P = require('../../../lib/promise');

const DirectStripeRoutes = require('../../../lib/routes/subscriptions')
  .DirectStripeRoutes;
const subscription2 = require('../payments/fixtures/subscription2.json');

let config,
  log,
  directStripeRoutes,
  db,
  customs,
  push,
  mailer,
  subhub,
  payments,
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
  },
  {
    plan_id: PLAN_ID_1,
    plan_name: 'Basic FN',
    product_id: 'prod_G93l8Yn7XJHYUs',
    produuct_name: 'FN Tier 1',
    interval: 'month',
    amount: 499,
    current: 'usd',
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

describe('subscriptions', () => {
  beforeEach(() => {
    config = {
      subscriptions: {
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        clientCapabilities: {},
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
      assert.deepEqual(res, PLANS);
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
        payments.deleteCachedCustomer = sinon.fake();
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
          [PLANS[0].product_id, PLAN_ID_1],
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
describe.skip('subscriptions (using direct stripe access)', () => {
  beforeEach(() => {
    config = {
      subscriptions: {
        clientCapabilities: {},
        enabled: true,
        managementClientId: MOCK_CLIENT_ID,
        managementTokenTTL: MOCK_TTL,
        stripeApiKey: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
      },
    };

    log = mocks.mockLog();
    customs = mocks.mockCustoms();

    payments = sinon.stub();

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

    directStripeRoutes = new DirectStripeRoutes(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      payments
    );
    // Only here to make commit hook happy, remove!
    directStripeRoutes.test();
  });

  describe('GET /oauth/subscriptions/plans', () => {
    it('should list available subscription plans', async () => {
      const res = await runTest('/oauth/subscriptions/plans', requestOptions);
      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(res, PLANS);
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
      });

      it('should allow updating of subscription plan', async () => {
        payments.verifyPlanUpgradeForSubscription = sinon.fake();
        payments.changeSubscriptionPlan = sinon.fake.returns(subscription2);
        payments.deleteCachedCustomer = sinon.fake();
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
        assert.equal(payments.deleteCachedCustomer.callCount, 1);
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
