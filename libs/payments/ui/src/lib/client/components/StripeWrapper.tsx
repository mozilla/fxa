/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';

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
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        cart={{ id: 'temp', version: 1 }}
        amount={amount}
        currency={currency}
        successRedirectUrl="http://localhost:3035/en/123done/checkout/monthly/temp/success"
      />
    </Elements>
  );
}
