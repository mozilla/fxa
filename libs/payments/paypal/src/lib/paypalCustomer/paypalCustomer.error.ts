/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import {
  CreatePaypalCustomer,
  UpdatePaypalCustomer,
} from './paypalCustomer.types';

/**
 * PaypalCustomerError is not intended for direct use, except for type-checking errors.
 * When throwing a new PaypalCustomerError, create a unique extension of the class.
 */
export class PaypalCustomerError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'PayPalCustomerError';
  }
}

export class PaypalCustomerManagerError extends PaypalCustomerError {
  constructor(uid: string, billingAgreementId: string) {
    super('Must provide at least one update param', {
      uid,
      billingAgreementId,
    });
    this.name = 'PaypalCustomerManagerError';
  }
}

export class PaypalCustomerNotCreatedError extends PaypalCustomerError {
  constructor(createPayPalCustomer: CreatePaypalCustomer, cause: Error) {
    super(
      'PaypalCustomer not created',
      {
        createPayPalCustomer,
      },
      cause
    );
    this.name = 'PaypalCustomerNotCreatedError';
  }
}
export class PaypalCustomerNotFoundError extends PaypalCustomerError {
  constructor(uid: string, cause: Error) {
    super(
      'PaypalCustomer not found',
      {
        uid,
      },
      cause
    );
    this.name = 'PaypalCustomerNotFoundError';
  }
}

export class PaypalCustomerByUidNotFoundError extends PaypalCustomerError {
  constructor(uid: string, cause: Error) {
    super(
      'PaypalCustomer fetch by uid not found',
      {
        uid,
      },
      cause
    );
    this.name = 'PaypalCustomerByUidNotFoundError';
  }
}

export class PaypalCustomersByBillingAgreementNotFoundError extends PaypalCustomerError {
  constructor(uid: string, cause: Error) {
    super(
      'PaypalCustomers fetch by Billing Agreement not found',
      {
        uid,
      },
      cause
    );
    this.name = 'PaypalCustomersByBillingAgreementNotFoundError';
  }
}
export class PaypalCustomerNotUpdatedError extends PaypalCustomerError {
  constructor(
    uid: string,
    billingAgreementId: string,
    data: UpdatePaypalCustomer,
    cause?: Error
  ) {
    super(
      'PaypalCustomer not updated',
      {
        uid,
        billingAgreementId,
        data,
      },
      cause
    );
    this.name = 'PaypalCustomerNotUpdatedError';
  }
}

export class PaypalCustomerNoRowsUpdatedError extends PaypalCustomerError {
  constructor(uid: string, billingAgreementId: string) {
    super('PaypalCustomer not updated', {
      uid,
      billingAgreementId,
    });
    this.name = 'PaypalCustomerNoRowsUpdatedError';
  }
}

export class PaypalCustomerDeletionError extends PaypalCustomerError {
  constructor(
    message: string,
    uid: string,
    billingAgreementId: string,
    cause?: Error
  ) {
    super(message, { uid, billingAgreementId }, cause);
    this.name = 'PaypalCustomerDeletionError';
  }
}

export class PaypalCustomerNoEntriesDeletedError extends PaypalCustomerDeletionError {
  constructor(uid: string, billingAgreementId: string) {
    super(
      'No rows affected when deleting Paypal customer',
      uid,
      billingAgreementId
    );
    this.name = 'PaypalCustomerNotDeletedError';
  }
}

export class PaypalCustomerDeletionFailedError extends PaypalCustomerDeletionError {
  constructor(uid: string, billingAgreementId: string, cause?: Error) {
    super(
      'An error occured while deleting Paypal customer',
      uid,
      billingAgreementId,
      cause
    );
    this.name = 'PaypalCustomerDeletionFailedError';
  }
}

export class PaypalCustomerNotDeletedByUidError extends PaypalCustomerError {
  constructor(uid: string, cause: Error) {
    super(
      'PaypalCustomer not deleted by uid',
      {
        uid,
      },
      cause
    );
    this.name = 'PaypalCustomerNotDeletedByUidError';
  }
}

export class PaypalCustomerMultipleRecordsError extends PaypalCustomerError {
  constructor(uid: string, billingAgreementIds: string[]) {
    super('Multiple PaypalCustomer records', {
      uid,
      billingAgreementIds,
    });
    this.name = 'PaypalCustomerMultipleRecordsError';
  }
}
