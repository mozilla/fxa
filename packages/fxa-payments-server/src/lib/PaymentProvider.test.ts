/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Customer } from '../store/types';
import {
  isStripe,
  isPaypal,
  isNotChosen,
  getPaymentProviderMappedVal,
  PaymentProvider,
} from './PaymentProvider';

describe('isStripe', () => {
  it('returns false when payment provider is not "stripe"', () => {
    expect(isStripe(undefined)).toBe(false);
    expect(isStripe('Stripe' as PaymentProvider)).toBe(false);
    expect(isStripe('STRIPE' as PaymentProvider)).toBe(false);
    expect(isStripe('paypal')).toBe(false);
  });

  it('returns true when the payment provider is "stripe"', () => {
    expect(isStripe('stripe')).toBe(true);
  });
});

describe('isPayPal', () => {
  it('returns false when payment provider is not "paypal"', () => {
    expect(isPaypal(undefined)).toBe(false);
    expect(isPaypal('PayPal' as PaymentProvider)).toBe(false);
    expect(isPaypal('PAYPAL' as PaymentProvider)).toBe(false);
    expect(isPaypal('stripe')).toBe(false);
  });

  it('returns true when the payment provider is "paypal"', () => {
    expect(isPaypal('paypal')).toBe(true);
  });
});

describe('isNotChosen', () => {
  it('returns false when payment provider is defined and not "not_chosen"', () => {
    expect(isNotChosen('the chosen one' as PaymentProvider)).toBe(false);
    expect(isNotChosen('NOT_CHOSEN' as PaymentProvider)).toBe(false);
    expect(isNotChosen('stripe')).toBe(false);
  });

  it('returns true when the payment provider is "not_chosen" or undefined', () => {
    expect(isNotChosen(undefined)).toBe(true);
    expect(isNotChosen('not_chosen')).toBe(true);
  });
});

describe('getPaymentProviderMappedVal', () => {
  const vals = {
    stripe: 'wibble',
    paypal: 'quux',
  };

  it('returns the stripe value when there is no payment provider', () => {
    const actual = getPaymentProviderMappedVal(
      ({} as unknown) as Customer,
      vals
    );
    expect(actual).toBe(vals.stripe);
  });

  it('returns the stripe value by default the payment provider is not a valid provider', () => {
    const actual = getPaymentProviderMappedVal(
      ({ payment_provider: 'localbank' } as unknown) as Customer,
      vals
    );
    expect(actual).toBe(vals.stripe);
  });

  it('returns the correct value based on the payment provider', () => {
    const actual = getPaymentProviderMappedVal(
      ({ payment_provider: 'paypal' } as unknown) as Customer,
      vals
    );
    expect(actual).toBe(vals.paypal);
  });
});
