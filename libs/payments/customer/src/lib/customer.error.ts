/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';

/**
 * CustomerError is not intended for direct use, except for type-checking errors.
 * When throwing a new CustomerError, create a unique extension of the class.
 */
export class CustomerError extends BaseError {
  constructor(message: string, info: Record<string, any>) {
    super(message, { info });
    this.name = 'CustomerError';
  }
}

export class CustomerDeletedError extends CustomerError {
  constructor(customerId: string) {
    super('Customer deleted', { customerId });
    this.name = 'CustomerDeletedError';
  }
}

export class PlanIntervalMultiplePlansError extends CustomerError {
  constructor(priceIds: string[], interval: string) {
    super('Interval has mulitple plans', { priceIds, interval });
    this.name = 'PlanIntervalMultiplePlansError';
  }
}

export class PriceForCurrencyNotFoundError extends CustomerError {
  constructor(priceId: string, currency: string) {
    super('Price for currency not found', { priceId, currency });
    this.name = 'PriceForCurrencyNotFoundError';
  }
}

export class SubscriptionCustomerMismatchError extends CustomerError {
  constructor(
    customerId: string,
    subscriptionCustomerId: string,
    subscriptionId: string,
  ) {
    super('Subscription customer does not match provided customer', {
      customerId,
      subscriptionCustomerId,
      subscriptionId,
    });
    this.name = 'SubscriptionCustomerMismatchError';
  }
}

export class PromotionCodeError extends CustomerError {
  constructor(message: string, info: Record<string, any>) {
    super(message, info);
    this.name = 'PromotionCodeError';
  }
}

export class PromotionCodeNotFoundError extends PromotionCodeError {
  constructor(promotionCodeId: string, priceId: string, currency: string) {
    super('PromoCode could not be found', {
      promotionCodeId,
      priceId,
      currency,
    });
    this.name = 'PromotionCodeNotFoundError';
  }
}

export class PromotionCodeSubscriptionInactiveError extends PromotionCodeError {
  constructor(
    subscriptionId: string,
    promotionCodeId: string,
    customerId: string
  ) {
    super('Cannot attach promo code to inactive subscription', {
      subscriptionId,
      promotionCodeId,
      customerId,
    });
    this.name = 'PromotionCodeSubscriptionInactiveError';
  }
}

export class PromotionCodeCustomerSubscriptionMismatchError extends PromotionCodeError {
  constructor(
    customerId: string,
    subscriptionId: string,
    subscriptionCustomerId: string,
    promotionCodeId: string
  ) {
    super('subscription.customerId does not match passed in customerId', {
      customerId,
      subscriptionId,
      subscriptionCustomerId,
      promotionCodeId,
    });
    this.name = 'PromotionCodeCustomerSubscriptionMismatchError';
  }
}

export class PromotionCodePriceNotValidError extends PromotionCodeError {
  constructor(promotionId: string, priceId: string, productId?: string) {
    super(
      "Promotion code restricted to a product that doesn't match the product on this subscription",
      { promotionId, priceId, productId }
    );
    this.name = 'PromotionCodePriceNotValidError';
  }
}

export class UniqueSubscriptionItemNotFoundError extends PromotionCodeError {
  constructor(subscriptionId: string) {
    super('No price item found on subscription', { subscriptionId });
    this.name = 'SubscriptionItemNotFoundError';
  }
}

export class PromotionCodeCouldNotBeAttachedError extends PromotionCodeError {
  constructor(
    cause?: Error,
    customerId?: string,
    subscriptionId?: string,
    promotionId?: string
  ) {
    super('Promotion code could not be attached to subscription', {
      cause,
      customerId,
      subscriptionId,
      promotionId,
    });
    this.name = 'PromotionCodeCouldNotBeAttachedError';
  }
}

export class PromotionCodeSanitizedError extends PromotionCodeError {
  constructor(message: string, code: string) {
    super(message, { name: code });
    this.name = 'PromotionCodeGenericError';
  }
}

