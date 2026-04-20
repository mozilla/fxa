/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeCustomerFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import { STRIPE_CUSTOMER_METADATA } from '../types';
import { getCustomerPaypalAgreement } from './getCustomerPaypalAgreement';

describe('getCustomerPaypalAgreement', () => {
  it('returns the paypal agreement id when present in metadata', () => {
    const customer = StripeResponseFactory(
      StripeCustomerFactory({
        metadata: { [STRIPE_CUSTOMER_METADATA.PaypalAgreement]: 'ba_123' },
      })
    );
    expect(getCustomerPaypalAgreement(customer)).toBe('ba_123');
  });

  it('returns undefined when metadata has no paypal agreement', () => {
    const customer = StripeResponseFactory(
      StripeCustomerFactory({ metadata: {} })
    );
    expect(getCustomerPaypalAgreement(customer)).toBeUndefined();
  });
});
