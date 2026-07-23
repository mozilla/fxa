/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeUpcomingInvoice } from '../stripe.client.types';
import { StripeInvoiceFactory } from './invoice.factory';

export const StripeUpcomingInvoiceFactory = (
  override?: Partial<StripeUpcomingInvoice>
): StripeUpcomingInvoice => StripeInvoiceFactory(override);
