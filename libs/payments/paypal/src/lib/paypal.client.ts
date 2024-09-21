/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { EventEmitter } from 'events';
import pRetry from 'p-retry';
import superagent from 'superagent';
import { Injectable } from '@nestjs/common';

import {
  PAYPAL_LIVE_API,
  PAYPAL_LIVE_IPN,
  PAYPAL_SANDBOX_API,
  PAYPAL_SANDBOX_IPN,
  PAYPAL_VERSION,
  PLACEHOLDER_URL,
} from './constants';
import { PayPalClientError, PayPalNVPError } from './paypal.error';
import {
  BAUpdateOptions,
  CreateBillingAgreementOptions,
  DoReferenceTransactionOptions,
  NVPBAUpdateTransactionResponse,
  NVPCreateBillingAgreementResponse,
  NVPDoReferenceTransactionResponse,
  NVPErrorResponse,
  NVPRefundTransactionResponse,
  NVPSetExpressCheckoutResponse,
  NVPSuccessResponse,
  NVPTransactionSearchResponse,
  PaypalMethods,
  PaypalNVPAckOptions,
  RefundTransactionOptions,
  RefundType,
  ResponseEvent,
  SetExpressCheckoutOptions,
  TransactionSearchOptions,
} from './paypal.client.types';
import { nvpToObject, objectToNVP, toIsoString } from './util';
import { PaypalClientConfig } from './paypal.client.config';

@Injectable()
export class PayPalClient {
  private url: string;
  private ipnUrl: string;
  private user: string;
  private pwd: string;
  private signature: string;
  private retryOptions: {
    retries: number;
    minTimeout: number;
    factor: number;
  };
  private emitter: EventEmitter;
  public on: (
    event: 'response',
    listener: (response: ResponseEvent) => void
  ) => EventEmitter;

  constructor(options: PaypalClientConfig) {
    this.url = options.sandbox ? PAYPAL_SANDBOX_API : PAYPAL_LIVE_API;
    this.ipnUrl = options.sandbox ? PAYPAL_SANDBOX_IPN : PAYPAL_LIVE_IPN;
    this.user = options.user;
    this.pwd = options.pwd;
    this.signature = options.signature;
    this.retryOptions = {
      retries: 3,
      minTimeout: 500,
      factor: 1.66,
      ...options.retryOptions,
    };
    this.emitter = new EventEmitter();
    this.on = this.emitter.on.bind(this.emitter);
  }

  private async doRequest<T extends NVPSuccessResponse>(
    method: PaypalMethods,
    data: Record<string, any>
  ): Promise<T> {
    const payload = objectToNVP({
      ...data,
      USER: this.user,
      METHOD: method,
      PWD: this.pwd,
      SIGNATURE: this.signature,
      VERSION: PAYPAL_VERSION,
    });
    const response = {
      request_start_time: Date.now(),
      method,
      version: PAYPAL_VERSION,
    };
    let result;
    try {
      result = await pRetry(
        () =>
          superagent
            .post(this.url)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(payload),
        this.retryOptions
      );
    } catch (err) {
      const request_end_time = Date.now();
      this.emitter.emit('response', {
        ...response,
        elapsed: request_end_time - response.request_start_time,
        error: err,
        request_end_time,
      });
      throw err;
    }
    const request_end_time = Date.now();
    const resultObj = nvpToObject(result.text) as T | NVPErrorResponse;
    this.emitter.emit('response', {
      ...response,
      elapsed: request_end_time - response.request_start_time,
      request_end_time,
    });
    if (
      resultObj.ACK === PaypalNVPAckOptions.Success ||
      resultObj.ACK === PaypalNVPAckOptions.SuccessWithWarning
    ) {
      return resultObj;
    } else {
      // TypeScript doesn't narrow ACK, necessitating a cast
      throw new PayPalClientError(
        PayPalClient.getListOfPayPalNVPErrors(
          result.text,
          resultObj as NVPErrorResponse
        ),
        result.text,
        resultObj as NVPErrorResponse
      );
    }
  }

  public static getListOfPayPalNVPErrors(raw: string, data: NVPErrorResponse) {
    const errors: PayPalNVPError[] = [];
    if (!data.L || !data.L.length) {
      const message =
        'PayPal NVP returned a non-success ACK. See "this.raw" or "this.data" for more details.';
      const err = new PayPalNVPError(raw, data, {
        message,
      });
      errors.push(err);
      return errors;
    }

    // Sort errors in alphabetical order by SEVERITYCODE
    // This puts type "Error" before type "Warning".
    const nvpErrors = data.L.sort((errA, errB) => {
      if (errA.SEVERITYCODE < errB.SEVERITYCODE) {
        return -1;
      }
      if (errA.SEVERITYCODE > errB.SEVERITYCODE) {
        return 1;
      }
      return 0;
    });

    for (let i = 0; i < nvpErrors.length; i++) {
      const message = nvpErrors[i].LONGMESSAGE;
      const errorCode = parseInt(nvpErrors[i].ERRORCODE);
      const err = new PayPalNVPError(raw, data, {
        errorCode,
        message,
      });
      errors.push(err);
    }
    return errors;
  }

