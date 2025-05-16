/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeClient, StripePrice } from '@fxa/payments/stripe';
import { PlanIntervalMultiplePlansError, PriceForCurrencyNotFoundError } from './error';
import { SubplatInterval, type PricingForCurrency } from './types';
import { doesPriceMatchSubplatInterval } from './util/doesPriceMatchSubplatInterval';
import { determinePriceUnitAmount } from './util/determinePriceUnitAmount';

@Injectable()
export class PriceManager {
  constructor(private stripeClient: StripeClient) { }

  async retrieve(priceId: string) {
    const price = await this.stripeClient.pricesRetrieve(priceId);
    return price;
  }

  async retrievePricingForCurrency(priceId: string, currency: string): Promise<PricingForCurrency> {
    const stripeCurrency = currency.toLowerCase();
    const price = await this.retrieve(priceId);

    const currencyOptionForCurrency = price.currency_options[stripeCurrency];

    if (!currencyOptionForCurrency) {
      throw new PriceForCurrencyNotFoundError(priceId, currency);
    }

    const unitAmountForCurrency = determinePriceUnitAmount(currencyOptionForCurrency)

    return {
      price,
      unitAmountForCurrency,
      currencyOptionForCurrency,
    }
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
