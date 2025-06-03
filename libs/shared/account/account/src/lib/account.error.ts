/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

/**
 * AccountError is not intended for direct use, except for type-checking errors.
 * When throwing a new AccountError, create a unique extension of the class.
 */
export class AccountError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'AccountError';
  }
}

export class AccountAlreadyExistsError extends AccountError {
  constructor(email: string) {
    super('Account already exists', { email });
    this.name = 'AccountAlreadyExistsError';
  }
}

export class AccountNotCreatedError extends AccountError {
  constructor(email: string, cause: Error) {
    super('Account not created', { email }, cause);
    this.name = 'AccountNotCreatedError';
  }
}

export class AccountEmailRecordNotCreatedError extends AccountError {
  constructor(email: string) {
    super('Email record not created', { email });
    this.name = 'AccountEmailRecordNotCreatedError';
  }
}
