import { Stripe } from 'stripe';
import { Expanded } from './expanded';

// export type Invoice = Omit<
//   Stripe.Invoice,
//   | 'charge'
//   | 'customer'
//   | 'payment_intent'
//   | 'subscription'
//   | 'default_payment_method'
//   | 'default_source'
//   | 'discounts'
// > & {
//   charge: NonString<Stripe.Invoice['charge']>;
//   customer: NonString<Stripe.Invoice['customer']>;
//   payment_intent: NonString<Stripe.Invoice['payment_intent']>;
//   subscription: NonString<Stripe.Invoice['subscription']>;
//   default_payment_method: NonString<Stripe.Invoice['default_payment_method']>;
//   default_source: NonString<Stripe.Invoice['default_source']>;
//   discounts: NonString<Stripe.Invoice['discounts']>;
// };

export type Invoice = Expanded<Stripe.Invoice, 'customer' | 'subscription'>;
