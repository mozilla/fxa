/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

export class AccountError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, {
      name: 'AccountError',
      cause,
    });
  }
}

export class AccountAlreadyExistsError extends AccountError {
  email: string;

  constructor(email: string) {
    super('Account already exists: ' + email);
    this.email = email;
  }
}

export class AccountNotCreatedError extends AccountError {
  email: string;

  constructor(email: string, cause: Error) {
    super('Account not created: ' + email, cause);
    this.email = email;
  }
}

export class AccountNotFoundError extends AccountError {
  accountId: string;
  constructor(accountId: string, cause: Error) {
    super('Account not found', cause);
    this.accountId = accountId;
  }
}
