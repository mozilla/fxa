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

@Injectable()
export class CurrencyManager {
  constructor() {}

  /**
   * Verify that provided source country and plan currency are compatible with
   * valid currencies and countries as listed in constants
   *
   * @param currency Currency of customer
   * @param country Country of customer
   * @returns True if currency is compatible with country, else throws error
   */
  assertCurrencyCompatibleWithCountry(
    currency: string | null | undefined,
    country: string | null | undefined
  ): boolean {
    if (!currency) throw new CurrencyCodeInvalidError(currency);
    if (!country) throw new CountryCodeInvalidError(country);

    const currencyToCountryMap: Record<string, string[]> = {
      ...CURRENCIES_TO_COUNTRIES,
    };

    if (
      !VALID_CURRENCY_CODES.includes(currency) ||
      !SUPPORTED_PAYPAL_CURRENCIES.includes(currency) ||
      !currencyToCountryMap.hasOwnProperty(currency)
    ) {
      throw new CurrencyCodeInvalidError(currency);
    }

    if (!VALID_COUNTRY_CODES.includes(country)) {
      throw new CountryCodeInvalidError(country);
    }

    if (!currencyToCountryMap[currency].includes(country))
      throw new CurrencyCountryMismatchError(currency, country);

    return true;
  }
}
