import {
  StripeCustomerFactory,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import { PrePayStepsResult } from './checkout.types';
import { ResultCartFactory } from './cart.factories';
import { faker } from '@faker-js/faker';
import { SubscriptionEligibilityResultCreateFactory } from '@fxa/payments/eligibility';

export const PrePayStepsResultFactory = (
  override?: Partial<PrePayStepsResult>
): PrePayStepsResult => {
  const cart = ResultCartFactory();

  return {
    version: cart.version,
    uid: faker.string.uuid(),
    customer: StripeCustomerFactory(),
    enableAutomaticTax: true,
    price: StripePriceFactory(),
    eligibility: SubscriptionEligibilityResultCreateFactory(),
    ...override,
  };
};
