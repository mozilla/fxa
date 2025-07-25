/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeCustomer } from '@fxa/payments/stripe';
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

export class SubscriptionContentMissingIntervalInformationError extends SubscriptionManagementError {
  constructor(subscriptionId: string, priceId: string) {
    super(
      'Subscription interval and/or interval count missing from subscription',
      {
        subscriptionId,
        priceId,
      }
    );
    this.name = 'SubscriptionContentMissingIntervalInformationError';
  }
}

export class SubscriptionContentMissingLatestInvoicePreviewError extends SubscriptionManagementError {
  constructor(subscriptionId: string, latestInvoiceId: string) {
    super('Subscription is missing latest invoice preview', {
      subscriptionId,
      latestInvoiceId,
    });
    this.name = 'SubscriptionContentMissingLatestInvoicePreviewError';
  }
}

export class SubscriptionContentMissingLatestInvoiceError extends SubscriptionManagementError {
  constructor(subscriptionId: string) {
    super('Subscription is missing latest invoice', {
      subscriptionId,
    });
    this.name = 'SubscriptionContentMissingLatestInvoiceError';
  }
}

export class SubscriptionContentMissingUpcomingInvoicePreviewError extends SubscriptionManagementError {
  constructor(
    subscriptionId: string,
    priceId: string,
    currency: string,
    customer: StripeCustomer
  ) {
    super('Subscription is missing latest invoice preview', {
      subscriptionId,
      priceId,
      currency,
      customer,
    });
    this.name = 'SubscriptionContentMissingUpcomingInvoicePreviewError';
  }
}

export class SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError extends SubscriptionManagementError {
  constructor(priceIds: string[]) {
    super('Could not retrieve product names from CMS', {
      priceIds,
    });
    this.name =
      'SubscriptionManagementCouldNotRetrieveProductNamesFromCMSError';
  }
}
