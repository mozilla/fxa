import { Stripe } from 'stripe';
import { Expanded } from './expanded';

// export type Price = Omit<Stripe.Price, 'product'> & {
//   product: NonString<Stripe.Price['product']>;
// };

export type Price = Expanded<Stripe.Price, 'product'>;
