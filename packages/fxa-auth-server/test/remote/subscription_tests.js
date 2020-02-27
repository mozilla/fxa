/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const clientFactory = require('../client')();
const config = require(`${ROOT_DIR}/config`).getProperties();
const error = require(`${ROOT_DIR}/lib/error`);
const testServerFactory = require('../test_server');

const validClients = config.oauthServer.clients.filter(
  client => client.trusted && client.canGrant && client.publicClient
);
const CLIENT_ID = validClients.pop().id;
const CLIENT_ID_FOR_DEFAULT = validClients.pop().id;
const DISPLAY_NAME = 'Example User';
const PAYMENT_TOKEN = 'pay8675309';
const PLAN_ID = 'allDoneProMonthly';
const PLAN_NAME = 'All Done Pro Monthly';
const PRODUCT_ID = 'megaProductHooray';
const PRODUCT_NAME = 'All Done Pro';

describe('remote subscriptions:', function() {
  this.timeout(10000);

  before(async () => {
    config.subscriptions.stripeApiKey = null;
    config.subhub.useStubs = true;
    config.subhub.stubs = {
      plans: [
        {
          plan_id: PLAN_ID,
          plan_name: PLAN_NAME,
          product_id: PRODUCT_ID,
          product_name: PRODUCT_NAME,
          interval: 'month',
          amount: 50,
          currency: 'usd',
        },
      ],
    };
    config.subscriptions = {
      sharedSecret: 'wibble',
    };
  });

  describe('config.subscriptions.enabled = true and direct stripe access:', function() {
    this.timeout(15000);

    let client, server, tokens;
    const mockStripeHelper = {};

    before(async () => {
      config.subscriptions.enabled = true;
      config.subscriptions.stripeApiKey = 'sk_34523452345';
      mockStripeHelper.allPlans = async () => [
        {
          plan_id: PLAN_ID,
          plan_name: PLAN_NAME,
          product_id: PRODUCT_ID,
          product_name: PRODUCT_NAME,
          interval: 'month',
          amount: 50,
          currency: 'usd',
          product_metadata: {
            [`capabilities:${CLIENT_ID}`]: '123donePro, ILikePie',
          },
        },
        {
          plan_id: 'plan_1a',
          plan_name: 'plan 1a',
          product_id: 'prod_1a',
          product_name: 'product 1a',
          interval: 'month',
          amount: 50,
          currency: 'usd',
        },
        {
          plan_id: 'plan_1b',
          plan_name: 'plan 1b',
          product_id: 'prod_1b',
          product_name: 'product 1b',
          interval: 'month',
          amount: 50,
          currency: 'usd',
          plan_metadata: {
            [`capabilities:${CLIENT_ID}`]: 'MechaMozilla,FooBar',
          },
        },
      ];
      mockStripeHelper.customer = async (uid, email) => ({});
      server = await testServerFactory.start(config, false, {
        authServerMockDependencies: {
          '../lib/payments/stripe': () => mockStripeHelper,
        },
      });
    });

    after(async () => {
      await testServerFactory.stop(server);
    });

    beforeEach(async () => {
      client = await clientFactory.createAndVerify(
        config.publicUrl,
        server.uniqueEmail(),
        'wibble',
        server.mailbox
      );

      const tokenResponse1 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID_FOR_DEFAULT,
        scope: 'profile:subscriptions',
      });

      const tokenResponse2 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile:subscriptions',
      });

      const tokenResponse3 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile https://identity.mozilla.com/account/subscriptions',
      });

      tokens = [
        tokenResponse1.access_token,
        tokenResponse2.access_token,
        tokenResponse3.access_token,
      ];
    });

    it('should return client capabilities with shared secret', async () => {
      const response = await client.getSubscriptionClients('wibble');
      assert.deepEqual(response, [
        {
          clientId: CLIENT_ID,
          capabilities: ['123donePro', 'ILikePie', 'MechaMozilla', 'FooBar'],
        },
      ]);
    });

    it('should not return client capabilities with invalid shared secret', async () => {
      let succeeded = false;

      try {
        await client.getSubscriptionClients('blee');
        succeeded = true;
      } catch (err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
      }

      assert.isFalse(succeeded);
    });

    describe('with no subscriptions', () => {
      beforeEach(() => {
        mockStripeHelper.customer = async (uid, email) => ({
          subscriptions: { data: [] },
        });
        mockStripeHelper.subscriptionsToResponse = async subscriptions => [];
      });

      it('should not return any subscription capabilities by default with session token', async () => {
        const response = await client.accountProfile();
        assert.isUndefined(response.subscriptions);
      });

      it('should not return any subscription capabilities for client without capabilities', async () => {
        const response = await client.accountProfile(tokens[0]);
        assert.isUndefined(response.subscriptions);
      });

      it('should not return any subscription capabilities for client with capabilities', async () => {
        const response = await client.accountProfile(tokens[1]);
        assert.isUndefined(response.subscriptions);
      });

      it('should return no active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        assert.deepEqual(result, []);

        result = await client.account();
        assert.deepEqual(result.subscriptions, []);
      });
    });

    describe('with a subscription', () => {
      const subscriptionId = 'sub_12345';
      beforeEach(() => {
        mockStripeHelper.customer = async (uid, email) => ({
          subscriptions: {
            data: [
              {
                id: subscriptionId,
                created: Date.now() / 1000,
                cancelled_at: null,
                plan: {
                  product: PRODUCT_ID,
                },
                status: 'active',
              },
            ],
          },
        });
        mockStripeHelper.subscriptionsToResponse = async subscriptions => [
          {
            subscription_id: subscriptionId,
            plan_id: PLAN_ID,
            current_period_end: Date.now() / 1000,
            current_period_start: Date.now() / 1000,
            cancel_at_period_end: false,
            end_at: null,
            latest_invoice: '628031D-0002',
            plan_name: 'foo',
            status: 'active',
            failure_code: undefined,
            failure_message: undefined,
          },
        ];
      });

      it('should not return any subscription capabilities by default with session token', async () => {
        const response = await client.accountProfile();
        assert.deepEqual(response.subscriptions, ['123donePro', 'ILikePie']);
      });

      it('should not return any subscription capabilities for client without capabilities', async () => {
        const response = await client.accountProfile(tokens[0]);
        assert.isUndefined(response.subscriptions);
      });

      it('should return subscription capabilities for client with capabilities', async () => {
        const response = await client.accountProfile(tokens[1]);
        assert.deepEqual(response.subscriptions, ['123donePro', 'ILikePie']);
      });

      it('should return active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.isAbove(result[0].createdAt, Date.now() - 1000);
        assert.isAtMost(result[0].createdAt, Date.now());
        assert.equal(result[0].productId, PRODUCT_ID);
        assert.equal(result[0].uid, client.uid);
        assert.isNull(result[0].cancelledAt);

        result = await client.account();
        assert.isArray(result.subscriptions);
        assert.lengthOf(result.subscriptions, 1);
        assert.equal(result.subscriptions[0].subscription_id, subscriptionId);
        assert.equal(result.subscriptions[0].plan_id, PLAN_ID);
      });
    });
  });

  describe('config.subscriptions.enabled = true:', () => {
    let client, server, tokens;

    before(async () => {
      config.subscriptions.enabled = true;
      config.subscriptions.stripeApiKey = null;
      config.subscriptions.stripeApiUrl = null;
      server = await testServerFactory.start(config);
    });

    after(async () => {
      await testServerFactory.stop(server);
    });

    beforeEach(async () => {
      client = await clientFactory.createAndVerify(
        config.publicUrl,
        server.uniqueEmail(),
        'wibble',
        server.mailbox
      );

      const tokenResponse1 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID_FOR_DEFAULT,
        scope: 'profile:subscriptions',
      });

      const tokenResponse2 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile:subscriptions',
      });

      const tokenResponse3 = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile https://identity.mozilla.com/account/subscriptions',
      });

      tokens = [
        tokenResponse1.access_token,
        tokenResponse2.access_token,
        tokenResponse3.access_token,
      ];
    });

    it('should not return client capabilities with invalid shared secret', async () => {
      let succeeded = false;

      try {
        await client.getSubscriptionClients('blee');
        succeeded = true;
      } catch (err) {
        assert.equal(err.code, 401);
        assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
      }

      assert.isFalse(succeeded);
    });

    it('should not return any subscription capabilities', async () => {
      const response = await client.accountProfile(tokens[1]);
      assert.isUndefined(response.subscriptions);
    });

    it('should return subscription plans', async () => {
      const result = await client.getSubscriptionPlans(tokens[2]);
      assert.deepEqual(result, [
        {
          plan_id: PLAN_ID,
          plan_name: PLAN_NAME,
          product_id: PRODUCT_ID,
          product_name: PRODUCT_NAME,
          interval: 'month',
          amount: 50,
          currency: 'usd',
        },
      ]);
    });

    it('should return no active subscriptions', async () => {
      let result = await client.getActiveSubscriptions(tokens[2]);
      assert.deepEqual(result, []);

      result = await client.account();
      assert.deepEqual(result.subscriptions, []);
    });

    describe('createSubscription:', () => {
      let subscriptionId;

      beforeEach(async () => {
        ({ subscriptionId } = await client.createSubscription(
          tokens[2],
          PLAN_ID,
          PAYMENT_TOKEN,
          DISPLAY_NAME
        ));
      });

      it('returned the subscription id', () => {
        assert.isString(subscriptionId);
        assert.notEqual(subscriptionId, '');
      });

      it('should return active subscriptions', async () => {
        let result = await client.getActiveSubscriptions(tokens[2]);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.isAbove(result[0].createdAt, Date.now() - 1000);
        assert.isAtMost(result[0].createdAt, Date.now());
        assert.equal(result[0].productId, PRODUCT_ID);
        assert.equal(result[0].uid, client.uid);
        assert.isNull(result[0].cancelledAt);

        result = await client.account();
        assert.isArray(result.subscriptions);
        assert.lengthOf(result.subscriptions, 1);
        assert.equal(result.subscriptions[0].subscription_id, subscriptionId);
        assert.equal(result.subscriptions[0].plan_id, PLAN_ID);
      });

      describe('cancelSubscription:', () => {
        beforeEach(async () => {
          await client.cancelSubscription(tokens[2], subscriptionId);
        });

        it('should return cancelled subscriptions', async () => {
          const result = await client.getActiveSubscriptions(tokens[2]);
          assert.isArray(result);
          assert.lengthOf(result, 1);
          assert.isAbove(result[0].createdAt, Date.now() - 1000);
          assert.isAtLeast(result[0].cancelledAt, result[0].createdAt);
          assert.isAtMost(result[0].cancelledAt, Date.now());
          assert.equal(result[0].productId, PRODUCT_ID);
          assert.equal(result[0].uid, client.uid);
        });

        describe('reactivateSubscription:', () => {
          beforeEach(async () => {
            await client.reactivateSubscription(tokens[2], subscriptionId);
          });

          it('should return reactivated subscriptions', async () => {
            const result = await client.getActiveSubscriptions(tokens[2]);
            assert.isArray(result);
            assert.lengthOf(result, 1);
            assert.isAbove(result[0].createdAt, Date.now() - 1000);
            assert.isNull(result[0].cancelledAt);
            assert.equal(result[0].productId, PRODUCT_ID);
            assert.equal(result[0].uid, client.uid);
          });
        });
      });
    });
  });

  describe('config.subscriptions.enabled = false:', () => {
    let client, refreshToken, server;

    before(async () => {
      config.subscriptions.enabled = false;
      config.subscriptions.stripeApiKey = null;
      config.subscriptions.stripeApiUrl = null;
      server = await testServerFactory.start(config);
    });

    after(async () => {
      await testServerFactory.stop(server);
    });

    beforeEach(async () => {
      client = await clientFactory.createAndVerify(
        config.publicUrl,
        server.uniqueEmail(),
        'wibble',
        server.mailbox
      );

      const tokenResponse = await client.grantOAuthTokensFromSessionToken({
        grant_type: 'fxa-credentials',
        client_id: CLIENT_ID,
        scope: 'profile:subscriptions',
      });

      refreshToken = tokenResponse.access_token;
    });

    it('should not include subscriptions with session token', async () => {
      const response = await client.accountProfile();
      assert.isUndefined(response.subscriptions);
    });

    it('should not include subscriptions with refresh token', async () => {
      const response = await client.accountProfile(refreshToken);
      assert.isUndefined(response.subscriptions);
    });

    it('should not return subscriptions from client.account', async () => {
      const response = await client.account();
      assert.deepEqual(response.subscriptions, []);
    });
  });
});
