/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import Stripe from 'stripe';
import { Elements } from '@stripe/react-stripe-js';
import {
  loadStripe,
  StripeElementLocale,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { useContext, useState } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';
import { STRIPE_MINIMUM_CHARGE_AMOUNTS } from '../../../../../stripe/src/lib/stripe.constants';

const stripeElementLocales = [
  'auto',
  'ar',
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'en-AU',
  'en-CA',
  'en-NZ',
  'en-GB',
  'es',
  'es-ES',
  'es-419',
  'et',
  'fi',
  'fil',
  'fr',
  'fr-CA',
  'fr-FR',
  'he',
  'hu',
  'hr',
  'id',
  'it',
  'it-IT',
  'ja',
  'ko',
  'lt',
  'lv',
  'ms',
  'mt',
  'nb',
  'nl',
  'no',
  'pl',
  'pt',
  'pt-BR',
  'ro',
  'ru',
  'sk',
  'sl',
  'sv',
  'th',
  'tr',
  'vi',
  'zh',
  'zh-HK',
  'zh-TW',
];

const sharedOptions = {
  appearance: {
    variables: {
      fontFamily:
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontSizeBase: '16px',
      fontSizeSm: '16px',
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
  paymentMethodCreation: 'manual',
} satisfies StripeElementsOptions;

function isStripeElementLocale(locale: string): locale is StripeElementLocale {
  return stripeElementLocales.includes(locale as StripeElementLocale);
}

interface StripeWrapperProps {
  amount: number;
  currency: string;
  cart: {
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
    hasActiveSubscriptions?: boolean;
    trialDays?: number;
  };
  children: React.ReactNode;
  locale: string;
}

export function StripeWrapper({
  amount,
  currency,
  cart,
  locale,
  children,
}: StripeWrapperProps) {
  const config = useContext(ConfigContext);
  const [stripePromise] = useState(() => loadStripe(config.stripePublicApiKey));

  const normalizedCurrency = currency.toLowerCase();
  const minCharge = STRIPE_MINIMUM_CHARGE_AMOUNTS[normalizedCurrency];
  const isBelowMin = amount < minCharge;

  const isTrial = cart.trialDays && cart.trialDays > 0;

  const options: StripeElementsOptions = {
    ...sharedOptions,
    mode: isBelowMin || isTrial ? 'setup' : 'subscription',
    locale: isStripeElementLocale(locale) ? locale : 'auto',
    amount: isBelowMin || isTrial ? undefined : amount,
    currency: normalizedCurrency,
    ...(isTrial && { setupFutureUsage: 'off_session' }),
    externalPaymentMethodTypes: ['external_paypal'],
    customerSessionClientSecret: cart.paymentInfo?.customerSessionClientSecret,
  };

  // Remove external_paypal if the customer has an active subscription
  // paid with non-external_paypal payment method
  if (
    cart.paymentInfo?.type !== 'external_paypal' &&
    cart.paymentInfo?.customerSessionClientSecret &&
    cart.hasActiveSubscriptions
  ) {
    delete options.externalPaymentMethodTypes;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

interface StripeManagementWrapperProps {
  locale: string;
  currency: string;
  sessionSecret: string;
  children: React.ReactNode;
  instanceKey: string;
}

export function StripeManagementWrapper({
  locale,
  currency,
  sessionSecret,
  children,
  instanceKey,
}: StripeManagementWrapperProps) {
  const config = useContext(ConfigContext);
  const [stripePromise] = useState(() => loadStripe(config.stripePublicApiKey));

  const options: StripeElementsOptions = {
    ...sharedOptions,
    mode: 'setup',
    locale: isStripeElementLocale(locale) ? locale : 'auto',
    currency: currency.toLowerCase(),
    customerSessionClientSecret: sessionSecret,
    setupFutureUsage: 'off_session',
  };

  return (
    <Elements stripe={stripePromise} options={options} key={instanceKey}>
      {children}
    </Elements>
  );
}
