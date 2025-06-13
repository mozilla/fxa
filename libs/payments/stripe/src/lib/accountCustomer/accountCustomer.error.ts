/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
import {
  CreateAccountCustomer,
  UpdateAccountCustomer,
} from './accountCustomer.types';

/**
 * AccountCustomerError is not intended for direct use, except for type-checking errors.
 * When throwing a new AccountCustomerError, create a unique extension of the class.
 */
export class AccountCustomerError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'AccountCustomerError';
  }
}

export class AccountCustomerUpdateRequiredFieldsError extends AccountCustomerError {
  constructor(uid: string) {
    super('Must provide at least one update param', { uid });
    this.name = 'AccountCustomerUpdateRequiredFieldsError';
  }
}

export class AccountCustomerNotCreatedError extends AccountCustomerError {
  constructor(data: CreateAccountCustomer, cause: Error) {
    super(
      'AccountCustomer not created',
      { createAccountCustomer: data },
      cause
    );
    this.name = 'AccountCustomerNotCreatedError';
  }
}

export class AccountCustomerNotFoundError extends AccountCustomerError {
  constructor(uid: string, cause: Error) {
    super(
      'AccountCustomer not found',
      {
        uid,
      },
      cause
    );
    this.name = 'AccountCustomerNotFoundError';
  }
}

export class AccountCustomerUpdatedNoEffectError extends AccountCustomerError {
  constructor(uid: string) {
    super('AccountCustomer update applied without changes', {
      uid,
    });
    this.name = 'AccountCustomerUpdatedNoEffectError';
  }
}

export class AccountCustomerNotUpdatedError extends AccountCustomerError {
  constructor(
    uid: string,
    updateAccountCustomer: UpdateAccountCustomer,
    cause: Error
  ) {
    super(
      'AccountCustomer not updated',
      {
        uid,
        updateAccountCustomer,
      },
      cause
    );
    this.name = 'AccountCustomerNotUpdatedError';
  }
}

export class AccountCustomerNotDeletedError extends AccountCustomerError {
  constructor(uid: string) {
    super(
      'AccountCustomer not deleted',
      {
        uid,
      }
    );
    this.name = 'AccountCustomerNotDeletedError';
  }
}

export class AccountCustomerDeleteAccountError extends AccountCustomerError {
  constructor(uid: string, cause?: Error) {
    super(
      'AccountCustomer not deleted',
      {
        uid,
      },
      cause
    );
    this.name = 'AccountCustomerNotDeletedUnexpectedError';
  }
}
