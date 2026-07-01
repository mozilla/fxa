/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Stripe from 'stripe';
import {
  StripeTestCards,
  StripeTestCard,
  TestCardDefaults,
} from './stripe-test-cards';

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_API_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_API_KEY environment variable is required for subscription helpers'
    );
  }
  return new Stripe(key, {
    // Pinned independently of STRIPE_API_VERSION (@fxa/payments/stripe) so the
    // functional-test helpers don't pull in the payments app graph. Keep in sync
    // with that constant on a Stripe upgrade.
    apiVersion: '2026-06-24.dahlia',
  });
}

/**
 * Create a Stripe customer in test mode.
 */
export async function createStripeTestCustomer(
  email: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  return stripe.customers.create({ email });
}

/**
 * Attach a test card payment method to a customer.
 */
export async function attachPaymentMethod(
  customerId: string,
  card: StripeTestCard = StripeTestCards.SUCCESS
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient();
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: card,
      exp_month: TestCardDefaults.EXP_MONTH,
      exp_year: TestCardDefaults.EXP_YEAR,
      cvc: TestCardDefaults.CVC,
    },
  });
  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: customerId,
  });
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });
  return paymentMethod;
}

/**
 * Create a subscription via the Stripe API — for manage/cancel tests.
 */
export async function createTestSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  });
}

/**
 * Cancel all subscriptions and delete a customer — for teardown.
 */
export async function cleanupStripeCustomer(customerId: string): Promise<void> {
  const stripe = getStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });
  for (const sub of subscriptions.data) {
    await stripe.subscriptions.cancel(sub.id);
  }
  await stripe.customers.del(customerId);
}
