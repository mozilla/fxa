import { Stripe } from 'stripe';
import { NonString } from './nonstring';

export type Customer = Omit<Stripe.Customer, 'default_source'> & {
  default_source: NonString<Stripe.Customer['default_source']>;
};

export const CustomerFactory = {
  create(stripeCustomer: Stripe.Customer): Customer {
    if (typeof stripeCustomer.default_source === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_source not expanded');
    }

    const customer = {
      ...stripeCustomer,
      default_source: stripeCustomer.default_source,
    } satisfies Customer;

    return customer;
  },
};
