/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeInvoiceFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import {
  CancellationReason,
  determineCancellation,
} from './determineCancellation';
import { SubPlatPaymentMethodType } from '@fxa/payments/customer';

describe('determineCancellation', () => {
  const mockSubscription = StripeSubscriptionFactory();

  describe('external_paypal', () => {
    const paymentProvider = SubPlatPaymentMethodType.PayPal;
    it('returns customer initiated if status is not uncollectible', () => {
      const mockLatestInvoice = StripeInvoiceFactory({ status: 'paid' });
      expect(
        determineCancellation(
          paymentProvider,
          mockSubscription,
          mockLatestInvoice
        )
      ).toBe(CancellationReason.CustomerInitiated);
    });

    it('return involuntary if status is uncollectible', () => {
      const mockLatestInvoice = StripeInvoiceFactory({
        status: 'uncollectible',
      });
      expect(
        determineCancellation(
          paymentProvider,
          mockSubscription,
          mockLatestInvoice
        )
      ).toBe(CancellationReason.Involuntary);
    });

    it('return undefined', () => {
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        undefined
      );
    });
  });

  describe('card', () => {
    const paymentProvider = SubPlatPaymentMethodType.Card;
    it('returns customer initiated if reason is cancellation_requested', () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancellation_details: {
          reason: 'cancellation_requested',
          comment: 'comment',
          feedback: 'other',
        },
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        CancellationReason.CustomerInitiated
      );
    });

    it('returns involuntary if reason is not cancellation_requested', () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancellation_details: {
          reason: 'payment_disputed',
          comment: 'comment',
          feedback: 'other',
        },
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        CancellationReason.Involuntary
      );
    });

    it('returns undefined if cancellation_details is undefined', () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancellation_details: undefined,
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        undefined
      );
    });
  });

  describe('redundantCancellation', () => {
    const paymentProvider = SubPlatPaymentMethodType.Card;
    it('returns redundant if metadata contains redundantCancellation', () => {
      const mockSubscription = StripeSubscriptionFactory({
        metadata: {
          redundantCancellation: 'true',
        },
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        CancellationReason.Redundant
      );
    });
  });

  describe('other', () => {
    const paymentProvider = SubPlatPaymentMethodType.GooglePay;
    it('returns undefined if payment provider is not supported', () => {
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        undefined
      );
    });
  });
});
