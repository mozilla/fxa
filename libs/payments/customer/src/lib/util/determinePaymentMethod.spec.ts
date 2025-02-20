/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeCustomerFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { determinePaymentMethodType } from './determinePaymentMethodType';

describe('determinePaymentMethodType', () => {
  it('returns stripe', () => {
    const mockCustomer = StripeCustomerFactory();
    expect(determinePaymentMethodType(mockCustomer)).toEqual({
      type: 'stripe',
      paymentMethodId: expect.any(String),
    });
  });

  it('returns external_paypal', () => {
    const mockSubscription = StripeSubscriptionFactory({
      collection_method: 'send_invoice',
    });
    expect(determinePaymentMethodType(undefined, [mockSubscription])).toEqual({
      type: 'external_paypal',
    });
  });

  it('returns null', () => {
    expect(determinePaymentMethodType(undefined, undefined));
  });
});
