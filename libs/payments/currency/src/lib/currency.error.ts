/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class CurrencyError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'CurrencyError';
    Object.setPrototypeOf(this, CurrencyError.prototype);
  }
}

export class CurrencyCodeInvalidError extends CurrencyError {
  constructor(currency: string, cause?: Error) {
    super('Invalid currency code', {
      info: {
        currency,
      },
      cause,
    });
    this.name = 'CurrencyCodeInvalidError';
    Object.setPrototypeOf(this, CurrencyCodeInvalidError.prototype);
  }
}

export class CountryCodeInvalidError extends CurrencyError {
  constructor(country: string, cause?: Error) {
    super('Invalid country code', {
      info: {
        country,
      },
      cause,
    });
    this.name = 'CountryCodeInvalidError';
    Object.setPrototypeOf(this, CountryCodeInvalidError.prototype);
  }
}

export class CurrencyCountryMismatchError extends CurrencyError {
  constructor(currency: string, country: string, cause?: Error) {
    super('Funding source country does not match plan currency', {
      info: {
        currency,
        country,
      },
      cause,
    });
    this.name = 'CurrencyCountryMismatchError';
    Object.setPrototypeOf(this, CurrencyCountryMismatchError.prototype);
  }
}
