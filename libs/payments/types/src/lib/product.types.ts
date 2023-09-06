import { Stripe } from 'stripe';
import { Expanded } from './expanded';

// export type Product = Omit<Stripe.Product, 'default_price' | 'tax_code'> & {
//   default_price: NonString<Stripe.Product['default_price']>;
//   tax_code: NonString<Stripe.Product['tax_code']>;
// };

export type Product = Expanded<Stripe.Product, 'default_price' | 'tax_code'>;
