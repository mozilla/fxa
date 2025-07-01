/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { TaxAddress } from '@fxa/payments/customer';
import { BaseError } from '@fxa/shared/error';

/**
 * CheckoutError is not intended for direct use, except for type-checking errors.
 * When throwing a new CheckoutError, create a unique extension of the class.
 */
export class CheckoutError extends BaseError {
  constructor(message: string, info: Record<string, any>) {
    super(message, { info });
    this.name = 'CheckoutError';
  }
}

export class InvalidInvoiceStateCheckoutError extends CheckoutError {
  constructor(cartId: string, invoiceId: string, invoiceState?: string) {
    super('Expected processed invoice status to be one of [paid, open]', {
      cartId,
      invoiceId,
      invoiceState,
    });
    this.name = 'InvalidInvoiceStateCheckoutError';
  }
}

export class InvalidIntentStateError extends CheckoutError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    paymentIntentState: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super(
      'Expected payment intent status to be one of [requires_action, succeeded]',
      {
        cartId,
        paymentIntentId,
        paymentIntentState,
        intentType,
      }
    );
    this.name = 'InvalidPaymentIntentStateError';
  }
}

export class SubmitNeedsInputFailedError extends CheckoutError {
  constructor(cartId: string) {
    super('payment failed while submitting user needs_input', { cartId });
    this.name = 'SubmitNeedsInputFailedError';
  }
}

export class UpgradeForSubscriptionNotFoundError extends CheckoutError {
  constructor(
    cartId: string,
    customerId: string,
    fromPriceId: string,
    toPriceId: string
  ) {
    super('Could not determine subscription for upgrade', {
      cartId,
      customerId,
      fromPriceId,
      toPriceId,
    });
    this.name = 'UpgradeForSubscriptionNotFoundError';
  }
}

export class LatestInvoiceNotFoundOnSubscriptionError extends CheckoutError {
  constructor(cartId: string, subscriptionId: string) {
    super('latest_invoice could not be found on subscription', {
      cartId,
      subscriptionId,
    });
    this.name = 'LatestInvoiceNotFoundOnSubscriptionError';
  }
}

export class PaymentMethodUpdateFailedError extends CheckoutError {
  constructor(cartId: string, customerId: string) {
    super('Failed to update customer default payment method', {
      cartId,
      customerId,
    });
    this.name = 'PaymentMethodUpdateFailedError';
  }
}

export class DetermineCheckoutAmountCustomerRequiredError extends CheckoutError {
  constructor(priceId: string, currency: string, taxAddress: TaxAddress) {
    super('Customer is required for upgrade', {
      priceId,
      currency,
      taxAddress,
    });
    this.name = 'DetermineCheckoutAmountCustomerRequiredError';
  }
}

export class DetermineCheckoutAmountSubscriptionRequiredError extends CheckoutError {
  constructor(customerId: string, fromPriceId: string) {
    super('Subscription required', {
      customerId,
      fromPriceId,
    });
    this.name = 'DetermineCheckoutAmountCustomerRequiredError';
  }
}

export class IntentFailedGenericError extends CheckoutError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    paymentIntentState: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super('Intent payment method failed with general error', {
      cartId,
      paymentIntentId,
      paymentIntentState,
      intentType,
    });
    this.name = 'IntentPaymentFailedGenericError';
  }
}

export class IntentFailedHandledError extends CheckoutError {
  constructor(message: string, info: Record<string, any>) {
    super(message, info);
    this.name = 'IntentFailedHandledError';
  }
}

export class IntentCardDeclinedError extends IntentFailedHandledError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super('Intent payment method card declined', {
      cartId,
      paymentIntentId,
      intentType,
    });
    this.name = 'IntentCardDeclinedError';
  }
}

export class IntentCardExpiredError extends IntentFailedHandledError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super('Intent payment method card expired', {
      cartId,
      paymentIntentId,
      intentType,
    });
    this.name = 'IntentCardExpiredError';
  }
}

export class IntentTryAgainError extends IntentFailedHandledError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super('Intent failed with an error where customers can try again.', {
      cartId,
      paymentIntentId,
      intentType,
    });
    this.name = 'IntentTryAgainError';
  }
}

export class IntentGetInTouchError extends IntentFailedHandledError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    intentType: 'SetupIntent' | 'PaymentIntent'
  ) {
    super(
      'Intent failed with an error requiring customers to get in touch with the payment issuer.',
      {
        cartId,
        paymentIntentId,
        intentType,
      }
    );
    this.name = 'IntentGetInTouchError';
  }
}
