/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient, StripePrice } from '@fxa/payments/stripe';
import { PlanIntervalMultiplePlansError } from './error';
import { SubplatInterval } from './types';
import { doesPriceMatchSubplatInterval } from './util/doesPriceMatchSubplatInterval';

@Injectable()
export class PriceManager {
  constructor(private stripeClient: StripeClient) {}

  async retrieve(priceId: string) {
    const price = await this.stripeClient.pricesRetrieve(priceId);
    return price;
  }

  async retrieveByInterval(priceIds: string[], interval: SubplatInterval) {
    const prices: StripePrice[] = [];
    for (const priceId of priceIds) {
      const price = await this.retrieve(priceId);
      if (doesPriceMatchSubplatInterval(price, interval)) {
        prices.push(price);
      }
    }
    if (prices.length > 1) throw new PlanIntervalMultiplePlansError();
    return prices.at(0);
  }
}
