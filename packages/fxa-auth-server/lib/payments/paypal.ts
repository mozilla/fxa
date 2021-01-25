/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import {
  PayPalClient,
  NVPDoReferenceTransactionResponse,
  DoReferenceTransactionOptions,
} from './paypal-client';

type PaypalHelperOptions = {
  log: Logger;
};

export class PayPalHelper {
  private log: Logger;
  private client: PayPalClient;
  private metrics: StatsD;

  constructor(options: PaypalHelperOptions) {
    this.log = options.log;
    this.client = Container.get(PayPalClient);
    this.metrics = Container.get(StatsD);
  }

  /**
   * Get a token authorizing transaction to move to the next stage.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   *
   */
  public async getCheckoutToken(): Promise<string> {
    const response = await this.client.setExpressCheckout();
    return response.TOKEN;
  }

  /**
   * Charge customer based on an existing Billing Agreement.
   *
   * If the call to PayPal fails, a PayPalClientError will be thrown.
   * If the call is successful, all PayPal response data is returned.
   *
   */
  public async chargeCustomer(
    options: DoReferenceTransactionOptions
  ): Promise<NVPDoReferenceTransactionResponse> {
    return await this.client.doReferenceTransaction(options);
  }
}
