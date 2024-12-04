/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import * as Sentry from '@sentry/node';
import { SeverityLevel } from '@sentry/core';
import {
  Account,
  getUidAndEmailByStripeCustomerId,
} from 'fxa-shared/db/models/auth';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import isA from 'joi';
import { Stripe } from 'stripe';
import Container from 'typedi';

import { ConfigType } from '../../../config';
import SUBSCRIPTIONS_DOCS from '../../../docs/swagger/subscriptions-api';
import {
  formatMetadataValidationErrorMessage,
  reportSentryError,
  reportValidationError,
} from '../../../lib/sentry';
import error from '../../error';
import { PayPalHelper, RefusedError } from '../../payments/paypal';
import { RefundType } from '@fxa/payments/paypal';
import {
  CUSTOMER_RESOURCE,
  FormattedSubscriptionForEmail,
  INVOICES_RESOURCE,
  PAYMENT_METHOD_RESOURCE,
  STRIPE_OBJECT_TYPE_TO_RESOURCE,
  StripeHelper,
  SUBSCRIPTION_UPDATE_TYPES,
  VALID_RESOURCE_TYPES,
} from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import { subscriptionProductMetadataValidator } from '../validators';
import { StripeHandler } from './stripe';
import { FirestoreStripeErrorBuilder } from 'fxa-shared/payments/stripe-firestore';

// ALLOWED_EXPAND_RESOURCE_TYPES is a map of "types" of Stripe objects that we
// will fetch the latest of for the webhook event, _instead of_ using the
// object in the request payload.  Products and plans are excluded because
// `expandResource` uses the cached lists for products and plans, but the
// cached lists themselves are updated through webhooks.
//
// 'price' is included in this list of exclusion because the Prices API
// replaced Plans, but since it is backwards compatible, we haven't needed to
// update our plans handling code.  Prices should be treated in the same
// fashion as plans, so it's on this list.
const BYPASS_LATEST_FETCH_TYPES = ['plan', 'price', 'product'];
const BYPASS_LATEST_FETCH_EVENTS = [
  'invoice.upcoming',
  'payment_method.detached',
];
const ALLOWED_EXPAND_RESOURCE_TYPES = Object.fromEntries(
  Object.entries(STRIPE_OBJECT_TYPE_TO_RESOURCE).filter(
    ([k, _]) => !BYPASS_LATEST_FETCH_TYPES.includes(k)
  )
);

const IGNORABLE_STRIPE_WEBHOOK_ERRNOS = [
  error.ERRNO.UNKNOWN_SUBSCRIPTION_FOR_SOURCE,
  error.ERRNO.BOUNCE_HARD,
  error.ERRNO.BOUNCE_COMPLAINT,
];

export class StripeWebhookHandler extends StripeHandler {
  protected paypalHelper?: PayPalHelper;

  constructor(
    log: AuthLogger,
    db: any,
    config: ConfigType,
    customs: any,
    push: any,
    mailer: any,
    profile: any,
    stripeHelper: StripeHelper
  ) {
    super(log, db, config, customs, push, mailer, profile, stripeHelper);
    if (config.subscriptions.paypalNvpSigCredentials.enabled) {
      this.paypalHelper = Container.get(PayPalHelper);
    }
  }

  private async checkIfAccountExists(customerId: string) {
    const result = await getUidAndEmailByStripeCustomerId(customerId);
    return !!result.uid;
  }

