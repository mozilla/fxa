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

let config,
  log,
  db,
  customs,
  push,
  oauthdb,
  subhub,
  routes,
  route,
  request,
  requestOptions;

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';

const TEST_EMAIL = 'test@email.com';
const UID = uuid.v4('binary').toString('hex');
const NOW = Date.now();
const CUSTOMER = {
  payment_type: 'card',
  last4: 8675,
  exp_month: 8,
  exp_year: 2020,
};
const PLANS = [
  {
    plan_id: 'firefox_pro_basic_823',
    plan_name: 'Firefox Pro Basic Weekly',
    product_id: 'firefox_pro_basic',
    product_name: 'Firefox Pro Basic',
    interval: 'week',
    amount: '123',
    currency: 'usd',
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
];
const SUBSCRIPTION_ID_1 = 'sub-8675309';
const PAYMENT_TOKEN_VALID = '8675309-foobarbaz';
const PAYMENT_TOKEN_NEW = 'new-8675309';
const PAYMENT_TOKEN_BAD = 'thisisabadtoken';
const ACTIVE_SUBSCRIPTIONS = [
  {
    uid: UID,
    subscriptionId: SUBSCRIPTION_ID_1,
    productName: PLANS[0].product_id,
    createdAt: NOW,
    cancelledAt: null,
  },
];

const MOCK_CLIENT_ID = '3c49430b43dfba77';
const MOCK_TTL = 3600;
const MOCK_SCOPES = ['profile:email', SUBSCRIPTIONS_MANAGEMENT_SCOPE];
const MOCK_TOKEN_RESPONSE = {
  access_token: 'ACCESS',
  scope: MOCK_SCOPES,
  token_type: 'bearer',
  expires_in: MOCK_TTL,
  auth_at: 123456,
};

function runTest(routePath, requestOptions) {
  routes = require('../../../lib/routes/subscriptions')(
    log,
    db,
    config,
    customs,
    push,
    oauthdb,
    subhub
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
    });
    db.createAccountSubscription = sinon.spy(async data => ({}));
    db.deleteAccountSubscription = sinon.spy(
      async (uid, subscriptionId) => ({})
    );
    db.cancelAccountSubscription = sinon.spy(async () => ({}));
    db.fetchAccountSubscriptions = sinon.spy(async uid =>
      ACTIVE_SUBSCRIPTIONS.filter(s => s.uid === uid)
    );
    db.getAccountSubscription = sinon.spy(
      async (uid, subscriptionId) =>
        ACTIVE_SUBSCRIPTIONS.filter(
          s => s.uid === uid && s.subscriptionId === subscriptionId
        )[0]
    );
    push = mocks.mockPush();
    oauthdb = mocks.mockOAuthDB({
      getClientInfo: sinon.spy(async () => {
        return { id: MOCK_CLIENT_ID, name: 'mock client' };
      }),
      grantTokensFromSessionToken: sinon.spy(async () => MOCK_TOKEN_RESPONSE),
    });

    subhub = mocks.mockSubHub({
      getCustomer: sinon.spy(async () => CUSTOMER),
      listPlans: sinon.spy(async () => PLANS),
      createSubscription: sinon.spy(async (uid, token, plan_id) => ({
        subscriptions: [{ subscription_id: SUBSCRIPTION_ID_1 }],
      })),
      cancelSubscription: sinon.spy(async (uid, subscriptionId) => true),
      updateCustomer: sinon.spy(async (uid, token) => ({})),
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
        oauthdb,
        subhub
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
          paymentToken: PAYMENT_TOKEN_VALID,
        },
      });

      assert.equal(customs.check.callCount, 1, 'calls customs.check');

      assert.equal(subhub.listPlans.callCount, 1);
      assert.deepEqual(subhub.createSubscription.args, [
        [UID, PAYMENT_TOKEN_VALID, PLANS[0].plan_id, TEST_EMAIL],
      ]);
      assert.equal(db.createAccountSubscription.callCount, 1);

      const createArgs = db.createAccountSubscription.args[0][0];
      assert.deepEqual(createArgs, {
        uid: UID,
        subscriptionId: SUBSCRIPTION_ID_1,
        // TODO: The FxA DB has a column `productName` that we're using for
        // product_id. We might want to rename that someday.
        // https://github.com/mozilla/fxa/issues/1187
        productName: PLANS[0].product_id,
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
      assert.deepEqual(res, {});

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
});
