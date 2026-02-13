/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import { FinishErrorCart, SetupCart, UpdateCart } from './cart.types';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

/**
 * CartError is not intended for direct use, except for type-checking errors.
 * When throwing a new CartError, create a unique extension of the class.
 */
export class CartError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, {
      info,
      cause,
    });
    this.name = 'CartError';
  }
}

export class CartNotCreatedError extends CartError {
  constructor(setupCart: SetupCart, cause: Error) {
    super('Cart not created', { setupCart }, cause);
    this.name = 'CartNotCreatedError';
  }
}

export class ErrorCartNotCreatedError extends CartError {
  constructor(setupCart: SetupCart, cause: Error) {
    super('Error cart not created', { setupCart }, cause);
    this.name = 'ErrorCartNotCreatedError';
  }
}

export class CartNotFoundError extends CartError {
  constructor(cartId: string, cause: Error) {
    super('Cart not found', { cartId }, cause);
    this.name = 'CartNotFoundError';
  }
}

export class CartVersionMismatchError extends CartError {
  constructor(cartId: string) {
    super('Cart version mismatch', { cartId });
    this.name = 'CartVersionMismatchError';
  }
}

export class CartNotUpdatedError extends CartError {
  constructor(cartId: string) {
    super('Cart not updated', {
      cartId,
    });
    this.name = 'CartNotUpdatedError';
  }
}

export class CartCouldNotRetrievePriceForCurrencyWhenAttemptingToGetCartCartError extends CartError {
  constructor(
    cartId: string,
    cartInterval: string,
    offeringId: string,
    cartCurrency: string,
    priceId: string
  ) {
    super(
      'Cart could not retrieve price for currency when attempting to getCart',
      {
        cartId,
        cartInterval,
        offeringId,
        cartCurrency,
        priceId,
      }
    );
    this.name =
      'CartCouldNotRetrievePriceForCurrencyWhenAttemptingToGetCartCartError';
  }
}

export class UpdateFreshCartFailedError extends CartError {
  constructor(cartId: string, items: UpdateCart, cause?: Error) {
    super(
      'Update fresh cart failed',
      {
        cartId,
        items,
      },
      cause
    );
    this.name = 'UpdateFreshCartFailedError';
  }
}

export class FinishCartFailedError extends CartError {
  constructor(cartId: string, version: number, cause?: Error) {
    super(
      'Finish cart failed',
      {
        cartId,
        version,
      },
      cause
    );
    this.name = 'FinishCartFailedError';
  }
}

export class FinishErrorCartFailedError extends CartError {
  constructor(cartId: string, items: FinishErrorCart, cause?: Error) {
    super(
      'Finish error cart failed',
      {
        cartId,
        items,
      },
      cause
    );
    this.name = 'FinishErrorCartFailedError';
  }
}

export class SetNeedsInputCartFailedError extends CartError {
  constructor(cartId: string, cause?: Error) {
    super(
      'Set needs input cart failed',
      {
        cartId,
      },
      cause
    );
    this.name = 'SetNeedsInputCartFailedError';
  }
}

export class SetProcessingCartFailedError extends CartError {
  constructor(cartId: string, cause?: Error) {
    super(
      'Set processing cart failed',
      {
        cartId,
      },
      cause
    );
    this.name = 'SetProcessingCartFailedError';
  }
}

export class DeleteCartFailedError extends CartError {
  constructor(cartId: string, cause?: Error) {
    super(
      'Delete cart failed',
      {
        cartId,
      },
      cause
    );
    this.name = 'DeleteCartFailedError';
  }
}

export class CartStateProcessingError extends CartError {
  constructor(message: string, cartId: string, cause: Error) {
    super(message, { cartId }, cause);
    this.name = 'CartStateProcessingError';
  }
}

export class UpdateStripeProcessingCartError extends CartStateProcessingError {
  constructor(cartId: string, cause: Error) {
    super(
      'Stripe checkout cart state not changed to processing',
      cartId,
      cause
    );
    this.name = 'UpdateStripeProcessingCartError';
  }
}

