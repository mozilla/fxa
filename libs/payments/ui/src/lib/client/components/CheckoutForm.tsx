/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { checkoutCartWithStripe } from '../../actions/checkoutCartWithStripe';
import { useState } from 'react';
import { handleStripeErrorAction } from '../../actions/handleStripeError';

interface CheckoutFormProps {
  cart: {
    id: string;
    version: number;
  };
  amount: number;
  currency: string;
  successRedirectUrl: string;
}

export function CheckoutForm({ cart, successRedirectUrl }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      await handleStripeErrorAction(cart.id, cart.version, submitError);
      return;
    }

    const result = await checkoutCartWithStripe(cart.id, cart.version, '');

    const { type, clientSecret } = result as any;
    const confirmIntent =
      type === 'setup' ? stripe.confirmSetup : stripe.confirmPayment;

    // Confirm the Intent using the details collected by the Payment Element
    const { error } = await confirmIntent({
      elements,
      clientSecret,
      confirmParams: {
        return_url: successRedirectUrl,
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when confirming the Intent.
      // Show the error to your customer (for example, "payment details incomplete").
      await handleStripeErrorAction(cart.id, cart.version, error);
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <PaymentElement />
      <button
        className="flex items-center justify-center bg-blue-500 font-semibold h-12 rounded-md text-white w-full p-4 mt-6 disabled:relative disabled:after:absolute disabled:after:content-[''] disabled:after:top-0 disabled:after:left-0 disabled:after:w-full disabled:after:h-full disabled:after:bg-white disabled:after:opacity-50 disabled:after:z-[100] disabled:border-none"
        type="submit"
        disabled={!stripe || loading}
      >
        Subscribe Now
      </button>
    </form>
  );
}
