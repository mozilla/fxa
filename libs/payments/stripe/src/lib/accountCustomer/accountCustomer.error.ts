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
  }
}
