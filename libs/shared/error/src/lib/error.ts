/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MultiError, VError, WError } from 'verror';

import { NVPErrorResponse } from '../../../../payments/paypal/src';

export class TypeError extends VError {
  constructor(message: string, cause?: Error) {
    super(
      {
        name: 'TypeError',
        ...(cause && { cause }),
      },
      message
    );
  }
}

export class ContentfulClientError extends VError {
  constructor(message: string, cause?: Error) {
    super(
      {
        name: 'ContentfulClientError',
        ...(cause && { cause }),
      },
      message
    );
  }
}

export class PayPalClientError extends MultiError {
  public raw: string;
  public data: NVPErrorResponse;

  constructor(errors: PayPalNVPError[], raw: string, data: NVPErrorResponse) {
    super(errors);
    this.name = 'PayPalClientError';
    this.raw = raw;
    this.data = data;
  }

  getPrimaryError(): PayPalNVPError {
    // TS is not picking up the type otherwise, so have to cast.
    return this.errors()[0] as PayPalNVPError;
  }

  static hasPayPalNVPError(err: Error | PayPalClientError): boolean {
    return (
      err instanceof PayPalClientError &&
      err.getPrimaryError() instanceof PayPalNVPError
    );
  }
}

export class PayPalNVPError extends VError {
  public raw: string;
  public data: NVPErrorResponse;
  public errorCode: number;

  constructor(raw: string, data: NVPErrorResponse, params: any) {
    const { message, cause, errorCode } = params;
    super(
      {
        name: 'PayPalNVPError',
        ...(cause && { cause }),
      },
      message
    );
    this.raw = raw;
    this.data = data;
    this.errorCode = errorCode;
  }
}

export { MultiError };
