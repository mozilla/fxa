/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { STRIPE_CUSTOMER_METADATA } from '@fxa/payments/customer';
import {
  StripeCardPaymentMethodFactory,
  StripeCustomerFactory,
  StripeResponseFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';

import {
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
  buildBillingDetails,
} from './buildBillingDetails';

describe('buildBillingDetails', () => {
  it('populates card fields from the default payment method', () => {
    const paymentMethod = StripeResponseFactory(
      StripeCardPaymentMethodFactory({
        billing_details: {
          address: {
            city: null,
            country: null,
            line1: null,
            line2: null,
            postal_code: null,
            state: null,
          },
          email: null,
          name: 'Jane Doe',
          phone: null,
        },
      })
    );
    const customer = StripeResponseFactory(StripeCustomerFactory());
    const sub = StripeSubscriptionFactory({
      collection_method: 'charge_automatically',
    });

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [sub],
      paymentProvider: 'stripe',
      defaultPaymentMethod: paymentMethod,
      hasOpenInvoiceWithRetry: false,
    });

    expect(result).toMatchObject({
      payment_provider: 'stripe',
      billing_name: 'Jane Doe',
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      exp_month: paymentMethod.card?.exp_month,
      exp_year: paymentMethod.card?.exp_year,
      payment_type: paymentMethod.card?.funding,
    });
    expect(result.paypal_payment_error).toBeUndefined();
  });

  it('omits payment_provider when undefined', () => {
    const customer = StripeResponseFactory(StripeCustomerFactory());

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [],
      paymentProvider: undefined,
      defaultPaymentMethod: undefined,
      hasOpenInvoiceWithRetry: false,
    });

    expect(result.payment_provider).toBeUndefined();
  });

  it('omits card fields when there is no default payment method', () => {
    const customer = StripeResponseFactory(StripeCustomerFactory());
    const sub = StripeSubscriptionFactory({
      collection_method: 'charge_automatically',
    });

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [sub],
      paymentProvider: 'stripe',
      defaultPaymentMethod: undefined,
      hasOpenInvoiceWithRetry: false,
    });

    expect(result.payment_provider).toBe('stripe');
    expect(result.last4).toBeUndefined();
    expect(result.billing_name).toBeUndefined();
  });

  it('returns paypal_payment_error=missing_agreement for paypal subs without an agreement', () => {
    const customer = StripeResponseFactory(
      StripeCustomerFactory({ metadata: {} })
    );
    const sub = StripeSubscriptionFactory({
      collection_method: 'send_invoice',
      cancel_at_period_end: false,
    });

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [sub],
      paymentProvider: 'paypal',
      defaultPaymentMethod: undefined,
      hasOpenInvoiceWithRetry: false,
    });

    expect(result.payment_provider).toBe('paypal');
    expect(result.paypal_payment_error).toBe(
      PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT
    );
  });

  it('returns paypal_payment_error=funding_source when paypal has agreement and an open invoice has retry attempts', () => {
    const customer = StripeResponseFactory(
      StripeCustomerFactory({
        metadata: { [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'ba_123' },
      })
    );
    const sub = StripeSubscriptionFactory({
      collection_method: 'send_invoice',
      cancel_at_period_end: false,
    });

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [sub],
      paymentProvider: 'paypal',
      defaultPaymentMethod: undefined,
      hasOpenInvoiceWithRetry: true,
    });

    expect(result.payment_provider).toBe('paypal');
    expect(result.paypal_payment_error).toBe(
      PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE
    );
  });

  it('does not set paypal_payment_error when the paypal sub is cancelling at period end', () => {
    const customer = StripeResponseFactory(
      StripeCustomerFactory({ metadata: {} })
    );
    const sub = StripeSubscriptionFactory({
      collection_method: 'send_invoice',
      cancel_at_period_end: true,
    });

    const result = buildBillingDetails({
      customer,
      activeSubscriptions: [sub],
      paymentProvider: 'paypal',
      defaultPaymentMethod: undefined,
      hasOpenInvoiceWithRetry: false,
    });

    expect(result.payment_provider).toBe('paypal');
    expect(result.paypal_payment_error).toBeUndefined();
  });
});
