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
  let mockCurrencyManager: CurrencyManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyManager],
    }).compile();

    mockCurrencyManager = module.get<CurrencyManager>(CurrencyManager);
  });

  describe('assertCurrencyCompatibleWithCountry', () => {
    const validCountry = faker.helpers.arrayElement(
      CURRENCIES_TO_COUNTRIES.USD
    );
    const validCurrency = 'USD';

    it('asserts when currency to country is valid', () => {
      mockCurrencyManager.assertCurrencyCompatibleWithCountry(
        validCurrency,
        validCountry
      );
    });

    it('throws an error when currency is invalid', () => {
      expect(() =>
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          '',
          validCountry
        )
      ).toThrow(CurrencyCodeInvalidError);
    });

    it('throws an error when country is invalid', () => {
      const countryCode = faker.location.countryCode('alpha-3');

      expect(() =>
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          validCurrency,
          countryCode
        )
      ).toThrow(CountryCodeInvalidError);
    });

    it('throws an error when currency to country do not match', () => {
      const currencyCode = 'EUR';

      expect(() =>
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          currencyCode,
          validCountry
        )
      ).toThrow(CurrencyCountryMismatchError);
    });
  });
});
