/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';
import { useContext, useState } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';

interface StripeWrapperProps {
  readOnly: boolean;
  amount: number;
  currency: string;
  cart: {
    id: string;
    version: number;
    email: string | null;
  };
}

export function StripeWrapper({
  readOnly,
  amount,
  currency,
  cart,
}: StripeWrapperProps) {
  const config = useContext(ConfigContext);
  const [stripePromise] = useState(() => loadStripe(config.stripePublicApiKey));

  const options: StripeElementsOptions = {
    mode: 'subscription',
    amount,
    currency,
    paymentMethodCreation: 'manual',
    externalPaymentMethodTypes: ['external_paypal'],
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
      <CheckoutForm readOnly={readOnly} cart={cart} />
    </Elements>
  );
}
