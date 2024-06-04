import { StripeCustomer } from '../stripe.client.types';

export const isCustomerTaxEligible = (customer: StripeCustomer) => {
  return (
    customer.tax.automatic_tax === 'supported' ||
    customer.tax.automatic_tax === 'not_collecting'
  );
};
