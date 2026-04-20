/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { CurrencyConfig } from './currency.config';

@Injectable()
export class CurrencyManager {
  private taxIds: { [key: string]: string };
  constructor(private config: CurrencyConfig) {
    this.taxIds = this.config.taxIds;
  }

  getTaxId(currency: string) {
    return this.taxIds[currency.toUpperCase()];
  }

  getCurrencyForCountry(country: string) {
    for (const [currency, countries] of Object.entries(
      this.config.currenciesToCountries
    )) {
      if (countries.includes(country)) {
        return currency.toLowerCase();
      }
    }

    return undefined;
  }

  getDefaultCountryForCurrency(currency: string) {
    const currencyUpper = currency.toUpperCase();
    if (
      currencyUpper in
      Object.getOwnPropertyNames(this.config.currenciesToCountries)
    ) {
      return this.config.currenciesToCountries[currencyUpper][0];
    } else {
      return undefined;
    }
  }
}