export class CouponErrorCannotRedeem extends PromotionCodeSanitizedError {
  constructor() {
    super(
      'The code you entered cannot be applied — your account has a previous subscription to one of our services.',
      'CouponErrorCannotRedeem'
    );
    this.name = 'CouponErrorCannotRedeem';
  }
}

export class CouponErrorExpired extends PromotionCodeSanitizedError {
  constructor() {
    super('The code you entered has expired.', 'CouponErrorExpired');
    this.name = 'CouponErrorExpired';
  }
}

export class CouponErrorGeneric extends PromotionCodeSanitizedError {
  constructor() {
    super(
      'An error occurred processing the code. Please try again.',
      'CouponErrorGeneric'
    );
    this.name = 'CouponErrorGeneric';
  }
}

export class CouponErrorInvalidCode extends PromotionCodeSanitizedError {
  constructor() {
    super('The code you entered is invalid.', 'CouponErrorInvalidCode');
    this.name = 'CouponErrorInvalidCode';
  }
}

export class CouponErrorInvalidCurrency extends PromotionCodeSanitizedError {
  constructor() {
    super(
      'The code you entered is invalid for this currency.',
      'CouponErrorInvalidCurrency'
    );
    this.name = 'CouponErrorInvalidCurrency';
  }
}

export class CouponErrorLimitReached extends PromotionCodeSanitizedError {
  constructor() {
    super(
      'The code you entered has reached its limit.',
      'CouponErrorLimitReached'
    );
    this.name = 'CouponErrorLimitReached';
  }
}

export class StripeNoMinimumChargeAmountAvailableError extends CustomerError {
  constructor(currency: string) {
    super('Currency does not have a minimum charge amount available.', {
      currency,
    });
    this.name = 'StripeNoMinimumChargeAmountAvailableError';
  }
}

export class TransactionMissingOnPaidInvoiceError extends CustomerError {
  constructor(invoiceId: string, customerId: string) {
    super('Paid invoice missing transaction id', { invoiceId, customerId });
    this.name = 'TransactionMissingOnPaidInvoiceError';
  }
}

export class InvalidInvoiceStateCustomerError extends CustomerError {
  constructor(invoiceId: string, state?: string) {
    super('Expected invoice to be in draft or open states', {
      invoiceId,
      state,
    });
    this.name = 'InvalidInvoiceStateCustomerError';
  }
}

export class UpgradeCustomerMissingCurrencyInvoiceError extends CustomerError {
  constructor(customerId: string) {
    super('Customer should have currency for upgrade', {
      customerId,
    });
    this.name = 'UpgradeCustomerMissingCurrencyInvoiceError';
  }
}

export class StripePayPalAgreementNotFoundError extends CustomerError {
  constructor(customerId: string) {
    super('PayPal agreement not found for Stripe customer', {
      customerId,
    });
    this.name = 'StripePayPalAgreementNotFoundError';
  }
}

export class PayPalPaymentFailedError extends CustomerError {
  constructor(customerId: string, status?: string) {
    super('PayPal payment failed', {
      customerId,
      status: status ?? 'undefined',
    });
    this.name = 'PayPalPaymentFailedError';
  }
}

export class SetupIntentCancelInvalidStatusError extends CustomerError {
  constructor(setupIntentId: string, setupIntentStatus: string) {
    super('Setup Intent can not be canceled due to invalid status.', {
      setupIntentId,
      setupIntentStatus,
    });
    this.name = 'SetupIntentCancelInvalidStatusError';
  }
}

export class SubscriptionItemMultipleItemsError extends CustomerError {
  constructor(subscriptionId: string, subscriptionItems: string[]) {
    super('Multiple subscription items not supported', {
      subscriptionId,
      subscriptionItems,
    });
    this.name = 'SubscriptionItemMultipleItemsError';
  }
}

export class SubscriptionItemMissingItemError extends CustomerError {
  constructor(subscriptionId: string) {
    super('Subscription item missing', { subscriptionId });
    this.name = 'SubscriptionItemMissingItemError';
  }
}
