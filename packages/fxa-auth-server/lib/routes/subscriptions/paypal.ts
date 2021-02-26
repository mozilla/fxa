/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { reportSentryError } from 'fxa-auth-server/lib/sentry';
import { msToSec } from 'fxa-auth-server/lib/time';
import { createPayPalBA } from 'fxa-shared/db/models/auth';
import {
  filterCustomer,
  filterSubscription,
} from 'fxa-shared/subscriptions/stripe';
import { Stripe } from 'stripe';
import Container from 'typedi';

import { ConfigType } from '../../../config';
import error from '../../error';
import { PayPalHelper } from '../../payments/paypal';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import validators from '../validators';
import { StripeHandler } from './stripe';
import { handleAuth } from './utils';

export class PayPalHandler extends StripeHandler {
  protected paypalHelper: PayPalHelper;

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
    this.paypalHelper = Container.get(PayPalHelper);
  }

  /**
   * Get PayPal Checkout Token.
   */
  async getCheckoutToken(request: AuthRequest) {
    this.log.begin('subscriptions.getCheckoutToken', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'getCheckoutToken');

    const { currencyCode } = request.payload as Record<string, string>;
    const token = await this.paypalHelper.getCheckoutToken({ currencyCode });
    const responseObject = { token };
    this.log.info('subscriptions.getCheckoutToken.success', responseObject);
    return responseObject;
  }

  /**
   * Create a subscription for a user with an authorized PayPal Token.
   */
  async createSubscriptionWithPaypal(request: AuthRequest) {
    this.log.begin('subscriptions.createSubscriptionWithPaypal', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'createSubscriptionWithPaypal');

    let customer = await this.stripeHelper.customer({
      uid,
      email,
    });

    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    const { priceId, token, idempotencyKey } = request.payload as Record<
      string,
      string
    >;

    const currency = (await this.stripeHelper.findPlanById(priceId)).currency;
    const {
      agreementId,
      agreementDetails,
    } = await this.createAndVerifyBillingAgreement({ uid, token, currency });

    let subscription;
    [subscription, customer] = await Promise.all([
      this.stripeHelper.createSubscriptionWithPaypal({
        customer,
        priceId,
        subIdempotencyKey: idempotencyKey,
      }),
      this.stripeHelper.updateCustomerPaypalAgreement(customer, agreementId),
    ]);

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    if (latestInvoice.amount_due === 0) {
      await this.paypalHelper.processZeroInvoice(latestInvoice);
    } else {
      await this.paypalHelper.processInvoice({
        customer,
        invoice: latestInvoice,
      });
    }

    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.createSubscriptionWithPaypal.success', {
      uid,
      subscriptionId: subscription.id,
    });

    return {
      sourceCountry: agreementDetails.countryCode,
      subscription: filterSubscription(subscription),
    };
  }

  /**
   * Updates the billing agreement for a user with a new PayPal token.
   *
   * Updates are not allowed if there's:
   *  - No paypal sourced subscriptions active/past_due
   *  - An existing billing agreement on file.
   *
   * If there's open invoices, attempts to pay them will be made in
   * the background.
   */
  async updatePaypalBillingAgreement(request: AuthRequest) {
    this.log.begin('subscriptions.updatePaypalBillingAgreement', request);
    const { uid, email } = await handleAuth(this.db, request.auth, true);
    await this.customs.check(request, email, 'updatePaypalBillingAgreement');

    let customer = await this.stripeHelper.customer({
      uid,
      email,
    });

    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    if (this.stripeHelper.getCustomerPaypalAgreement(customer)) {
      throw error.billingAgreementExists(customer.id);
    }

    const paypalSubscription = customer.subscriptions?.data.find(
      (sub) =>
        ['active', 'past_due'].includes(sub.status) &&
        sub.collection_method === 'send_invoice'
    );
    if (!paypalSubscription || !customer.currency) {
      throw error.internalValidationError('updatePaypalBillingAgreement', {
        customerId: customer.id,
        message: 'User is missing paypal subscriptions or currency value.',
        uid,
      });
    }

    const { token } = request.payload as Record<string, string>;
    const { agreementId } = await this.createAndVerifyBillingAgreement({
      uid,
      token,
      currency: customer.currency,
    });

    await this.stripeHelper.updateCustomerPaypalAgreement(
      customer,
      agreementId
    );

    const nowSeconds = msToSec(Date.now());
    const invoices = await this.stripeHelper
      .fetchOpenInvoices(nowSeconds, customer.id)
      .autoPagingToArray({ limit: 10 });
    if (invoices.length) {
      for (const invoice of invoices) {
        this.processInvoiceInBackground(request, customer, invoice);
      }
    }
    await this.customerChanged(request, uid, email);

    this.log.info('subscriptions.updatePaypalBillingAgreement.success', {
      uid,
    });
    return filterCustomer(customer);
  }

  /**
   * Processes an invoice in the background with proper sentry reporting
   * of the originating request that triggered it.
   */
  private async processInvoiceInBackground(
    request: AuthRequest,
    customer: Stripe.Customer,
    invoice: Stripe.Invoice
  ) {
    try {
      if (invoice.amount_due === 0) {
        await this.paypalHelper.processZeroInvoice(invoice);
      } else {
        await this.paypalHelper.processInvoice({ customer, invoice });
      }
    } catch (err) {
      reportSentryError(err, request);
    }
  }

  /**
   * Create and verify a billing agreement is funded from the appropriate
   * country given the currency of the billing agreement.
   */
  private async createAndVerifyBillingAgreement(options: {
    uid: string;
    token: string;
    currency: string;
  }) {
    const { uid, token, currency } = options;
    // Create PayPal billing agreement
    const agreementId = await this.paypalHelper.createBillingAgreement({
      token,
    });

    const agreementDetails = await this.paypalHelper.agreementDetails({
      billingAgreementId: agreementId,
    });

    // Verify sourceCountry and plan currency are a valid combination.
    const country = agreementDetails.countryCode;
    if (
      !this.paypalHelper.currencyHelper.isCurrencyCompatibleWithCountry(
        currency,
        country
      )
    ) {
      throw error.currencyCountryMismatch(currency, country);
    }

    // Track the billing agreement id in database
    try {
      await createPayPalBA(uid, agreementId, 'active');
    } catch (err) {
      // TODO: Ignore error here if this is a repeat call for a duplicate row.
      this.log.info('Error creating BA, repeat?', { err });
    }

    return { agreementId, agreementDetails };
  }
}

export const paypalRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
): ServerRoute[] => {
  const paypalHandler = new PayPalHandler(
    log,
    db,
    config,
    customs,
    push,
    mailer,
    profile,
    stripeHelper
  );

  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/paypal-checkout',
      options: {
        auth: {
          payload: false,
          strategy: 'oauthToken',
        },
        response: {
          schema: isA.object({
            token: isA.string().required(),
          }),
        },
        validate: {
          payload: {
            currencyCode: isA.string().uppercase().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        paypalHandler.getCheckoutToken(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/active/new-paypal',
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
            token: validators.paypalPaymentToken.required(),
            idempotencyKey: isA.string().required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        paypalHandler.createSubscriptionWithPaypal(request),
    },
    {
      method: 'POST',
      path: '/oauth/subscriptions/paymentmethod/billing-agreement',
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
            token: validators.paypalPaymentToken.required(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        paypalHandler.updatePaypalBillingAgreement(request),
    },
  ];
};
