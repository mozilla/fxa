/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

export class CartError extends BaseError {}

// TODO - Add information about the cart that caused the errors

export class CartNotCreatedError extends CartError {
  constructor() {
    super('Cart not created');
  }
}

export class CartNotFoundError extends CartError {
  constructor() {
    super('Cart not found');
  }
}

export class CartNotUpdatedError extends CartError {
  constructor() {
    super('Cart not updated');
  }
}

export class CartStateFinishedError extends CartError {
  constructor() {
    super('Cart state is already finished');
  }
}
