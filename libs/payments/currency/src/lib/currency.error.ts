/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class CurrencyError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      name: 'CurrencyError',
      cause,
      info,
    });
  }
}

export class CurrencyCodeInvalidError extends CurrencyError {
  constructor(currency: string | null | undefined) {
    super('Invalid currency code', {
      currency,
    });
  }
}

export class CountryCodeInvalidError extends CurrencyError {
  constructor(country: string | null | undefined) {
    super('Invalid country code', {
      country,
    });
  }
}

export class CurrencyCountryMismatchError extends CurrencyError {
  constructor(currency: string, country: string) {
    super('Funding source country does not match plan currency', {
      currency,
      country,
    });
  }
}
