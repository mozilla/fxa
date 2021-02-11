/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const { CurrencyHelper } = require('../../../lib/payments/currencies');

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