export class UpdatePayPalProcessingCartError extends CartStateProcessingError {
  constructor(cartId: string, cause: Error) {
    super(
      'PayPal checkout cart state not changed to processing',
      cartId,
      cause
    );
    this.name = 'UpdatePayPalProcessingCartError';
  }
}

export class CartNotDeletedError extends CartError {
  constructor(cartId: string) {
    super('Cart not deleted', { cartId });
    this.name = 'CartNotDeletedError';
  }
}

export class CartInvalidStateForActionError extends CartError {
  constructor(cartId: string, state: CartState, action: string) {
    super('Invalid state for executed action', {
      cartId,
      state,
      action,
    });
    this.name = 'CartInvalidStateForActionError';
  }
}

export class CartTotalMismatchError extends CartError {
  constructor(cartId: string, cartAmount: number, invoiceAmount: number) {
    super('Cart total mismatch', { cartId, cartAmount, invoiceAmount });
    this.name = 'CartTotalMismatchError';
  }
}

export class CartEligibilityMismatchError extends CartError {
  constructor(
    cartId: string,
    cartEligibility: CartEligibilityStatus,
    incomingEligibility: CartEligibilityStatus
  ) {
    super('Cart eligibility mismatch', {
      cartId,
      cartEligibility,
      incomingEligibility,
    });
    this.name = 'CartEligibilityMismatchError';
  }
}

export class CartAccountNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart account not found for uid', {
      cartId,
    });
    this.name = 'CartAccountNotFoundError';
  }
}

export class CartUidNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart uid not found', {
      cartId,
    });
    this.name = 'CartUidNotFoundError';
  }
}

export class InvalidPromoCodeCartError extends CartError {
  constructor(
    message: string,
    promoCode: string,
    offeringConfigId: string,
    cause: Error,
    cartId?: string
  ) {
    super(
      message,
      {
        cartId,
        offeringConfigId,
        promoCode,
      },
      cause
    );
    this.name = 'InvalidPromoCodeCartError';
  }
}

export class CartSetupInvalidPromoCodeError extends InvalidPromoCodeCartError {
  constructor(promoCode: string, offeringConfigId: string, cause: Error) {
    super(
      'Cart specified promo code does not exist in cart setup',
      promoCode,
      offeringConfigId,
      cause
    );
    this.name = 'CartSetupInvalidPromoCodeError';
  }
}

export class CartRestartInvalidPromoCodeError extends InvalidPromoCodeCartError {
  constructor(
    promoCode: string,
    offeringConfigId: string,
    cause: Error,
    cartId?: string
  ) {
    super(
      'Cart specified promo code does not exist in cart restart',
      promoCode,
      offeringConfigId,
      cause,
      cartId
    );
    this.name = 'CartRestartInvalidPromoCodeError';
  }
}

export class CartCurrencyNotFoundError extends CartError {
  constructor(
    message: string,
    currency?: string,
    country?: string,
    cartId?: string
  ) {
    super(message, {
      cartId,
      currency,
      country,
    });
    this.name = 'CartCurrencyNotFoundError';
  }
}

export class PrepayCartCurrencyNotFoundError extends CartCurrencyNotFoundError {
  constructor(currency?: string, country?: string, cartId?: string) {
    super(
      'Cart currency could not be determined during prepay steps',
      currency,
      country,
      cartId
    );
    this.name = 'PrepayCartCurrencyNotFoundError';
  }
}

export class SetupCartCurrencyNotFoundError extends CartCurrencyNotFoundError {
  constructor(currency?: string, country?: string) {
    super('Cart currency could not be determined in setup', currency, country);
    this.name = 'SetupCartCurrencyNotFoundError';
  }
}

export class UpdateCartCurrencyNotFoundError extends CartCurrencyNotFoundError {
  constructor(currency?: string, country?: string, cartId?: string) {
    super(
      'Cart currency could not be determined in update',
      currency,
      country,
      cartId
    );
    this.name = 'UpdateCartCurrencyNotFoundError';
  }
}

