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

  it('should be defined', async () => {
    expect(mockCurrencyManager).toBeDefined();
    expect(mockCurrencyManager).toBeInstanceOf(CurrencyManager);
  });

  describe('assertCurrencyCompatibleWithCountry', () => {
    const validCountry = faker.helpers.arrayElement(
      Object.values(CURRENCIES_TO_COUNTRIES.USD)
    );
    const validCurrency = 'USD';

    it('returns true when currency to country are valid', () => {
      const result = mockCurrencyManager.assertCurrencyCompatibleWithCountry(
        validCurrency,
        validCountry
      );

      expect(result).toBeTruthy();
    });

    it('throws an error when currency is invalid', () => {
      try {
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          null,
          validCountry
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CurrencyCodeInvalidError);
      }
    });

    it('throws an error when country is invalid', () => {
      const countryCode = faker.location.countryCode('alpha-3');

      try {
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          validCurrency,
          countryCode
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CountryCodeInvalidError);
      }
    });

    it('throws an error when currency to country do not match', () => {
      const currencyCode = 'EUR';

      try {
        mockCurrencyManager.assertCurrencyCompatibleWithCountry(
          currencyCode,
          validCountry
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CurrencyCountryMismatchError);
      }
    });
  });
});
