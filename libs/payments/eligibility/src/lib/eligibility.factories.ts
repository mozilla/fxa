import {
  EligibilityStatus,
  SubscriptionEligibilityResult,
  type SubscriptionEligibilityUpgradeDowngradeResult,
} from './eligibility.types';
import { StripePriceFactory } from '@fxa/payments/stripe';

export const SubscriptionEligibilityResultFactory = (
  override?: Partial<{
    subscriptionEligibilityResult:
      | EligibilityStatus.CREATE
      | EligibilityStatus.INVALID
      | EligibilityStatus.SAME
      | EligibilityStatus.BLOCKED_IAP;
  }>
): SubscriptionEligibilityResult => ({
  subscriptionEligibilityResult: EligibilityStatus.CREATE,
  ...override,
});

export const SubscriptionEligibilityUpgradeDowngradeResultFactory = (
  override?: Partial<SubscriptionEligibilityUpgradeDowngradeResult>
): SubscriptionEligibilityUpgradeDowngradeResult => ({
  subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
  fromOfferingConfigId: 'vpn',
  fromPrice: StripePriceFactory(),
  redundantOverlaps: [],
  ...override,
});
