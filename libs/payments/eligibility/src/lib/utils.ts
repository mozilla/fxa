/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EligibilityContentOfferingResult,
  EligibilityOfferingResult,
} from '@fxa/shared/contentful';

import {
  Interval,
  IntervalComparison,
  OfferingComparison,
} from './eligibility.types';

/**
 * Returns whether the target offering overlaps, and how.
 *
 * @returns OfferingComparison if there's overlap, null otherwise.
 */
export const offeringComparison = (
  fromOfferingProductId: string,
  targetOffering: EligibilityContentOfferingResult | EligibilityOfferingResult
) => {
  if (targetOffering.stripeProductId === fromOfferingProductId)
    return OfferingComparison.SAME;
  const commonSubgroups =
    targetOffering.linkedFrom.subGroupCollection.items.filter(
      (subgroup) =>
        !!subgroup.offeringCollection.items.find(
          (oc) => oc.stripeProductId === fromOfferingProductId
        )
    );
  if (!commonSubgroups.length) return null;
  const subgroupProductIds = commonSubgroups[0].offeringCollection.items.map(
    (o) => o.stripeProductId
  );
  const existingIndex = subgroupProductIds.indexOf(fromOfferingProductId);
  const targetIndex = subgroupProductIds.indexOf(
    targetOffering.stripeProductId
  );

  const resultIndex = targetIndex - existingIndex;
  if (resultIndex === 0) {
    return OfferingComparison.SAME;
  } else if (resultIndex > 0) {
    return OfferingComparison.UPGRADE;
  } else {
    return OfferingComparison.DOWNGRADE;
  }
};

/**
 * Compare two intervals and return whether the target interval is longer,
 * shorter, or the same as the existing interval.
 *
 * Note that due to months and years having varying quantities of days, this
 * is an approximationbut should be sufficient for calculations in this
 * context. An example is that 4 weeks will not be considered equivilant to
 * 1 month, and 12 months will not be considered equivilant to 1 year.
 */
export const intervalComparison = (
  fromInterval: Interval,
  toInterval: Interval
): IntervalComparison => {
  const difference =
    unitToDays(toInterval.unit) * toInterval.count -
    unitToDays(fromInterval.unit) * fromInterval.count;
  if (difference === 0) return IntervalComparison.SAME;
  if (difference > 0) return IntervalComparison.LONGER;
  return IntervalComparison.SHORTER;
};

/**
 * Convert an interval unit to days.
 */
const unitToDays = (unit: Interval['unit']) => {
  switch (unit) {
    case 'day':
      return 1;
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'year':
      return 365;
    default:
      return 0;
  }
};
