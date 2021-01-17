/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Joi from '@hapi/joi';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';
import { Container } from 'typedi';

import { PayPalClient } from './paypal-client';

export type GetCheckoutTokenOptions = {
  amountInCents: number;
  itemName: string;
  itemDescription: string;
};

const getCheckoutTokenOptionsSchema = Joi.object({
  amountInCents: Joi.number().required(),
  itemName: Joi.string().required(),
  itemDescription: Joi.string().required(),
});

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
   * @param {<GetCheckoutTokenOptions>} - The options for the purchase item.
   *      amountInCents (number) - The amount to charge in a whole number of cents e.g. $15.99 should be 1599
   *      itemName (string) - Item name
   *      itemDescription (string) - Item descriptiong
   * @return {string} - The token from the paypal call.
   */
  public async getCheckoutToken(
    options: GetCheckoutTokenOptions
  ): Promise<string> {
    Joi.assert(options, getCheckoutTokenOptionsSchema);
    const response = await this.client.setExpressCheckout(options);
    return response.TOKEN;
  }
}
