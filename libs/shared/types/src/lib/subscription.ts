import { Stripe } from 'stripe';
import { NonString } from './nonstring';

export type Subscription = Omit<
  Stripe.Subscription,
  | 'customer'
  | 'default_payment_method'
  | 'latest_invoice'
  | 'pending_setup_intent'
  | 'default_source'
> & {
  customer: NonString<Stripe.Subscription['customer']>;
  default_payment_method: NonString<
    Stripe.Subscription['default_payment_method']
  >;
  latest_invoice: NonString<Stripe.Subscription['latest_invoice']>;
  pending_setup_intent: NonString<Stripe.Subscription['pending_setup_intent']>;
  default_source: NonString<Stripe.Subscription['default_source']>;
};

export const SubscriptionFactory = {
  create(stripeSub: Stripe.Subscription): Subscription {
    if (typeof stripeSub.customer === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('customer not expanded');
    }
    if (typeof stripeSub.default_payment_method === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_payment_method not expanded');
    }
    if (typeof stripeSub.latest_invoice === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('latest_invoice not expanded');
    }
    if (typeof stripeSub.pending_setup_intent === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('pending_setup_intent not expanded');
    }
    if (typeof stripeSub.default_source === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_source not expanded');
    }

    const subscription = {
      ...stripeSub,
      customer: stripeSub.customer,
      default_payment_method: stripeSub.default_payment_method,
      latest_invoice: stripeSub.latest_invoice,
      pending_setup_intent: stripeSub.pending_setup_intent,
      default_source: stripeSub.default_source,
    } satisfies Subscription;

    return subscription;
  },
};
