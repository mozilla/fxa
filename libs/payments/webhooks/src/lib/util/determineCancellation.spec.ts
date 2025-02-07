/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripeInvoiceFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';
import { determineCancellation } from './determineCancellation';

describe('determineCancellation', () => {
  const mockSubscription = StripeSubscriptionFactory();

  describe('external_paypal', () => {
    const paymentProvider = 'external_paypal';
    it('returns true if status is not uncollectible', () => {
      const mockLatestInvoice = StripeInvoiceFactory({ status: 'paid' });
      expect(
        determineCancellation(
          paymentProvider,
          mockSubscription,
          mockLatestInvoice
        )
      ).toBe(true);
    });

    it('return false if status is uncollectible', () => {
      const mockLatestInvoice = StripeInvoiceFactory({
        status: 'uncollectible',
      });
      expect(
        determineCancellation(
          paymentProvider,
          mockSubscription,
          mockLatestInvoice
        )
      ).toBe(false);
    });

    it('return undefined', () => {
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        undefined
      );
    });
  });

  describe('card', () => {
    const paymentProvider = 'card';
    it('returns true if reason is cancellation_requested', () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancellation_details: {
          reason: 'cancellation_requested',
          comment: 'comment',
          feedback: 'other',
        },
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        true
      );
    });

    it('returns false if reason is not cancellation_requested', () => {
      const mockSubscription = StripeSubscriptionFactory({
        cancellation_details: {
          reason: 'payment_disputed',
          comment: 'comment',
          feedback: 'other',
        },
      });
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        false
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

  describe('other', () => {
    const paymentProvider = 'google_iap';
    it('returns undefined if payment provider is not supported', () => {
      expect(determineCancellation(paymentProvider, mockSubscription)).toBe(
        undefined
      );
    });
  });
});
