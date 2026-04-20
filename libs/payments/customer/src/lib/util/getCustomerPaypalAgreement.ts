/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeCustomer } from '@fxa/payments/stripe';
import { STRIPE_CUSTOMER_METADATA } from '../types';

export const getCustomerPaypalAgreement = (
  customer: StripeCustomer
): string | undefined =>
  customer.metadata?.[STRIPE_CUSTOMER_METADATA.PaypalAgreement];
