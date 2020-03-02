/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Sentry = require('@sentry/node');
const error = require('../error');
const isA = require('@hapi/joi');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const validators = require('./validators');
const {
  metadataFromPlan,
  splitCapabilities,
} = require('./utils/subscriptions');

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';

/** @typedef {import('hapi').Request} Request */
/** @typedef {import('stripe').Stripe.Customer} Customer */
/** @typedef {import('stripe').Stripe.Event} Event */
/** @typedef {import('stripe').Stripe.Subscription} Subscription */
/** @typedef {import('stripe').Stripe.Invoice} Invoice */
/** @typedef {import('stripe').Stripe.PaymentIntent} PaymentIntent */
/** @typedef {import('../payments/stripe.js').AbbrevPlan} AbbrevPlan*/

async function handleAuth(db, auth, fetchEmail = false) {
  const scope = ScopeSet.fromArray(auth.credentials.scope);
  if (!scope.contains(SUBSCRIPTIONS_MANAGEMENT_SCOPE)) {
    throw error.invalidScopes();
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

// Delete any metadata keys prefixed by `capabilities:` before
// sending response. We don't need to reveal those.
// https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
function sanitizePlans(plans) {
  return plans.map(planIn => {
    // Try not to mutate the original in case we cache plans in memory.
    const plan = { ...planIn };
    for (const metadataKey of ['plan_metadata', 'product_metadata']) {
      if (plan[metadataKey]) {
        // Make a clone of the metadata object so we don't mutate the original.
        const metadata = { ...plan[metadataKey] };
        const capabilityKeys = [
          'capabilities',
          ...Object.keys(metadata).filter(key =>
            key.startsWith('capabilities:')
          ),
        ];
        for (const key of capabilityKeys) {
          delete metadata[key];
        }
        plan[metadataKey] = metadata;
      }
    }
    return plan;
  });
}

class DirectStripeRoutes {
  /**
   *
   * @param {*} log
   * @param {*} db
   * @param {*} config
   * @param {*} customs
   * @param {*} push
   * @param {*} mailer
   * @param {*} profile
   * @param {import('../payments/stripe').StripeHelper} stripeHelper
   */
  constructor(log, db, config, customs, push, mailer, profile, stripeHelper) {
    this.log = log;
    this.db = db;
    this.config = config;
    this.customs = customs;
    this.push = push;
    this.mailer = mailer;
    this.profile = profile;
    this.stripeHelper = stripeHelper;
  }

  async customerChanged(request, uid, email) {
    const [devices] = await Promise.all([
      await request.app.devices,
      await this.stripeHelper.refreshCachedCustomer(uid, email),
      await this.profile.deleteCache(uid),
    ]);
    await this.push.notifyProfileUpdated(uid, devices);
    this.log.notifyAttachedServices('profileDataChanged', request, {
      uid,
      email,
    });
  }

  async getClients(request) {
    this.log.begin('subscriptions.getClients', request);
    const capabilitiesByClientId = {};

    const plans = await this.stripeHelper.allPlans();

    const capabilitiesForAll = [];
    for (const plan of plans) {
      const metadata = metadataFromPlan(plan);
      if (metadata.capabilities) {
        capabilitiesForAll.push(...splitCapabilities(metadata.capabilities));
      }
      const capabilityKeys = Object.keys(metadata).filter(key =>
        key.startsWith('capabilities:')
      );
      for (const key of capabilityKeys) {
        const clientId = key.split(':')[1];
        const capabilities = splitCapabilities(metadata[key]);
        capabilitiesByClientId[clientId] = (
          capabilitiesByClientId[clientId] || []
        ).concat(capabilities);
      }
    }

    return Object.entries(capabilitiesByClientId).map(
      ([clientId, capabilities]) => {
        // Merge dupes with Set
        const capabilitySet = new Set([...capabilitiesForAll, ...capabilities]);
        return {
          clientId,
          capabilities: [...capabilitySet],
        };
      }
    );
  }

  async createSubscription(request) {
    this.log.begin('subscriptions.createSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'createSubscription');

    const {
      planId,
      paymentToken,
      displayName,
      idempotencyKey,
    } = request.payload;

    // Find the selected plan and get its product ID
    const selectedPlan = await this.stripeHelper.findPlanById(planId);
    const productId = selectedPlan.product_id;
    const planMetadata = metadataFromPlan(selectedPlan);

    const customer = await this.stripeHelper.fetchCustomer(uid, email, [
      'data.subscriptions.data.latest_invoice',
    ]);

    let subscription;

    if (!customer) {
      subscription = await this.createSubscriptionNewCustomer(
        uid,
        email,
        displayName,
        paymentToken,
        selectedPlan,
        idempotencyKey
      );
    } else {
      subscription = await this.createSubscriptionExistingCustomer(
        customer,
        paymentToken,
        selectedPlan,
        idempotencyKey
      );
    }

    await this.customerChanged(request, uid, email);

    const account = await this.db.account(uid);
    await this.mailer.sendDownloadSubscriptionEmail(account.emails, account, {
      acceptLanguage: account.locale,
      productId,
      planId,
      productName: selectedPlan.product_name,
      planEmailIconURL: planMetadata.emailIconURL,
      planDownloadURL: planMetadata.downloadURL,
    });
    this.log.info('subscriptions.createSubscription.success', {
      uid,
      subscriptionId: subscription.id,
    });
    return {
      subscriptionId: subscription.id,
    };
  }

  /**
   * Create Subscription for New Customer
   *
   * @param {string} uid
   * @param {string} email
   * @param {string} displayName
   * @param {string} paymentToken
   * @param {AbbrevPlan} selectedPlan
   *
   * @returns {Promise<Subscription>}
   */
  async createSubscriptionNewCustomer(
    uid,
    email,
    displayName,
    paymentToken,
    selectedPlan,
    idempotencyKey
  ) {
    // This method invokes *two* create methods, both of which accept an
    // idempotency key. Since that key can only be used once we're just adding
    // an additional piece to the customer request. If this method is invoked
    // multiple times it would still be idempotent in both cases because it
    // uses the base key value.
    const customerIdempotencyKey = `${idempotencyKey}-customer`;
    const customer = await this.stripeHelper.createCustomer(
      uid,
      email,
      displayName,
      paymentToken,
      customerIdempotencyKey
    );

    return this.stripeHelper.createSubscription(
      customer,
      selectedPlan,
      idempotencyKey
    );
  }

  /**
   * Create Subscription for Existing Customer
   *
   * @param {Customer} customer
   * @param {string} paymentToken
   * @param {AbbrevPlan} selectedPlan
   *
   * @returns {Promise<Subscription>}
   */
  async createSubscriptionExistingCustomer(
    customer,
    paymentToken,
    selectedPlan,
    idempotencyKey
  ) {
    if (paymentToken) {
      // Always update the source if we are given a paymentToken
      // Note that if the customer already exists and we were not
      // passed a paymentToken value, we will not update it and use
      // the default source.
      await this.stripeHelper.updateCustomerPaymentMethod(
        customer.id,
        paymentToken
      );
    }

    // Check if the customer already has subscribed to this plan.
    const subscription = this.findCustomerSubscriptionByPlanId(
      customer,
      selectedPlan.plan_id
    );

    // If we have a prior subscription, we have 3 options:
    //   1) Open subscription that needs a payment method, try to pay it
    //   2) Paid subscription, stop and return as they already have the sub
    //   3) Old subscription will have no open invoices, ignore it
    if (subscription && subscription.latest_invoice) {
      const invoice = /** @type {Invoice} */ (subscription.latest_invoice);
      if (invoice.status === 'open') {
        await this.handleOpenInvoice(invoice);
        return subscription;
      } else if (invoice.status === 'paid') {
        throw error.subscriptionAlreadyExists();
      }
    }

    return this.stripeHelper.createSubscription(
      customer,
      selectedPlan,
      idempotencyKey
    );
  }

  /**
   * @param {Invoice} invoice
   */
  async handleOpenInvoice(invoice) {
    const payment_intent = await this.stripeHelper.fetchPaymentIntentFromInvoice(
      invoice
    );

    if (payment_intent.status !== 'requires_payment_method') {
      throw error.backendServiceFailure('stripe', 'invoice status', {
        invoiceId: invoice.id,
        invoiceStatus: invoice.status,
        paymentStatus: payment_intent.status,
      });
    }

    // Re-run the payment
    await this.stripeHelper.payInvoice(invoice.id);
  }

  findCustomerSubscriptionByPlanId(customer, planId) {
    const subscription = customer.subscriptions.data.find(
      sub => sub.items.data.find(item => item.plan.id === planId) != null
    );

    return subscription;
  }

  async deleteSubscription(request) {
    this.log.begin('subscriptions.deleteSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'deleteSubscription');

    const subscriptionId = request.params.subscriptionId;

    await this.stripeHelper.cancelSubscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.deleteSubscription.success', {
      uid,
      subscriptionId,
    });

    return { subscriptionId };
  }

  async updatePayment(request) {
    this.log.begin('subscriptions.updatePayment', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'updatePayment');

    const { paymentToken } = request.payload;

    const customer = await this.stripeHelper.fetchCustomer(uid, email);
    if (!customer) {
      const err = new Error(`No customer for email: ${email}`);
      throw error.backendServiceFailure('stripe', 'updatePayment', {}, err);
    }

    await this.stripeHelper.updateCustomerPaymentMethod(
      customer.id,
      paymentToken
    );

    this.log.info('subscriptions.updatePayment.success', { uid });

    return {};
  }

  async reactivateSubscription(request) {
    this.log.begin('subscriptions.reactivateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'reactivateSubscription');

    const { subscriptionId } = request.payload;

    await this.stripeHelper.reactivateSubscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.reactivateSubscription.success', {
      uid,
      subscriptionId,
    });

    return {};
  }

  async updateSubscription(request) {
    this.log.begin('subscriptions.updateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'updateSubscription');

    const { subscriptionId } = request.params;
    const { planId } = request.payload;

    const subscription = await this.stripeHelper.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    const currentPlanId = subscription.plan.id;

    // Verify the plan is a valid upgrade for this subscription.
    await this.stripeHelper.verifyPlanUpgradeForSubscription(
      currentPlanId,
      planId
    );

    // Upgrade the plan
    await this.stripeHelper.changeSubscriptionPlan(subscriptionId, planId);

    await this.customerChanged(request, uid, email);

    return { subscriptionId };
  }

  async listPlans(request) {
    this.log.begin('subscriptions.listPlans', request);
    await handleAuth(this.db, request.auth);
    const plans = await this.stripeHelper.allPlans();
    return sanitizePlans(plans);
  }

  async listActive(request) {
    this.log.begin('subscriptions.listActive', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.customer(uid, email, false, true);
    const activeSubscriptions = [];

    if (customer && customer.subscriptions) {
      for (const subscription of customer.subscriptions.data) {
        const {
          id: subscriptionId,
          created,
          canceled_at,
          plan: { product: productId },
        } = subscription;
        if (['trialing', 'active', 'past_due'].includes(subscription.status)) {
          activeSubscriptions.push({
            uid,
            subscriptionId,
            productId,
            createdAt: created * 1000,
            cancelledAt: canceled_at ? canceled_at * 1000 : null,
          });
        }
      }
    }
    return activeSubscriptions;
  }

  async getCustomer(request) {
    this.log.begin('subscriptions.getCustomer', request);

    const { uid, email } = await this.getUidEmail(request);
    const customer = await this.stripeHelper.fetchCustomer(uid, email, [
      'data.subscriptions.data.latest_invoice',
    ]);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }
    let response = { subscriptions: [] };
    if (customer.sources && customer.sources.data.length > 0) {
      // Currently assume a single source, and we can only access these attributes
      // on cards.
      const src = customer.sources.data[0];
      if (src.object === 'card') {
        response = {
          ...response,
          payment_type: src.funding,
          last4: src.last4,
          exp_month: src.exp_month,
          exp_year: src.exp_year,
          brand: src.brand,
        };
      }
    }

    response.subscriptions = await this.stripeHelper.subscriptionsToResponse(
      customer.subscriptions
    );
    return response;
  }

  /**
   * Gather all capabilities granted by a product across all clients
   *
   * @param {*} productId
   */
  async getProductCapabilities(productId) {
    const plans = await this.stripeHelper.allPlans();
    const capabilitiesForProduct = [];
    for (const plan of plans) {
      if (plan.product_id !== productId) {
        continue;
      }
      const metadata = metadataFromPlan(plan);
      const capabilityKeys = [
        'capabilities',
        ...Object.keys(metadata).filter(key => key.startsWith('capabilities:')),
      ];
      for (const key of capabilityKeys) {
        capabilitiesForProduct.push(...splitCapabilities(metadata[key]));
      }
    }
    // Remove duplicates with Set
    const capabilitySet = new Set(capabilitiesForProduct);
    return [...capabilitySet];
  }

  /**
   * Send a subscription status Service Notification event to SQS
   *
   * @param {*} request
   * @param {string} uid
   * @param {Event} event
   * @param {{id: string, productId: string}} sub
   * @param {boolean} isActive
   */
  async sendSubscriptionStatusToSqs(request, uid, event, sub, isActive) {
    this.log.notifyAttachedServices('subscription:update', request, {
      uid,
      eventCreatedAt: event.created,
      subscriptionId: sub.id,
      isActive,
      productId: sub.productId,
      productCapabilities: await this.getProductCapabilities(sub.productId),
    });
  }

  /**
   *
   * @param {*} request
   * @param {Event} event
   * @param {Subscription} sub
   * @param {boolean} isActive
   */
  async updateCustomerAndSendStatus(request, event, sub, isActive) {
    const {
      uid,
      email,
    } = await this.stripeHelper.getCustomerUidEmailFromSubscription(sub);
    if (!uid) {
      return;
    }
    await this.stripeHelper.refreshCachedCustomer(uid, email);
    await this.profile.deleteCache(uid);
    await this.sendSubscriptionStatusToSqs(
      request,
      uid,
      event,
      { id: sub.id, productId: /** @type {string} */ (sub.plan.product) },
      isActive
    );
  }

  /**
   * Handle `subscription.created` Stripe webhook events.
   *
   * Only subscriptions that are active/trialing are valid. Emit an event for
   * those conditions only.
   *
   * @param {*} request
   * @param {Event} event
   */
  async handleSubscriptionCreatedEvent(request, event) {
    const sub = /** @type {Subscription} */ (event.data.object);
    if (['active', 'trialing'].includes(sub.status)) {
      return this.updateCustomerAndSendStatus(request, event, sub, true);
    }
  }

  /**
   * Handle `subscription.updated` Stripe webhook events.
   *
   * The only time this requires us to emit a subscription event is when an
   * existing incomplete subscription has now been completed. Unpaid renewals and
   * subscriptions that are cancelled result in a `subscription.deleted` event.
   *
   * @param {*} request
   * @param {Event} event
   */
  async handleSubscriptionUpdatedEvent(request, event) {
    const stripeData =
      /** @type {import('stripe').Stripe.Event.Data } */ (event.data);
    const sub = /** @type {Subscription} */ (stripeData.object);

    // if the subscription changed from 'incomplete' to 'active' or 'trialing'
    if (
      ['active', 'trialing'].includes(sub.status) &&
      stripeData.previous_attributes.status === 'incomplete'
    ) {
      return this.updateCustomerAndSendStatus(request, event, sub, true);
    }
  }

  /**
   * Handle `subscription.deleted` Stripe wehbook events.
   *
   * @param {*} request
   * @param {Event} event
   */
  async handleSubscriptionDeletedEvent(request, event) {
    const sub = /** @type {Subscription} */ (event.data.object);
    return this.updateCustomerAndSendStatus(request, event, sub, false);
  }

  async handleWebhookEvent(request) {
    const event = this.stripeHelper.constructWebhookEvent(
      request.payload,
      request.headers['stripe-signature']
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreatedEvent(request, event);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdatedEvent(request, event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeletedEvent(request, event);
        break;
      default:
        Sentry.withScope(scope => {
          scope.setContext('stripeEvent', {
            event: { id: event.id, type: event.type },
          });
          Sentry.captureMessage(
            'Unhandled Stripe event received.',
            Sentry.Severity.Info
          );
        });
        break;
    }

    return {};
  }

  /**
   * Get a list of subscriptions with a FxA UID and email address.
   *
   * @param {Request} request a Hapi request
   * @returns {Promise<object[]>} Formatted list of subscriptions.
   */
  async getSubscriptions(request) {
    this.log.begin('subscriptions.getSubscriptions', request);

    const { uid, email } = await this.getUidEmail(request);
    const customer = await this.stripeHelper.customer(uid, email, false, true);

    // A FxA user isn't always a customer.
    if (!customer) {
      return [];
    }

    const response = await this.stripeHelper.subscriptionsToResponse(
      customer.subscriptions
    );

    return response;
  }

  async getUidEmail(request) {
    let uid, email;

    if (request.auth.strategy === 'supportPanelSecret') {
      ({ uid, email } = request.query);
    } else {
      // 'oauthToken' is the default
      ({ uid, email } = await handleAuth(this.db, request.auth, true));
    }

    return { uid, email };
  }
}

const directRoutes = (
  log,
  db,
  config,
  customs,
  push,
  mailer,
  profile,
  stripeHelper
) => {
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

  // FIXME: All of these need to be wrapped in Stripe error handling
  // FIXME: Many of these stripe calls need retries with careful thought about
  //        overall request deadline. Stripe retries must include a idempotency_key.
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
      handler: request => directStripeRoutes.getClients(request),
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
      handler: request => directStripeRoutes.listPlans(request),
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
      handler: request => directStripeRoutes.listActive(request),
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
            idempotencyKey: isA.string().required(),
          },
        },
        response: {
          schema: isA.object().keys({
            subscriptionId: validators.subscriptionsSubscriptionId.required(),
          }),
        },
      },
      handler: request => directStripeRoutes.createSubscription(request),
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
      handler: request => directStripeRoutes.updatePayment(request),
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
      handler: request => directStripeRoutes.getCustomer(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/search',
      options: {
        auth: {
          payload: false,
          strategy: 'supportPanelSecret',
        },
        response: {
          schema: isA
            .array()
            .items(validators.subscriptionsSubscriptionValidator),
        },
        validate: {
          query: {
            uid: isA.string().required(),
            email: validators.email().required(),
            limit: isA.number().optional(),
          },
        },
      },
      handler: request => directStripeRoutes.getSubscriptions(request),
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
      handler: request => directStripeRoutes.updateSubscription(request),
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
      handler: request => directStripeRoutes.deleteSubscription(request),
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
      handler: request => directStripeRoutes.reactivateSubscription(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/stripe/event',
      options: {
        // We'll use the official Stripe library to authenticate the payload,
        // and it will also return an event.
        auth: false,
        // The raw payload is needed for authentication.
        payload: {
          output: 'data',
          parse: false,
        },
        validate: {
          headers: { 'stripe-signature': isA.string().required() },
        },
      },
      handler: request => directStripeRoutes.handleWebhookEvent(request),
    },
  ];
};

const createRoutes = (
  log,
  db,
  config,
  customs,
  push,
  mailer,
  profile,
  stripeHelper
) => {
  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return [];
  }

  if (stripeHelper) {
    return directRoutes(
      log,
      db,
      config,
      customs,
      push,
      mailer,
      profile,
      stripeHelper
    );
  }

  return [];
};

module.exports = createRoutes;
module.exports.DirectStripeRoutes = DirectStripeRoutes;
module.exports.handleAuth = handleAuth;
module.exports.sanitizePlans = sanitizePlans;
