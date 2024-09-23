/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { CurrencyHelper } from '../../../lib/payments/currencies';

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
    assert.deepEqual(ch.currencyToCountryMap, expected);
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
    assert.equal(ch.payPalEnabled, false);
    ch = new CurrencyHelper({
      currenciesToCountries: {},
      subscriptions: payPalEnabledSubscriptionsConfig,
    });
    assert.equal(ch.payPalEnabled, true);
  });
  it('throws an error if invalid currencyCode', () => {
    const invalidCurrency = {
      ZZZZZ: ['US', 'CA'],
    };
    assert.throws(() => {
      CurrencyHelper({ currenciesToCountries: invalidCurrency });
    });
  });
  it('throws an error if invalid countryCode', () => {
    const invalidCountry = {
      AUD: ['AUS'],
    };
    assert.throws(() => {
      CurrencyHelper({ currenciesToCountries: invalidCountry });
    });
  });
  it('throws an error if countries are duplicated', () => {
    const duplicateCountriesA = {
      AUD: ['AM', 'AM'],
    };
    const duplicateCountriesB = {
      AUD: ['AM', 'US', 'CA'],
      USD: ['AM'],
    };
    assert.throws(() => {
      CurrencyHelper({ currenciesToCountries: duplicateCountriesA });
    });
    assert.throws(() => {
      CurrencyHelper({ currenciesToCountries: duplicateCountriesB });
    });
  });
  it('throws an error if currency not in paypal supported, if paypalEnabled', () => {
    const currenciesToCountries = {
      USD: ['US', 'CA'],
    };
    assert.throws(() => {
      CurrencyHelper({
        currenciesToCountries,
        subscriptions: payPalEnabledSubscriptionsConfig,
      });
    });
  });
});

describe('isCurrencyCompatibleWithCountry', () => {
  const currenciesToCountries = { EUR: ['FR', 'DE'] };
  const ch = new CurrencyHelper({ currenciesToCountries });

  it('returns true if valid', () => {
    assert(ch.isCurrencyCompatibleWithCountry('EUR', 'FR') === true);
  });

  it('returns true if valid irrespecive of case mismatch', () => {
    assert(ch.isCurrencyCompatibleWithCountry('EUr', 'FR') === true);
    assert(ch.isCurrencyCompatibleWithCountry('EUR', 'fR') === true);
  });

  it('returns false if country not in values', () => {
    assert(
      ch.isCurrencyCompatibleWithCountry('EUR', 'Not a country') === false
    );
  });

  it('returns false if currency not in keys', () => {
    assert(
      ch.isCurrencyCompatibleWithCountry('Not a currency', 'FR') === false
    );
  });
});

describe('getPayPalAmountStringFromAmountInCents', () => {
  const currenciesToCountries = { USD: ['US'], EUR: ['FR', 'DE'] };
  const ch = new CurrencyHelper({
    currenciesToCountries,
    subscriptions: payPalEnabledSubscriptionsConfig,
  });

  it('converts amount in cents to amount string', () => {
    assert.equal(ch.getPayPalAmountStringFromAmountInCents(1099), '10.99');
    assert.equal(ch.getPayPalAmountStringFromAmountInCents(9), '0.09');
    assert.equal(ch.getPayPalAmountStringFromAmountInCents(900000), '9000.00');
  });

  it('throws an error if value exceeds 9 digits', () => {
    /*
     * https://developer.paypal.com/docs/nvp-soap-api/do-reference-transaction-nvp/#payment-details-fields
     * AMT: ....Value is typically a positive number that cannot exceed nine (9) digits in SOAP request/response...
     */
    assert.equal(
      ch.getPayPalAmountStringFromAmountInCents(999999999),
      '9999999.99'
    );
    assert.throws(() => {
      ch.getPayPalAmountStringFromAmountInCents(1000000000);
    });
  });
});
