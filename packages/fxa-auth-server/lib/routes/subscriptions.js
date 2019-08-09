/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const validators = require('./validators');

module.exports = (log, db, config, customs, push, oauthdb, subhub) => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
  }

  const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
    'https://identity.mozilla.com/account/subscriptions';

  const CLIENT_CAPABILITIES = Object.entries(
    config.subscriptions.clientCapabilities
  ).map(([clientId, capabilities]) => ({ clientId, capabilities }));

  async function handleAuth(auth, fetchEmail = false) {
    const scope = ScopeSet.fromArray(auth.credentials.scope);
    if (!scope.contains(SUBSCRIPTIONS_MANAGEMENT_SCOPE)) {
      throw error.invalidScopes('Invalid authentication scope in token');
    }
    const { user: uid } = auth.credentials;
    let email;
    if (!fetchEmail) {
      ({ email } = auth.credentials);
    } else {
      const account = await db.account(uid);
      ({ email } = account.primaryEmail);
    }
    return { uid, email };
  }

  return [
    {
      method: 'GET',
      path: '/oauth/subscriptions/clients',
      options: {
        auth: {
          payload: false,
          strategy: 'subscriptionsSecret',
        },
        response: {
          schema: isA.array().items(
            isA.object().keys({
              clientId: isA.string(),
              capabilities: isA.array().items(isA.string()),
            })
          ),
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.getClients', request);
        return CLIENT_CAPABILITIES;
      },
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/plans',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.array().items(validators.subscriptionsPlanValidator),
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.listPlans', request);
        await handleAuth(request.auth);
        return subhub.listPlans();
      },
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/active',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.array().items(validators.activeSubscriptionValidator),
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.listActive', request);
        const { uid } = await handleAuth(request.auth);
        return db.fetchAccountSubscriptions(uid);
      },
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/active',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: {
            planId: validators.subscriptionsPlanId.required(),
            paymentToken: validators.subscriptionsPaymentToken.required(),
            displayName: isA.string().required(),
          },
        },
        response: {
          schema: isA.object().keys({
            subscriptionId: validators.subscriptionsSubscriptionId.required(),
          }),
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.createSubscription', request);

        const { uid, email } = await handleAuth(request.auth, true);

        await customs.check(request, email, 'createSubscription');

        const { planId, paymentToken, displayName } = request.payload;

        // Find the selected plan and get its product ID
        const plans = await subhub.listPlans();
        const selectedPlan = plans.filter(p => p.plan_id === planId)[0];
        if (!selectedPlan) {
          throw error.unknownSubscriptionPlan(planId);
        }
        // TODO: The FxA DB has a column `productName` that we're using for
        // product_id. We might want to rename that someday.
        // https://github.com/mozilla/fxa/issues/1187
        const productName = selectedPlan.product_id;

        const paymentResult = await subhub.createSubscription(
          uid,
          paymentToken,
          planId,
          displayName,
          email
        );

        // FIXME: We're assuming the last subscription is newest, because
        // payment result doesn't actually report the newly-created subscription
        // https://github.com/mozilla/subhub/issues/56
        // https://github.com/mozilla/fxa/issues/1148
        const newSubscription = paymentResult.subscriptions.pop();
        const subscriptionId = newSubscription.subscription_id;

        await db.createAccountSubscription({
          uid,
          subscriptionId,
          productName,
          createdAt: Date.now(),
        });

        const devices = await request.app.devices;
        await push.notifyProfileUpdated(uid, devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });

        log.info('subscriptions.createSubscription.success', {
          uid,
          subscriptionId,
        });

        return { subscriptionId };
      },
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/updatePayment',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: {
            paymentToken: validators.subscriptionsPaymentToken.required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.updatePayment', request);

        const { uid, email } = await handleAuth(request.auth, true);
        await customs.check(request, email, 'updatePayment');

        const { paymentToken } = request.payload;

        await subhub.updateCustomer(uid, paymentToken);

        log.info('subscriptions.updatePayment.success', { uid });

        return {};
      },
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/customer',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsCustomerValidator,
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.getCustomer', request);
        const { uid } = await handleAuth(request.auth);
        return subhub.getCustomer(uid);
      },
    },
    {
      method: 'DELETE',
      path: '/oauth/subscriptions/active/{subscriptionId}',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          params: {
            subscriptionId: validators.subscriptionsSubscriptionId.required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.deleteSubscription', request);

        const { uid, email } = await handleAuth(request.auth, true);

        await customs.check(request, email, 'deleteSubscription');

        const subscriptionId = request.params.subscriptionId;

        const subscription = await db.getAccountSubscription(
          uid,
          subscriptionId
        );
        if (!subscription) {
          throw error.unknownSubscription();
        }

        await subhub.cancelSubscription(uid, subscriptionId);

        try {
          await db.cancelAccountSubscription(uid, subscriptionId, Date.now());
        } catch (err) {
          if (err.statusCode === 404 && err.errno === 116) {
            throw error.subscriptionAlreadyCancelled();
          }
        }

        const devices = await request.app.devices;
        await push.notifyProfileUpdated(uid, devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });

        log.info('subscriptions.deleteSubscription.success', {
          uid,
          subscriptionId,
        });

        return { subscriptionId };
      },
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/reactivate',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          payload: {
            subscriptionId: validators.subscriptionsSubscriptionId.required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.reactivateSubscription', request);

        const { uid, email } = await handleAuth(request.auth, true);

        await customs.check(request, email, 'reactivateSubscription');

        const { subscriptionId } = request.payload;

        const subscription = await db.getAccountSubscription(
          uid,
          subscriptionId
        );
        if (!subscription) {
          throw error.unknownSubscription();
        }

        await subhub.reactivateSubscription(uid, subscriptionId);
        await db.reactivateAccountSubscription(uid, subscriptionId);

        await push.notifyProfileUpdated(uid, await request.app.devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });

        log.info('subscriptions.reactivateSubscription.success', {
          uid,
          subscriptionId,
        });

        return {};
      },
    },
  ];
};
