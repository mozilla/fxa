/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import pRetry from 'p-retry';
import querystring from 'querystring';
import superagent from 'superagent';
import { GetCheckoutTokenOptions } from './paypal';

export const PAYPAL_SANDBOX_BASE = 'https://api-3t.sandbox.paypal.com';
export const PAYPAL_LIVE_BASE = 'https://api-3t.paypal.com';
export const PAYPAL_NVP_ROUTE = '/nvp';
export const PAYPAL_SANDBOX_API = PAYPAL_SANDBOX_BASE + PAYPAL_NVP_ROUTE;
export const PAYPAL_LIVE_API = PAYPAL_LIVE_BASE + PAYPAL_NVP_ROUTE;
// See https://developer.paypal.com/docs/checkout/reference/upgrade-integration/#nvp-integrations
// for information on when to use PLACEHOLDER_URL
export const PLACEHOLDER_URL = 'https://www.paypal.com/checkoutnow/error';
const PAYPAL_VERSION = '204';
const L_LIST = /L_([A-Z]+)(\d+)$/;

type PaypalOptions = {
  sandbox: boolean;
  user: string;
  pwd: string;
  signature: string;
  retryOptions?: {
    retries?: number;
    minTimeout?: number;
    factor?: number;
  };
};

export enum PAYPAL_METHODS {
  BillAgreementUpdate = 'BillAgreementUpdate',
  CreateBillingAgreement = 'CreateBillingAgreement',
  DoReferenceTransaction = 'DoReferenceTransaction',
  GetTransactionDetails = 'GetTransactionDetails',
  SetExpressCheckout = 'SetExpressCheckout',
  TransactionSearch = 'TransactionSearch',
}

/*
 * Common response fields
 * https://developer.paypal.com/docs/nvp-soap-api/NVPAPIOverview/#common-response-fields
 */

export enum PAYPAL_NVP_ACK_OPTIONS {
  Success = 'Success',
  SuccessWithWarning = 'SuccessWithWarning',
  Failure = 'Failure',
  FailureWithWarning = 'FailureWithWarning',
}

type NVPResponse = {
  ACK: PAYPAL_NVP_ACK_OPTIONS;
  CORRELATIONID: string;
  TIMESTAMP: string;
  VERSION: string;
  BUILD: string;
};

type SetCheckoutData = {
  TOKEN: string;
};

export type NVPSetCheckoutResponse = NVPResponse & SetCheckoutData;

export class PayPalClientError extends Error {
  public raw: string;
  public data: NVPResponse;

  constructor(raw: string, data: NVPResponse, ...params: any) {
    super(...params);
    // Cannot override the name
    this.name = 'PayPalClientError';
    if (!this.message) {
      this.message =
        'PayPal NVP returned a non-success ACK. See "this.raw" or "this.data" for more details.';
    }
    this.raw = raw;
    this.data = data;
  }
}
export class PayPalClient {
  private url: string;
  private user: string;
  private pwd: string;
  private signature: string;
  private retryOptions: {
    retries: number;
    minTimeout: number;
    factor: number;
  };

  constructor(options: PaypalOptions) {
    this.url = options.sandbox ? PAYPAL_SANDBOX_API : PAYPAL_LIVE_API;
    this.user = options.user;
    this.pwd = options.pwd;
    this.signature = options.signature;
    this.retryOptions = {
      retries: 3,
      minTimeout: 500,
      factor: 1.66,
      ...options.retryOptions,
    };
  }

  private objectToNVP(object: Record<string, any>): string {
    return querystring.stringify(object);
  }

  private nvpToObject(payload: string): Record<string, any> {
    const object = querystring.parse(payload, undefined, undefined, {
      maxKeys: 0,
    });
    const result: Record<string, any> = {};
    const lst: any[] = [];
    for (const [key, value] of Object.entries(object)) {
      const match = key.match(L_LIST);
      if (!match) {
        result[key] = value;
        continue;
      }
      const [name, indexString] = [match[1], match[2]];
      const index = parseInt(indexString);

      if (!lst[index]) {
        lst[index] = {};
      }
      lst[index][name] = value;
    }
    if (lst.length !== 0) {
      result['L'] = lst;
    }
    return result;
  }

  private async doRequest(
    method: PAYPAL_METHODS,
    data: Record<string, any>
  ): Promise<NVPResponse> {
    const payload = this.objectToNVP({
      ...data,
      USER: this.user,
      METHOD: method,
      PWD: this.pwd,
      SIGNATURE: this.signature,
      VERSION: PAYPAL_VERSION,
    });
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
      throw new Error('Call to PayPal Failed');
    }
    const resultObj = this.nvpToObject(result.text) as NVPResponse;
    if (
      resultObj.ACK === PAYPAL_NVP_ACK_OPTIONS.Success ||
      resultObj.ACK === PAYPAL_NVP_ACK_OPTIONS.SuccessWithWarning
    ) {
      return resultObj;
    } else {
      throw new PayPalClientError(result.text, resultObj);
    }
  }

  /**
   * Call the Paypal SetExpressCheckout NVP API
   *
   * Using the Paypal SetExpressCheckout API (https://developer.paypal.com/docs/nvp-soap-api/set-express-checkout-nvp/)
   * we get back the response which contains a token that we can use in the next step of the transaction.
   * The API is extensive. The options currently avialable only support the case of:
   * - One digital good
   * - In USD
   * - As a recurring payment
   * - Authorization is hardcoded as the Payment Action
   *
   * @param {<SetExpressCheckoutOptions>}
   * @return {Promise<NVPSetCheckoutResponse>}
   */
  public async setExpressCheckout(
    options: GetCheckoutTokenOptions
  ): Promise<NVPSetCheckoutResponse> {
    const decimalAmount = options.amountInCents / 100;
    const stringifiedAmount = String(decimalAmount);
    const method = PAYPAL_METHODS.SetExpressCheckout;
    const data = {
      PAYMENTREQUEST_0_AMT: stringifiedAmount,
      RETURNURL: PLACEHOLDER_URL,
      CANCELURL: PLACEHOLDER_URL,
      NOSHIPPING: '1',
      SOLUTIONTYPE: 'Sole',
      PAYMENTREQUEST_0_ITEMAMT: stringifiedAmount,
      L_PAYMENTREQUEST_0_ITEMCATEGORY0: 'Digital',
      L_PAYMENTREQUEST_0_NAME0: options.itemName,
      L_PAYMENTREQUEST_0_AMT0: stringifiedAmount,
      L_PAYMENTREQUEST_0_QTY0: '1',
      L_BILLINGTYPE0: 'RecurringPayments',
      L_BILLINGAGREEMENTDESCRIPTION0: options.itemDescription,
    };
    return (await this.doRequest(method, data)) as NVPSetCheckoutResponse;
  }
}
