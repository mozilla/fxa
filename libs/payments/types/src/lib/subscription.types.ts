import { Stripe } from 'stripe';
import { Expanded } from './expanded';

// export type Subscription = Omit<
//   Stripe.Subscription,
//   | 'customer'
//   | 'default_payment_method'
//   | 'latest_invoice'
//   | 'pending_setup_intent'
//   | 'default_source'
// > & {
//   customer: NonString<Stripe.Subscription['customer']>;
//   default_payment_method: NonString<
//     Stripe.Subscription['default_payment_method']
//   >;
//   latest_invoice: NonString<Stripe.Subscription['latest_invoice']>;
//   pending_setup_intent: NonString<Stripe.Subscription['pending_setup_intent']>;
//   default_source: NonString<Stripe.Subscription['default_source']>;
// };

export type Subscription = Expanded<
  Stripe.Subscription,
  'customer' | 'latest_invoice'
>;
