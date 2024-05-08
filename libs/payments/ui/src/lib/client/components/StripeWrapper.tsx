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
  cart: {
    id: string;
    version: number;
    email: string | null;
  };
}

export function StripeWrapper({ amount, currency, cart }: StripeWrapperProps) {
  // TODO - Load from config
  const stripePromise = loadStripe(
    'pk_test_VNpCidC0a2TJJB3wqXq7drhN00sF8r9mhs'
  );

  const options: StripeElementsOptions = {
    mode: 'subscription',
    amount,
    currency,
    paymentMethodCreation: 'manual',
    appearance: {
      variables: {
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        fontSizeBase: '16px',
        fontWeightNormal: '500',
        colorDanger: '#D70022',
      },
      rules: {
        '.Tab': {
          borderColor: 'rgba(0,0,0,0.3)',
        },
        '.Input': {
          borderColor: 'rgba(0,0,0,0.3)',
        },
        '.Input::placeholder': {
          color: '#5E5E72', // Matches grey-500 of tailwind.config.js
          fontWeight: '400',
        },
        '.Label': {
          color: '#6D6D6E', // Matches grey-400 of tailwind.config.js
          fontWeight: '500',
          lineHeight: '1.15',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm cart={cart} />
    </Elements>
  );
}
