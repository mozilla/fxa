/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nestjs';
import {
  EligibilityContentOfferingResult,
  EligibilityOfferingResult,
} from '@fxa/shared/cms';

import {
  Interval,
  IntervalComparison,
  OfferingComparison,
} from './eligibility.types';

/**
 * An offering as it appears within a subgroup, reduced to the fields needed to
 * rank it. Structurally satisfied by the subgroup offerings of both the
 * by-offering and by-plan-ids queries.
 */
type RankableOffering = {
  apiIdentifier: string;
  tier: number | null;
};

/**
 * Returns whether the target offering overlaps, and how.
 *
 * Ranking within a subgroup comes from each offering's `tier` in the CMS. Until
 * that content is backfilled, this falls back to the offering's position in the
 * subgroup - the behaviour prior to `tier` existing.
 *
 * @returns OfferingComparison if there's overlap, null otherwise.
 */
export const offeringComparison = (
  fromOfferingId: string,
  targetOffering: EligibilityContentOfferingResult | EligibilityOfferingResult
) => {
  // TODO PAY-3844: temporary debug logging, remove before merge
  console.log(
    '[PAY-3844] offeringComparison: input',
    JSON.stringify({
      fromOfferingId,
      targetOfferingId: targetOffering.apiIdentifier,
      subGroups: targetOffering.subGroups.map((subgroup) => ({
        groupName: subgroup.groupName,
        offerings: subgroup.offerings.map((offering) => ({
          apiIdentifier: offering.apiIdentifier,
          tier: offering.tier,
        })),
      })),
    })
  );

  if (targetOffering.apiIdentifier === fromOfferingId) {
    console.log(
      '[PAY-3844] offeringComparison: same offering id -> SAME',
      fromOfferingId
    );
    return OfferingComparison.SAME;
  }
  const commonSubgroups = targetOffering.subGroups.filter(
    (subgroup) =>
      !!subgroup.offerings.find((oc) => oc.apiIdentifier === fromOfferingId)
  );
  if (!commonSubgroups.length) {
    console.log(
      '[PAY-3844] offeringComparison: no common subgroup -> null (no overlap)',
      JSON.stringify({
        fromOfferingId,
        targetOfferingId: targetOffering.apiIdentifier,
      })
    );
    return null;
  }

  const resultIndex = tierDifference(
    commonSubgroups[0].offerings,
    fromOfferingId,
    targetOffering.apiIdentifier
  );

  const comparison =
    resultIndex === 0
      ? OfferingComparison.SAME
      : resultIndex > 0
      ? OfferingComparison.UPGRADE
      : OfferingComparison.DOWNGRADE;

  console.log(
    '[PAY-3844] offeringComparison: result',
    JSON.stringify({
      fromOfferingId,
      targetOfferingId: targetOffering.apiIdentifier,
      usedSubgroup: commonSubgroups[0].groupName,
      commonSubgroupCount: commonSubgroups.length,
      resultIndex,
      comparison,
    })
  );

  return comparison;
};

/**
 * How far the target offering sits above the existing offering within a
 * subgroup. Positive is an upgrade, negative a downgrade.
 *
 * Only the sign is meaningful. Tiers are unique within a subgroup but not
 * contiguous - an offering that also sits high up a longer subgroup keeps its
 * tier in the shorter one, leaving gaps.
 */
const tierDifference = (
  subgroupOfferings: RankableOffering[],
  fromOfferingId: string,
  targetOfferingId: string
) => {
  const fromTier = subgroupOfferings.find(
    (offering) => offering.apiIdentifier === fromOfferingId
  )?.tier;
  const targetTier = subgroupOfferings.find(
    (offering) => offering.apiIdentifier === targetOfferingId
  )?.tier;

  // TODO PAY-3844: temporary debug logging, remove before merge
  console.log(
    '[PAY-3844] tierDifference',
    JSON.stringify({
      fromOfferingId,
      fromTier,
      targetOfferingId,
      targetTier,
      difference:
        fromTier != null && targetTier != null ? targetTier - fromTier : null,
      rankedBy: fromTier != null && targetTier != null ? 'tier' : 'position',
    })
  );

  if (fromTier != null && targetTier != null) {
    return targetTier - fromTier;
  }

  // A subgroup where only some offerings carry a tier cannot be ranked either
  // way, and is not a state backfilling produces - flag it rather than silently
  // ranking on position.
  if (fromTier != null || targetTier != null) {
    Sentry.captureMessage(
      'offeringComparison: subgroup has a partial set of tiers',
      {
        extra: {
          fromOfferingId,
          targetOfferingId,
          subgroupOfferings: subgroupOfferings.map((offering) => ({
            apiIdentifier: offering.apiIdentifier,
            tier: offering.tier,
          })),
        },
      }
    );
  }

  return subgroupPositionDifference(
    subgroupOfferings,
    fromOfferingId,
    targetOfferingId
  );
};

/**
 * How far the target offering sits above the existing offering by position in
 * the subgroup.
 *
 * Subgroup relations are returned unsorted by the CMS, so position is not a
 * dependable signal. This exists only to preserve behaviour for content with no
 * `tier` yet, and should be removed once every offering carries one.
 */
const subgroupPositionDifference = (
  subgroupOfferings: RankableOffering[],
  fromOfferingId: string,
  targetOfferingId: string
) => {
  const subgroupOfferingIds = subgroupOfferings.map(
    (offering) => offering.apiIdentifier
  );
  return (
    subgroupOfferingIds.indexOf(targetOfferingId) -
    subgroupOfferingIds.indexOf(fromOfferingId)
  );
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
