/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * CurrencyError is not intended for direct use, except for type-checking errors.
 * When throwing a new CurrencyError, create a unique extension of the class.
 */
export class CurrencyError extends BaseError {
  constructor(name: string, info: Record<string, any>, cause?: Error) {
    super(name, { info, cause });
    this.name = 'CurrencyError';
  }
}

export class CurrencyCodeInvalidError extends CurrencyError {
  constructor(currency: string) {
    super('Invalid currency code', {
      currency,
    });
    this.name = 'CurrencyCodeInvalidError';
  }
}

export class CountryCodeInvalidError extends CurrencyError {
  constructor(country: string) {
    super('Invalid country code', {
      country,
    });
    this.name = 'CountryCodeInvalidError';
  }
}

export class CountryCodeMissingError extends CurrencyError {
  constructor() {
    super('Country code is required', {});
    this.name = 'CountryCodeMissingError';
  }
}

export class CurrencyCodeMissingError extends CurrencyError {
  constructor() {
    super('Currency code is required', {});
    this.name = 'CurrencyCodeMissingError';
  }
}

export class CurrencyCountryMismatchError extends CurrencyError {
  constructor(currency: string, country: string) {
    super('Funding source country does not match plan currency', {
      currency,
      country,
    });
    this.name = 'CurrencyCountryMismatchError';
  }
}
