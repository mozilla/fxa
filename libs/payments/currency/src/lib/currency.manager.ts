/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import {
  CURRENCIES_TO_COUNTRIES,
  SUPPORTED_PAYPAL_CURRENCIES,
  VALID_COUNTRY_CODES,
  VALID_CURRENCY_CODES,
} from './currency.constants';
import {
  CurrencyCodeInvalidError,
  CountryCodeInvalidError,
  CurrencyCountryMismatchError,
} from './currency.error';
import { CurrencyConfig } from './currency.config';

@Injectable()
export class CurrencyManager {
  private taxIds: { [key: string]: string };
  constructor(private config: CurrencyConfig) {
    this.taxIds = this.config.taxIds;
  }

  /**
   * Verify that provided source country and plan currency are compatible with
   * valid currencies and countries as listed in constants
   *
   * @param currency Currency of customer
   * @param country Country of customer
   * @returns True if currency is compatible with country, else throws error
   */
  assertCurrencyCompatibleWithCountry(currency: string, country: string): void {
    if (!currency) throw new CurrencyCodeInvalidError(currency);
    if (!country) throw new CountryCodeInvalidError(country);

    if (
      !VALID_CURRENCY_CODES.includes(currency) ||
      !SUPPORTED_PAYPAL_CURRENCIES.includes(currency) ||
      !CURRENCIES_TO_COUNTRIES.hasOwnProperty(currency)
    ) {
      throw new CurrencyCodeInvalidError(currency);
    }

    if (!VALID_COUNTRY_CODES.includes(country)) {
      throw new CountryCodeInvalidError(country);
    }

    if (
      currency in CURRENCIES_TO_COUNTRIES &&
      !CURRENCIES_TO_COUNTRIES[
        currency as keyof typeof CURRENCIES_TO_COUNTRIES
      ].includes(country)
    ) {
      throw new CurrencyCountryMismatchError(currency, country);
    }
  }

  getTaxId(currency: string) {
    return this.taxIds[currency.toUpperCase()];
  }

  getCurrencyForCountry(country: string) {
    for (const [currency, countries] of Object.entries(
      this.config.currenciesToCountries
    )) {
      if (countries.includes(country)) {
        return currency;
      }
    }

    return undefined;
  }
}
