import { Stripe } from 'stripe';
import { NonString } from './nonstring';

export type Product = Omit<Stripe.Product, 'default_price' | 'tax_code'> & {
  default_price: NonString<Stripe.Product['default_price']>;
  tax_code: NonString<Stripe.Product['tax_code']>;
};

export const ProductFactory = {
  create(stripeProduct: Stripe.Product): Product {
    if (typeof stripeProduct.default_price === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_price not expanded');
    }

    if (typeof stripeProduct.tax_code === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('tax_code not expanded');
    }

    const product = {
      ...stripeProduct,
      default_price: stripeProduct.default_price,
      tax_code: stripeProduct.tax_code,
    } satisfies Product;

    return product;
  },
};
