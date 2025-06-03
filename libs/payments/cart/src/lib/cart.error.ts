/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';
import { SetupCart } from './cart.types';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

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
    cartId?: string
  ) {
    super(message, {
      cartId,
      offeringConfigId,
      promoCode,
    });
    this.name = 'InvalidPromoCodeCartError';
  }
}

export class CartSetupInvalidPromoCodeError extends InvalidPromoCodeCartError {
  constructor(promoCode: string, offeringConfigId: string) {
    super(
      'Cart specified promo code does not exist in cart setup',
      promoCode,
      offeringConfigId
    );
    this.name = 'CartSetupInvalidPromoCodeError';
  }
}

export class CartRestartInvalidPromoCodeError extends InvalidPromoCodeCartError {
  constructor(promoCode: string, offeringConfigId: string, cartId?: string) {
    super(
      'Cart specified promo code does not exist in cart restart',
      promoCode,
      offeringConfigId,
      cartId
    );
    this.name = 'CartRestartInvalidPromoCodeError';
  }
}

export class CartCurrencyNotFoundError extends CartError {
  constructor(
    message: string,
    currency: string | undefined,
    country: string | undefined,
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
  constructor(
    currency: string | undefined,
    country: string | undefined,
    cartId: string | undefined
  ) {
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
  constructor(currency: string | undefined, country: string | undefined) {
    super('Cart currency could not be determined in setup', currency, country);
    this.name = 'SetupCartCurrencyNotFoundError';
  }
}

export class UpdateCartCurrencyNotFoundError extends CartCurrencyNotFoundError {
  constructor(
    currency: string | undefined,
    country: string | undefined,
    cartId: string | undefined
  ) {
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
  constructor(
    currency: string | undefined,
    country: string | undefined,
    cartId: string | undefined
  ) {
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

export class CartSubscriptionNotFoundError extends CartError {
  constructor(message: string, cartId: string, subscriptionId?: string) {
    super(message, {
      cartId,
      subscriptionId,
    });
    this.name = 'CartSubscriptionNotFoundError';
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
    stripeCustomerId: string | undefined,
    invoiceId: string,
    cause: Error
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
    stripeCustomerId: string | undefined,
    paymentIntentId: string
  ) {
    super('Paid payment intent found on failed cart', {
      cartId,
      stripeCustomerId,
      paymentIntentId,
    });
    this.name = 'PaidPaymentIntendOnFailedCartError';
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

export class NeedsInputPaymentMethodMissingCartError extends CartError {
  constructor(cartId: string, customerId: string) {
    super('Payment method required for processing needs_input cart', {
      cartId,
      customerId,
    });
    this.name = 'NeedsInputPaymentMethodMissingCartError';
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
    taxAddress:
      | {
          countryCode: string;
          postalCode: string;
        }
      | undefined,
    currency: string | undefined
  ) {
    super('Cart must have a tax address and currency to restart', {
      cartId,
      taxAddress,
      currency,
    });
    this.name = 'TaxAndCurrencyRequiredCartError';
  }
}
