import {
  StripeCustomerFactory,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import { PrePayStepsResult } from './checkout.types';
import { ResultCartFactory } from './cart.factories';
import { faker } from '@faker-js/faker';
import { SubscriptionEligibilityResultFactory } from '@fxa/payments/eligibility';
import { EligibilityStatus } from '@fxa/payments/eligibility';

export const PrePayStepsResultFactory = (
  override?: Partial<PrePayStepsResult>
): PrePayStepsResult => {
  const cart = ResultCartFactory();

  return {
    version: cart.version,
    uid: faker.string.uuid(),
    accountCreatedAt: faker.date.past().getTime(),
    customer: StripeCustomerFactory(),
    enableAutomaticTax: true,
    price: StripePriceFactory(),
    eligibility: SubscriptionEligibilityResultFactory({
      subscriptionEligibilityResult: EligibilityStatus.CREATE,
    }),
    freeTrial: null,
    ...override,
  };
};
