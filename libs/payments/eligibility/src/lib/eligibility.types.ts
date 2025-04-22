/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripePrice } from '@fxa/payments/stripe';

export enum EligibilityStatus {
  CREATE = 'create',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  BLOCKED_IAP = 'blocked_iap',
  SAME = 'same',
  INVALID = 'invalid',
}

export enum LocationStatus {
  ProductNotAvailable = 'product_not_available',
  SanctionedLocation = 'sanctioned_location',
  Unresolved = 'unresolved',
  Valid = 'valid',
}

// Used to represent offering comparison to target price
export enum OfferingComparison {
  SAME = 'same',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
}

// Used to represent an interval comparison to another interval
export enum IntervalComparison {
  SAME = 'same',
  LONGER = 'longer',
  SHORTER = 'shorter',
}

export type OfferingOverlapResult = {
  comparison: OfferingComparison;
  priceId: string;
  fromOfferingId: string;
};

export type Interval = {
  unit: 'day' | 'week' | 'month' | 'year';
  count: number;
};

export type SubscriptionEligibilityResult =
  | {
      subscriptionEligibilityResult:
        | EligibilityStatus.CREATE
        | EligibilityStatus.INVALID
        | EligibilityStatus.SAME
        | EligibilityStatus.BLOCKED_IAP;
    }
  | {
      subscriptionEligibilityResult:
        | EligibilityStatus.UPGRADE
        | EligibilityStatus.DOWNGRADE;
      fromOfferingConfigId: string;
      fromPrice: StripePrice;
    };
