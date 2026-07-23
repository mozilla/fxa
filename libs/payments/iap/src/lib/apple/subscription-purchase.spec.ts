/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubscriptionStatus } from 'app-store-server-api';
import { FirestoreAppleIapPurchaseRecordFactory } from '../factories';
import { AppStoreSubscriptionPurchase } from './subscription-purchase';

const MOCK_NOW = 1_700_000_000_000;
const ONE_MINUTE = 60_000;

describe('AppStoreSubscriptionPurchase', () => {
  describe('isEntitlementActive', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(MOCK_NOW);
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    const buildPurchase = (
      override: Parameters<typeof FirestoreAppleIapPurchaseRecordFactory>[0]
    ) =>
      AppStoreSubscriptionPurchase.fromFirestoreObject(
        FirestoreAppleIapPurchaseRecordFactory(override)
      );

    it('returns true for an active subscription with a future expiry', () => {
      const purchase = buildPurchase({
        status: SubscriptionStatus.Active,
        expiresDate: MOCK_NOW + ONE_MINUTE,
      });
      expect(purchase.isEntitlementActive()).toBe(true);
    });

    it('returns false for an active subscription whose expiry has passed', () => {
      const purchase = buildPurchase({
        status: SubscriptionStatus.Active,
        expiresDate: MOCK_NOW - ONE_MINUTE,
      });
      expect(purchase.isEntitlementActive()).toBe(false);
    });

    it('returns true for a grace-period subscription despite a past expiry', () => {
      const purchase = buildPurchase({
        status: SubscriptionStatus.InBillingGracePeriod,
        expiresDate: MOCK_NOW - ONE_MINUTE,
      });
      expect(purchase.isEntitlementActive()).toBe(true);
    });

    it('returns false for an expired subscription with a future expiry', () => {
      const purchase = buildPurchase({
        status: SubscriptionStatus.Expired,
        expiresDate: MOCK_NOW + ONE_MINUTE,
      });
      expect(purchase.isEntitlementActive()).toBe(false);
    });

    it('returns true for an active subscription with no expiry set', () => {
      const record = FirestoreAppleIapPurchaseRecordFactory({
        status: SubscriptionStatus.Active,
      });
      delete (record as { expiresDate?: number }).expiresDate;
      const purchase = AppStoreSubscriptionPurchase.fromFirestoreObject(record);
      expect(purchase.isEntitlementActive()).toBe(true);
    });
  });
});
