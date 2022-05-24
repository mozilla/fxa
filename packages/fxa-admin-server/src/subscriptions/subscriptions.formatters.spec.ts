/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentState } from 'fxa-shared/payments/iap/google-play/types';
import {
  AppStoreFormatter,
  MozPlaySubscriptionStatusType,
  PlayStoreFormatter,
  StripeFormatter,
} from './subscriptions.formatters';
import { addDays, created } from './test.util';

describe('MozSubscriptionFormatters', () => {
  describe('Stripe Formatter', () => {
    it('formats', () => {
      const formatted = StripeFormatter.toMozSubscription(
        {
          created: created,
          current_period_end: addDays(created, 30),
          current_period_start: addDays(created, 1),
          cancel_at_period_end: true,
          ended_at: null,
          status: 'active',
          id: '123',
        },
        {
          plan_id: 'plan-123',
          product_name: 'product 123',
          product_id: 'prod-123',
        },
        {
          hosted_invoice_url: 'www.foo.bar',
        }
      );
      expect(formatted).toEqual({
        created: created,
        currentPeriodEnd: addDays(created, 30),
        currentPeriodStart: addDays(created, 1),
        cancelAtPeriodEnd: true,
        endedAt: null,
        latestInvoice: 'www.foo.bar',
        planId: 'plan-123',
        productName: 'product 123',
        productId: 'prod-123',
        status: 'active',
        subscriptionId: '123', // Not sure
      });
    });
  });

  describe('App Store Formatter', () => {
    it('formats', () => {
      const formatted = AppStoreFormatter.toMozSubscription(
        {
          originalPurchaseDate: created,
          expiresDate: addDays(created, 30),
          verifiedAt: addDays(created, 1),
          originalTransactionId: '123',
          willRenew: () => true,
          isExpired: () => false,
          isFreeTrial: () => false,
          isEntitlementActive: () => true,
          isInBillingRetryPeriod: () => false,
          isInGracePeriod: () => false,
        },
        {
          plan_id: 'plan-123',
          product_name: '123',
          product_id: 'prod-123',
        }
      );
      expect(formatted).toEqual({
        created: created,
        currentPeriodEnd: addDays(created, 30),
        currentPeriodStart: addDays(created, 1),
        cancelAtPeriodEnd: false,
        endedAt: null,
        latestInvoice: '',
        planId: 'plan-123',
        productName: '123',
        productId: 'prod-123',
        status: 'active',
        subscriptionId: '123', // Not sure
      });
    });

    const defaultState = {
      isFreeTrial: () => false,
      isEntitlementActive: () => false,
      isInBillingRetryPeriod: () => false,
      isInGracePeriod: () => false,
      isExpired: () => false,
    };

    it('determines trailing status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
        isFreeTrial: () => true,
      });
      expect(status1).toEqual('trialing');
    });

    it('determines unpaid status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
        isInBillingRetryPeriod: () => true,
      });
      expect(status1).toEqual('unpaid');
    });

    it('determines past_due status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
        isInGracePeriod: () => true,
      });

      const status2 = AppStoreFormatter.toStatus({
        ...defaultState,
        isExpired: () => true,
        isInGracePeriod: () => true,
      });
      expect(status1).toEqual('past_due');
      expect(status2).toEqual('past_due');
    });

    it('determines canceled status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
        isExpired: () => true,
      });
      expect(status1).toEqual('canceled');
    });

    it('determines active status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
        isEntitlementActive: () => true,
      });
      expect(status1).toEqual('active');
    });

    it('determines indeterminate status', () => {
      const status1 = AppStoreFormatter.toStatus({
        ...defaultState,
      });
      expect(status1).toEqual(null);
    });
  });

  describe('Play Store Formatter', () => {
    it('formats', () => {
      const formatted = PlayStoreFormatter.toMozSubscription(
        {
          startTimeMillis: created,
          expiryTimeMillis: addDays(created, 30),
          verifiedAt: addDays(created, 1),
          autoRenewing: true,
          purchaseToken: '123',
          replacedByAnotherPurchase: false,
          paymentState: PaymentState.RECEIVED,
        },
        {
          plan_id: 'plan-123',
          product_name: 'product 123',
          product_id: 'prod-123',
        }
      );
      expect(formatted).toEqual({
        created: created,
        currentPeriodEnd: addDays(created, 30),
        currentPeriodStart: addDays(created, 1),
        cancelAtPeriodEnd: false,
        endedAt: null,
        latestInvoice: '',
        planId: 'plan-123',
        productName: 'product 123',
        productId: 'prod-123',
        status: 'active',
        subscriptionId: '123', // Not sure
      });
    });

    const defaultState: MozPlaySubscriptionStatusType = {
      expiryTimeMillis: Date.now() + 100000,
      paymentState: PaymentState.RECEIVED,
      replacedByAnotherPurchase: false,
    };

    it('determines canceled status', () => {
      const status1 = PlayStoreFormatter.toStatus({
        ...defaultState,
        expiryTimeMillis: Date.now() - 100000,
      });
      const status2 = PlayStoreFormatter.toStatus({
        ...defaultState,
        replacedByAnotherPurchase: true,
      });

      expect(status1).toEqual('canceled');
      expect(status2).toEqual('canceled');
    });

    it('determines trialing status', () => {
      const status1 = PlayStoreFormatter.toStatus({
        ...defaultState,
        paymentState: PaymentState.FREE_TRIAL,
      });
      expect(status1).toEqual('trialing');
    });

    it('determines active status', () => {
      const status1 = PlayStoreFormatter.toStatus({
        ...defaultState,
      });
      expect(status1).toEqual('active');
    });

    it('determines unpaid status', () => {
      const status1 = PlayStoreFormatter.toStatus({
        ...defaultState,
        paymentState: PaymentState.PENDING_DEFERRED,
      });
      const status2 = PlayStoreFormatter.toStatus({
        ...defaultState,
        paymentState: PaymentState.PENDING_DEFERRED,
      });
      expect(status1).toEqual('unpaid');
      expect(status2).toEqual('unpaid');
    });

    it('determines indeterminate status', () => {
      const status1 = PlayStoreFormatter.toStatus({
        ...defaultState,
        paymentState: undefined,
      });
      expect(status1).toEqual(null);
    });
  });
});
