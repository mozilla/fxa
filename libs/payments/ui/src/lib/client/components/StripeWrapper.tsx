/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized } from '@fluent/react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

interface StripeWrapperProps {
  amount: number;
  currency: string;
}

export function StripeWrapper({ amount, currency }: StripeWrapperProps) {
  // TODO - Load from config
  const stripePromise = loadStripe(
    'pk_test_VNpCidC0a2TJJB3wqXq7drhN00sF8r9mhs'
  );

  const options: StripeElementsOptions = {
    mode: 'subscription',
    amount,
    currency,
    paymentMethodCreation: 'manual',
  };

  return (
    <>
      <Localized id="pay-with-heading-card-only"></Localized>
      <Elements stripe={stripePromise} options={options}>
        Hello there from Stripe
      </Elements>
    </>
  );
}
