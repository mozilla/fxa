/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import error from '../error';
import {
  BAUpdateOptions,
  CreateBillingAgreementOptions,
  DoReferenceTransactionOptions,
  IpnMessage,
  PayPalClient,
  PayPalClientError,
  SetExpressCheckoutOptions,
  TransactionSearchOptions,
  TransactionStatus,
} from './paypal-client';
import {
  PAYPAL_APP_ERRORS,
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_RETRY_ERRORS,
  PAYPAL_SOURCE_ERRORS,
} from './paypal-error-codes';
import { StripeHelper } from './stripe';
import { CurrencyHelper } from './currencies';

type PaypalHelperOptions = {
  log: Logger;
};

type AgreementDetails = {
  status: 'active' | 'cancelled';
  countryCode: string;
};

export type ChargeCustomerOptions = {
  amountInCents: number;
  billingAgreementId: string;
  invoiceNumber: string;
  idempotencyKey: string;
  currencyCode: string;
};

export type ChargeResponse = {
  avsCode: string;
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
};

export type TransactionSearchResult = {
  amount: string;
  currencyCode: string;
  email: string;
  feeAmount: string;
  name: string;
  netAmount: string;
  status: TransactionStatus;
  timestamp: string;
  transactionId: string;
  type: string;
};

/**
 * Translates paypal client errors into fxa-auth-server errors.
 *
 * Re-throws the provided error as an auth-server error.
 *
 * @param err
 */
function throwPaypalCodeError(err: PayPalClientError) {
  const code = err.errorCode;
  if (!code) {
    throw error.backendServiceFailure(
      'paypal',
      'transaction',
      {
        errData: err.data,
        message: 'Error with no errorCode is not expected',
      },
      err
    );
  }
  if (
    PAYPAL_SOURCE_ERRORS.includes(code) ||
    code === PAYPAL_BILLING_AGREEMENT_INVALID
  ) {
    const rethrowErr = error.paymentFailed();
    rethrowErr.jse_cause = err;
    throw rethrowErr;
  }
  if (PAYPAL_APP_ERRORS.includes(code)) {
    throw error.backendServiceFailure(
      'paypal',
      'transaction',
      {
        errData: err.data,
        code,
      },
      err
    );
  }
  if (PAYPAL_RETRY_ERRORS.includes(code)) {
    throw error.serviceUnavailable();
  }
  throw error.internalValidationError(
    'paypalCodeHandler',
    {
      code,
      errData: err.data,
    },
    err
  );
}

export class PayPalHelper {
  private log: Logger;
  private client: PayPalClient;
  private metrics: StatsD;
  private stripeHelper: StripeHelper;
  public currencyHelper: CurrencyHelper;

  constructor(options: PaypalHelperOptions) {
    this.log = options.log;
    this.client = Container.get(PayPalClient);
    this.metrics = Container.get(StatsD);
    this.stripeHelper = Container.get(StripeHelper);
    this.currencyHelper = Container.get(CurrencyHelper);
    if (this.metrics) {
      this.client.on('response', (response) => {
        this.metrics.timing('paypal_request', response.elapsed, undefined, {
          method: response.method,
          error: response.error ? 'false' : 'true',
        });
      });
    }
  }

  /**
   * Generate a PayPal idempotency key, used as the MSGSUBID on PayPal NVP
   * API calls.
   *
   * @param invoiceId
   * @param paymentAttempt
   */
  public generateIdempotencyKey(
    invoiceId: string,
    paymentAttempt: number
  ): string {
    return `${invoiceId}-${paymentAttempt}`;
  }

  /**
   * Parse the invoice Id and payment attempt out of the idempotency key
   *
   * Returns the paymentAttempt with 1 added to reflect the actual payment
   * attempts made as the original attempt number is incremented *after* the
   * attempt is made successfully.
   *
   * @param idempotencyKey
   */
  public parseIdempotencyKey(
    idempotencyKey: string
  ): { invoiceId: string; paymentAttempt: number } {
    const parsedValue = idempotencyKey.split('-');
    return {
      invoiceId: parsedValue[0],
      paymentAttempt: parseInt(parsedValue[1]) + 1,
    };
  }

  /**
   * Get a token authorizing transaction to move to the next stage.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   *
   */
  public async getCheckoutToken(
    options: SetExpressCheckoutOptions
  ): Promise<string> {
    const response = await this.client.setExpressCheckout(options);
    return response.TOKEN;
  }

  /**
   * Create billing agreement using the ExpressCheckout token.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   *
   */
  public async createBillingAgreement(
    options: CreateBillingAgreementOptions
  ): Promise<string> {
    const response = await this.client.createBillingAgreement(options);
    return response.BILLINGAGREEMENTID;
  }

  /**
   * Charge customer based on an existing Billing Agreement.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   * If the call is successful, all PayPal response data is returned.
   *
   */
  public async chargeCustomer(
    options: ChargeCustomerOptions
  ): Promise<ChargeResponse> {
    const doReferenceTransactionOptions = {
      amount: this.currencyHelper.getPayPalAmountStringFromAmountInCents(
        options.amountInCents
      ),
      billingAgreementId: options.billingAgreementId,
      invoiceNumber: options.invoiceNumber,
      idempotencyKey: options.idempotencyKey,
      currencyCode: options.currencyCode,
    };
    const response = await this.client.doReferenceTransaction(
      doReferenceTransactionOptions
    );
    return {
      amount: response.AMT,
      avsCode: response.AVSCODE,
      cvv2Match: response.CVV2MATCH,
      orderTime: response.ORDERTIME,
      parentTransactionId: response.PARENTTRANSACTIONID,
      paymentStatus: response.PAYMENTSTATUS as ChargeResponse['paymentStatus'],
      paymentType: response.PAYMENTTYPE,
      pendingReason: response.PENDINGREASON as ChargeResponse['pendingReason'],
      reasonCode: response.REASONCODE as ChargeResponse['reasonCode'],
      transactionId: response.TRANSACTIONID,
      transactionType: response.TRANSACTIONTYPE as ChargeResponse['transactionType'],
    };
  }