export class PrePayCartCurrencyNotFoundError extends CartCurrencyNotFoundError {
  constructor(currency?: string, country?: string, cartId?: string) {
    super(
      'Cart currency could not be determined in prepayment',
      currency,
      country,
      cartId
    );
    this.name = 'PrePayCartCurrencyNotFoundError';
  }
}

export class CartNoTaxAddressError extends CartError {
  constructor(cartId: string) {
    super('Cart tax address not found', {
      cartId,
    });
    this.name = 'CartNoTaxAddressError';
  }
}

export class CartIntentNotFoundError extends CartError {
  constructor(cartId: string) {
    super('Cart payment or setup intent not found', {
      cartId,
    });
    this.name = 'CartIntentNotFoundError';
  }
}

export class GetCartMissingTaxAddressError extends CartError {
  constructor(cartId: string) {
    super('Cart must have a tax address', { cartId });
    this.name = 'GetCartMissingTaxAddressError';
  }
}

export class GetCartFailureFromPriceMissingError extends CartError {
  constructor(cartId: string) {
    super('fromPrice not present for upgrade cart', { cartId });
    this.name = 'GetCartFailureFromPriceMissingError';
  }
}

export class GetCartFromPriceMissingError extends CartError {
  constructor(cartId: string) {
    super('fromPrice not present for upgrade cart', { cartId });
    this.name = 'GetCartFromPriceMissingError';
  }
}

export class GetCartCustomerMissingError extends CartError {
  constructor(cartId: string) {
    super('Customer is required for upgrade', { cartId });
    this.name = 'GetCartCustomerMissingError';
  }
}

export class GetCartSubscriptionMissingError extends CartError {
  constructor(cartId: string) {
    super('Subscription required', { cartId });
    this.name = 'GetCartSubscriptionMissingError';
  }
}

export class GetCartLatestInvoicePreviewMissingError extends CartError {
  constructor(cartId: string) {
    super('latestInvoicePreview not present for success cart', { cartId });
    this.name = 'GetCartLatestInvoicePreviewMissingError';
  }
}

export class GetCartPaymentInfoMissingError extends CartError {
  constructor(cartId: string) {
    super('PaymentInfo not present for success cart', { cartId });
    this.name = 'GetCartPaymentInfoMissingError';
  }
}

export class GetCartIntervalMissingError extends CartError {
  constructor(cartId: string) {
    super('Interval not found but is required', { cartId });
    this.name = 'GetCartIntervalMissingError';
  }
}

export class GetCartUnitAmountForCurrencyMissingError extends CartError {
  constructor(cartId: string) {
    super('Unit amount for currency is required', { cartId });
    this.name = 'GetCartUnitAmountForCurrencyMissingError';
  }
}

export class GetCartPriceForCurrencyRecurringMissingError extends CartError {
  constructor(cartId: string) {
    super('Price for currency recurring is required', { cartId });
    this.name = 'GetCartPriceForCurrencyRecurringMissingError';
  }
}

export class SubmitNeedsInputCustomerIdMissingError extends CartError {
  constructor(cartId: string) {
    super('Cart must have a stripeCustomerId', { cartId });
    this.name = 'SubmitNeedsInputCustomerIdMissingError';
  }
}

export class SubmitNeedsInputSubscriptionIdMissingError extends CartError {
  constructor(cartId: string) {
    super('Cart must have a stripeSubscriptionId', { cartId });
    this.name = 'SubmitNeedsInputSubscriptionIdMissingError';
  }
}

export class SubmitNeedsInputUidMissingError extends CartError {
  constructor(cartId: string) {
    super('Cart must have a uid', { cartId });
    this.name = 'SubmitNeedsInputUidMissingError';
  }
}

export class CartSubscriptionNotFoundError extends CartError {
  constructor(message: string, cartId: string, subscriptionId?: string) {
    super(message, {
      cartId,
      subscriptionId,
    });
    this.name = 'CartSubscriptionNotFoundError';
  }
}

