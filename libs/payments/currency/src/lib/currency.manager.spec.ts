/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { CurrencyManager } from './currency.manager';
import {
  CurrencyCodeInvalidError,
  CountryCodeInvalidError,
  CurrencyCountryMismatchError,
} from './currency.error';
import { CURRENCIES_TO_COUNTRIES } from './currency.constants';

describe('CurrencyManager', () => {
  let currencyManager: CurrencyManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyManager],
    }).compile();

    currencyManager = module.get<CurrencyManager>(CurrencyManager);
  });

  describe('assertCurrencyCompatibleWithCountry', () => {
    const validCountry = faker.helpers.arrayElement(
      CURRENCIES_TO_COUNTRIES.USD
    );
    const validCurrency = 'USD';

    it('asserts when currency to country is valid', () => {
      currencyManager.assertCurrencyCompatibleWithCountry(
        validCurrency,
        validCountry
      );
    });

    it('throws an error when currency is invalid', () => {
      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry('', validCountry)
      ).toThrow(CurrencyCodeInvalidError);
    });

    it('throws an error when country is invalid', () => {
      const countryCode = faker.location.countryCode('alpha-3');

      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry(
          validCurrency,
          countryCode
        )
      ).toThrow(CountryCodeInvalidError);
    });

    it('throws an error when currency to country do not match', () => {
      const currencyCode = 'EUR';

      expect(() =>
        currencyManager.assertCurrencyCompatibleWithCountry(
          currencyCode,
          validCountry
        )
      ).toThrow(CurrencyCountryMismatchError);
    });
  });
});
