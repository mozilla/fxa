/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError, BaseMultiError } from '@fxa/shared/error';

/**
 * Thrown as a wrapper for multiple query errors
 */
export class CMSError extends BaseMultiError {
  constructor(...args: ConstructorParameters<typeof BaseMultiError>) {
    super(...args);
  }
}

export class ProductConfigError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
  }
}