export class GetCartSubscriptionIdCartError extends CartSubscriptionNotFoundError {
  constructor(cartId: string) {
    super('Get cart missing subscription id', cartId);
    this.name = 'GetCartSubscriptionIdCartError';
  }
}

export class FinalizeWithoutSubscriptionIdCartError extends CartSubscriptionNotFoundError {
  constructor(cartId: string) {
    super('Cart missing subscription id in finalization', cartId);
    this.name = 'FinalizeWithoutSubscriptionIdCartError';
  }
}

export class FinalizeWithoutSubscriptionCartError extends CartSubscriptionNotFoundError {
  constructor(cartId: string, subscriptionId: string) {
    super(
      'Cart subscription id has no matching subscription',
      cartId,
      subscriptionId
    );
    this.name = 'FinalizeWithoutSubscriptionCartError';
  }
}

export class GetInputWithoutSubscriptionIdCartError extends CartSubscriptionNotFoundError {
  constructor(cartId: string) {
    super('Cart missing subscription id in finalization', cartId);
    this.name = 'GetInputWithoutSubscriptionIdCartError';
  }
}

export class GetInputWithoutSubscriptionCartError extends CartSubscriptionNotFoundError {
  constructor(cartId: string, subscriptionId: string) {
    super(
      'Cart subscription id has no matching subscription',
      cartId,
      subscriptionId
    );
    this.name = 'GetInputWithoutSubscriptionCartError';
  }
}

export class PaidInvoiceOnFailedCartError extends CartError {
  constructor(
    cartId: string,
    invoiceId: string,
    cause: Error,
    stripeCustomerId?: string
  ) {
    super(
      'Paid invoice found on failed cart',
      {
        cartId,
        stripeCustomerId,
        invoiceId,
      },
      cause
    );
    this.name = 'PaidInvoiceOnFailedCartError';
  }
}

export class PaidPaymentIntendOnFailedCartError extends CartError {
  constructor(
    cartId: string,
    paymentIntentId: string,
    stripeCustomerId?: string
  ) {
    super('Paid payment intent found on failed cart', {
      cartId,
      stripeCustomerId,
      paymentIntentId,
    });
    this.name = 'PaidPaymentIntendOnFailedCartError';
  }
}

export class CartSubscriptionDeletionFailedError extends CartError {
  constructor(cartId: string, subscriptionId: string, cause: Error) {
    super('Subscription deletion failed during cart cleanup', {
      cartId,
      subscriptionId,
    }, cause);
    this.name = 'CartSubscriptionDeletionFailedError';
  }
}

export class SubscriptionPaymentIntentMissingCartError extends CartError {
  constructor(cartId: string, subscriptionId: string) {
    super('Subscription on cart has no payment intent', {
      cartId,
      subscriptionId,
    });
    this.name = 'SubscriptionPaymentIntentMissingCartError';
  }
}

export class SuccessfulIntentMissingPaymentMethodCartError extends CartError {
  constructor(cartId: string, intentId: string) {
    super('Payment method required for processing needs_input cart', {
      cartId,
      customerId: intentId,
    });
    this.name = 'SuccessfulIntentMissingPaymentMethodCartError';
  }
}

export class FinalizeWithoutUidCartError extends CartError {
  constructor(cartId: string) {
    super('uid required for cart finalization', {
      cartId,
    });
    this.name = 'FinalizeWithoutUidCartError';
  }
}

export class TaxAndCurrencyRequiredCartError extends CartError {
  constructor(
    cartId: string,
    taxAddress?: {
      countryCode: string;
      postalCode: string;
    },
    currency?: string
  ) {
    super('Cart must have a tax address and currency to restart', {
      cartId,
      taxAddress,
      currency,
    });
    this.name = 'TaxAndCurrencyRequiredCartError';
  }
}

export class CartUidMismatchError extends CartError {
  constructor(cartId: string, sessionUid?: string) {
    super('Cart UID does not match session UID', {
      cartId,
      sessionUid,
    });
    this.name = 'CartUidMismatchError';
  }
}
