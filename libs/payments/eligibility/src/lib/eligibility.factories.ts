import { faker } from '@faker-js/faker/locale/af_ZA';
import {
  EligibilityStatus,
  SubscriptionEligibilityResult,
} from './eligibility.types';
import { StripePrice, StripePriceFactory } from '@fxa/payments/stripe';

export const SubscriptionEligibilityResultCreateFactory =
  (): SubscriptionEligibilityResult => ({
    subscriptionEligibilityResult: EligibilityStatus.CREATE,
  });

export const SubscriptionEligibilityResultUpgradeFactory = (): {
  subscriptionEligibilityResult:
    | EligibilityStatus.UPGRADE
    | EligibilityStatus.DOWNGRADE;
  fromOfferingConfigId: string;
  fromPrice: StripePrice;
} => ({
  subscriptionEligibilityResult: EligibilityStatus.UPGRADE,
  fromOfferingConfigId: faker.helpers.arrayElement(['vpn']),
  fromPrice: StripePriceFactory(),
});