  /**
   * Call the Paypal SetExpressCheckout NVP API
   *
   * Using the Paypal SetExpressCheckout API (https://developer.paypal.com/docs/nvp-soap-api/set-express-checkout-nvp/)
   * we get back the response which contains a token that we can use in the next step of the transaction.
   * The API is extensive. Currently this method only supports the situation where you're getting an authorizing
   * token that allows us to perform billing in the future.
   */
  public async setExpressCheckout(
    options: SetExpressCheckoutOptions
  ): Promise<NVPSetExpressCheckoutResponse> {
    const data = {
      CANCELURL: PLACEHOLDER_URL,
      L_BILLINGAGREEMENTDESCRIPTION0: 'Mozilla',
      L_BILLINGTYPE0: 'MerchantInitiatedBilling',
      NOSHIPPING: 1,
      PAYMENTREQUEST_0_AMT: '0',
      PAYMENTREQUEST_0_CURRENCYCODE: options.currencyCode.toUpperCase(),
      PAYMENTREQUEST_0_PAYMENTACTION: 'AUTHORIZATION',
      RETURNURL: PLACEHOLDER_URL,
    };
    return this.doRequest<NVPSetExpressCheckoutResponse>(
      PaypalMethods.SetExpressCheckout,
      data
    );
  }

  /**
   * Call the Paypal CreateBillingAgreement NVP API
   *
   * Using the Paypal CreateBillingAgreement API (https://developer.paypal.com/docs/nvp-soap-api/create-billing-agreement-nvp/)
   * creates a billing agreement using the time-stamped token returned in the SetExpressCheckout response.
   */
  public async createBillingAgreement(
    options: CreateBillingAgreementOptions
  ): Promise<NVPCreateBillingAgreementResponse> {
    return this.doRequest<NVPCreateBillingAgreementResponse>(
      PaypalMethods.CreateBillingAgreement,
      options
    );
  }

  /**
   * Call the Paypal DoReferenceTransaction NVP API
   *
   * Using the Paypal DoReferenceTransaction API (https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/)
   * we charge the customer based on a pre-existing billing agreement.
   * The API is extensive, we only support the one workflow of pre-existing billing
   * agreement.
   *
   * The amount, that is passed in with options should be a formatted string of USD
   * that is acceptable to PayPal.
   */
  public async doReferenceTransaction(
    options: DoReferenceTransactionOptions
  ): Promise<NVPDoReferenceTransactionResponse> {
    const data = {
      AMT: options.amount,
      CURRENCYCODE: options.currencyCode.toUpperCase(),
      CUSTOM: options.idempotencyKey,
      INVNUM: options.invoiceNumber,
      ...(options.ipaddress && { IPADDRESS: options.ipaddress }),
      MSGSUBID: options.idempotencyKey,
      PAYMENTACTION: 'Sale',
      PAYMENTTYPE: 'instant',
      REFERENCEID: options.billingAgreementId,
      ...(options.taxAmount && {
        TAXAMT: options.taxAmount,
        // PayPal wants all of this when you include taxes 🤷
        L_AMT0: options.amount,
        L_TAXAMT0: options.taxAmount,
        ITEMAMT: (Number(options.amount) - Number(options.taxAmount)).toFixed(
          2
        ),
      }),
    };
    return this.doRequest<NVPDoReferenceTransactionResponse>(
      PaypalMethods.DoReferenceTransaction,
      data
    );
  }

  /**
   * Call the PayPal RefundTransaction NVP API
   *
   * Using the PayPal RefundTransaction API (https://developer.paypal.com/docs/nvp-soap-api/refund-transaction-nvp/)
   * we fund the entire transaction to the user.
   */
  public async refundTransaction(
    options: RefundTransactionOptions
  ): Promise<NVPRefundTransactionResponse> {
    const data = {
      TRANSACTIONID: options.transactionId,
      MSGSUBID: options.idempotencyKey,
      REFUNDTYPE: options.refundType,
      ...(options.refundType === RefundType.Partial && {
        AMT: (options.amount / 100).toFixed(2),
      }),
    };

    return this.doRequest<NVPRefundTransactionResponse>(
      PaypalMethods.RefundTransaction,
      data
    );
  }

  /**
   * Call the PayPal BillAgreementUpdate NVP API
   *
   * Using the PayPal BillAgreementUpdate API (https://developer.paypal.com/docs/nvp-soap-api/ba-update-nvp/)
   * we get the information on the PayPal user such as the country code.
   */
  public async baUpdate(
    options: BAUpdateOptions
  ): Promise<NVPBAUpdateTransactionResponse> {
    const data: Record<string, any> = {
      REFERENCEID: options.billingAgreementId,
    };
    if (options.cancel) {
      data['BILLINGAGREEMENTSTATUS'] = 'Canceled';
    }
    return this.doRequest<NVPBAUpdateTransactionResponse>(
      PaypalMethods.BillAgreementUpdate,
      data
    );
  }

  /**
   * Call the PayPal IPN/PDT message verification endpoint.
   *
   * Verifies a PayPal IPN/PDT message body by posting it back to PayPal per
   * the IPN listener request-response flow
   * (https://developer.paypal.com/docs/api-basics/notifications/ipn/IPNImplementation/#ipn-listener-request-response-flow).
   */
  public async ipnVerify(message: string): Promise<string> {
    const verifyBody = 'cmd=_notify-validate&' + message;
    const result = await pRetry(() =>
      superagent.post(this.ipnUrl).send(verifyBody)
    );
    return result.text;
  }

  public async transactionSearch(
    options: TransactionSearchOptions
  ): Promise<NVPTransactionSearchResponse> {
    const data = {
      STARTDATE: toIsoString(options.startDate),
      ENDDATE: options.endDate ? toIsoString(options.endDate) : undefined,
      EMAIL: options.email,
      INVNUM: options.invoice,
      TRANSACTIONID: options.transactionId,
    };
    return this.doRequest<NVPTransactionSearchResponse>(
      PaypalMethods.TransactionSearch,
      data
    );
  }
}
