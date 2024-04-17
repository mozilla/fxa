/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { hasPaypalSubscription } from 'fxa-shared/subscriptions/stripe';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import {
  BAUpdateOptions,
  CreateBillingAgreementOptions,
  DoReferenceTransactionOptions,
  IpnMessage,
  nvpToObject,
  PayPalClient,
  PayPalClientError,
  RefundTransactionOptions,
  RefundType,
  SetExpressCheckoutOptions,
  TransactionSearchOptions,
  TransactionStatus,
} from '@fxa/payments/paypal';
import error from '../../error';
import { CurrencyHelper } from '../currencies';
import { StripeHelper } from '../stripe';
import { RefusedError } from './error';
import {
  PAYPAL_APP_ERRORS,
  PAYPAL_BILLING_AGREEMENT_INVALID,
  PAYPAL_RETRY_ERRORS,
  PAYPAL_SOURCE_ERRORS,
} from './error-codes';

type PaypalHelperOptions = {
  log: Logger;
};

type AgreementDetails = {
  city: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  state: string;
  status: 'active' | 'cancelled';
  street: string;
  street2: string;
  zip: string;
};

export type ChargeCustomerOptions = {
  amountInCents: number;
  billingAgreementId: string;
  currencyCode: string;
  idempotencyKey: string;
  invoiceNumber: string;
  ipaddress?: string;
  taxAmountInCents?: number;
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
  const primaryError = err.getPrimaryError();
  const code = primaryError.errorCode;
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

export class RefundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefundError';
  }
}

