/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import {
  NVPCreateBillingAgreementResponse,
  NVPDoReferenceTransactionResponse,
  NVPError,
  NVPErrorResponse,
  NVPRefundTransactionResponse,
  NVPSuccessResponse,
  NVPSetExpressCheckoutResponse,
  NVPTransactionSearchResponse,
  PaypalNVPAckOptions,
  TransactionStatus,
  NVPBaseResponse,
  NVPBAUpdateTransactionResponse,
  NVPErrorSeverity,
  TransactionSearchResult,
} from './paypal.client.types';
import { ChargeOptions, ChargeResponse } from './paypal.types';

export const NVPBaseResponseFactory = (
  override?: Partial<NVPBaseResponse>
): NVPBaseResponse => ({
  TIMESTAMP: faker.date.recent().toISOString(),
  CORRELATIONID: faker.string.octal(),
  VERSION: '204',
  BUILD: '55251101',
  ...override,
});

export const NVPResponseFactory = (
  override?: Partial<NVPSuccessResponse>
): NVPSuccessResponse => ({
  ...NVPBaseResponseFactory(),
  ACK: PaypalNVPAckOptions.Success,
  ...override,
});

export const NVPErrorFactory = (override?: Partial<NVPError>): NVPError => ({
  ERRORCODE: faker.string.numeric(),
  SHORTMESSAGE: faker.word.words(),
  LONGMESSAGE: faker.word.words(),
  SEVERITYCODE: NVPErrorSeverity.Error,
  ...override,
});

export const NVPErrorResponseFactory = (
  override?: Partial<NVPErrorResponse>
): NVPErrorResponse => ({
  ...NVPBaseResponseFactory(),
  ACK: PaypalNVPAckOptions.Failure,
  L: [NVPErrorFactory()],
  ...override,
});

export const NVPSetExpressCheckoutResponseFactory = (
  override?: Partial<NVPSetExpressCheckoutResponse>
): NVPSetExpressCheckoutResponse => ({
  ...NVPResponseFactory(),
  TOKEN: faker.string.uuid(),
  ...override,
});

export const NVPCreateBillingAgreementResponseFactory = (
  override?: Partial<NVPCreateBillingAgreementResponse>
): NVPCreateBillingAgreementResponse => ({
  ...NVPResponseFactory(),
  BILLINGAGREEMENTID: faker.string.alphanumeric(),
  ...override,
});

export const NVPDoReferenceTransactionResponseFactory = (
  override?: Partial<NVPDoReferenceTransactionResponse>
): NVPDoReferenceTransactionResponse => ({
  ...NVPResponseFactory(),
  AMT: faker.finance.amount(),
  AVSCODE: '',
  CVV2MATCH: '',
  BILLINGAGREEMENTID: faker.string.alphanumeric(),
  CURRENCYCODE: faker.finance.currencyCode(),
  FEEAMT: faker.finance.amount({ symbol: '-' }),
  ORDERTIME: faker.date.recent().toISOString(),
  PARENTTRANSACTIONID: `PAYID-${faker.string.alphanumeric()}`,
  PAYMENTSTATUS: 'Completed',
  PAYMENTTYPE: 'instant',
  PENDINGREASON: 'None',
  PROTECTIONELIGIBILITY: 'Eligible',
  PROTECTIONELIGIBILITYTYPE:
    'ItemNotReceivedEligible,UnauthorizedPaymentEligible',
  REASONCODE: 'None',
  TAXAMT: faker.finance.amount(),
  TRANSACTIONID: faker.string.alphanumeric(),
  TRANSACTIONTYPE: 'merchtpmt',
  ...override,
});

export const NVPRefundTransactionResponseFactory = (
  override?: Partial<NVPRefundTransactionResponse>
): NVPRefundTransactionResponse => ({
  ...NVPResponseFactory(),
  REFUNDTRANSACTIONID: faker.string.alphanumeric(),
  FEEREFUNDAMT: faker.finance.amount(),
  GROSSREFUNDAMT: faker.finance.amount(),
  NETREFUNDAMT: faker.finance.amount(),
  CURRENCYCODE: faker.finance.currencyCode(),
  TOTALREFUNDEDAMOUNT: faker.finance.amount(),
  MSGSUBID: faker.string.alphanumeric(),
  REFUNDSTATUS: 'Instant',
  PENDINGREASON: 'None',
  ...override,
});

export const NVPBAUpdateTransactionResponseFactory = (
  override?: Partial<NVPBAUpdateTransactionResponse>
): NVPBAUpdateTransactionResponse => ({
  ...NVPResponseFactory(),
  BILLINGAGREEMENTID: faker.string.sample(),
  BILLINGAGREEMENTSTATUS: faker.string.sample(), // Paypal docs are non-descriptive. This field may be refined further.
  EMAIL: faker.internet.email(),
  PAYERSTATUS: 'verified',
  FIRSTNAME: faker.person.firstName(),
  LASTNAME: faker.person.lastName(),
  CITY: faker.location.city(),
  COUNTRYCODE: faker.location.countryCode(),
  STATE: faker.location.state(),
  STREET: faker.location.streetAddress(),
  STREET2: faker.location.streetAddress(),
  ZIP: faker.location.zipCode(),
  ...override,
});

const TransactionSearchResultFactory = (
  override?: Partial<TransactionSearchResult>
): TransactionSearchResult => ({
  ...NVPResponseFactory(),
  TYPE: 'Payment',
  EMAIL: faker.internet.email(),
  NAME: faker.person.fullName(),
  TRANSACTIONID: faker.string.alphanumeric(),
  STATUS: TransactionStatus.Completed,
  AMT: faker.finance.amount(),
  CURRENCYCODE: faker.finance.currencyCode(),
  FEEAMT: faker.finance.amount({ symbol: '-' }),
  NETAMT: faker.finance.amount(),
  ...override,
});

export const NVPTransactionSearchResponseFactory = (
  override?: Partial<NVPTransactionSearchResponse>
): NVPTransactionSearchResponse => ({
  ...NVPResponseFactory(),
  L: [TransactionSearchResultFactory(), TransactionSearchResultFactory()],
  ...override,
});

export const ChargeResponseFactory = (
  override?: Partial<ChargeResponse>
): ChargeResponse => ({
  avsCode: faker.string.alpha(1).toUpperCase(),
  currencyCode: faker.finance.currencyCode(),
  cvv2Match: faker.finance.creditCardCVV(),
  transactionId: faker.string.uuid(),
  parentTransactionId: faker.string.uuid(),
  transactionType: 'express-checkout',
  paymentType: faker.finance.transactionType(),
  orderTime: faker.date.recent().toISOString(),
  amount: faker.finance.amount(),
  paymentStatus: 'Completed',
  pendingReason: 'none',
  reasonCode: 'none',
  ...override,
});

export const ChargeOptionsFactory = (
  override?: Partial<ChargeOptions>
): ChargeOptions => ({
  amountInCents: faker.number.int({ max: 100000000 }),
  billingAgreementId: faker.string.uuid(),
  currencyCode: faker.finance.currencyCode(),
  countryCode: faker.finance.currencyCode(),
  idempotencyKey: faker.string.uuid(),
  invoiceNumber: faker.string.uuid(),
  taxAmountInCents: faker.number.int({ max: 100000000 }),
  ...override,
});
