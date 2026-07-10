/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeInvoice } from '@fxa/payments/stripe';
import { STRIPE_INVOICE_METADATA } from '../types';

export const hasOpenInvoiceWithPaymentAttempts = (
  invoice: StripeInvoice
): boolean => {
  const attempts = parseInt(
    invoice.metadata?.[STRIPE_INVOICE_METADATA.RetryAttempts] ?? '0'
  );
  return invoice.status === 'open' && attempts > 0;
};
