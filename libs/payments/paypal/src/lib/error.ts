/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NVPError, NVPErrorResponse } from './types';

// TODO: Create a dedicated error handling library in FXA-7656
export class PayPalClientError extends Error {
  public raw: string;
  public data: NVPErrorResponse;
  public errorCode: number | undefined;

  constructor(raw: string, data: NVPErrorResponse, ...params: any) {
    super(...params);
    this.name = 'PayPalClientError';
    let errors: NVPError[] = [];
    // We can get severity "Error" or "Warning" so filter for "Error" as a priority.
    if (data.L?.length) {
      errors = data.L.filter((error) => error.SEVERITYCODE === 'Error');
      if (errors.length === 0) {
        errors = [data.L[0]];
      }
    }
    this.errorCode = errors?.length ? parseInt(errors[0].ERRORCODE) : undefined;
    if (!this.message) {
      this.message = `PayPal NVP returned a non-success ACK. See "this.raw" or "this.data" for more details. PayPal error code: ${this.errorCode}`;
    }
    this.raw = raw;
    this.data = data;
  }
}
