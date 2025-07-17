/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * AccountCustomerError is not intended for direct use, except for type-checking errors.
 * When throwing a new AccountCustomerError, create a unique extension of the class.
 */
export class SubscriptionManagementError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'SubscriptionManagementError';
  }
}

export class AccountCustomerMissingStripeId extends SubscriptionManagementError {
  constructor(uid: string) {
    super('Found AccountCustomer is missing a Stripe customer id', { uid });
    this.name = 'AccountCustomerMissingStripeId';
  }
}

export class SetupIntentInvalidStatusError extends SubscriptionManagementError {
  constructor(setupIntentId?: string, status?: string) {
    super('ConfirmationToken failed to create successful SetupIntent', {
      setupIntentId,
      status: status ?? 'unknown',
    });
    this.name = 'SetupIntentInvalidStatusError';
  }
}
