/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePaymentIntentFactory,
  StripeSetupIntentFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import { isPaymentIntent } from './isPaymentIntent';

describe('isPaymentIntent', () => {
  it('returns true for a PaymentIntent', () => {
    const paymentIntent = StripeResponseFactory(
      StripePaymentIntentFactory({ object: 'payment_intent' })
    );
    expect(isPaymentIntent(paymentIntent)).toBe(true);
  });

  it('returns false for a SetupIntent', () => {
    const setupIntent = StripeResponseFactory(
      StripeSetupIntentFactory({ object: 'setup_intent' })
    );
    expect(isPaymentIntent(setupIntent)).toBe(false);
  });
});
