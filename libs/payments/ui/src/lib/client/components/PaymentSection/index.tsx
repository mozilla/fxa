/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { useEffect } from 'react';
import Stripe from 'stripe';
import { CheckoutForm } from '../CheckoutForm';
import { StripeWrapper } from '../StripeWrapper';
import { SAW_TRIAL_OFFER_COOKIE_PREFIX } from '../../../constants';
import {
  PayPalScriptProvider,
  ReactPayPalScriptOptions,
} from '@paypal/react-paypal-js';

const SAW_TRIAL_OFFER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

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
    offeringConfigId: string;
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
      walletType?: string;
    };
    hasActiveSubscriptions: boolean;
    freeTrialOffer?: {
      trialLengthDays: number;
    } | null;
    freeTrialUserEligible?: boolean;
  };
  locale: string;
  nonce?: string;
  paypalClientId: string;
  sessionUid?: string;
  sessionEmail?: string;
  sawTrialOffer?: boolean;
  metricsEnabled?: boolean;
  isCancelInterstitialOffer?: boolean;
}

export function PaymentSection({
  cmsCommonContent,
  paymentsInfo,
  cart,
  locale,
  nonce,
  paypalClientId,
  sessionUid,
  sessionEmail,
  sawTrialOffer,
  metricsEnabled,
  isCancelInterstitialOffer,
}: PaymentFormProps) {
  const isFreeTrial =
    !!cart.freeTrialOffer && (!sessionUid || !!cart.freeTrialUserEligible);
  const trialLengthDays = cart.freeTrialOffer?.trialLengthDays;
  const showTrialIneligibleNotice =
    !!cart.freeTrialOffer &&
    !!sessionUid &&
    !cart.freeTrialUserEligible &&
    !!sawTrialOffer;

  useEffect(() => {
    if (isFreeTrial) {
      document.cookie = `${SAW_TRIAL_OFFER_COOKIE_PREFIX}${cart.offeringConfigId}=1; path=/; max-age=${SAW_TRIAL_OFFER_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }, [isFreeTrial, cart.offeringConfigId]);

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
          sessionEmail={sessionEmail}
          isFreeTrial={isFreeTrial}
          trialLengthDays={trialLengthDays}
          showTrialIneligibleNotice={showTrialIneligibleNotice}
          metricsEnabled={metricsEnabled}
          isCancelInterstitialOffer={isCancelInterstitialOffer}
        />
      </StripeWrapper>
    </PayPalScriptProvider>
  );
}
