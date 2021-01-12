/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import querystring from 'querystring';
import superagent from 'superagent';
import pRetry from 'p-retry';

export const PAYPAL_SANDBOX_API = 'https://api-3t.sandbox.paypal.com/nvp';
export const PAYPAL_LIVE_API = 'https://api-3t.paypal.com/nvp';
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
  ): Promise<Record<string, any>> {
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
    return this.nvpToObject(result.text);
  }
}
