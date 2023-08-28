/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum PaypalMethods {
  BillAgreementUpdate = 'BillAgreementUpdate',
  CreateBillingAgreement = 'CreateBillingAgreement',
  DoReferenceTransaction = 'DoReferenceTransaction',
  GetTransactionDetails = 'GetTransactionDetails',
  RefundTransaction = 'RefundTransaction',
  SetExpressCheckout = 'SetExpressCheckout',
  TransactionSearch = 'TransactionSearch',
}

/*
 * Common response fields
 * https://developer.paypal.com/docs/nvp-soap-api/NVPAPIOverview/#common-response-fields
 */
export enum PaypalNVPAckOptions {
  Success = 'Success',
  SuccessWithWarning = 'SuccessWithWarning',
  Failure = 'Failure',
  FailureWithWarning = 'FailureWithWarning',
}

export interface NVPBaseResponse {
  BUILD: string;
  CORRELATIONID: string;
  TIMESTAMP: string;
  VERSION: string;
}

export enum NVPErrorSeverity {
  Error = 'Error',
  Warning = 'Warning',
}

export interface NVPError {
  ERRORCODE: string;
  SHORTMESSAGE: string;
  LONGMESSAGE: string;
  SEVERITYCODE: NVPErrorSeverity;
}

export interface NVPSuccessResponse extends NVPBaseResponse {
  ACK: PaypalNVPAckOptions.Success | PaypalNVPAckOptions.SuccessWithWarning;
}

export interface NVPErrorResponse extends NVPBaseResponse {
  ACK: PaypalNVPAckOptions.Failure | PaypalNVPAckOptions.FailureWithWarning;
  L?: NVPError[];
}

export interface NVPSetExpressCheckoutResponse extends NVPSuccessResponse {
  TOKEN: string;
}

export interface NVPCreateBillingAgreementResponse extends NVPSuccessResponse {
  BILLINGAGREEMENTID: string;
}

export interface NVPDoReferenceTransactionResponse extends NVPSuccessResponse {
  AMT: string;
  AVSCODE: string;
  BILLINGAGREEMENTID: string;
  CURRENCYCODE: string;
  CVV2MATCH: string;
  FEEAMT: string;
  ORDERTIME: string;
  PARENTTRANSACTIONID: string;
  PAYMENTSTATUS: string;
  PAYMENTTYPE: string;
  PENDINGREASON: string;
  PROTECTIONELIGIBILITY: string;
  PROTECTIONELIGIBILITYTYPE: string;
  REASONCODE: string;
  TAXAMT: string;
  TRANSACTIONID: string;
  TRANSACTIONTYPE: string;
}

export interface NVPRefundTransactionResponse extends NVPSuccessResponse {
  REFUNDTRANSACTIONID: string;
  FEEREFUNDAMT: string;
  GROSSREFUNDAMT: string;
  NETREFUNDAMT: string;
  CURRENCYCODE: string;
  TOTALREFUNDEDAMOUNT: string;
  MSGSUBID: string;
  REFUNDSTATUS: string;
  PENDINGREASON: string;
}

export interface NVPBAUpdateTransactionResponse extends NVPSuccessResponse {
  BILLINGAGREEMENTID: string;
  BILLINGAGREEMENTSTATUS: string;
  EMAIL: string;
  PAYERSTATUS: string;
  FIRSTNAME: string;
  LASTNAME: string;
  CITY: string;
  COUNTRYCODE: string;
  STATE: string;
  STREET: string;
  STREET2: string;
  ZIP: string;
}

export enum TransactionStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Completed = 'Completed',
  Denied = 'Denied',
  Reversed = 'Reversed',
}

export interface TransactionSearchResult {
  AMT: string;
  CURRENCYCODE: string;
  EMAIL: string;
  FEEAMT: string;
  NAME: string;
  NETAMT: string;
  STATUS: TransactionStatus;
  TIMESTAMP: string;
  TRANSACTIONID: string;
  TYPE: string;
}

export interface NVPTransactionSearchResponse extends NVPSuccessResponse {
  L: TransactionSearchResult[];
}

export interface SetExpressCheckoutOptions {
  currencyCode: string;
}

export interface CreateBillingAgreementOptions {
  token: string;
}

export interface DoReferenceTransactionOptions {
  amount: string;
  billingAgreementId: string;
  invoiceNumber: string;
  idempotencyKey: string;
  currencyCode: string;
  taxAmount?: string;
  ipaddress?: string;
}

export enum RefundType {
  Full = 'Full',
  Partial = 'Partial',
}

export type RefundTransactionOptions = {
  idempotencyKey: string;
  transactionId: string;
} & (
  | {
      refundType: RefundType.Full;
    }
  | {
      refundType: RefundType.Partial;
      amount: number;
    }
);

export interface BAUpdateOptions {
  billingAgreementId: string;
  cancel?: boolean;
}

export interface TransactionSearchOptions {
  invoice?: string;
  startDate: Date;
  endDate?: Date;
  email?: string;
  transactionId?: string;
}

export interface IpnMessage {
  txn_type: string;
  [key: string]: any;
}

// Agreement status, A for Active, I for inactive
// I is equivalent to cancelled.
export enum IpnMPStatus {
  Active = 'A',
  Inactive = 'I',
}

export enum IpnMPPayType {
  Instant = 'INSTANT',
  Any = 'ANY',
  Echeck = 'ECHECK',
}

export enum IpnTxnType {
  MerchPmt = 'merch_pmt',
  MpCancel = 'mp_cancel',
}

export interface IpnMerchPmtType extends IpnMessage {
  invoice: string;
  // The billing agreement ID
  mp_id: string;
  mc_gross: string;
  mp_notification?: any;
  mp_pay_type: IpnMPPayType;
  mp_status: IpnMPStatus;
  txn_id: string;
  txn_type: IpnTxnType;
}

export interface ResponseEvent {
  error?: Error;
  request_end_time: number;
  version: string;
  elapsed: number;
  method: string;
  request_start_time: number;
}
