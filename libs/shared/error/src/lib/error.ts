/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MultiError, VError, Options } from 'verror';

export class BaseError extends VError {
  constructor(options: Options | Error, message: string, ...params: any[]) {
    super(options, message, ...params);
  }
}

export class BaseMultiError extends MultiError {
  constructor(errors: Error[]) {
    super(errors);
  }
}

export class TypeError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}
