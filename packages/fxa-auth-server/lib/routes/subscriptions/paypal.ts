/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { createPayPalBA } from 'fxa-shared/db/models/auth';
import { filterSubscription } from 'fxa-shared/subscriptions/stripe';
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
   *
   * @param request
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
    // Create PayPal billing agreement
    const agreementId = await this.paypalHelper.createBillingAgreement({
      token,
    });

    // TODO: Check user source country is in an allowed list of source countries
    //       based on the PayPal Billing Agreement details.
    const agreementDetails = await this.paypalHelper.agreementDetails({
      billingAgreementId: agreementId,
    });

    // Track the billing agreement id in database
    try {
      await createPayPalBA(uid, agreementId, 'active');
    } catch (err) {
      // TODO: Ignore error here if this is a repeat call for a duplicate row.
      this.log.info('Error creating BA, repeat?', { err });
    }

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
            currencyCode: isA.string().required(),
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
  ];
};
