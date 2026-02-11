/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * ChurnInterventionError is not intended for direct use, except for type-checking errors.
 * When throwing a new ChurnInterventionError, create a unique extension of the class.
 */
export class ChurnInterventionError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'ChurnInterventionError';
  }
}

export class ChurnInterventionProductIdentifierMissingError extends ChurnInterventionError {
  constructor() {
    super(
      'Either stripeProductId or offeringApiIdentifier must be provided',
      {}
    );
    this.name = 'ChurnInterventionProductIdentifierMissingError';
  }
}

export class ChurnSubscriptionCustomerMismatchError extends ChurnInterventionError {
  constructor(
    uid: string,
    accountCustomer: string,
    subscriptionCustomer: string,
    subscriptionId: string
  ) {
    super('Subscription customer does not match account customer', {
      uid,
      accountCustomer,
      subscriptionCustomer,
      subscriptionId,
    });
    this.name = 'ChurnSubscriptionCustomerMismatchError';
  }
}
