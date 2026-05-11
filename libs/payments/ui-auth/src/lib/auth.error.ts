/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class AuthError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'AuthError';
  }
}

export class UnauthenticatedError extends AuthError {
  constructor() {
    super('Unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}
