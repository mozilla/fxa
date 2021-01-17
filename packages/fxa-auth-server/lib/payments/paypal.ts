/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { string } from '@hapi/joi';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import { NVPSetCheckoutResponse, PayPalClient } from './paypal-client';

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
   * @param {integer} amountInCents - The amount to charge in a whole number of cents e.g. $15.99 should be 1599
   * @return {string} - The token from the paypal call.
   */
  public async getCheckoutToken(amountInCents: number): Promise<string> {
    const decimalAmount = amountInCents / 100;
    const stringifiedAmount = String(decimalAmount);
    const response = await this.client.setExpressCheckout(stringifiedAmount);
    return response.TOKEN;
  }
}
