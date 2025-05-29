/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import {
  CreatePaypalCustomer,
  UpdatePaypalCustomer,
} from './paypalCustomer.types';

export class PaypalCustomerManagerError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'PaypalCustomerManagerError';
    Object.setPrototypeOf(this, PaypalCustomerManagerError.prototype);
  }
}

export class PaypalCustomerNotCreatedError extends PaypalCustomerManagerError {
  constructor(data?: CreatePaypalCustomer, cause?: Error) {
    super('PaypalCustomer not created', {
      info: data,
      cause,
    });
    this.name = 'PaypalCustomerNotCreatedError';
    Object.setPrototypeOf(this, PaypalCustomerNotCreatedError.prototype);
  }
}

export class PaypalCustomerNotFoundError extends PaypalCustomerManagerError {
  constructor(uid: string, cause?: Error) {
    super('PaypalCustomer not found', {
      info: {
        uid,
      },
      cause,
    });
    this.name = 'PaypalCustomerNotFoundError';
    Object.setPrototypeOf(this, PaypalCustomerNotFoundError.prototype);
  }
}
export class PaypalCustomerNotUpdatedError extends PaypalCustomerManagerError {
  constructor(
    uid: string,
    billingAgreementId?: string,
    data?: UpdatePaypalCustomer,
    cause?: Error
  ) {
    super('PaypalCustomer not updated', {
      info: {
        uid,
        billingAgreementId,
        data,
      },
      cause,
    });
    this.name = 'PaypalCustomerNotUpdatedError';
    Object.setPrototypeOf(this, PaypalCustomerNotUpdatedError.prototype);
  }
}
export class PaypalCustomerNotDeletedError extends PaypalCustomerManagerError {
  constructor(uid: string, billingAgreementId: string, cause?: Error) {
    super('PaypalCustomer not deleted', {
      info: {
        uid,
        billingAgreementId,
      },
      cause,
    });
    this.name = 'PaypalCustomerNotDeletedError';
    Object.setPrototypeOf(this, PaypalCustomerNotDeletedError.prototype);
  }
}

export class PaypalCustomerMultipleRecordsError extends PaypalCustomerManagerError {
  constructor(uid: string, cause?: Error) {
    super('Multiple PaypalCustomer records', {
      info: {
        uid,
      },
      cause,
    });
    this.name = 'PaypalCustomerMultipleRecordsError';
    Object.setPrototypeOf(this, PaypalCustomerMultipleRecordsError.prototype);
  }
}
