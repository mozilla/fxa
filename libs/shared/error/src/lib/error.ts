/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MultiError, VError } from 'verror';

export class BaseError extends VError {}

export class BaseMultiError extends MultiError {}

export class TypeError extends BaseError {
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
