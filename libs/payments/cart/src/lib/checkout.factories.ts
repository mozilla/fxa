import {
  StripeCustomerFactory,
  StripePriceFactory,
} from '@fxa/payments/stripe';
import { PrePayStepsResult } from './checkout.types';
import { ResultCartFactory } from './cart.factories';
import { faker } from '@faker-js/faker';

export const PrePayStepsResultFactory = (
  override?: Partial<PrePayStepsResult>
): PrePayStepsResult => {
  const cart = ResultCartFactory();

  return {
    version: cart.version,
    uid: faker.string.uuid(),
    email: cart.email,
    customer: StripeCustomerFactory(),
    enableAutomaticTax: true,
    price: StripePriceFactory(),
    ...override,
  };
};