const MAX_REFUND_DAYS = 180;

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
          error: response.error ? 'true' : 'false',
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
  public parseIdempotencyKey(idempotencyKey: string): {
    invoiceId: string;
    paymentAttempt: number;
  } {
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
    const doReferenceTransactionOptions: DoReferenceTransactionOptions = {
      amount: this.currencyHelper.getPayPalAmountStringFromAmountInCents(
        options.amountInCents
      ),
      billingAgreementId: options.billingAgreementId,
      currencyCode: options.currencyCode,
      idempotencyKey: options.idempotencyKey,
      invoiceNumber: options.invoiceNumber,
      ...(options.ipaddress && { ipaddress: options.ipaddress }),
      ...(options.taxAmountInCents && {
        taxAmount: this.currencyHelper.getPayPalAmountStringFromAmountInCents(
          options.taxAmountInCents
        ),
      }),
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
      transactionType:
        response.TRANSACTIONTYPE as ChargeResponse['transactionType'],
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
      city: response.CITY,
      countryCode: response.COUNTRYCODE,
      firstName: response.FIRSTNAME,
      lastName: response.LASTNAME,
      state: response.STATE,
      status:
        response.BILLINGAGREEMENTSTATUS.toLowerCase() as AgreementDetails['status'],
      street: response.STREET,
      street2: response.STREET2,
      zip: response.ZIP,
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
      if (!PayPalClientError.hasPayPalNVPError(err)) {
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
    return nvpToObject(payload) as IpnMessage;
  }

  public async searchTransactions(
    options: TransactionSearchOptions
  ): Promise<TransactionSearchResult[]> {
    const results = await this.client.transactionSearch(options);
    if (!(results.L instanceof Array)) {
      return [];
    }

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
   * Removes Paypal billing agreements on a customer if they paid with
   * Paypal but no longer have an active/past_due/trialing subscription.
   */
  async conditionallyRemoveBillingAgreement(
    customer: Stripe.Customer
  ): Promise<boolean> {
    const billingAgreementId =
      this.stripeHelper.getCustomerPaypalAgreement(customer);
    if (!billingAgreementId) {
      return false;
    }
    if (hasPaypalSubscription(customer)) {
      return false;
    }
    await this.cancelBillingAgreement(billingAgreementId);
    await this.stripeHelper.removeCustomerPaypalAgreement(
      customer.metadata.userid,
      customer.id,
      billingAgreementId
    );
    return true;
  }

  public async updateStripeNameFromBA(
    customer: Stripe.Customer,
    billingAgreementId: string
  ): Promise<Stripe.Customer> {
    this.metrics.increment('paypal.updateStripeNameFromBA');
    const agreementDetails = await this.agreementDetails({
      billingAgreementId,
    });
    if (agreementDetails.status === 'cancelled') {
      throw error.internalValidationError('updateStripeNameFromBA', {
        message: 'Billing agreement was cancelled.',
      });
    }
    const name = `${agreementDetails.firstName} ${agreementDetails.lastName}`;
    return this.stripeHelper.updateCustomerBillingAddress({
      customerId: customer.id,
      name,
    });
  }

  /**
   * Finalize and process a draft invoice that has no amounted owed.
   *
   * @param invoice
   */
  public processZeroInvoice(invoice: Stripe.Invoice) {
    // It appears for subscriptions that do not require payment, the invoice
    // transitions to paid automatially.
    // https://stripe.com/docs/billing/invoices/subscription#sub-invoice-lifecycle
    return this.stripeHelper.finalizeInvoice(invoice);
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
    ipaddress?: string;
  }) {
    const { customer, invoice, batchProcessing = false, ipaddress } = opts;
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      invoice.id!,
      paymentAttempt
    );

    const promises: Promise<any>[] = [
      this.chargeCustomer({
        amountInCents: invoice.amount_due,
        billingAgreementId: agreementId,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        invoiceNumber: invoice.id!,
        currencyCode: invoice.currency,
        idempotencyKey,
        ...(ipaddress && { ipaddress }),
        ...(invoice.tax && { taxAmountInCents: invoice.tax }),
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
      if (PayPalClientError.hasPayPalNVPError(err) && !batchProcessing) {
        throwPaypalCodeError(err);
      }
      this.log.error('processInvoice', {
        err,
        nvpData: err.data,
        invoiceId: invoice.id,
      });

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

  /**
   * Given the transaction ID, refund the transaction in full.
   * Use the Stripe Invoice ID as the idempotency key since we
   * expect one refund per invoice.
   *
   * @param options
   */
  public async refundTransaction(options: RefundTransactionOptions) {
    let response;
    try {
      response = await this.client.refundTransaction(options);
    } catch (err) {
      if (!PayPalClientError.hasPayPalNVPError(err)) {
        throw err;
      }
      const primaryError = err.getPrimaryError();
      if (
        primaryError.data.L &&
        primaryError.data.L[0].SHORTMESSAGE === 'Transaction refused'
      ) {
        throw new RefusedError(
          primaryError.data.L[0].SHORTMESSAGE,
          primaryError.data.L[0].LONGMESSAGE,
          primaryError.data.L[0].ERRORCODE
        );
      }
      throw err;
    }
    return {
      pendingReason: response.PENDINGREASON,
      refundStatus: response.REFUNDSTATUS,
      refundTransactionId: response.REFUNDTRANSACTIONID,
    };
  }

  public async issueRefund(
    invoice: Stripe.Invoice,
    transactionId: string,
    refundType: RefundType,
    amount?: number
  ) {
    const refundResponse = await this.refundTransaction({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      idempotencyKey: invoice.id!,
      transactionId: transactionId,
      refundType: refundType,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      amount: amount!,
    });
    const success = ['instant', 'delayed'];
    if (success.includes(refundResponse.refundStatus.toLowerCase())) {
      this.stripeHelper.updateInvoiceWithPaypalRefundTransactionId(
        invoice,
        refundResponse.refundTransactionId
      );
      return;
    }
    this.log.error('issueRefund', {
      message: 'PayPal refund transaction unsuccessful',
      invoiceId: invoice.id,
      transactionId,
      refundResponse,
    });
    throw error.internalValidationError('issueRefund', {
      message: 'PayPal refund transaction unsuccessful',
    });
  }

  /**
   * Attempts to refund all of the invoices passed, provided they're created via PayPal
   * This will invisibly do nothing if the invoice is not billed through PayPal, so be mindful
   * if using it elsewhere and need confirmation of a refund.
   */
  public async refundInvoices(invoices: Stripe.Invoice[]) {
    this.log.debug('PayPalHelper.refundInvoices', {
      numberOfInvoices: invoices.length,
    });
    const payPalInvoices = invoices.filter(
      (invoice) => invoice.collection_method === 'send_invoice'
    );

    for (const invoice of payPalInvoices) {
      try {
        await this.refundInvoice(invoice);
      } catch (error) {
        if (
          !(error instanceof RefusedError) &&
          !(error instanceof RefundError)
        ) {
          throw error;
        }
      }
    }

    return;
  }

  /**
   * Refunds the invoice passed, throwing an error on any issue encountered.
   */
  public async refundInvoice(invoice: Stripe.Invoice) {
    this.log.debug('PayPalHelper.refundInvoice', {
      invoiceId: invoice.id,
    });
    const minCreated = Math.floor(
      new Date().setDate(new Date().getDate() - MAX_REFUND_DAYS) / 1000
    );
    if (invoice.collection_method !== 'send_invoice') {
      throw new Error('Invoice is not a Paypal invoice');
    }

    try {
      if (invoice.created < minCreated) {
        throw new RefundError(
          'Invoice created outside of maximum refund period'
        );
      }
      const transactionId =
        this.stripeHelper.getInvoicePaypalTransactionId(invoice);
      if (!transactionId) {
        throw new RefundError('Missing transactionId');
      }
      const refundTransactionId =
        this.stripeHelper.getInvoicePaypalRefundTransactionId(invoice);
      if (refundTransactionId) {
        throw new RefundError('Invoice already refunded with PayPal');
      }

      await this.issueRefund(invoice, transactionId, RefundType.Full);

      this.log.info('refundInvoice', {
        invoiceId: invoice.id,
        priceId: this.stripeHelper.getPriceIdFromInvoice(invoice),
        total: invoice.total,
        currency: invoice.currency,
      });
    } catch (error) {
      this.log.error('PayPalHelper.refundInvoice', {
        error,
        invoiceId: invoice.id,
      });
      throw error;
    }

    return;
  }
}