  /**
   * Process an event to Firestore so that we have the latest copy in cache. This
   * updates the event object in place to have the latest data.
   */
  private async processEventToFirestore(event: Stripe.Event) {
    // This must run before expansion below to ensure the types that Firestore
    // can store are updated first to prevent multiple fetches from Stripe.
    const firestoreHandled =
      await this.stripeHelper.processWebhookEventToFirestore(event);

    // Ensure the object is the latest version.
    const stripeObject = event.data.object as Record<string, any>;
    const resourceType =
      ALLOWED_EXPAND_RESOURCE_TYPES[stripeObject.object as string];
    if (resourceType) {
      if (!BYPASS_LATEST_FETCH_EVENTS.includes(event.type)) {
        // Replace the object with the latest version if we support this object.
        event.data.object = await this.stripeHelper.expandResource(
          stripeObject.id,
          resourceType as (typeof VALID_RESOURCE_TYPES)[number]
        );
      }
    } else if (stripeObject.object === 'card' && stripeObject.customer) {
      // Cards are not expandable using `expandResource` and are handled separately.
      event.data.object = await this.stripeHelper.getCard(
        stripeObject.customer,
        stripeObject.id
      );
    } else if (
      !BYPASS_LATEST_FETCH_TYPES.includes(stripeObject.object as string)
    ) {
      // We shouldn't be handling events that we can't fetch the latest version
      // of with expandResource. If we have a handler below for this type, then
      // we should have it included as a resource type to expand above.
      Sentry.withScope((scope) => {
        scope.setContext('stripeEvent', {
          event: {
            id: event.id,
            type: event.type,
            objectType: (event.data.object as any).object,
          },
        });
        Sentry.captureMessage(
          'Event being handled that is not using latest object from Stripe.',
          'info' as SeverityLevel
        );
      });
    }
    return firestoreHandled;
  }

