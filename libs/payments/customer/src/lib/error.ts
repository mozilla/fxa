/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class PaymentsCustomerError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, {
      cause,
    });
  }
}

export class CustomerDeletedError extends PaymentsCustomerError {
  constructor() {
    super('Customer deleted');
  }
}

export class CustomerNotFoundError extends PaymentsCustomerError {
  constructor() {
    super('Customer not found');
  }
}

export class PlanIntervalMultiplePlansError extends PaymentsCustomerError {
  constructor() {
    super('Interval has mulitple plans');
  }
}

export class PromotionCodeCouldNotBeAttachedError extends PaymentsCustomerError {
  customerId?: string;
  subscriptionId?: string;
  promotionId?: string;

  constructor(
    message: string,
    cause?: Error,
    data?: {
      customerId?: string;
      subscriptionId?: string;
      promotionId?: string;
    }
  ) {
    super(message, cause);
    this.customerId = data?.customerId;
    this.subscriptionId = data?.subscriptionId;
    this.promotionId = data?.promotionId;
  }
}

export class StripeNoMinimumChargeAmountAvailableError extends PaymentsCustomerError {
  constructor() {
    super('Currency does not have a minimum charge amount available.');
  }
}
