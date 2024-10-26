/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum BillingAgreementStatus {
  Active = 'active',
  Cancelled = 'cancelled',
}

export interface BillingAgreement {
  city: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  state: string;
  status: BillingAgreementStatus;
  street: string;
  street2: string;
  zip: string;
}

export interface ChargeOptions {
  amountInCents: number;
  billingAgreementId: string;
  currencyCode: string;
  idempotencyKey: string;
  invoiceNumber: string;
  ipaddress?: string;
  taxAmountInCents?: number;
}

export interface ChargeResponse {
  avsCode: string;
  currencyCode: string;
  cvv2Match: string;
  transactionId: string;
  parentTransactionId: string | undefined;
  transactionType: 'cart' | 'express-checkout';
  paymentType: string;
  orderTime: string;
  amount: string;
  paymentStatus:
    | 'None'
    | 'Canceled-Reversal'
    | 'Completed'
    | 'Denied'
    | 'Expired'
    | 'Failed'
    | 'In-Progress'
    | 'Partially-Refunded'
    | 'Pending'
    | 'Refunded'
    | 'Reversed'
    | 'Processed'
    | 'Voided';
  pendingReason:
    | 'none'
    | 'address'
    | 'authorization'
    | 'echeck'
    | 'intl'
    | 'multi-currency'
    | 'order'
    | 'paymentreview'
    | 'regulatoryreview'
    | 'unilateral'
    | 'verify'
    | 'other';
  reasonCode:
    | 'none'
    | 'chargeback'
    | 'guarantee'
    | 'buyer-complaint'
    | 'refund'
    | 'other';
}
