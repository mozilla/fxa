/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StripeError } from '@stripe/stripe-js';
import type { Stripe } from 'stripe';
import {
  stripeErrorToErrorReasonId,
  handleEligibilityStatusMap,
  convertStripePaymentMethodTypeToSubPlat,
} from './cart.utils';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';
import { EligibilityStatus } from '@fxa/payments/eligibility';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';

describe('utils', () => {
  describe('stripeErrorReasonId', () => {
    let mockStripeError: StripeError;

    beforeEach(() => {
      mockStripeError = new Error() as unknown as StripeError;
    });

    it('should return for type card_error', () => {
      mockStripeError.type = 'card_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.UNKNOWN);
    });

    it('should return for default', () => {
      mockStripeError.type = 'api_error';
      const result = stripeErrorToErrorReasonId(mockStripeError);
      expect(result).toBe(CartErrorReasonId.UNKNOWN);
    });
  });

  describe('handleEligibilityStatusMap', () => {
    it.each([
      {
        eligibility: EligibilityStatus.CREATE,
        expected: CartEligibilityStatus.CREATE,
      },
      {
        eligibility: EligibilityStatus.UPGRADE,
        expected: CartEligibilityStatus.UPGRADE,
      },
      {
        eligibility: EligibilityStatus.DOWNGRADE,
        expected: CartEligibilityStatus.DOWNGRADE,
      },
      {
        eligibility: EligibilityStatus.BLOCKED_IAP,
        expected: CartEligibilityStatus.BLOCKED_IAP,
      },
      {
        eligibility: EligibilityStatus.INVALID,
        expected: CartEligibilityStatus.INVALID,
      },
      {
        eligibility: EligibilityStatus.SAME,
        expected: CartEligibilityStatus.INVALID,
      },
    ])(
      'maps EligibilityStatus.$eligibility to CartEligibilityStatus.$expected',
      ({ eligibility, expected }) => {
        expect(handleEligibilityStatusMap[eligibility]).toBe(expected);
      }
    );
  });

  describe('convertStripePaymentMethodTypeToSubPlat', () => {
    it('returns Card for a plain card payment method', () => {
      const pm = {
        type: 'card',
        card: { wallet: null },
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.Card
      );
    });

    it('returns ApplePay for a card with apple_pay wallet', () => {
      const pm = {
        type: 'card',
        card: { wallet: { type: 'apple_pay' } },
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.ApplePay
      );
    });

    it('returns GooglePay for a card with google_pay wallet', () => {
      const pm = {
        type: 'card',
        card: { wallet: { type: 'google_pay' } },
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.GooglePay
      );
    });

    it('returns Link for a link payment method', () => {
      const pm = {
        type: 'link',
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.Link
      );
    });

    it('returns Stripe for an unmapped payment method type', () => {
      const pm = {
        type: 'sepa_debit',
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.Stripe
      );
    });

    it('returns Card for a card with unknown wallet type', () => {
      const pm = {
        type: 'card',
        card: { wallet: { type: 'samsung_pay' } },
      } as unknown as Stripe.PaymentMethod;
      expect(convertStripePaymentMethodTypeToSubPlat(pm)).toBe(
        SubPlatPaymentMethodType.Card
      );
    });
  });
});
