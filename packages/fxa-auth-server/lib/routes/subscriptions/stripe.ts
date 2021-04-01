/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { AbbrevPlan } from 'fxa-shared/dist/subscriptions/types';
import { metadataFromPlan } from 'fxa-shared/subscriptions/metadata';
import {
  DeepPartial,
  filterCustomer,
  filterIntent,
  filterInvoice,
  filterSubscription,
} from 'fxa-shared/subscriptions/stripe';
import omitBy from 'lodash/omitBy';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';

import { ConfigType } from '../../../config';
import error from '../../error';
import {
  StripeHelper,
  ACTIVE_SUBSCRIPTION_STATUSES,
} from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import { splitCapabilities } from '../utils/subscriptions';
import validators from '../validators';
import { handleAuth, ThenArg } from './utils';

/**
 * Delete any metadata keys prefixed by `capabilities:` before
 * sending response. We don't need to reveal those.
 * https://github.com/mozilla/fxa/issues/3273#issuecomment-552637420
 */
export function sanitizePlans(plans: AbbrevPlan[]) {
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

export type PaypalPaymentError = 'missing_agreement' | 'funding_source';

type PaymentBillingDetails = ReturnType<
  StripeHandler['extractBillingDetails']
> & {
  paypal_payment_error?: PaypalPaymentError;
  billing_agreement_id?: string;
};

export class StripeHandler {
  constructor(
    // FIXME: For some reason Logger methods were not being detected in
    //        inheriting classes thus this interface join.
    protected log: AuthLogger & Logger,
    protected db: any,
    protected config: ConfigType,
    protected customs: any,
    protected push: any,
    protected mailer: any,
    protected profile: any,
    protected stripeHelper: StripeHelper
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

  // TODO: This can be removed, its a ghost function, no callers.
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

    // Verify the new plan currency and customer currency are compatible.
    // Stripe does not allow customers to change currency after a currency is set, which
    // occurs on initial subscription. (https://stripe.com/docs/billing/customer#payment)
    const customer = await this.stripeHelper.customer({ uid, email });
    const planCurrency = (await this.stripeHelper.findPlanById(planId))
      .currency;
    if (customer && customer.currency != planCurrency) {
      throw error.currencyCurrencyMismatch(customer.currency, planCurrency);
    }

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

  async getProductName(request: AuthRequest) {
    this.log.begin('subscriptions.getProductName', request);
    const { productId } = request.query as Record<string, string>;
    const plans = await this.stripeHelper.allPlans();
    const planForProduct = plans.find((plan) => plan.product_id === productId);
    if (!planForProduct) {
      throw error.unknownSubscriptionPlan();
    }
    this.log.info('subscriptions.getProductName', {
      productId,
    });
    return { product_name: planForProduct.product_name };
  }

  async listActive(request: AuthRequest) {
    this.log.begin('subscriptions.listActive', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.customer({
      uid,
      email,
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
        if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
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
   * Extracts billing details if a customer has a source on file.
   */
  extractBillingDetails(customer: Stripe.Customer) {
    const defaultPayment = customer.invoice_settings.default_payment_method;
    const paymentProvider = this.stripeHelper.getPaymentProvider(customer);

    if (defaultPayment) {
      if (typeof defaultPayment === 'string') {
        // This should always be expanded here.
        throw error.backendServiceFailure('stripe', 'paymentExpansion');
      }

      if (defaultPayment.card) {
        return {
          billing_name: defaultPayment.billing_details.name,
          payment_provider: paymentProvider,
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
          payment_provider: paymentProvider,
          payment_type: src.funding,
          last4: src.last4,
          exp_month: src.exp_month,
          exp_year: src.exp_year,
          brand: src.brand,
        };
      }
    }

    return {
      payment_provider: paymentProvider,
    };
  }

  async getCustomer(request: AuthRequest) {
    this.log.begin('subscriptions.getCustomer', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'getCustomer');

    const customer = await this.stripeHelper.fetchCustomer(uid, [
      'subscriptions.data.latest_invoice',
      'invoice_settings.default_payment_method',
    ]);
    if (!customer) {
      throw error.unknownCustomer(uid);
    }
    const billingDetails = this.extractBillingDetails(
      customer
    ) as PaymentBillingDetails;

    if (billingDetails.payment_provider === 'paypal') {
      billingDetails.billing_agreement_id = this.stripeHelper.getCustomerPaypalAgreement(
        customer
      );
    }

    if (
      billingDetails.payment_provider === 'paypal' &&
      this.stripeHelper.hasSubscriptionRequiringPaymentMethod(customer)
    ) {
      if (!this.stripeHelper.getCustomerPaypalAgreement(customer)) {
        billingDetails.paypal_payment_error = 'missing_agreement';
      } else if (this.stripeHelper.hasOpenInvoice(customer)) {
        billingDetails.paypal_payment_error = 'funding_source';
      }
    }

    const response = {
      subscriptions: [] as ThenArg<
        ReturnType<StripeHelper['subscriptionsToResponse']>
      >,
      ...billingDetails,
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

    // Skip the payment source check if there's no payment method id.
    if (paymentMethodId) {
      const planCurrency = (await this.stripeHelper.findPlanById(priceId))
        .currency;
      const paymentMethodCountry = (
        await this.stripeHelper.getPaymentMethod(paymentMethodId)
      ).card?.country;
      if (
        !this.stripeHelper.currencyHelper.isCurrencyCompatibleWithCountry(
          planCurrency,
          paymentMethodCountry
        )
      ) {
        throw error.currencyCountryMismatch(planCurrency, paymentMethodCountry);
      }
    }

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

    const paymentMethodCountry = (
      await this.stripeHelper.getPaymentMethod(paymentMethodId)
    ).card?.country;
    if (
      !this.stripeHelper.currencyHelper.isCurrencyCompatibleWithCountry(
        customer.currency,
        paymentMethodCountry
      )
    ) {
      throw error.currencyCountryMismatch(
        customer.currency,
        paymentMethodCountry
      );
    }

    await this.stripeHelper.updateDefaultPaymentMethod(
      customer.id,
      paymentMethodId
    );
    await this.stripeHelper.removeSources(customer.id);

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
   * Detach a payment method from a customer _without_ any subscriptions.
   * This prevents a potentially problematic card for being used for the
   * customer's _first_ subscription.
   */
  async detachFailedPaymentMethod(request: AuthRequest) {
    this.log.begin('subscriptions.detachFailedPaymentMethod', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'detachFailedPaymentMethod');

    let customer = await this.stripeHelper.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { paymentMethodId } = request.payload as Record<string, string>;

    // We are handling a very specific scenario here, one in which the customer
    // has not been ever able to successfully subscribe with the attempted
    // payment method.
    if (
      customer.subscriptions?.data.length &&
      customer.subscriptions.data.every((s) => s.status === 'incomplete')
    ) {
      return await this.stripeHelper.detachPaymentMethod(paymentMethodId);
    }

    // Do nothing.  There's no course correction action to take.
    return { id: paymentMethodId };
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
   * Get a list of subscriptions with a FxA UID and email address.
   */
  async getSubscriptions(request: AuthRequest) {
    this.log.begin('subscriptions.getSubscriptions', request);

    const { uid, email } = await handleAuth(this.db, request.auth, true);
    const customer = await this.stripeHelper.customer({
      uid,
      email,
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

export const stripeRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const stripeHandler = new StripeHandler(
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
      handler: (request: AuthRequest) => stripeHandler.getClients(request),
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
      handler: (request: AuthRequest) => stripeHandler.listPlans(request),
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
      handler: (request: AuthRequest) => stripeHandler.listActive(request),
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
      handler: (request: AuthRequest) => stripeHandler.getCustomer(request),
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
            displayName: isA.string().optional(),
            idempotencyKey: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.createCustomer(request),
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
        stripeHandler.createSubscriptionWithPMI(request),
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
      handler: (request: AuthRequest) => stripeHandler.retryInvoice(request),
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
        stripeHandler.createSetupIntent(request),
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
        stripeHandler.updateDefaultPaymentMethod(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/paymentmethod/failed/detach',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA
            .object({
              id: validators.stripePaymentMethodId.required(),
            })
            .unknown(true),
        },
        validate: {
          payload: {
            paymentMethodId: validators.stripePaymentMethodId.required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        stripeHandler.detachFailedPaymentMethod(request),
    },
    {
      method: 'GET',
      path: '/oauth/subscriptions/productname',
      options: {
        response: {
          schema: isA.object({
            product_name: isA.string().required(),
          }),
        },
        validate: {
          query: {
            productId: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) => stripeHandler.getProductName(request),
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
        stripeHandler.getSubscriptionsForSupport(request),
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
        stripeHandler.updateSubscription(request),
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
        stripeHandler.deleteSubscription(request),
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
        stripeHandler.reactivateSubscription(request),
    },
  ];
};
