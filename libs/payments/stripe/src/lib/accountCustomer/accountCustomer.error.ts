/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
import {
  CreateAccountCustomer,
  UpdateAccountCustomer,
} from './accountCustomer.types';

export class AccountCustomerManagerError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'AccountCustomerManagerError';
    Object.setPrototypeOf(this, AccountCustomerManagerError.prototype);
  }
}

export class AccountCustomerNotCreatedError extends AccountCustomerManagerError {
  constructor(data?: CreateAccountCustomer, cause?: Error) {
    super('AccountCustomer not created', {
      info: {
        data,
      },
      cause,
    });
    this.name = 'AccountCustomerNotCreatedError';
    Object.setPrototypeOf(this, AccountCustomerNotCreatedError.prototype);
  }
}

export class AccountCustomerNotFoundError extends AccountCustomerManagerError {
  constructor(uid: string, cause?: Error) {
    super('AccountCustomer not found', {
      info: {
        uid,
      },
      cause,
    });
    this.name = 'AccountCustomerNotFoundError';
    Object.setPrototypeOf(this, AccountCustomerNotFoundError.prototype);
  }
}

export class AccountCustomerNotUpdatedError extends AccountCustomerManagerError {
  constructor(uid: string, data?: UpdateAccountCustomer, cause?: Error) {
    super('AccountCustomer not updated', {
      info: {
        uid,
        data,
      },
      cause,
    });
    this.name = 'AccountCustomerNotUpdatedError';
    Object.setPrototypeOf(this, AccountCustomerNotUpdatedError.prototype);
  }
}

export class AccountCustomerNotDeletedError extends AccountCustomerManagerError {
  constructor(uid: string, cause?: Error) {
    super('AccountCustomer not deleted', {
      info: {
        uid,
      },
      cause,
    });
    this.name = 'AccountCustomerNotDeletedError';
    Object.setPrototypeOf(this, AccountCustomerNotDeletedError.prototype);
  }
}