  /**
   * Dispatch an event to the appropriate handler.
   */
  private async dispatchEventToHandler(
    request: AuthRequest,
    event: Stripe.Event,
    firestoreHandled: boolean
  ) {
    switch (event.type as Stripe.WebhookEndpointUpdateParams.EnabledEvent) {
      case 'credit_note.created':
        if (this.paypalHelper) {
          await this.handleCreditNoteEvent(request, event);
        }
        break;
      case 'coupon.created':
      case 'coupon.updated':
        await this.handleCouponEvent(request, event);
        break;
      case 'customer.created':
        // We don't need to setup the local customer if it happened via API
        // because we already set this up during creation.
        if (event.request?.id) {
          break;
        }
        await this.handleCustomerCreatedEvent(request, event);
        break;
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
      case 'customer.updated':
        await this.handleCustomerUpdatedEvent(request, event);
        break;
      case 'invoice.created':
        await this.handleInvoiceCreatedEvent(request, event);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaidEvent(request, event);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailedEvent(request, event);
        break;
      case 'invoice.upcoming':
        await this.handleInvoiceUpcomingEvent(request, event);
        break;
      case 'product.created':
      case 'product.updated':
      case 'product.deleted':
        await this.handleProductWebhookEvent(request, event);
        break;
      case 'plan.created':
      case 'plan.updated':
        await this.handlePlanCreatedOrUpdatedEvent(request, event);
        break;
      case 'plan.deleted':
        await this.handlePlanDeletedEvent(request, event);
        break;
      case 'tax_rate.created':
      case 'tax_rate.updated':
        await this.handleTaxRateCreatedOrUpdatedEvent(request, event);
        break;
      default:
        if (!firestoreHandled) {
          Sentry.withScope((scope) => {
            scope.setContext('stripeEvent', {
              event: { id: event.id, type: event.type },
            });
            Sentry.captureMessage(
              'Unhandled Stripe event received.',
              'info' as SeverityLevel
            );
          });
        }
        break;
    }
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
      const firestoreHandled = await this.processEventToFirestore(event);
      await this.dispatchEventToHandler(request, event, firestoreHandled);
    } catch (error) {
      if (error instanceof FirestoreStripeErrorBuilder && error?.customerId) {
        // Check if the Account record for this customerId still exists
        // If the Account record does not exist, it can be assumed that related
        // Firestore and Stripe records no longer exist either, and the
        // error can be ignored
        const accountExists = await this.checkIfAccountExists(error.customerId);
        if (accountExists) throw error;
      } else if (!IGNORABLE_STRIPE_WEBHOOK_ERRNOS.includes(error.errno)) {
        // Error is not ignorable, so re-throw.
        throw error;
      }
      // Caught an ignorable error, so let's log but continue to 200 OK response
      this.log.error('subscriptions.handleWebhookEvent.failure', { error });
    }
    return {};
  }

  /**
   * Handle `credit_note.created` Stripe webhook events.
   */
  async handleCreditNoteEvent(request: AuthRequest, event: Stripe.Event) {
    // Type-guard to require paypalHelper.
    if (!this.paypalHelper) {
      return;
    }
    const creditNote = event.data.object as Stripe.CreditNote;
    const invoice = await this.stripeHelper.expandResource(
      creditNote.invoice,
      'invoices'
    );

    if (invoice.collection_method === 'charge_automatically') {
      // This is a Stripe charge, report if needed and return as Stripe handles
      // refunding the customer.
      if (
        creditNote.customer_balance_transaction ||
        creditNote.out_of_band_amount
      ) {
        // We should be informed if it was applied to the account balance as they
        // should be refunded to the card or if it was applied out of band.
        reportSentryError(
          new Error(
            `Credit note issued for account balance or out of band: ${creditNote.id}`
          ),
          request
        );
      }

      return;
    }

    // We can't issue a refund if there's no paypal transaction to refund.
    const transactionId =
      this.stripeHelper.getInvoicePaypalTransactionId(invoice);
    if (!transactionId) {
      this.log.error('handleCreditNoteEvent', {
        invoiceId: invoice.id,
        message:
          'Credit note issued on invoice without a PayPal transaction id.',
      });
      return;
    }

    // If the amount doesn't match the invoice we can't reverse it.
    if (
      creditNote.out_of_band_amount &&
      creditNote.out_of_band_amount > invoice.amount_due
    ) {
      this.log.error('handleCreditNoteEvent', {
        invoiceId: invoice.id,
        message: 'Credit note exceeds invoice amount.',
      });
      reportSentryError(
        new Error(`Credit amount exceeds invoice: ${invoice.id}.`),
        request
      );
      return;
    }

    try {
      const fullRefund = creditNote.out_of_band_amount === invoice.amount_due;
      const refundType: RefundType = fullRefund
        ? RefundType.Full
        : RefundType.Partial;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const amount = fullRefund ? undefined : creditNote.out_of_band_amount!;

      await this.paypalHelper.issueRefund(
        invoice,
        transactionId,
        refundType,
        amount
      );
    } catch (error) {
      if (error instanceof RefusedError) {
        await this.stripeHelper.updateInvoiceWithPaypalRefundReason(
          invoice,
          error.longMessage
        );

        this.log.error('handleCreditNoteEvent', {
          invoiceId: invoice.id,
          message: 'Paypal refund refused.',
        });

        const sentryError = Object.assign(error, {
          output: {
            payload: {
              invoiceId: invoice.id,
            },
          },
        });

        reportSentryError(sentryError, request);
      } else {
        throw error;
      }
    }
    return;
  }

  /**
   * Handle `coupon.created` and `coupon.updated` Stripe webhook events.
   *
   * Verify that the coupon conforms to our requirements, currently that it:
   *  - Does not have a product ID requirement.
   */
  async handleCouponEvent(request: AuthRequest, event: Stripe.Event) {
    const eventCoupon = event.data.object as Stripe.Coupon;
    const coupon = await this.stripeHelper.getCoupon(eventCoupon.id);

    if (coupon.applies_to?.products && coupon.applies_to?.products.length > 0) {
      reportSentryError(
        new Error(`Coupon has a product requirement: ${coupon.id}.`),
        request
      );
      return;
    }
  }

  /**
   * Handle `customer.created` Stripe webhook events.
   */
  async handleCustomerCreatedEvent(_: AuthRequest, event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;
    const account = await this.db.accountRecord(customer.email);
    await this.stripeHelper.createLocalCustomer(account.uid, customer);
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
    if (ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)) {
      return this.capabilityService.stripeUpdate({ sub });
    }
    return;
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
    let uid;
    try {
      ({ uid } = await this.sendSubscriptionUpdatedEmail(event));
    } catch (err) {
      // It's unexpected that we don't know about the customer or an error happens.
      if (err.output && typeof err.output.payload === 'object') {
        err.output.payload = { ...err.output.payload, eventId: event.id };
      }
      // If the customer has been deleted, then there's insufficient information to
      // send the email. We can't do anything about it, so we'll ignore the error.
      if (err.errno !== error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER) {
        reportSentryError(err, request);
      }
      return;
    }

    // Always send subscription changes to the capability service.
    return this.capabilityService.stripeUpdate({ sub, uid });
  }

  /**
   * Handle `subscription.deleted` Stripe wehbook events.
   */
  async handleSubscriptionDeletedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const customer = await this.stripeHelper.expandResource(
        subscription.customer,
        CUSTOMER_RESOURCE
      );

      if (!customer || customer.deleted) {
        throw error.unknownCustomer(subscription.customer);
      }

      const uid = customer.metadata.userid;
      const account = await Account.findByUid(uid);
      if (
        // When SubPlat cannot collect a PayPal customer's first payment while
        // attempting to subscribe to a product, the subscription is canceled.
        // (At the time of writing, this is happening in
        // `_createPaypalBillingAgreementAndSubscription` of the
        // `PayPalHandler` route handler.)  We should not send an email in that
        // case.
        //
        // If we can retreive the subscription and customer, but the account record
        // cannot be retrieved from the db, the user has deleted their Mozilla
        // account which subsequently deletes their subscription from stripe.
        !account ||
        !(
          subscription.collection_method === 'send_invoice' &&
          account.verifierSetAt <= 0
        )
      ) {
        await this.sendSubscriptionDeletedEmail(subscription);
      }

      await this.capabilityService.stripeUpdate({ sub: subscription, uid });

      if (this.paypalHelper) {
        await this.paypalHelper.conditionallyRemoveBillingAgreement(customer);
      }

      const eventDetails = await this.getSubscriptionEndedEventDetails(
        uid,
        event.id,
        customer,
        subscription
      );
      await request.emitMetricsEvent('subscription.ended', eventDetails);
    } catch (err) {
      // FIXME: If the customer was deleted, we don't send an email that their subscription
      //        was cancelled. This is because the email requires a bunch of details that
      //        only exist on non-deleted customer. A more robust solution is needed.
      if (err.errno === error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER) {
        return;
      }
      reportSentryError(err, request);
    }
  }

  /**
   * Handle `customer.updated` events, this ensures metadata changes to the
   * customer are reflected correctly in our cached copy.
   */
  async handleCustomerUpdatedEvent(request: AuthRequest, event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;
    const uid = customer.metadata?.userid;
    if (!uid || customer.deleted) {
      // There's nothing to do if this event is for a customer being deleted.
      return;
    }
    const account = await Account.findByUid(uid, { include: ['emails'] });
    // If the request has a request id, it means that our API triggered this so
    // we can safely ignore the account not existing as this is typically due to
    // us deleting the account in FxA.
    if (!account && !event.request?.id) {
      reportSentryError(
        new Error(`Cannot load account for customerId: ${customer.id}`),
        request
      );
      return;
    }
  }

  /**
   * Handle `invoice.created` events, if the subscription is for an invoice
   * customer (PayPal), set auto_advance false and finalize.
   */
  async handleInvoiceCreatedEvent(request: AuthRequest, event: Stripe.Event) {
    // Type-guard to require paypalHelper.
    if (!this.paypalHelper) {
      return;
    }
    const invoice = event.data.object as Stripe.Invoice;
    const paypalInvoice = await this.stripeHelper.invoicePayableWithPaypal(
      invoice
    );

    if (!paypalInvoice || invoice.status !== 'draft') {
      return;
    }

    // Fetch the customer to determine if we need to set their name.
    // This is needed because the original PayPal implementation did not copy
    // the name to the Stripe customer object. This is a workaround for that
    // issue, with a metric to track the impact and indicate when this can be
    // removed.
    const customer = await this.stripeHelper.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    if (
      paypalInvoice &&
      customer &&
      customer.deleted !== true &&
      !customer.name
    ) {
      const billingAgreementId =
        this.stripeHelper.getCustomerPaypalAgreement(customer);
      // The customer needs to be updated for their name.
      if (billingAgreementId) {
        try {
          await this.paypalHelper.updateStripeNameFromBA(
            customer,
            billingAgreementId
          );
        } catch (err) {
          if (err.errno === error.ERRNO.INTERNAL_VALIDATION_ERROR) {
            this.log.error(
              `handleInvoiceCreatedEvent - Billing agreement (id: ${billingAgreementId}) was cancelled.`,
              {
                request,
                customer,
              }
            );
          } else {
            throw err;
          }
        }
      }
    }

    return this.stripeHelper.finalizeInvoice(invoice);
  }

  /**
   * Handle `invoice.paid` Stripe wehbook events.
   *
   * This handler sends out our invoice emails to customers as well as verifying
   * that we are not accepting payments for users that may have been deleted or
   * have a Stripe customer account with subscription that has become unlinked
   * from a FxA account. We have observed this can happen in some edge cases during
   * checkout in the past, and want to capture sufficient information for Support
   * to manually handle.
   */
  async handleInvoicePaidEvent(request: AuthRequest, event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customer = await this.stripeHelper.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    let invalidCustomer = false;
    // Store as much relevant user data as we can lookup in case they were
    // deleted or not linked to a FxA account.
    const deletedData: Record<string, any> = {
      customerId: invoice.customer,
      invoiceId: invoice.id,
    };
    if (!customer || customer?.deleted) {
      invalidCustomer = true;
      deletedData.reason = 'customer_deleted';
    } else {
      const uid = customer.metadata?.userid;
      if (!uid) {
        invalidCustomer = true;
        deletedData.reason = 'no_userid';
      } else {
        deletedData.userId = uid;
        deletedData.reason = 'fxa_deleted';
        const account = await Account.findByUid(uid);
        invalidCustomer = !account;
      }
    }
    if (invalidCustomer) {
      const err = Object.assign(
        new Error('Invoice paid on invalid customer.'),
        deletedData
      );
      reportSentryError(err, request);
      return;
    }

    try {
      await this.sendSubscriptionInvoiceEmail(invoice);
    } catch (err) {
      reportSentryError(err, request);
      return;
    }
  }

  /**
   * Handle `invoice.payment_failed` Stripe wehbook events.
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
    await this.sendSubscriptionPaymentFailedEmail(invoice);
  }

  /**
   * Handle `invoice.upcoming` Stripe wehbook events.
   */
  async handleInvoiceUpcomingEvent(request: AuthRequest, event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customer = await this.stripeHelper.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );

    if (
      customer?.deleted ||
      !customer?.invoice_settings?.default_payment_method
    ) {
      return;
    }

    const { card } =
      await this.stripeHelper.expandResource<Stripe.PaymentMethod>(
        customer?.invoice_settings.default_payment_method,
        PAYMENT_METHOD_RESOURCE
      );

    if (card?.exp_month && card.exp_year) {
      // If card expiry month/year is greater than current month/year, return without further action.
      if (
        new Date(card.exp_year, card.exp_month - 1, 1).getTime() > Date.now()
      ) {
        return;
      }
    } else {
      reportSentryError(
        new Error(`Could not find card for customerId: ${customer.id}`),
        request
      );
      return;
    }

    const subscriptions = await this.stripeHelper.formatSubscriptionsForEmails(
      customer
    );

    if (!subscriptions.length) {
      reportSentryError(
        new Error(
          `Could not find subscriptions for customerId: ${customer.id}`
        ),
        request
      );
      return;
    }

    const sourceDetails = {
      uid: customer.metadata.userid,
      email: customer.email,
      subscriptions,
    };

    await this.sendSubscriptionPaymentExpiredEmail(sourceDetails);
  }

  /**
   * Handle `customer.source.expiring` Stripe wehbook events.
   */
  async handleCustomerSourceExpiringEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const source = event.data.object as Stripe.Source;
    const sourceDetails = await this.stripeHelper.extractSourceDetailsForEmail(
      source
    );
    await this.sendSubscriptionPaymentExpiredEmail(sourceDetails);
  }

  /**
   * Validate plan metadata and update cached plans.
   */
  async handlePlanCreatedOrUpdatedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const plan = event.data.object as Stripe.Plan;
    const product = await this.stripeHelper.fetchProductById(
      plan.product as string
    );
    const allPlans = await this.stripeHelper.allPlans();
    // remove the plan until we have validated its metadata
    const updatedList = allPlans.filter((p) => p.id !== plan.id);

    if (!product || product.deleted) {
      const msg = `handlePlanCreatedOrUpdatedEvent - product ${plan.product} appear to have been deleted`;
      this.log.error(msg, { plan });

      Sentry.withScope((scope) => {
        scope.setContext('planUpdatedEvent', { plan });
        Sentry.captureMessage(msg, 'error' as SeverityLevel);
      });

      this.stripeHelper.updateAllPlans(updatedList);
      return;
    }

    // We'll keep validating the metadata, but if the Firestore config docs
    // feature flag is on, we add the plan to the list regardless of the
    // validation result.
    //
    // TODO remove metadata validation once we've successfully moved to
    // Firestore based product configs

    const { error } = await subscriptionProductMetadataValidator.validateAsync({
      ...product.metadata,
      ...plan.metadata,
    });

    if (error) {
      const msg = formatMetadataValidationErrorMessage(plan.id, error as any);
      this.log.error(`handlePlanCreatedOrUpdatedEvent: ${msg}`, {
        error,
        plan,
      });
      reportValidationError(msg, error as any);

      if (!this.config.subscriptions.productConfigsFirestore.enabled) {
        this.stripeHelper.updateAllPlans(updatedList);
        return;
      }
    }

    // The original plans list has the product expanded so we attach the
    // product object here.
    const updatedPlan = { ...plan, product };
    updatedList.push(updatedPlan);
    this.stripeHelper.updateAllPlans(updatedList);
  }

  async handlePlanDeletedEvent(request: AuthRequest, event: Stripe.Event) {
    const plan = event.data.object as Stripe.Plan;
    const allPlans = await this.stripeHelper.allPlans();
    this.stripeHelper.updateAllPlans(allPlans.filter((p) => p.id !== plan.id));
  }

  async handleTaxRateCreatedOrUpdatedEvent(
    request: AuthRequest,
    event: Stripe.Event
  ) {
    const taxRate = event.data.object as Stripe.TaxRate;
    const allTaxRates = await this.stripeHelper.allTaxRates();
    const updatedList = allTaxRates.filter((tr) => tr.id !== taxRate.id);
    updatedList.push(taxRate);
    this.stripeHelper.updateAllTaxRates(updatedList);
  }

  /**
   * Update products cache and validate metadata.
   */
  async handleProductWebhookEvent(request: AuthRequest, event: Stripe.Event) {
    const allProducts = await this.stripeHelper.allProducts();
    const product = event.data.object as Stripe.Product;
    const updatedList = allProducts.filter((p) => p.id !== product.id);
    updatedList.push(product);
    await this.stripeHelper.updateAllProducts(updatedList);

    const cachedPlans = await this.stripeHelper.fetchPlansByProductId(
      product.id
    );
    const latestStripePlans = await this.stripeHelper.fetchAllPlans();
    const updatedPlans = latestStripePlans.filter(
      (plan) => (plan.product as Stripe.Product).id !== product.id
    );
    const latestStripePlansForProduct = latestStripePlans.filter(
      (plan) => (plan.product as Stripe.Product).id === product.id
    );

    if (event.type !== 'product.deleted') {
      for (const plan of cachedPlans) {
        const { error } =
          await subscriptionProductMetadataValidator.validateAsync({
            ...product.metadata,
            ...plan.metadata,
          });

        if (error) {
          const msg = formatMetadataValidationErrorMessage(
            plan.id,
            error as any
          );
          this.log.error(`handleProductWebhookEvent: ${msg}`, {
            error,
            product,
          });
          reportValidationError(msg, error as any);
        }

        // We'll keep validating the metadata, but if the Firestore config docs
        // feature flag is on, we add the plan to the list regardless of the
        // validation result.
        //
        // TODO remove metadata validation once we've successfully moved to
        // Firestore based product configs
        if (
          this.config.subscriptions.productConfigsFirestore.enabled ||
          !error
        ) {
          updatedPlans.push({
            ...plan,
            product,
          });
        }
      }
      // Add any valid plans found in Stripe that are missing from the cache.
      // This is possible e.g. if a plan was created before a product's metadata
      // was valid and was never updated afterward.
      for (const plan of latestStripePlansForProduct) {
        const cachedPlan = updatedPlans.find((p) => p.id === plan.id);
        if (!cachedPlan) {
          updatedPlans.push({
            ...plan,
            product,
          });
        }
      }
    }

    this.stripeHelper.updateAllPlans(updatedPlans);
  }

  /**
   * Send out an email on payment expiration.
   */
  async sendSubscriptionPaymentExpiredEmail(sourceDetails: {
    uid: string;
    email: string | null;
    subscriptions: FormattedSubscriptionForEmail[];
  }) {
    const { uid } = sourceDetails;
    const account = await this.db.account(uid);

    return this.mailer.sendSubscriptionPaymentExpiredEmail(
      account.emails,
      account,
      {
        acceptLanguage: account.locale,
        ...sourceDetails,
        email: sourceDetails.email || account.email,
      }
    );
  }

  /**
   * Send out an email on payment failure.
   */
  async sendSubscriptionPaymentFailedEmail(invoice: Stripe.Invoice) {
    const invoiceDetails =
      await this.stripeHelper.extractInvoiceDetailsForEmail(invoice);
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
    await this.stripeHelper.updateEmailSent(invoice, 'paymentFailed');
    return invoiceDetails;
  }

  /**
   * Send out the appropriate invoice email, depending on whether it's the
   * initial or a subsequent invoice.
   */
  async sendSubscriptionInvoiceEmail(invoice: Stripe.Invoice) {
    const invoiceDetails =
      await this.stripeHelper.extractInvoiceDetailsForEmail(invoice);
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

        // To not overwhelm users with emails, we only send download subscription email
        // for existing accounts. Passwordless accounts get their own email.
        if (account.verifierSetAt > 0) {
          await this.mailer.sendDownloadSubscriptionEmail(...mailParams);
        }
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
    const eventDetails =
      await this.stripeHelper.extractSubscriptionUpdateEventDetailsForEmail(
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
   *
   * We receive a subscription deleted event for the following:
   *   1. A user canceled subscription.
   *   2. Subscription canceled after multiple Stripe attempts to pay an invoice.
   *   3. PayPal processor canceled the subscription after failed attempts.
   *   4. A user deleted their account.
   *   5. An admin or support agent cancelled the subscription.
   *
   * (1) and (5) are handled at the time of cancellation, so we do not send an additional
   * email here.
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
    const invoice = await this.stripeHelper.expandResource<Stripe.Invoice>(
      subscription.latest_invoice,
      INVOICES_RESOURCE
    );
    const invoiceDetails =
      await this.stripeHelper.extractInvoiceDetailsForEmail(invoice);
    if (subscription.metadata?.cancelled_for_customer_at) {
      // Subscription already cancelled, should have triggered an email earlier
      return invoiceDetails;
    }
    const { uid, email, invoiceStatus } = invoiceDetails;

    let account;
    try {
      // If the user's account has not been deleted, we should have already
      // sent email at subscription update when cancel_at_period_end = true,
      // _or_ the cancellation is from Stripe due to failed retries or the
      // PayPal processor, or the subscription was cancelled immediately
      // which we'll handle here.
      account = await this.db.account(uid);
      if (this.stripeHelper.checkSubscriptionPastDue(subscription)) {
        await this.mailer.sendSubscriptionFailedPaymentsCancellationEmail(
          account.emails,
          account,
          {
            acceptLanguage: account.locale,
            ...invoiceDetails,
          }
        );
      } else if (!subscription.cancel_at_period_end) {
        // If invoice is open or draft, assume there is an oustanding balance
        const showOutstandingBalance =
          invoiceStatus && ['open', 'draft'].includes(invoiceStatus);
        await this.mailer.sendSubscriptionCancellationEmail(
          account.emails,
          account,
          {
            acceptLanguage: account.locale,
            ...invoiceDetails,
            showOutstandingBalance,
            cancelAtEnd: subscription.cancel_at_period_end,
          }
        );
      }
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

  async getSubscriptionEndedEventDetails(
    userId: string,
    eventId: string,
    customer: Stripe.Customer,
    subscription: Stripe.Subscription
  ) {
    // We can't use the getPaymentProvider helper, since the subscription is no longer active
    const paymentProvider: 'paypal' | 'stripe' | 'not_chosen' =
      subscription.collection_method === 'send_invoice'
        ? 'paypal'
        : subscription.collection_method === 'charge_automatically'
        ? 'stripe'
        : 'not_chosen';
    const countryCode: string | null | undefined =
      customer.shipping?.address?.country;
    const { id: planId, product: productId } = subscription.items.data[0].plan;
    // It is considered a voluntary cancellation when the customer cancels their subscription
    // via Subscription Management, when a FxA account is deleted, or when Support cancels a
    // subscription immediately.
    // It is an involuntary cancellation when payment has failed or the latest invoice
    // is marked as uncollectible.
    // Voluntary cancellation is undefined if the payment provider is undefined.
    let voluntaryCancellation: boolean | undefined;
    if (paymentProvider === 'stripe') {
      voluntaryCancellation =
        subscription.cancellation_details?.reason === 'cancellation_requested';
    } else if (paymentProvider === 'paypal') {
      // Unfortunately when we cancel a PayPal subscription due to failed payment, it has
      // a cancellation_details.reason of 'cancellation_requested'.
      // Check if the latest invoice was marked as uncollectible; if so, we know the PayPal
      // subscription was canceled due to failed payment.
      const latestInvoiceId = subscription.latest_invoice;
      if (typeof latestInvoiceId === 'string') {
        const latestInvoice =
          await this.stripeHelper.expandResource<Stripe.Invoice>(
            latestInvoiceId,
            INVOICES_RESOURCE
          );
        voluntaryCancellation = latestInvoice.status !== 'uncollectible';
      }
    }

    return {
      country_code: countryCode,
      payment_provider: paymentProvider,
      plan_id: planId,
      product_id: productId,
      provider_event_id: eventId,
      subscription_id: subscription.id,
      uid: userId,
      voluntary_cancellation: voluntaryCancellation,
    };
  }
}

export const stripeWebhookRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const stripeWebhookHandler = new StripeWebhookHandler(
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
      method: 'POST',
      path: '/oauth/subscriptions/stripe/event',
      options: {
        ...SUBSCRIPTIONS_DOCS.OAUTH_SUBSCRIPTIONS_STRIPE_EVENT_POST,
        // We'll use the official Stripe library to authenticate the payload,
        // and it will also return an event.
        auth: false,
        // The raw payload is needed for authentication.
        payload: {
          output: 'data',
          parse: false,
          // Stripe event bodies can be pretty large, the server defaults to 1MB.
          maxBytes: config.subscriptions.stripeWebhookPayloadLimit,
        },
        validate: {
          headers: { 'stripe-signature': isA.string().required() },
        },
      },
      handler: (request: AuthRequest) =>
        stripeWebhookHandler.handleWebhookEvent(request),
    },
  ];
};
