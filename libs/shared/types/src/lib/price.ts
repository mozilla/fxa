import { Stripe } from 'stripe';
import { NonString } from './nonstring';

export type Price = Omit<Stripe.Price, 'product'> & {
  product: NonString<Stripe.Price['product']>;
};

export const PriceFactory = {
  create(stripePrice: Stripe.Price): Price {
    if (typeof stripePrice.product === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('product not expanded');
    }

    const price = {
      ...stripePrice,
      product: stripePrice.product,
    } satisfies Price;

    return price;
  },
};
