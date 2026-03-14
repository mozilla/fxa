/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/currencies.js (Mocha → Jest). */

import { CurrencyHelper } from './currencies';

const payPalEnabledSubscriptionsConfig = {
  paypalNvpSigCredentials: {
    enabled: true,
  },
};

describe('currencyMapValidation in constructor', () => {
  it('assigns map to property if object is valid', () => {
    const currenciesToCountries = {
      ZAR: ['US', 'CA'],
      EUR: ['FR'],
    };
    const expected = new Map([
      ['ZAR', ['US', 'CA']],
      ['EUR', ['FR']],
    ]);
    const ch = new CurrencyHelper({ currenciesToCountries });
    expect(ch.currencyToCountryMap).toEqual(expected);
  });

  it('assigns payPalEnabled to value in config', () => {
    let ch = new CurrencyHelper({
      currenciesToCountries: {},
      subscriptions: {
        paypalNvpSigCredentials: {
          enabled: false,
        },
      },
    });
    expect(ch.payPalEnabled).toBe(false);
    ch = new CurrencyHelper({
      currenciesToCountries: {},
      subscriptions: payPalEnabledSubscriptionsConfig,
    });
    expect(ch.payPalEnabled).toBe(true);
  });

  it('throws an error if invalid currencyCode', () => {
    const invalidCurrency = {
      ZZZZZ: ['US', 'CA'],
    };
    expect(() => {
      (CurrencyHelper as any)({ currenciesToCountries: invalidCurrency });
    }).toThrow();
  });

  it('throws an error if invalid countryCode', () => {
    const invalidCountry = {
      AUD: ['AUS'],
    };
    expect(() => {
      (CurrencyHelper as any)({ currenciesToCountries: invalidCountry });
    }).toThrow();
  });

  it('throws an error if countries are duplicated', () => {
    const duplicateCountriesA = {
      AUD: ['AM', 'AM'],
    };
    const duplicateCountriesB = {
      AUD: ['AM', 'US', 'CA'],
      USD: ['AM'],
    };
    expect(() => {
      (CurrencyHelper as any)({ currenciesToCountries: duplicateCountriesA });
    }).toThrow();
    expect(() => {
      (CurrencyHelper as any)({ currenciesToCountries: duplicateCountriesB });
    }).toThrow();
  });

  it('throws an error if currency not in paypal supported, if paypalEnabled', () => {
    const currenciesToCountries = {
      USD: ['US', 'CA'],
    };
    expect(() => {
      (CurrencyHelper as any)({
        currenciesToCountries,
        subscriptions: payPalEnabledSubscriptionsConfig,
      });
    }).toThrow();
  });
});

describe('isCurrencyCompatibleWithCountry', () => {
  const currenciesToCountries = { EUR: ['FR', 'DE'] };
  const ch = new CurrencyHelper({ currenciesToCountries });

  it('returns true if valid', () => {
    expect(ch.isCurrencyCompatibleWithCountry('EUR', 'FR')).toBe(true);
  });

  it('returns true if valid irrespective of case mismatch', () => {
    expect(ch.isCurrencyCompatibleWithCountry('EUr', 'FR')).toBe(true);
    expect(ch.isCurrencyCompatibleWithCountry('EUR', 'fR')).toBe(true);
  });

  it('returns false if country not in values', () => {
    expect(
      ch.isCurrencyCompatibleWithCountry('EUR', 'Not a country')
    ).toBe(false);
  });

  it('returns false if currency not in keys', () => {
    expect(
      ch.isCurrencyCompatibleWithCountry('Not a currency', 'FR')
    ).toBe(false);
  });
});

describe('getPayPalAmountStringFromAmountInCents', () => {
  const currenciesToCountries = { USD: ['US'], EUR: ['FR', 'DE'] };
  const ch = new CurrencyHelper({
    currenciesToCountries,
    subscriptions: payPalEnabledSubscriptionsConfig,
  });

  it('converts amount in cents to amount string', () => {
    expect(ch.getPayPalAmountStringFromAmountInCents(1099)).toBe('10.99');
    expect(ch.getPayPalAmountStringFromAmountInCents(9)).toBe('0.09');
    expect(ch.getPayPalAmountStringFromAmountInCents(900000)).toBe('9000.00');
  });

  /*
   * https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/#payment-details-fields
   * AMT: ....Value is typically a positive number that cannot exceed nine (9) digits in SOAP request/response...
   */
  it('throws an error if value exceeds 9 digits', () => {
    expect(ch.getPayPalAmountStringFromAmountInCents(999999999)).toBe(
      '9999999.99'
    );
    expect(() => {
      ch.getPayPalAmountStringFromAmountInCents(1000000000);
    }).toThrow();
  });
});
