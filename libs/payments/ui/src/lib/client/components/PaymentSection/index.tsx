/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import Stripe from 'stripe';
import { CheckoutForm } from '../CheckoutForm';
import { StripeWrapper } from '../StripeWrapper';
import {
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js';

const paypalInitialOptions: ReactPayPalScriptOptions = {
  clientId: '',
  vault: true,
  commit: false,
  intent: 'capture',
  disableFunding: ['credit', 'card'],
};

interface PaymentFormProps {
  cmsCommonContent: {
    termsOfServiceUrl: string;
    privacyNoticeUrl: string;
  };
  paymentsInfo: {
    amount: number;
    currency: string;
  };
  cart: {
    id: string;
    version: number;
    uid?: string | null;
    errorReasonId: string | null;
    couponCode: string | null;
    currency: string;
    taxAddress: {
      countryCode: string;
      postalCode: string;
    };
    paymentInfo?: {
      type:
        | Stripe.PaymentMethod.Type
        | 'google_iap'
        | 'apple_iap'
        | 'external_paypal';
      last4?: string;
      brand?: string;
      customerSessionClientSecret?: string;
    };
    hasActiveSubscriptions: boolean;
  };
  locale: string;
  nonce?: string;
  paypalClientId: string;
  sessionUid?: string;
}

export function PaymentSection({
  cmsCommonContent,
  paymentsInfo,
  cart,
  locale,
  nonce,
  paypalClientId,
  sessionUid,
}: PaymentFormProps) {
  return (
    <PayPalScriptProvider
      options={{
        ...paypalInitialOptions,
        clientId: paypalClientId,
        dataCspNonce: nonce,
      }}
    >
      <StripeWrapper
        amount={paymentsInfo.amount}
        currency={paymentsInfo.currency}
        cart={cart}
        locale={locale}
      >
        <CheckoutForm
          cmsCommonContent={cmsCommonContent}
          cart={cart}
          locale={locale}
          sessionUid={sessionUid}
        />
      </StripeWrapper>
    </PayPalScriptProvider>
  );
}
