import { Stripe } from 'stripe';
import { Expanded } from './expanded';

// export type Customer = Omit<Stripe.Customer, 'default_source'> & {
//   default_source: NonString<Stripe.Customer['default_source']>;
// };

export type Customer = Expanded<Stripe.Customer, 'default_source'>;
