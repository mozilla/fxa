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

export class CouponErrorExpired extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super('The code you entered has expired.');
  }
}

export class CouponErrorGeneric extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super('An error occurred processing the code. Please try again.');
  }
}

export class CouponErrorInvalid extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super('The code you entered is invalid.');
  }
}

export class CouponErrorLimitReached extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super('The code you entered has reached its limit.');
  }
}

export class StripeNoMinimumChargeAmountAvailableError extends PaymentsCustomerError {
  constructor() {
    super('Currency does not have a minimum charge amount available.');
  }
}

export class PaymentIntentNotFoundError extends PaymentsCustomerError {
  constructor() {
    super('Payment intent not found');
  }
}

export class InvalidPaymentIntentError extends PaymentsCustomerError {
  constructor() {
    super('Invalid payment intent');
  }
}

export class InvalidInvoiceError extends PaymentsCustomerError {
  constructor(message: string) {
    super(message);
  }
}

export class StripePayPalAgreementNotFoundError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super(`PayPal agreement not found for Stripe customer ${customerId}`);
  }
}

export class PayPalPaymentFailedError extends PaymentsCustomerError {
  constructor(status?: string) {
    super(`PayPal payment failed with status ${status ?? 'undefined'}`);
  }
}
