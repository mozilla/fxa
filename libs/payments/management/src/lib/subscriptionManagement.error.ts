/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeCustomer } from '@fxa/payments/stripe';
import { BaseError } from '@fxa/shared/error';

export class SubscriptionManagementError extends BaseError {
  constructor(message: string, info: Record<string, any>) {
    super(message, { info });
    this.name = 'SubscriptionManagementError';
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
