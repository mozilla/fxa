/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeInvoiceFactory,
  StripeResponseFactory,
} from '@fxa/payments/stripe';
import { STRIPE_INVOICE_METADATA } from '../types';
import { hasOpenInvoiceWithPaymentAttempts } from './hasOpenInvoiceWithPaymentAttempts';

describe('hasOpenInvoiceWithPaymentAttempts', () => {
  it('returns true when an open invoice has retry attempts > 0', () => {
    const invoice = StripeResponseFactory(
      StripeInvoiceFactory({
        status: 'open',
        metadata: { [STRIPE_INVOICE_METADATA.RetryAttempts]: '2' },
      })
    );
    expect(hasOpenInvoiceWithPaymentAttempts(invoice)).toBe(true);
  });

  it('returns false when the open invoice has zero retry attempts', () => {
    const invoice = StripeResponseFactory(
      StripeInvoiceFactory({
        status: 'open',
        metadata: { [STRIPE_INVOICE_METADATA.RetryAttempts]: '0' },
      })
    );
    expect(hasOpenInvoiceWithPaymentAttempts(invoice)).toBe(false);
  });

  it('returns false when the invoice is not open even if it has retry attempts', () => {
    const invoice = StripeResponseFactory(
      StripeInvoiceFactory({
        status: 'paid',
        metadata: { [STRIPE_INVOICE_METADATA.RetryAttempts]: '3' },
      })
    );
    expect(hasOpenInvoiceWithPaymentAttempts(invoice)).toBe(false);
  });

  it('returns false when retry attempts metadata is missing', () => {
    const invoice = StripeResponseFactory(
      StripeInvoiceFactory({
        status: 'open',
        metadata: {},
      })
    );
    expect(hasOpenInvoiceWithPaymentAttempts(invoice)).toBe(false);
  });
});
