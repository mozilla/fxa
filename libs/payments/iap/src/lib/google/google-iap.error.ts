/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class GoogleIapError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'GoogleIapError';
    Object.setPrototypeOf(this, GoogleIapError.prototype);
  }
}

export class GoogleIapTokenNotFoundError extends GoogleIapError {
  constructor(...args: ConstructorParameters<typeof GoogleIapError>) {
    super(...args);
    this.name = 'GoogleIapTokenNotFoundError';
    Object.setPrototypeOf(this, GoogleIapTokenNotFoundError.prototype);
  }
}

export class GoogleIapInvalidMessagePayloadError extends GoogleIapError {
  constructor(...args: ConstructorParameters<typeof GoogleIapError>) {
    super(...args);
    this.name = 'GoogleIapInvalidMessagePayloadError';
    Object.setPrototypeOf(this, GoogleIapInvalidMessagePayloadError.prototype);
  }
}

export class GoogleIapUnknownError extends GoogleIapError {
  constructor(...args: ConstructorParameters<typeof GoogleIapError>) {
    super(...args);
    this.name = 'GoogleIapUnknownError';
    Object.setPrototypeOf(this, GoogleIapUnknownError.prototype);
  }
}

export class GoogleIapInvalidPurchaseTokenError extends GoogleIapError {
  constructor(...args: ConstructorParameters<typeof GoogleIapError>) {
    super(...args);
    this.name = 'GoogleIapInvalidPurchaseTokenError';
    Object.setPrototypeOf(this, GoogleIapInvalidPurchaseTokenError.prototype);
  }
}

export class GoogleIapConflictError extends GoogleIapError {
  constructor(...args: ConstructorParameters<typeof GoogleIapError>) {
    super(...args);
    this.name = 'GoogleIapConflictError';
    Object.setPrototypeOf(this, GoogleIapConflictError.prototype);
  }
}
