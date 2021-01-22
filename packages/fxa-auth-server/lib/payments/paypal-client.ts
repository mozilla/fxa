/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import pRetry from 'p-retry';
import querystring from 'querystring';
import superagent from 'superagent';

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

export type PAYPAL_METHODS =
  | 'BillAgreementUpdate'
  | 'CreateBillingAgreement'
  | 'DoReferenceTransaction'
  | 'GetTransactionDetails'
  | 'SetExpressCheckout'
  | 'TransactionSearch';

/*
 * Common response fields
 * https://developer.paypal.com/docs/nvp-soap-api/NVPAPIOverview/#common-response-fields
 */

export type PAYPAL_NVP_ACK_OPTIONS =
  | 'Success'
  | 'SuccessWithWarning'
  | 'Failure'
  | 'FailureWithWarning';

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

  private async doRequest<T extends NVPResponse>(
    method: PAYPAL_METHODS,
    data: Record<string, any>
  ): Promise<T> {
    const payload = this.objectToNVP({
      ...data,
      USER: this.user,
      METHOD: method,
      PWD: this.pwd,
      SIGNATURE: this.signature,
      VERSION: PAYPAL_VERSION,
    });
    const result = await pRetry(
      () =>
        superagent
          .post(this.url)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(payload),
      this.retryOptions
    );
    const resultObj = this.nvpToObject(result.text) as T;
    if (resultObj.ACK === 'Success' || resultObj.ACK === 'SuccessWithWarning') {
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
   * The API is extensive. Currently this method only supports the situation where you're getting an authorizing
   * token that allows us to perform billing in the future.
   */
  public async setExpressCheckout(): Promise<NVPSetCheckoutResponse> {
    const data = {
      PAYMENTREQUEST_0_AMT: '0',
      RETURNURL: PLACEHOLDER_URL,
      CANCELURL: PLACEHOLDER_URL,
      L_BILLINGTYPE0: 'MerchantInitiatedBilling',
    };
    return await this.doRequest<NVPSetCheckoutResponse>(
      'SetExpressCheckout',
      data
    );
  }
}
