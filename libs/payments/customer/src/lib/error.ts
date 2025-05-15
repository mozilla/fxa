/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

export class PaymentsCustomerError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'PaymentsCustomerError';
    Object.setPrototypeOf(this, PaymentsCustomerError.prototype);
  }
}

export class CustomerDeletedError extends PaymentsCustomerError {
  constructor() {
    super('Customer deleted');
    this.name = 'CustomerDeletedError';
    Object.setPrototypeOf(this, CustomerDeletedError.prototype);
  }
}

export class CustomerNotFoundError extends PaymentsCustomerError {
  constructor() {
    super('Customer not found');
    this.name = 'CustomerNotFoundError';
    Object.setPrototypeOf(this, CustomerNotFoundError.prototype);
  }
}

export class PlanIntervalMultiplePlansError extends PaymentsCustomerError {
  constructor() {
    super('Interval has mulitple plans');
    this.name = 'PlanIntervalMultiplePlansError';
    Object.setPrototypeOf(this, PlanIntervalMultiplePlansError.prototype);
  }
}

export class PriceForCurrencyNotFoundError extends PaymentsCustomerError {
  constructor(priceId: string, currency: string) {
    super('Price for currency not found', { info: { priceId, currency } });
    this.name = 'PriceForCurrencyNotFoundError';
    Object.setPrototypeOf(this, PriceForCurrencyNotFoundError.prototype);
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
    },
    name?: string
  ) {
    super(message, { cause, name });
    this.customerId = data?.customerId;
    this.subscriptionId = data?.subscriptionId;
    this.promotionId = data?.promotionId;
    this.name = 'PromotionCodeCouldNotBeAttachedError';
    Object.setPrototypeOf(this, PromotionCodeCouldNotBeAttachedError.prototype);
  }
}

export class CouponErrorExpired extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super(
      'The code you entered has expired.',
      undefined,
      undefined,
      'CouponErrorExpired'
    );
    this.name = 'CouponErrorExpired';
    Object.setPrototypeOf(this, CouponErrorExpired.prototype);
  }
}

export class CouponErrorGeneric extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super(
      'An error occurred processing the code. Please try again.',
      undefined,
      undefined,
      'CouponErrorGeneric'
    );
    this.name = 'CouponErrorGeneric';
    Object.setPrototypeOf(this, CouponErrorGeneric.prototype);
  }
}

export class CouponErrorInvalid extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super(
      'The code you entered is invalid.',
      undefined,
      undefined,
      'CouponErrorInvalid'
    );
    this.name = 'CouponErrorInvalid';
    Object.setPrototypeOf(this, CouponErrorInvalid.prototype);
  }
}

export class CouponErrorLimitReached extends PromotionCodeCouldNotBeAttachedError {
  constructor() {
    super(
      'The code you entered has reached its limit.',
      undefined,
      undefined,
      'CouponErrorLimitReached'
    );
    this.name = 'CouponErrorLimitReached';
    Object.setPrototypeOf(this, CouponErrorLimitReached.prototype);
  }
}

export class StripeNoMinimumChargeAmountAvailableError extends PaymentsCustomerError {
  constructor() {
    super('Currency does not have a minimum charge amount available.');
    this.name = 'StripeNoMinimumChargeAmountAvailableError';
    Object.setPrototypeOf(
      this,
      StripeNoMinimumChargeAmountAvailableError.prototype
    );
  }
}

export class PaymentIntentNotFoundError extends PaymentsCustomerError {
  constructor() {
    super('Payment intent not found');
    this.name = 'PaymentIntentNotFoundError';
    Object.setPrototypeOf(this, PaymentIntentNotFoundError.prototype);
  }
}

export class InvalidPaymentIntentError extends PaymentsCustomerError {
  constructor() {
    super('Invalid payment intent');
    this.name = 'InvalidPaymentIntentError';
    Object.setPrototypeOf(this, InvalidPaymentIntentError.prototype);
  }
}

export class InvalidInvoiceError extends PaymentsCustomerError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInvoiceError';
    Object.setPrototypeOf(this, InvalidInvoiceError.prototype);
  }
}

export class UpgradeCustomerMissingCurrencyInvoiceError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super('Customer performing upgrade is missing currency', {
      info: {
        customerId,
      },
    });
    this.name = 'UpgradeCustomerMissingCurrencyInvoiceError';
    Object.setPrototypeOf(
      this,
      UpgradeCustomerMissingCurrencyInvoiceError.prototype
    );
  }
}

export class StripePayPalAgreementNotFoundError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super(`PayPal agreement not found for Stripe customer ${customerId}`);
    this.name = 'StripePayPalAgreementNotFoundError';
    Object.setPrototypeOf(this, StripePayPalAgreementNotFoundError.prototype);
  }
}

export class PayPalPaymentFailedError extends PaymentsCustomerError {
  constructor(status?: string) {
    super(`PayPal payment failed with status ${status ?? 'undefined'}`);
    this.name = 'PayPalPaymentFailedError';
    Object.setPrototypeOf(this, PayPalPaymentFailedError.prototype);
  }
}

export class SubscriptionItemMultipleItemsError extends PaymentsCustomerError {
  constructor(subscriptionId: string) {
    super('Multiple subscription items not supported', {
      info: { subscriptionId },
    });
    this.name = 'SubscriptionItemMultipleItemsError';
    Object.setPrototypeOf(this, SubscriptionItemMultipleItemsError.prototype);
  }
}

export class SubscriptionItemMissingItemError extends PaymentsCustomerError {
  constructor(subscriptionId: string) {
    super('Subscription item missing', { info: { subscriptionId } });
    this.name = 'SubscriptionItemMissingItemError';
    Object.setPrototypeOf(this, SubscriptionItemMissingItemError.prototype);
  }
}
