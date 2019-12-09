/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const validators = require('./validators');
const StripeHelper = require('../payments/stripe');
const { metadataFromPlan } = require('./utils/subscriptions');

const createRoutes = (
  log,
  db,
  config,
  customs,
  push,
  mailer,
  subhub,
  profile
) => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
  }

  let stripeHelper = config.subscriptions.stripeApiKey
    ? new StripeHelper(log, config)
    : undefined;

  // For testing with Stripe, we attach the stripehelper to the subhub object
  if (subhub.stripeHelper) {
    stripeHelper = subhub.stripeHelper;
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
        const plans = await subhub.listPlans();

        // Delete any metadata keys prefixed by `capabilities:` before
        // sending response. We don't need to reveal those.
        // https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
        return plans.map(planIn => {
          // Try not to mutate the original in case we cache plans in memory.
          const plan = { ...planIn };
          for (const metadataKey of ['plan_metadata', 'product_metadata']) {
            if (plan[metadataKey]) {
              // Make a clone of the metadata object so we don't mutate the original.
              const metadata = { ...plan[metadataKey] };
              const capabilityKeys = Object.keys(metadata).filter(key =>
                key.startsWith('capabilities:')
              );
              for (const key of capabilityKeys) {
                delete metadata[key];
              }
              plan[metadataKey] = metadata;
            }
          }
          return plan;
        });
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
        const productId = selectedPlan.product_id;
        const planMetadata = metadataFromPlan(selectedPlan);

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
          productId,
          createdAt: Date.now(),
        });

        const devices = await request.app.devices;
        await push.notifyProfileUpdated(uid, devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });
        await profile.deleteCache(uid);

        const account = await db.account(uid);
        await mailer.sendDownloadSubscriptionEmail(account.emails, account, {
          acceptLanguage: account.locale,
          productId,
          planId,
          productName: selectedPlan.product_name,
          planEmailIconURL: planMetadata.emailIconURL,
          planDownloadURL: planMetadata.downloadURL,
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
      method: 'PUT',
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
          payload: {
            planId: validators.subscriptionsPlanId.required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('subscriptions.updateSubscription', request);

        const { uid, email } = await handleAuth(request.auth, true);

        await customs.check(request, email, 'updateSubscription');

        const { subscriptionId } = request.params;
        const { planId } = request.payload;

        let accountSub;

        try {
          accountSub = await db.getAccountSubscription(uid, subscriptionId);
        } catch (err) {
          if (err.statusCode === 404 && err.errno === 116) {
            throw error.unknownSubscription();
          }
        }
        const oldProductId = accountSub.productId;
        let newProductId;

        if (stripeHelper) {
          // Verify the plan is a valid upgrade for this subscription.
          await stripeHelper.verifyPlanUpgradeForSubscription(
            oldProductId,
            planId
          );

          // Upgrade the plan
          const changeResponse = await stripeHelper.changeSubscriptionPlan(
            subscriptionId,
            planId
          );
          newProductId = changeResponse.plan.product;
        } else {
          // Find the selected plan and get its product ID
          const plans = await subhub.listPlans();
          const selectedPlan = plans.filter(p => p.plan_id === planId)[0];
          if (!selectedPlan) {
            throw error.unknownSubscriptionPlan(planId);
          }
          newProductId = selectedPlan.product_id;
          try {
            await subhub.updateSubscription(uid, subscriptionId, planId);
          } catch (err) {
            if (err.errno !== 1003) {
              // Only allow already subscribed, as this call is being possibly repeated
              // to ensure the accountSubscriptions database is updated.
              throw err;
            }
          }
        }

        // Update the local db record for the new plan. We don't have a method to
        // change the product on file for a sub thus the delete/create here even
        // though its more work to catch both errors for a retry.
        try {
          await db.deleteAccountSubscription(uid, subscriptionId);
        } catch (err) {
          // It's ok if it was already cancelled or deleted.
          if (err.statusCode !== 404) {
            throw err;
          }
        }

        // This call needs to succeed for us to consider this a success.
        await db.createAccountSubscription({
          uid,
          subscriptionId,
          productId: newProductId,
          createdAt: Date.now(),
        });

        const devices = await request.app.devices;
        await push.notifyProfileUpdated(uid, devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });
        await profile.deleteCache(uid);

        return { subscriptionId };
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

        try {
          await db.getAccountSubscription(uid, subscriptionId);
        } catch (err) {
          if (err.statusCode === 404 && err.errno === 116) {
            throw error.unknownSubscription();
          }
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
        await profile.deleteCache(uid);

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

        try {
          await db.getAccountSubscription(uid, subscriptionId);
        } catch (err) {
          if (err.statusCode === 404 && err.errno === 116) {
            throw error.unknownSubscription();
          }
        }

        await subhub.reactivateSubscription(uid, subscriptionId);
        await db.reactivateAccountSubscription(uid, subscriptionId);

        await push.notifyProfileUpdated(uid, await request.app.devices);
        log.notifyAttachedServices('profileDataChanged', request, {
          uid,
          email,
        });
        await profile.deleteCache(uid);

        log.info('subscriptions.reactivateSubscription.success', {
          uid,
          subscriptionId,
        });

        return {};
      },
    },
  ];
};

module.exports = createRoutes;
