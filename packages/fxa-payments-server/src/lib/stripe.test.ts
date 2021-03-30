/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { localeToStripeLocale } from './stripe';

// handleSubscriptionPayment and handlePaymentIntent are tested as part of SubscriptionCreate

describe('localeToStripeLocale', () => {
  it('handles known Stripe locales as expected', () => {
    expect(localeToStripeLocale('ar')).toEqual('ar');
  });
  it('handles locales with subtags as expected', () => {
    expect(localeToStripeLocale('en-GB')).toEqual('en');
  });
  it('handles empty locales as "auto"', () => {
    expect(localeToStripeLocale()).toEqual('auto');
  });
  it('handles unknown Stripe locales as "auto"', () => {
    expect(localeToStripeLocale('xx-pirate')).toEqual('auto');
  });
});
