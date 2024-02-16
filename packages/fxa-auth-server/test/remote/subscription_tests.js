/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const { default: Container } = require('typedi');
const { OAUTH_SCOPE_SUBSCRIPTIONS } = require('fxa-shared/oauth/constants');
const clientFactory = require('../client')();
const config = require(`${ROOT_DIR}/config`).default.getProperties();
const error = require(`${ROOT_DIR}/lib/error`);
const testServerFactory = require('../test_server');
const { CapabilityService } = require('../../lib/payments/capability');
const { StripeHelper } = require('../../lib/payments/stripe');
const { AuthLogger, ProfileClient } = require('../../lib/types');
const {
  PlaySubscriptions,
} = require('../../lib/payments/iap/google-play/subscriptions');
const {
  AppStoreSubscriptions,
} = require('../../lib/payments/iap/apple-app-store/subscriptions');

const { CapabilityManager } = require('@fxa/payments/capability');

const validClients = config.oauthServer.clients.filter(
  (client) => client.trusted && client.canGrant && client.publicClient
);
const CLIENT_ID = validClients.pop().id;
const CLIENT_ID_FOR_DEFAULT = validClients.pop().id;
const PLAN_ID = 'allDoneProMonthly';
const PRODUCT_ID = 'megaProductHooray';
const PRODUCT_NAME = 'All Done Pro';

[{ version: '' }, { version: 'V2' }].forEach((testOptions) => {
  describe(`#integration${testOptions.version} - remote subscriptions:`, function () {
    this.timeout(10000);

    before(async () => {
      config.subscriptions.stripeApiKey = null;
      config.subscriptions = {
        sharedSecret: 'wibble',
        paymentsServer: config.subscriptions.paymentsServer,
      };
    });

    describe('config.subscriptions.enabled = true and direct stripe access:', function () {
      this.timeout(15000);

      let client, server, tokens;
      const mockStripeHelper = {};
      const mockPlaySubscriptions = {};
      const mockAppStoreSubscriptions = {};
      const mockCapabilityManager = { getClients: () => {} };
      const mockProfileClient = {};

      before(async () => {
        config.subscriptions.enabled = true;
        config.subscriptions.stripeApiKey = 'sk_34523452345';
        config.subscriptions.paypalNvpSigCredentials = {
          sandbox: true,
          user: 'user',
          pwd: 'pwd',
          signature: 'sig',
        };
        config.subscriptions.productConfigsFirestore = { enabled: true };
        mockStripeHelper.allAbbrevPlans = async () => [
          {
            plan_id: PLAN_ID,
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
            product_id: 'prod_1a',
            product_name: 'product 1a',
            interval: 'month',
            amount: 50,
            currency: 'usd',
          },
          {
            plan_id: 'plan_1b',
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
        mockStripeHelper.fetchCustomer = async (uid, email) => ({});
        mockStripeHelper.allMergedPlanConfigs = async () => [];
        mockProfileClient.deleteCache = () => {};
        Container.set(AuthLogger, { error: () => {} });
        Container.set(StripeHelper, mockStripeHelper);
        Container.set(PlaySubscriptions, mockPlaySubscriptions);
        Container.set(AppStoreSubscriptions, mockAppStoreSubscriptions);
        Container.set(ProfileClient, mockProfileClient);
        Container.set(CapabilityManager, mockCapabilityManager);
        Container.remove(CapabilityService);
        Container.set(CapabilityService, new CapabilityService());

        server = await testServerFactory.start(config, false, {
          authServerMockDependencies: {
            '../lib/payments/stripe': {
              StripeHelper: mockStripeHelper,
              createStripeHelper: () => mockStripeHelper,
            },
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
          server.mailbox,
          testOptions
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
          scope: `profile ${OAUTH_SCOPE_SUBSCRIPTIONS}`,
        });

        tokens = [
          tokenResponse1.access_token,
          tokenResponse2.access_token,
          tokenResponse3.access_token,
        ];

        mockStripeHelper.subscriptionsToResponse = async (subscriptions) => [];
        mockPlaySubscriptions.getActiveGooglePlaySubscriptions = async (
          uid
        ) => [];
      });

      it('should return client capabilities with shared secret', async () => {
        const response = await client.getSubscriptionClients('wibble');
        assert.deepEqual(response, [
          {
            clientId: CLIENT_ID,
            capabilities: ['123donePro', 'FooBar', 'ILikePie', 'MechaMozilla'],
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
          mockStripeHelper.fetchCustomer = async (uid, email) => ({
            subscriptions: { data: [] },
          });
        });

        afterEach(() => {
          Container.reset();
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
        const date = Date.now();
        beforeEach(() => {
          mockStripeHelper.fetchCustomer = async (uid, email) => ({
            subscriptions: {
              data: [
                {
                  id: subscriptionId,
                  created: date,
                  cancelled_at: null,
                  plan: {
                    id: PLAN_ID,
                    product: PRODUCT_ID,
                  },
                  items: {
                    data: [
                      {
                        price: { id: PLAN_ID, product: PRODUCT_ID },
                        plan: { id: PLAN_ID, product: PRODUCT_ID },
                      },
                    ],
                  },
                  status: 'active',
                },
              ],
            },
          });
          mockStripeHelper.subscriptionsToResponse = async (subscriptions) => [
            {
              subscription_id: subscriptionId,
              plan_id: PLAN_ID,
              product_name: PRODUCT_NAME,
              product_id: PRODUCT_ID,
              created: date,
              current_period_end: date,
              current_period_start: date,
              cancel_at_period_end: false,
              end_at: null,
              latest_invoice: '628031D-0002',
              latest_invoice_items: {
                line_items: [
                  {
                    amount: 599,
                    currency: 'usd',
                    id: 'plan_G93lTs8hfK7NNG',
                    name: 'testo',
                    period: {
                      end: date,
                      start: date,
                    },
                  },
                ],
                subtotal: 599,
                subtotal_excluding_tax: null,
                total: 599,
                total_excluding_tax: null,
              },
              status: 'active',
              failure_code: undefined,
              failure_message: undefined,
            },
          ];
        });

        afterEach(() => {
          Container.reset();
        });

        it('should return all subscription capabilities with session token', async () => {
          const response = await client.accountProfile();
          assert.deepEqual(response.subscriptionsByClientId, {
            [CLIENT_ID]: ['123donePro', 'ILikePie'],
          });
        });

        it('should return all subscription capabilities for client without capabilities', async () => {
          const response = await client.accountProfile(tokens[0]);
          assert.deepEqual(response.subscriptionsByClientId, {
            [CLIENT_ID]: ['123donePro', 'ILikePie'],
          });
        });

        it('should return all subscription capabilities for client with capabilities', async () => {
          const response = await client.accountProfile(tokens[1]);
          assert.deepEqual(response.subscriptionsByClientId, {
            [CLIENT_ID]: ['123donePro', 'ILikePie'],
          });
        });

        it('should return active subscriptions', async () => {
          let result = await client.getActiveSubscriptions(tokens[2]);
          assert.isArray(result);
          assert.lengthOf(result, 1);
          assert.equal(result[0].createdAt, date * 1000);
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

    describe('config.subscriptions.enabled = false:', () => {
      let client, refreshToken, server;

      before(async () => {
        config.subscriptions.enabled = false;
        config.subscriptions.stripeApiKey = null;
        config.subscriptions.stripeApiUrl = null;
        config.subscriptions.productConfigsFirestore = { enabled: true };
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
          server.mailbox,
          testOptions
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
});
