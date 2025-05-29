/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class CheckoutError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'CheckoutError';
    Object.setPrototypeOf(this, CheckoutError.prototype);
  }
}

export class CheckoutPaymentError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'CheckoutPaymentError';
    Object.setPrototypeOf(this, CheckoutPaymentError.prototype);
  }
}

export class CheckoutFailedError extends CheckoutError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'CheckoutFailedError';
    Object.setPrototypeOf(this, CheckoutFailedError.prototype);
  }
}

export class CheckoutUpgradeError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'CheckoutUpgradeError';
    Object.setPrototypeOf(this, CheckoutUpgradeError.prototype);
  }
}
