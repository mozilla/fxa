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

export class GetAccountCustomerMissingStripeId extends SubscriptionManagementError {
  constructor(uid: string) {
    super('Retrieved AccountCustomer is missing a Stripe customer id', { uid });
    this.name = 'AccountCustomerMissingStripeId';
  }
}

export class UpdateAccountCustomerMissingStripeId extends SubscriptionManagementError {
  constructor(uid: string) {
    super('Updated AccountCustomer is missing a Stripe customer id', { uid });
    this.name = 'AccountCustomerMissingStripeId';
  }
}

export class SetDefaultPaymentAccountCustomerMissingStripeId extends SubscriptionManagementError {
  constructor(uid: string) {
    super('AccountCustomer for updating default payment method is missing a Stripe customer id', { uid });
    this.name = 'SetDefaultPaymentAccountCustomerMissingStripeId';
  }
}

export class SetupIntentInvalidStatusError extends SubscriptionManagementError {
  constructor(setupIntentId?: string, status?: string) {
    super('ConfirmationToken failed to create successful SetupIntent', {
      setupIntentId,
      status,
    });
    this.name = 'SetupIntentInvalidStatusError';
  }
}

export class SetupIntentMissingPaymentMethodError extends SubscriptionManagementError {
  constructor(
    setupIntentId?: string,
    status?: string,
    customerId?: string | null
  ) {
    super('SetupIntent created without a payment method', {
      setupIntentId,
      status,
      customerId,
    });
    this.name = 'SetupIntentMissingPaymentMethodError';
  }
}

export class SetupIntentMissingCustomerError extends SubscriptionManagementError {
  constructor(setupIntentId?: string, status?: string) {
    super('SetupIntent created without a customer', {
      setupIntentId,
      status,
    });
    this.name = 'SetupIntentMissingCustomerError';
  }
}

export class CurrencyForCustomerNotFoundError extends SubscriptionManagementError {
  constructor(stripeCustomerId: string) {
    super('Could not determine currency code for customer', {
      stripeCustomerId,
    });
    this.name = 'CurrencyForCustomerNotFoundError';
  }
}