  /**
   * Get Billing Agreement details by calling the update Billing Agreement API.
   * Parses the API call response for country code and billing agreement status
   */
  public async agreementDetails(
    options: BAUpdateOptions
  ): Promise<AgreementDetails> {
    const response = await this.client.baUpdate(options);
    return {
      status: response.BILLINGAGREEMENTSTATUS.toLowerCase() as AgreementDetails['status'],
      countryCode: response.COUNTRYCODE,
    };
  }

  /**
   * Cancel a billing agreement.
   *
   * Errors from PayPal canceling the agreement are ignored as they only occur
   * if the agreement is no longer valid, isn't present anymore, etc. Other errors
   * processing the request are not ignored.
   *
   * @param billingAgreementId
   */
  public async cancelBillingAgreement(
    billingAgreementId: string
  ): Promise<null> {
    try {
      await this.client.baUpdate({ billingAgreementId, cancel: true });
    } catch (err) {
      if (!(err instanceof PayPalClientError)) {
        throw err;
      }
    }
    return null;
  }

  /**
   * Verify whether an IPN message is valid.
   *
   * @param message
   */
  public async verifyIpnMessage(message: string): Promise<boolean> {
    return (await this.client.ipnVerify(message)) === 'VERIFIED';
  }

  /**
   * Extract an IPN message from a payload.
   *

   * @param payload
   */
  public extractIpnMessage(payload: string): IpnMessage {
    return this.client.nvpToObject(payload) as IpnMessage;
  }

  public async searchTransactions(
    options: TransactionSearchOptions
  ): Promise<TransactionSearchResult[]> {
    const results = await this.client.transactionSearch(options);
    return results.L.map((r) => ({
      amount: r.AMT,
      currencyCode: r.CURRENCYCODE,
      email: r.EMAIL,
      feeAmount: r.FEEAMT,
      name: r.NAME,
      netAmount: r.NETAMT,
      status: r.STATUS,
      timestamp: r.TIMESTAMP,
      transactionId: r.TRANSACTIONID,
      type: r.TYPE,
    }));
  }

  /**
   * Finalize and process a draft invoice that has no amounted owed.
   *
   * @param invoice
   */
  public processZeroInvoice(invoice: Stripe.Invoice) {
    return Promise.all([
      this.stripeHelper.finalizeInvoice(invoice),
      this.stripeHelper.payInvoiceOutOfBand(invoice),
    ]);
  }

  /**
   * Process an invoice with a billing agreement that is in draft/open with
   * the provided billing agreement.
   *
   * @param opts
   */
  public async processInvoice(opts: {
    customer: Stripe.Customer;
    invoice: Stripe.Invoice;
    batchProcessing?: boolean;
  }) {
    const { customer, invoice, batchProcessing = false } = opts;
    const agreementId = this.stripeHelper.getCustomerPaypalAgreement(customer);
    if (!agreementId) {
      throw error.internalValidationError('processInvoice', {
        message: 'Agreement ID not found.',
      });
    }
    if (!['draft', 'open'].includes(invoice.status ?? '')) {
      throw error.internalValidationError('processInvoice', {
        message: 'Invoice in invalid state.',
      });
    }

    const paymentAttempt = this.stripeHelper.getPaymentAttempts(invoice);

    // PayPal supports an idempotencyKey on transaction charges to avoid repeat
    // charges. This key is restricted to the invoice and payment
    // attempt in combination, so that retries can be made if
    // the prior attempt failed and a retry is desired.
    const idempotencyKey = this.generateIdempotencyKey(
      invoice.id,
      paymentAttempt
    );

    const promises: Promise<any>[] = [
      this.chargeCustomer({
        amountInCents: invoice.amount_due,
        billingAgreementId: agreementId,
        invoiceNumber: invoice.id,
        currencyCode: invoice.currency,
        idempotencyKey,
      }),
    ];
    if (invoice.status === 'draft') {
      promises.push(this.stripeHelper.finalizeInvoice(invoice));
    }

    let transactionResponse;
    try {
      [transactionResponse] = (await Promise.all(promises)) as [
        ChargeResponse,
        any
      ];
    } catch (err) {
      if (err instanceof PayPalClientError && !batchProcessing) {
        throwPaypalCodeError(err);
      }
      throw err;
    }
    await this.stripeHelper.updatePaymentAttempts(invoice);

    switch (transactionResponse.paymentStatus) {
      case 'Completed':
      case 'Processed':
        return Promise.all([
          this.stripeHelper.updateInvoiceWithPaypalTransactionId(
            invoice,
            transactionResponse.transactionId
          ),
          this.stripeHelper.payInvoiceOutOfBand(invoice),
        ]);
      case 'Pending':
      case 'In-Progress':
        return;
      case 'Denied':
      case 'Failed':
      case 'Voided':
      case 'Expired':
        throw error.paymentFailed();
      default:
        // Unexpected response here, log details and throw validation error.
        this.log.error('processInvoice', {
          message: 'Unexpected PayPal transaction response.',
          transactionResponse,
        });
        throw error.internalValidationError('processInvoice', {
          message: 'Unexpected PayPal transaction response.',
          transactionResponse: transactionResponse.paymentStatus,
        });
    }
  }
}
