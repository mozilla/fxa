/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import * as Sentry from '@sentry/node';
import { Stripe } from 'stripe';
import Container from 'typedi';

import { ConfigType } from '../../../config';
import error from '../../error';
import { PayPalHelper } from '../../payments/paypal';
import { StripeHelper, SUBSCRIPTION_UPDATE_TYPES } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import { StripeHandler } from './stripe';

const IGNORABLE_STRIPE_WEBHOOK_ERRNOS = [
  error.ERRNO.UNKNOWN_SUBSCRIPTION_FOR_SOURCE,
  error.ERRNO.BOUNCE_HARD,
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

      switch (event.type as Stripe.WebhookEndpointUpdateParams.EnabledEvent) {
        case 'credit_note.created':
          if (this.paypalHelper) {
            await this.handleCreditNoteEvent(request, event);
          }
          break;
        case 'customer.created':
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
        case 'invoice.created':
          if (this.paypalHelper) {
            await this.handleInvoiceCreatedEvent(request, event);
          }
          break;
        case 'invoice.finalized':
          if (this.paypalHelper) {
            await this.handleInvoiceOpenEvent(request, event);
          }
          break;
        case 'invoice.paid':
          await this.handleInvoicePaidEvent(request, event);
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

    // This invoice must be for a paypal subscription for us to issue a
    // paypal refund and be marked for out_of_band refund.
    if (
      invoice.collection_method !== 'send_invoice' ||
      !creditNote.out_of_band_amount ||
      creditNote.out_of_band_amount === 0
    ) {
      return;
    }

    // We can't issue a refund if there's no paypal transaction to refund.
    const transactionId = this.stripeHelper.getInvoicePaypalTransactionId(
      invoice
    );
    if (!transactionId) {
      this.log.error('handleCreditNoteEvent', {
        invoiceId: invoice.id,
        message:
          'Credit note issued on invoice without a PayPal transaction id.',
      });
      return;
    }

    const customer = await this.stripeHelper.expandResource(
      invoice.customer,
      'customers'
    );
    if (customer.deleted) {
      return;
    }

    // If the amount doesn't match the invoice we can't reverse it.
    if (creditNote.out_of_band_amount !== invoice.amount_due) {
      this.log.error('handleCreditNoteEvent', {
        invoiceId: invoice.id,
        message: 'Credit note does not match invoice amount.',
      });
      return;
    }
    await this.paypalHelper.issueRefund(invoice, transactionId);
    return;
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
    await this.updateCustomerAndSendStatus(
      request,
      event,
      sub,
      false,
      uid,
      email
    );
    if (this.paypalHelper) {
      const customer = await this.stripeHelper.customer({ uid, email });
      if (!customer || customer.deleted) {
        return;
      }
      return this.paypalHelper.conditionallyRemoveBillingAgreement(customer);
    }
    return;
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
    if (!(await this.stripeHelper.invoicePayableWithPaypal(invoice))) {
      return;
    }
    return this.stripeHelper.finalizeInvoice(invoice);
  }

  /**
   * Handle `invoice.open` events, if the subscription invoice is for a PayPal
   * customer, charge them if needed.
   */
  async handleInvoiceOpenEvent(request: AuthRequest, event: Stripe.Event) {
    // Type-guard to require paypalHelper.
    if (!this.paypalHelper) {
      return;
    }
    const invoice = event.data.object as Stripe.Invoice;
    if (!(await this.stripeHelper.invoicePayableWithPaypal(invoice))) {
      return;
    }
    if (invoice.amount_due === 0) {
      return this.paypalHelper.processZeroInvoice(invoice);
    }
    const customer = await this.stripeHelper.expandResource(
      invoice.customer,
      'customers'
    );
    if (customer.deleted) {
      return;
    }
    return this.paypalHelper.processInvoice({ customer, invoice });
  }

  /**
   * Handle `invoice.paid` Stripe wehbook events.
   */
  async handleInvoicePaidEvent(request: AuthRequest, event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const { uid, email } = await this.sendSubscriptionInvoiceEmail(invoice);
    await this.updateCustomer(uid, email);
  }

  /**
   * Handle `invoice.paid` Stripe wehbook events.
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
        stripeWebhookHandler.handleWebhookEvent(request),
    },
  ];
};
