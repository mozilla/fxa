/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type {
  CommonMetrics,
  PaymentProvidersType,
  SubPlatPaymentMethodType,
} from './glean/glean.types';

/**
 * DI token for the checkout-conversion event emitter.
 *
 * Defined in the metrics leaf lib so cart-side code can publish backend-
 * triggered pay_setup.success / pay_setup.fail events without importing
 * @fxa/payments/events directly (which would create an import cycle —
 * events already depends on cart for CartManager).
 *
 * The provider binding lives in the Nest app module; it resolves to the
 * Emittery instance returned by PaymentsEmitterService.getEmitter(). The
 * registered handlers fetch the cart, run opt-out / nimbus / CMS lookups
 * via the same retrieveAdditionalMetricsData helper the existing
 * view/engage/submit handlers use, then call PaymentsGleanManager.
 */
export const CHECKOUT_EVENT_EMITTER_TOKEN = Symbol('CHECKOUT_EVENT_EMITTER');

/**
 * Payload for `checkoutSuccess` — extends CommonMetrics so the handler can
 * forward the same object straight into PaymentsGleanManager and use
 * `params` for the existing retrieveAdditionalMetricsData enrichment.
 * Cart-side code merges `params` with cart-derived cartId / offeringId /
 * interval before emitting.
 */
export type CheckoutSuccessPayload = CommonMetrics & {
  paymentProvider: PaymentProvidersType;
  paymentMethod: SubPlatPaymentMethodType;
};

/**
 * Payload for `checkoutFail` — CommonMetrics alone. The errorReasonId is
 * read from the cart record by the handler (finishErrorCart wrote it
 * before this emit fires).
 */
export type CheckoutFailPayload = CommonMetrics;

export interface CheckoutEventEmitter {
  emit(
    event: 'checkoutSuccess',
    payload: CheckoutSuccessPayload
  ): Promise<unknown>;
  emit(event: 'checkoutFail', payload: CheckoutFailPayload): Promise<unknown>;
}
