/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import isA from '@hapi/joi';
import * as Sentry from '@sentry/node';
import ScopeSet from 'fxa-shared/oauth/scopes';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import {
  DeepPartial,
  filterCustomer,
  filterIntent,
  filterInvoice,
  filterSubscription,
} from 'fxa-shared/subscriptions/stripe';
import omitBy from 'lodash/omitBy';
import { Stripe } from 'stripe';

import { ConfigType } from '../../config';
import error from '../error';
import {
  AbbrevPlan,
  StripeHelper,
  SUBSCRIPTION_UPDATE_TYPES,
} from '../payments/stripe';
import { AuthLogger, AuthRequest } from '../types';
import { splitCapabilities } from './utils/subscriptions';
import validators from './validators';

const SUBSCRIPTIONS_MANAGEMENT_SCOPE =
  'https://identity.mozilla.com/account/subscriptions';

const IGNORABLE_STRIPE_WEBHOOK_ERRNOS = [
  error.ERRNO.UNKNOWN_SUBSCRIPTION_FOR_SOURCE,
  error.ERRNO.BOUNCE_HARD,
];

/**
 * Authentication handler for subscription routes.
 */
async function handleAuth(db: any, auth: any, fetchEmail = false) {
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

/**
 * Delete any metadata keys prefixed by `capabilities:` before
 * sending response. We don't need to reveal those.
 * https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
 */
function sanitizePlans(plans: AbbrevPlan[]) {
  return plans.map((planIn) => {
    // Try not to mutate the original in case we cache plans in memory.
    const plan = { ...planIn };
    const isCapabilityKey = (value: string, key: string) =>
      key.startsWith('capabilities');
    plan.plan_metadata = omitBy(plan.plan_metadata, isCapabilityKey);
    plan.product_metadata = omitBy(plan.product_metadata, isCapabilityKey);
    return plan;
  });
}

class DirectStripeRoutes {
  constructor(
    private log: AuthLogger,
    private db: any,
    private config: ConfigType,
    private customs: any,
    private push: any,
    private mailer: any,
    private profile: any,
    private stripeHelper: StripeHelper
  ) {}

  /**
   * Reload the customer data to reflect a change.
   */
  async customerChanged(request: AuthRequest, uid: string, email: string) {
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

  /**
   * Retrieve the client capabilities
   */
  async getClients(request: AuthRequest) {
    this.log.begin('subscriptions.getClients', request);
    const capabilitiesByClientId: { [clientId: string]: string[] } = {};

    const plans = await this.stripeHelper.allPlans();

    const capabilitiesForAll: string[] = [];
    for (const plan of plans) {
      const metadata = metadataFromPlan(plan);
      if (metadata.capabilities) {
        capabilitiesForAll.push(...splitCapabilities(metadata.capabilities));
      }
      const capabilityKeys = Object.keys(metadata).filter((key) =>
        key.startsWith('capabilities:')
      );
      for (const key of capabilityKeys) {
        const clientId = key.split(':')[1];
        const capabilities = splitCapabilities((metadata as any)[key]);
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

  async createSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.createSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'createSubscription');

    const {
      planId,
      paymentToken,
      displayName,
      idempotencyKey,
    } = request.payload as any;

    const selectedPlan = await this.stripeHelper.findPlanById(planId);

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

    const sourceCountry = this.stripeHelper.extractSourceCountryFromSubscription(
      subscription
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.createSubscription.success', {
      uid,
      subscriptionId: subscription.id,
    });
    return {
      subscriptionId: subscription.id,
      sourceCountry,
    };
  }

  /**
   * Create Subscription for New Customer
   */
  async createSubscriptionNewCustomer(
    uid: string,
    email: string,
    displayName: string,
    paymentToken: string,
    selectedPlan: AbbrevPlan,
    idempotencyKey: string
  ): Promise<Stripe.Subscription> {
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
   */
  async createSubscriptionExistingCustomer(
    customer: Stripe.Customer,
    paymentToken: string,
    selectedPlan: AbbrevPlan,
    idempotencyKey: string
  ): Promise<Stripe.Subscription> {
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

    const subscription = this.findCustomerSubscriptionByProductId(
      customer,
      selectedPlan.product_id
    );

    // If the user has a subscription to the product
    if (subscription) {
      // AND the plan is different
      if (!subscription.plan) {
        throw error.internalValidationError(
          'createSubscriptionExistingCustomer',
          { subscription: subscription.id },
          'Subscriptions with multiple plans not supported.'
        );
      }
      if (subscription.plan.id !== selectedPlan.plan_id) {
        throw error.userAlreadySubscribedToProduct();
      }

      // If we have a prior subscription to the plan, we have 3 options:
      //   1) Open subscription that needs a payment method, try to pay it
      //   2) Paid subscription, stop and return as they already have the sub
      //   3) Old subscription will have no open invoices, ignore it
      if (subscription.latest_invoice) {
        if (typeof subscription.latest_invoice === 'string') {
          throw error.internalValidationError(
            'createSubscriptionExistingCustomer',
            { subscription: subscription.id },
            'latest_invoice for subscription was not expanded during load.'
          );
        }
        const invoice = subscription.latest_invoice;
        if (invoice.status === 'open') {
          await this.handleOpenInvoice(invoice);
          return subscription;
        } else if (invoice.status === 'paid') {
          throw error.subscriptionAlreadyExists();
        }
      }
    }

    return this.stripeHelper.createSubscription(
      customer,
      selectedPlan,
      idempotencyKey
    );
  }

  async handleOpenInvoice(invoice: Stripe.Invoice) {
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

  findCustomerSubscriptionByPlanId(
    customer: Stripe.Customer,
    planId: string
  ): Stripe.Subscription | undefined {
    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'findCustomerSubscriptionByPlanId',
        {
          customerId: customer.id,
        },
        'Expected subscriptions to be loaded.'
      );
    }
    return customer.subscriptions.data.find(
      (sub) => sub.items.data.find((item) => item.plan.id === planId) != null
    );
  }

  findCustomerSubscriptionByProductId(
    customer: Stripe.Customer,
    productId: string
  ): Stripe.Subscription | undefined {
    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'findCustomerSubscriptionByProductId',
        {
          customerId: customer.id,
        },
        'Expected subscriptions to be loaded.'
      );
    }
    return customer.subscriptions.data.find(
      (sub) =>
        sub.items.data.find(
          (item) =>
            item.plan.product === productId ||
            (item.plan.product &&
              typeof item.plan.product !== 'string' &&
              item.plan.product.id)
        ) != null
    );
  }

  async deleteSubscription(request: AuthRequest) {
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

  async updatePayment(request: AuthRequest) {
    this.log.begin('subscriptions.updatePayment', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'updatePayment');

    const { paymentToken } = request.payload as Record<string, string>;

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

  async reactivateSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.reactivateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'reactivateSubscription');

    const { subscriptionId } = request.payload as Record<string, string>;

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

  async updateSubscription(request: AuthRequest) {
    this.log.begin('subscriptions.updateSubscription', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);

    await this.customs.check(request, email, 'updateSubscription');

    const { subscriptionId } = request.params;
    const { planId } = request.payload as Record<string, string>;

    const subscription = await this.stripeHelper.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    if (!subscription.plan) {
      throw error.internalValidationError(
        'updateSubscription',
        { subscription: subscription.id },
        'Subscriptions with multiple plans not supported.'
      );
    }

    const currentPlanId = subscription.plan.id;

    // Verify the plan is a valid update for this subscription.
    await this.stripeHelper.verifyPlanUpdateForSubscription(
      currentPlanId,
      planId
    );

    // Update the plan
    await this.stripeHelper.changeSubscriptionPlan(subscriptionId, planId);

    await this.customerChanged(request, uid, email);

    return { subscriptionId };
  }

  async listPlans(request: AuthRequest) {
    this.log.begin('subscriptions.listPlans', request);
    await handleAuth(this.db, request.auth);
    const plans = await this.stripeHelper.allPlans();
    return sanitizePlans(plans);
  }

  async listActive(request: AuthRequest) {
    this.log.begin('subscriptions.listActive', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.customer({
      uid,
      email,
      cacheOnly: true,
    });
    const activeSubscriptions = [];

    if (customer && customer.subscriptions) {
      for (const subscription of customer.subscriptions.data) {
        if (!subscription.plan) {
          throw error.internalValidationError(
            'listActive',
            { subscription: subscription.id },
            'Subscriptions with multiple plans not supported.'
          );
        }

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

  /**
   * Extracts card details if a customer has a source on file.
   */
  extractCardDetails(customer: Stripe.Customer) {
    const defaultPayment = customer.invoice_settings.default_payment_method;
    if (defaultPayment) {
      if (typeof defaultPayment === 'string') {
        // This should always be expanded here.
        throw error.backendServiceFailure('stripe', 'paymentExpansion');
      }

      if (defaultPayment.card) {
        return {
          billing_name: defaultPayment.billing_details.name,
          payment_type: defaultPayment.card.funding,
          last4: defaultPayment.card.last4,
          exp_month: defaultPayment.card.exp_month,
          exp_year: defaultPayment.card.exp_year,
          brand: defaultPayment.card.brand,
        };
      }
    }
    if (customer.sources && customer.sources.data.length > 0) {
      // Currently assume a single source, and we can only access these attributes
      // on cards.
      const src = customer.sources.data[0];
      if (src.object === 'card') {
        return {
          billing_name: src.name,
          payment_type: src.funding,
          last4: src.last4,
          exp_month: src.exp_month,
          exp_year: src.exp_year,
          brand: src.brand,
        };
      }
    }
    return {};
  }

  async getCustomer(request: AuthRequest) {
    this.log.begin('subscriptions.getCustomer', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.fetchCustomer(uid, email, [
      'data.subscriptions.data.latest_invoice',
      'data.invoice_settings.default_payment_method',
    ]);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }
    const cardDetails = this.extractCardDetails(customer);
    const response = {
      // Less than ideal to type as any, but using the ReturnType of below
      // didn't work any better. 🤷‍♀️
      subscriptions: [] as any[],
      ...cardDetails,
    };

    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'listActive',
        { customerId: customer.id },
        'Customer has no subscriptions.'
      );
    }

    response.subscriptions = await this.stripeHelper.subscriptionsToResponse(
      customer.subscriptions
    );
    return response;
  }

  /**
   * Create a customer.
   *
   * New PaymentMethod flow.
   */
  async createCustomer(
    request: AuthRequest
  ): Promise<DeepPartial<Stripe.Customer>> {
    this.log.begin('subscriptions.createCustomer', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createCustomer');

    let customer = await this.stripeHelper.customer({ uid, email });
    if (customer) {
      return customer;
    }

    const { displayName, idempotencyKey } = request.payload as Record<
      string,
      string
    >;
    const customerIdempotencyKey = `${idempotencyKey}-customer`;
    customer = await this.stripeHelper.createPlainCustomer(
      uid,
      email,
      displayName,
      customerIdempotencyKey
    );
    return filterCustomer(customer);
  }

  /**
   * Retry an invoice by attaching a new payment method id for use.
   *
   * New PaymentMethod flow.
   */
  async retryInvoice(request: AuthRequest) {
    this.log.begin('subscriptions.retryInvoice', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'retryInvoice');

    const customer = await this.stripeHelper.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const {
      invoiceId,
      paymentMethodId,
      idempotencyKey,
    } = request.payload as Record<string, string>;
    const retryIdempotencyKey = `${idempotencyKey}-retryInvoice`;
    const invoice = await this.stripeHelper.retryInvoiceWithPaymentId(
      customer.id,
      invoiceId,
      paymentMethodId,
      retryIdempotencyKey
    );

    await this.customerChanged(request, uid, email);

    return filterInvoice(invoice);
  }

  /**
   * Create a subscription for a user.
   *
   * New PaymentMethod flow.
   */
  async createSubscriptionWithPMI(
    request: AuthRequest
  ): Promise<{
    sourceCountry: string | null;
    subscription: DeepPartial<Stripe.Subscription>;
  }> {
    this.log.begin('subscriptions.createSubscriptionWithPMI', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createSubscriptionWithPMI');

    const customer = await this.stripeHelper.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const {
      priceId,
      paymentMethodId,
      idempotencyKey,
    } = request.payload as Record<string, string>;

    const subIdempotencyKey = `${idempotencyKey}-createSub`;
    const subscription = await this.stripeHelper.createSubscriptionWithPMI({
      customerId: customer.id,
      priceId,
      paymentMethodId,
      subIdempotencyKey,
    });

    const sourceCountry = this.stripeHelper.extractSourceCountryFromSubscription(
      subscription
    );

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.createSubscriptionWithPMI.success', {
      uid,
      subscriptionId: subscription.id,
    });

    return {
      sourceCountry,
      subscription: filterSubscription(subscription),
    };
  }

  /**
   * Create a new SetupIntent that will be attached to the current customer
   * after it succeeds.
   */
  async createSetupIntent(request: AuthRequest) {
    this.log.begin('subscriptions.createSetupIntent', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createSetupIntent');

    const customer = await this.stripeHelper.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }
    const setupIntent = await this.stripeHelper.createSetupIntent(customer.id);
    return filterIntent(setupIntent);
  }

  /**
   * Updates what payment method is used by default on new invoices for the
   * customer.
   */
  async updateDefaultPaymentMethod(request: AuthRequest) {
    this.log.begin('subscriptions.updateDefaultPaymentMethod', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'updateDefaultPaymentMethod');

    let customer = await this.stripeHelper.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { paymentMethodId } = request.payload as Record<string, string>;

    await this.stripeHelper.updateDefaultPaymentMethod(
      customer.id,
      paymentMethodId
    );
    // Refetch the customer and force a cache clear
    customer = await this.stripeHelper.customer({
      uid,
      email,
      forceRefresh: true,
    });
    if (!customer) {
      // We had a customer, we really shouldn't lose it now.
      throw error.unexpectedError(request);
    }
    return filterCustomer(customer);
  }

  /**
   * Gather all capabilities granted by a product across all clients
   */
  async getProductCapabilities(productId: string): Promise<string[]> {
    const plans = await this.stripeHelper.allPlans();
    const capabilitiesForProduct = [];
    for (const plan of plans) {
      if (plan.product_id !== productId) {
        continue;
      }
      const metadata = metadataFromPlan(plan);
      const capabilityKeys = [
        'capabilities',
        ...Object.keys(metadata).filter((key) =>
          key.startsWith('capabilities:')
        ),
      ];
      for (const key of capabilityKeys) {
        capabilitiesForProduct.push(
          ...splitCapabilities((metadata as any)[key])
        );
      }
    }
    // Remove duplicates with Set
    const capabilitySet = new Set(capabilitiesForProduct);
    return [...capabilitySet];
  }

  /**
   * Send a subscription status Service Notification event to SQS
   */
  async sendSubscriptionStatusToSqs(
    request: AuthRequest,
    uid: string,
    event: Stripe.Event,
    sub: { id: string; productId: string },
    isActive: boolean
  ) {
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
   * Update the customer and send subscription status update.
   *
   * It is expected that the subscription does *not* have the product expanded.
   */
  async updateCustomerAndSendStatus(
    request: AuthRequest,
    event: Stripe.Event,
    sub: Stripe.Subscription,
    isActive: boolean,
    uidIn: string | null = null,
    emailIn: string | null = null
  ) {
    let uid, email;
    if (uidIn && emailIn) {
      // If we already have uid & email for the customer from a previous
      // API call, we can re-use it.
      uid = uidIn;
      email = emailIn;
    } else {
      // Otherwise, we'll need to fetch it based on the subscription.
      ({
        uid,
        email,
      } = await this.stripeHelper.getCustomerUidEmailFromSubscription(sub));
    }
    if (!uid || !email) {
      return;
    }
    await this.updateCustomer(uid, email);
    if (!sub.plan || typeof sub.plan.product !== 'string') {
      throw error.internalValidationError(
        'updateCustomerAndSendStatus',
        {
          subscriptionId: sub.id,
        },
        'Expected subscription to have a single plan with product not expanded.'
      );
    }
    await this.sendSubscriptionStatusToSqs(
      request,
      uid,
      event,
      { id: sub.id, productId: sub.plan.product },
      isActive
    );
  }

  /**
   * Refresh the cached customer and invalidate profile cache.
   */
  async updateCustomer(uid: string, email: string) {
    await this.stripeHelper.refreshCachedCustomer(uid, email);
    await this.profile.deleteCache(uid);
  }

  /**
   * Handle webhook events from Stripe by pre-processing the incoming
   * event and dispatching to the appropriate sub-handler. Log an info
   * message for events we don't yet handle.
   */
  async handleWebhookEvent(request: AuthRequest) {
    try {
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
        case 'customer.source.expiring':
          await this.handleCustomerSourceExpiringEvent(request, event);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceededEvent(request, event);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailedEvent(request, event);
          break;
        default:
          Sentry.withScope((scope) => {
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
    } catch (error) {
      if (!IGNORABLE_STRIPE_WEBHOOK_ERRNOS.includes(error.errno)) {
        // Error is not ignorable, so re-throw.
        throw error;
      }
      // Caught an ignorable error, so let's log but continue to 200 OK response
      this.log.error('subscriptions.handleWebhookEvent.failure', { error });
    }
    return {};
  }

  /**
   * Handle `subscription.created` Stripe webhook events.
   *
   * Only subscriptions that are active/trialing are valid. Emit an event for
   * those conditions only.
   */
  async handleSubscriptionCreatedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const sub = event.data.object as Stripe.Subscription;
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
   */
  async handleSubscriptionUpdatedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const { uid, email } = await this.sendSubscriptionUpdatedEmail(event);

    // if the subscription changed from 'incomplete' to 'active' or 'trialing'
    if (
      ['active', 'trialing'].includes(sub.status) &&
      (event.data?.previous_attributes as any)?.status === 'incomplete'
    ) {
      return this.updateCustomerAndSendStatus(
        request,
        event,
        sub,
        true,
        uid,
        email
      );
    }
  }

  /**
   * Handle `subscription.deleted` Stripe wehbook events.
   */
  async handleSubscriptionDeletedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const { uid, email } = await this.sendSubscriptionDeletedEmail(sub);
    return this.updateCustomerAndSendStatus(
      request,
      event,
      sub,
      false,
      uid,
      email
    );
  }

  /**
   * Handle `invoice.payment_succeeded` Stripe wehbook events.
   */
  async handleInvoicePaymentSucceededEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const { uid, email } = await this.sendSubscriptionInvoiceEmail(invoice);
    await this.updateCustomer(uid, email);
  }

  /**
   * Handle `invoice.payment_succeeded` Stripe wehbook events.
   */
  async handleInvoicePaymentFailedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.billing_reason !== 'subscription_cycle') {
      // Send payment failure emails only when processing a subscription renewal.
      return;
    }
    const { uid, email } = await this.sendSubscriptionPaymentFailedEmail(
      invoice
    );
    await this.updateCustomer(uid, email);
  }

  /**
   * Handle `customer.source.expiring` Stripe wehbook events.
   */
  async handleCustomerSourceExpiringEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const source = event.data.object as Stripe.Source;
    const { uid, email } = await this.sendSubscriptionPaymentExpiredEmail(
      source
    );
    await this.updateCustomer(uid, email);
  }

  /**
   * Send out an email on payment expiration.
   */
  async sendSubscriptionPaymentExpiredEmail(paymentSource: Stripe.Source) {
    const sourceDetails = await this.stripeHelper.extractSourceDetailsForEmail(
      paymentSource
    );
    const { uid } = sourceDetails;
    const account = await this.db.account(uid);
    await this.mailer.sendSubscriptionPaymentExpiredEmail(
      account.emails,
      account,
      {
        acceptLanguage: account.locale,
        ...sourceDetails,
      }
    );
    return sourceDetails;
  }

  /**
   * Send out an email on payment failure.
   */
  async sendSubscriptionPaymentFailedEmail(invoice: Stripe.Invoice) {
    const invoiceDetails = await this.stripeHelper.extractInvoiceDetailsForEmail(
      invoice
    );
    const { uid } = invoiceDetails;
    const account = await this.db.account(uid);
    await this.mailer.sendSubscriptionPaymentFailedEmail(
      account.emails,
      account,
      {
        acceptLanguage: account.locale,
        ...invoiceDetails,
      }
    );
    return invoiceDetails;
  }

  /**
   * Send out the appropriate invoice email, depending on whether it's the
   * initial or a subsequent invoice.
   */
  async sendSubscriptionInvoiceEmail(invoice: Stripe.Invoice) {
    const invoiceDetails = await this.stripeHelper.extractInvoiceDetailsForEmail(
      invoice
    );
    const { uid } = invoiceDetails;
    const account = await this.db.account(uid);
    const mailParams = [
      account.emails,
      account,
      {
        acceptLanguage: account.locale,
        ...invoiceDetails,
      },
    ];
    switch (invoice.billing_reason) {
      case 'subscription_create':
        await this.mailer.sendSubscriptionFirstInvoiceEmail(...mailParams);
        await this.mailer.sendDownloadSubscriptionEmail(...mailParams);
        break;
      default:
        // Other billing reasons should be covered in subsequent invoice email
        // https://stripe.com/docs/api/invoices/object#invoice_object-billing_reason
        await this.mailer.sendSubscriptionSubsequentInvoiceEmail(...mailParams);
        break;
    }
    return invoiceDetails;
  }

  /**
   * Send out the appropriate email on subscription update, depending on
   * whether the change was a subscription upgrade or downgrade.
   */
  async sendSubscriptionUpdatedEmail(event: Stripe.Event) {
    const eventDetails = await this.stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
      event
    );
    const { uid, email } = eventDetails;
    const account = await this.db.account(uid);

    const mailParams = [
      account.emails,
      account,
      {
        acceptLanguage: account.locale,
        ...eventDetails,
      },
    ];

    switch (eventDetails.updateType) {
      case SUBSCRIPTION_UPDATE_TYPES.UPGRADE:
        await this.mailer.sendSubscriptionUpgradeEmail(...mailParams);
        break;
      case SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE:
        await this.mailer.sendSubscriptionDowngradeEmail(...mailParams);
        break;
      case SUBSCRIPTION_UPDATE_TYPES.REACTIVATION:
        await this.mailer.sendSubscriptionReactivationEmail(...mailParams);
        break;
      case SUBSCRIPTION_UPDATE_TYPES.CANCELLATION:
        await this.mailer.sendSubscriptionCancellationEmail(...mailParams);
        break;
    }

    return { uid, email };
  }

  /**
   * Send out the appropriate email on subscription deletion, depending on
   * whether the user still has an account.
   */
  async sendSubscriptionDeletedEmail(subscription: Stripe.Subscription) {
    if (typeof subscription.latest_invoice !== 'string') {
      throw error.internalValidationError(
        'sendSubscriptionDeletedEmail',
        {
          subscriptionId: subscription.id,
          subscriptionInvoiceType: typeof subscription.latest_invoice,
        },
        'Subscription latest_invoice was not a string.'
      );
    }
    const invoiceDetails = await this.stripeHelper.extractInvoiceDetailsForEmail(
      subscription.latest_invoice
    );
    if (
      subscription.metadata &&
      subscription.metadata.cancelled_for_customer_at
    ) {
      // Subscription already cancelled, should have triggered an email earlier
      return invoiceDetails;
    }
    const { uid, email } = invoiceDetails;

    let account;
    try {
      // If the user's account has not been deleted, we should have already
      // sent email at subscription update when cancel_at_period_end = true
      await this.db.account(uid);
    } catch (err) {
      // Has the user's account been deleted?
      if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        // HACK: Minimal account-like object that mailer should accept.
        // see also: lib/senders/index.js senders.email wrappedMailer
        account = { email, uid, emails: [{ email, isPrimary: true }] };

        await this.mailer.sendSubscriptionAccountDeletionEmail(
          account.emails,
          account,
          {
            // TODO: How do we retain account.locale on deletion? Save in customer metadata?
            // acceptLanguage: account.locale,
            ...invoiceDetails,
          }
        );
      }
    }
    return invoiceDetails;
  }

  /**
   * Get a list of subscriptions with a FxA UID and email address.
   */
  async getSubscriptions(request: AuthRequest) {
    this.log.begin('subscriptions.getSubscriptions', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.customer({
      uid,
      email,
      cacheOnly: true,
    });

    // A FxA user isn't always a customer.
    if (!customer) {
      return [];
    }

    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'getSubscriptions',
        {
          customerId: customer.id,
        },
        'Customer did not have any subscriptions.'
      );
    }
    const response = await this.stripeHelper.subscriptionsToResponse(
      customer.subscriptions
    );

    return response;
  }

  /**
   * Get a list of subscriptions for support agents
   */
  async getSubscriptionsForSupport(request: AuthRequest) {
    this.log.begin('subscriptions.getSubscriptionsForSupport', request);
    const { uid, email } = request.query as Record<string, string>;

    // We know that a user has to be a customer to create a support ticket
    const customer = await this.stripeHelper.customer({ uid, email });
    if (!customer || !customer.subscriptions) {
      throw error.internalValidationError(
        'getSubscriptionsForSupport',
        {
          customerId: customer?.id,
          uid,
        },
        'No customer object or no subscriptions object present for customer.'
      );
    }
    const response = await this.stripeHelper.formatSubscriptionsForSupport(
      customer.subscriptions
    );

    return response;
  }
}

const directRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
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
      handler: (request: AuthRequest) => directStripeRoutes.getClients(request),
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
      handler: (request: AuthRequest) => directStripeRoutes.listPlans(request),
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
      handler: (request: AuthRequest) => directStripeRoutes.listActive(request),
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
            sourceCountry: validators.subscriptionPaymentCountryCode.required(),
          }),
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.createSubscription(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.updatePayment(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.getCustomer(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/customer',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeCustomerValidator,
        },
        validate: {
          payload: {
            displayName: isA.string().required(),
            idempotencyKey: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.createCustomer(request),
    },
    {
      method: 'POST',
      // Avoid conflict with existing, this can be updated to remove `/new` at the
      // same time the old routes are removed when the client is updated.
      path: '/oauth/subscriptions/active/new',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.object().keys({
            subscription: validators.subscriptionsStripeSubscriptionValidator,
            sourceCountry: validators.subscriptionPaymentCountryCode.required(),
          }),
        },
        validate: {
          payload: {
            priceId: isA.string().required(),
            paymentMethodId: validators.stripePaymentMethodId.optional(),
            idempotencyKey: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.createSubscriptionWithPMI(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/invoice/retry',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeInvoiceValidator,
        },
        validate: {
          payload: {
            invoiceId: isA.string().required(),
            paymentMethodId: validators.stripePaymentMethodId.required(),
            idempotencyKey: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.retryInvoice(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/setupintent/create',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeIntentValidator,
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.createSetupIntent(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/paymentmethod/default',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: validators.subscriptionsStripeCustomerValidator,
        },
        validate: {
          payload: {
            paymentMethodId: validators.stripePaymentMethodId.required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.updateDefaultPaymentMethod(request),
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
            .items(validators.subscriptionsSubscriptionSupportValidator),
        },
        validate: {
          query: {
            uid: isA.string().required(),
            email: validators.email().required(),
            limit: isA.number().optional(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        directStripeRoutes.getSubscriptionsForSupport(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.updateSubscription(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.deleteSubscription(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.reactivateSubscription(request),
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
      handler: (request: AuthRequest) =>
        directStripeRoutes.handleWebhookEvent(request),
    },
  ];
};

const createRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
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
