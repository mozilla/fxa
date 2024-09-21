/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
import { Options } from 'verror';

export class ProfileClientError extends BaseError {
  constructor(cause: Error) {
    super('Profile Client Error', { cause });
  }
}

export class ProfileClientServiceFailureError extends BaseError {
  constructor(serviceName: string, method: string, path: string, error: Error) {
    const options: Options = {
      cause: error,
      info: {
        serviceName,
        method,
        path,
      },
    };
    super('Profile Client service failure', options);
  }
}
