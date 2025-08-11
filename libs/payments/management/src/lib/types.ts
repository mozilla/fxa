/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubplatInterval } from '@fxa/payments/customer';

export interface SubscriptionContent {
  id: string;
  cancelAtPeriodEnd: boolean;
  productName: string;
  currency: string;
  interval?: SubplatInterval;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  promotionName?: string | null;
}
