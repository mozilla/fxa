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
  }
}

export class PaypalCustomerNotCreatedError extends PaypalCustomerManagerError {
  constructor(data?: CreatePaypalCustomer, cause?: Error) {
    super('PaypalCustomer not created', {
      info: data,
      cause,
    });
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
  }
}
