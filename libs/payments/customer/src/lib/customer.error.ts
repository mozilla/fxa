/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseError } from '@fxa/shared/error';
export class PaymentsCustomerError extends BaseError {
  constructor(message: string, info: Record<string, any>) {
    super(message, { info });
    this.name = 'PaymentsCustomerError';
  }
}

export class CustomerDeletedError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super('Customer deleted', { customerId });
    this.name = 'CustomerDeletedError';
  }
}

export class PlanIntervalMultiplePlansError extends PaymentsCustomerError {
  constructor(priceIds: string[], interval: string) {
    super('Interval has mulitple plans', { priceIds, interval });
    this.name = 'PlanIntervalMultiplePlansError';
  }
}

export class PriceForCurrencyNotFoundError extends PaymentsCustomerError {
  constructor(priceId: string, currency: string) {
    super('Price for currency not found', { priceId, currency });
    this.name = 'PriceForCurrencyNotFoundError';
  }
}

export class PromotionCodeError extends PaymentsCustomerError {
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
  constructor(promotionCode: string, priceId: string, productId?: string) {
    super(
      "Promotion code restricted to a product that doesn't match the product on this subscription",
      { promotionCode, priceId, productId }
    );
    this.name = 'PromotionCodePriceNotValidError';
  }
}

export class SubscriptionItemNotFoundError extends PromotionCodeError {
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

export class StripeNoMinimumChargeAmountAvailableError extends PaymentsCustomerError {
  constructor(currency: string) {
    super('Currency does not have a minimum charge amount available.', {
      currency,
    });
    this.name = 'StripeNoMinimumChargeAmountAvailableError';
  }
}

export class PaymentIntentNotFoundError extends PaymentsCustomerError {
  constructor(subscriptionId: string) {
    super('Payment intent not found', { subscriptionId });
    this.name = 'PaymentIntentNotFoundError';
  }
}

export class InvalidPaymentIntentError extends PaymentsCustomerError {
  constructor(
    subscriptionId: string,
    paymentIntentId: string,
    paymentIntentErrorMessage?: string
  ) {
    super('Invalid payment intent', {
      subscriptionId,
      paymentIntentId,
      paymentIntentErrorMessage,
    });
    this.name = 'InvalidPaymentIntentError';
  }
}

export class TransactionMissingOnPaidInvoiceError extends PaymentsCustomerError {
  constructor(invoiceId: string, customerId: string) {
    super('Paid invoice missing transaction id', { invoiceId, customerId });
    this.name = 'TransactionMissingOnPaidInvoiceError';
  }
}

export class InvalidInvoiceStateCustomerError extends PaymentsCustomerError {
  constructor(invoiceId: string, state?: string) {
    super('Expected invoice to be in draft or open states', {
      invoiceId,
      state,
    });
    this.name = 'InvalidInvoiceStateCustomerError';
  }
}

export class UpgradeCustomerMissingCurrencyInvoiceError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super('Customer should have currency for upgrade', {
      customerId,
    });
    this.name = 'UpgradeCustomerMissingCurrencyInvoiceError';
  }
}

export class StripePayPalAgreementNotFoundError extends PaymentsCustomerError {
  constructor(customerId: string) {
    super('PayPal agreement not found for Stripe customer', {
      customerId,
    });
    this.name = 'StripePayPalAgreementNotFoundError';
  }
}

export class PayPalPaymentFailedError extends PaymentsCustomerError {
  constructor(customerId: string, status?: string) {
    super('PayPal payment failed', {
      customerId,
      status: status ?? 'undefined',
    });
    this.name = 'PayPalPaymentFailedError';
  }
}

export class SubscriptionItemMultipleItemsError extends PaymentsCustomerError {
  constructor(subscriptionId: string, subscriptionItems: string[]) {
    super('Multiple subscription items not supported', {
      subscriptionId,
      subscriptionItems,
    });
    this.name = 'SubscriptionItemMultipleItemsError';
  }
}

export class SubscriptionItemMissingItemError extends PaymentsCustomerError {
  constructor(subscriptionId: string) {
    super('Subscription item missing', { subscriptionId });
    this.name = 'SubscriptionItemMissingItemError';
  }
}
