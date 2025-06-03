/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import {
  CreatePaypalCustomer,
  UpdatePaypalCustomer,
} from './paypalCustomer.types';

export class PayPalCustomerError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'PayPalCustomerError';
  }
}

export class PaypalCustomerManagerError extends PayPalCustomerError {
  constructor(uid: string, billingAgreementId: string) {
    super('Must provide at least one update param', {
      uid,
      billingAgreementId,
    });
    this.name = 'PaypalCustomerManagerError';
  }
}

export class PaypalCustomerNotCreatedError extends PayPalCustomerError {
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
export class PaypalCustomerNotFoundError extends PayPalCustomerError {
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

export class PaypalCustomerByUidNotFoundError extends PayPalCustomerError {
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

export class PaypalCustomersByBillingAgreementNotFoundError extends PayPalCustomerError {
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
export class PaypalCustomerNotUpdatedError extends PayPalCustomerError {
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

export class PaypalCustomerNoRowsUpdatedError extends PayPalCustomerError {
  constructor(uid: string, billingAgreementId: string) {
    super('PaypalCustomer not updated', {
      uid,
      billingAgreementId,
    });
    this.name = 'PaypalCustomerNoRowsUpdatedError';
  }
}

export class PaypalCustomerNotDeletedError extends PayPalCustomerError {
  constructor(uid: string, billingAgreementId: string) {
    super('PaypalCustomer not deleted', {
      uid,
      billingAgreementId,
    });
    this.name = 'PaypalCustomerNotDeletedError';
  }
}

export class PaypalCustomerDeletionFailedError extends PayPalCustomerError {
  constructor(
    uid: string,
    billingAgreementId: string,
    cause: Error | undefined
  ) {
    super(
      'PaypalCustomer not deleted',
      {
        uid,
        billingAgreementId,
      },
      cause
    );
    this.name = 'PaypalCustomerDeletionFailedError';
  }
}

export class PaypalCustomerNotDeletedByUidError extends PayPalCustomerError {
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

export class PaypalCustomerMultipleRecordsError extends PayPalCustomerError {
  constructor(uid: string, billingAgreementIds: string[]) {
    super('Multiple PaypalCustomer records', {
      uid,
      billingAgreementIds,
    });
    this.name = 'PaypalCustomerMultipleRecordsError';
  }
}
