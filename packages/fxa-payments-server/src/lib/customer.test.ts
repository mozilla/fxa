/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Customer } from '../store/types';
import {
  hasPaymentProvider,
  hasSubscriptions,
  isExistingCustomer,
  isExistingPaypalCustomer,
  isExistingStripeCustomer,
  needsCustomer,
} from './customer';
import { IAP_CUSTOMER } from './mock-data';
import { MOCK_CUSTOMER } from './test-utils';

describe('hasSubscriptions', () => {
  it('returns false when the customer does not have a list of subscriptions', () => {
    const actual = hasSubscriptions({ id: 'cus_123' } as unknown as Customer);
    expect(actual).toBe(false);
  });

  it('returns false when the list of subscriptions is empty', () => {
    const actual = hasSubscriptions({
      ...MOCK_CUSTOMER,
      subscriptions: [],
    } as Customer);
    expect(actual).toBe(false);
  });

  it('returns true when there are subscriptions', () => {
    const actual = hasSubscriptions(MOCK_CUSTOMER as Customer);
    expect(actual).toBe(true);
  });
});

describe('hasPaymentProvider', () => {
  it('returns false when the customer is null undefined', () => {
    expect(hasPaymentProvider(null)).toBe(false);
    expect(hasPaymentProvider(undefined)).toBe(false);
  });

  it('returns false when the payment provider property is undefined', () => {
    const actual = hasPaymentProvider({
      ...MOCK_CUSTOMER,
      payment_provider: undefined,
    });
    expect(actual).toBe(false);
  });

  it('returns false when the payment provider is not chosen', () => {
    const actual = hasPaymentProvider({
      ...MOCK_CUSTOMER,
      payment_provider: 'not_chosen',
    });
    expect(actual).toBe(false);
  });

  it('returns true when the payment provider is a valid one', () => {
    const actual = hasPaymentProvider({
      ...MOCK_CUSTOMER,
      payment_provider: 'paypal',
    });
    expect(actual).toBe(true);
  });
});

describe('isExistingCustomer', () => {
  it('returns false when the customer is null or undefined', () => {
    expect(isExistingCustomer(null)).toBe(false);
    expect(isExistingCustomer(undefined)).toBe(false);
  });

  it('returns false for a customer with no subscriptions', () => {
    const actual = isExistingCustomer({
      ...MOCK_CUSTOMER,
      subscriptions: [],
    } as Customer);
    expect(actual).toBe(false);
  });

  it('returns false for a customer with no payment provider', () => {
    const actual = isExistingCustomer({
      ...MOCK_CUSTOMER,
      payment_provider: 'not_chosen',
    } as Customer);
    expect(actual).toBe(false);
  });

  it('returns true for a customer with subscriptions and a payment provider', () => {
    const actual = isExistingCustomer(MOCK_CUSTOMER as Customer);
    expect(actual).toBe(true);
  });
});

describe('isExistingPaypalCustomer', () => {
  it('returns false when the customer is null', () => {
    expect(isExistingPaypalCustomer(null)).toBe(false);
  });

  it('returns false for a customer with no subscriptions', () => {
    const actual = isExistingPaypalCustomer({
      ...MOCK_CUSTOMER,
      subscriptions: [],
    } as Customer);
    expect(actual).toBe(false);
  });

  it('returns false when the payment provider is not paypal', () => {
    const actual = isExistingPaypalCustomer({
      ...MOCK_CUSTOMER,
      payment_provider: 'stripe',
    });
    expect(actual).toBe(false);
  });

  it('returns true when the payment provider is paypal', () => {
    const actual = isExistingPaypalCustomer({
      ...MOCK_CUSTOMER,
      payment_provider: 'paypal',
    });
    expect(actual).toBe(true);
  });
});

describe('isExistingStripeCustomer', () => {
  it('returns false when the customer is null or undefined', () => {
    expect(isExistingStripeCustomer(null)).toBe(false);
    expect(isExistingStripeCustomer(undefined)).toBe(false);
  });

  it('returns false for a customer with no subscriptions', () => {
    const actual = isExistingStripeCustomer({
      ...MOCK_CUSTOMER,
      subscriptions: [],
    } as Customer);
    expect(actual).toBe(false);
  });

  it('returns false when the payment provider is not stripe', () => {
    const actual = isExistingStripeCustomer({
      ...MOCK_CUSTOMER,
      payment_provider: 'paypal',
    });
    expect(actual).toBe(false);
  });

  it('returns true when the payment provider is stripe', () => {
    const actual = isExistingStripeCustomer({
      ...MOCK_CUSTOMER,
      payment_provider: 'stripe',
    });
    expect(actual).toBe(true);
  });
});

describe('needsCustomer', () => {
  it('return true when customer is empty', () => {
    const actual = needsCustomer(null);
    expect(actual).toBe(true);
  });
  it('return true when does not have payment_provider set', () => {
    const actual = needsCustomer(IAP_CUSTOMER);
    expect(actual).toBe(true);
  });
  it('return false when payment_provider is set', () => {
    const actual = needsCustomer(MOCK_CUSTOMER);
    expect(actual).toBe(false);
  });
});
