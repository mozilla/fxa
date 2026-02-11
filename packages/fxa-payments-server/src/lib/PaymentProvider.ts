/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Customer } from '../store/types';
import { hasPaymentProvider } from './customer';

export const PaymentProviders = {
  stripe: 'stripe',
  paypal: 'paypal',
  none: 'not_chosen',
} as const;

type PaymentProvidersType = typeof PaymentProviders;
export type PaymentProvider = PaymentProvidersType[keyof PaymentProvidersType];
export type NoPaymentProvider = 'not_chosen';

type PaymentProviderKey = Exclude<PaymentProvider, NoPaymentProvider>;
type PaymentProviderKeyedDictionary<T> = {
  [key in PaymentProviderKey]: T;
};
type GetPaymentProviderMappedVal = <T>(
  c: Customer | null | undefined,
  dict: PaymentProviderKeyedDictionary<T>
) => T;

export function isStripe(provider: PaymentProvider | undefined): boolean {
  return provider === 'stripe';
}

export function isPaypal(provider: PaymentProvider | undefined): boolean {
  return provider === 'paypal';
}

export function isNotChosen(provider: PaymentProvider | undefined): boolean {
  return provider === 'not_chosen' || provider === undefined;
}

export const getPaymentProviderMappedVal: GetPaymentProviderMappedVal = (
  c,
  dict
) => {
  if (!hasPaymentProvider(c)) {
    return dict.stripe;
  }

  const k = Object.keys(PaymentProviders).find(
    (x) =>
      PaymentProviders[x as keyof PaymentProvidersType] === c!.payment_provider
  );

  if (k && PaymentProviders[k as PaymentProviderKey] in dict) {
    return dict[k as PaymentProviderKey];
  }

  return dict.stripe;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  isStripe,
  isPaypal,
  isNotChosen,
  getPaymentProviderMappedVal,
};
