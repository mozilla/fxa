/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Sentry = require('@sentry/node');
const error = require('../error');
const isA = require('joi');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const validators = require('./validators');
const { metadataFromPlan } = require('./utils/subscriptions');

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

    this.CLIENT_CAPABILITIES = Object.entries(
      config.subscriptions.clientCapabilities
    ).map(([clientId, capabilities]) => ({ clientId, capabilities }));
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
    return this.CLIENT_CAPABILITIES;
  }

  async createSubscription(request) {
    this.log.begin('subscriptions.createSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'createSubscription');

    const { planId, paymentToken, displayName } = request.payload;

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
        selectedPlan
      );
    } else {
      subscription = await this.createSubscriptionExistingCustomer(
        customer,
        paymentToken,
        selectedPlan
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
    selectedPlan
  ) {
    const customer = await this.stripeHelper.createCustomer(
      uid,
      email,
      displayName,
      paymentToken
    );

    return this.stripeHelper.createSubscription(customer, selectedPlan);
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
    selectedPlan
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

    return this.stripeHelper.createSubscription(customer, selectedPlan);
  }

  /**
   * @param {Invoice} invoice
   */
  async handleOpenInvoice(invoice) {
    const payment_intent =
      /** @type {PaymentIntent} */ (invoice.payment_intent);

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

    const hasSubscription = await this.stripeHelper.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!hasSubscription) {
      throw error.unknownSubscription();
    }

    const subscription = await this.stripeHelper.stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
      }
    );
    if (!['active', 'trialing'].includes(subscription.status)) {
      const err = new Error(
        `Reactivated subscription (${subscriptionId}) is not active/trialing`
      );
      throw error.backendServiceFailure(
        'stripe',
        'reactivateSubscription',
        {},
        err
      );
    }

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
    return this.stripeHelper.allPlans();
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
        };
      }
    }

    response.subscriptions = await this.stripeHelper.subscriptionsToResponse(
      customer.subscriptions
    );
    return response;
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
      productCapabilities:
        this.config.subscriptions.productCapabilities[sub.productId] || [],
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
    const { uid, email } = await this.getCustomerUidEmailFromSubscription(sub);
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

  /**
   * Fetch a customer record from Stripe by id and return its userid metadata
   * and the email.
   *
   * @param {Subscription} sub
   * @returns {Promise<{uid: string, email: string} | {uid: undefined, email: undefined}>}
   */
  async getCustomerUidEmailFromSubscription(sub) {
    const customer = await this.stripeHelper.stripe.customers.retrieve(
      /** @type {string} */ (sub.customer)
    );
    if (customer.deleted) {
      // Deleted customers lost their metadata so we can't send events for them
      return { uid: undefined, email: undefined };
    }
    if (!(/** @type {Customer} */ (customer.metadata.userid))) {
      Sentry.withScope(scope => {
        scope.setContext('stripeEvent', {
          customer: { id: customer.id },
        });
        Sentry.captureMessage(
          'FxA UID does not exist on customer metadata.',
          Sentry.Severity.Error
        );
      });
    }
    return {
      uid: /** @type {Customer} */ (customer).metadata.userid,
      email: /** @type {Customer} */ (customer).email,
    };
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
  subhub,
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

  const CLIENT_CAPABILITIES = Object.entries(
    config.subscriptions.clientCapabilities
  ).map(([clientId, capabilities]) => ({ clientId, capabilities }));

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
        await handleAuth(db, request.auth);
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
        const { uid } = await handleAuth(db, request.auth);
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

        const { uid, email } = await handleAuth(db, request.auth, true);

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

        const { uid, email } = await handleAuth(db, request.auth, true);
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
        const { uid } = await handleAuth(db, request.auth);
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

        const { uid, email } = await handleAuth(db, request.auth, true);

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

        const { uid, email } = await handleAuth(db, request.auth, true);

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

        const { uid, email } = await handleAuth(db, request.auth, true);

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
module.exports.DirectStripeRoutes = DirectStripeRoutes;
module.exports.handleAuth = handleAuth;
