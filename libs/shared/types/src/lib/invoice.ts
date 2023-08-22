import { Stripe } from 'stripe';
import { NonString } from './nonstring';

export type Invoice = Omit<
  Stripe.Invoice,
  | 'charge'
  | 'customer'
  | 'payment_intent'
  | 'subscription'
  | 'default_payment_method'
  | 'default_source'
  | 'discounts'
> & {
  charge: NonString<Stripe.Invoice['charge']>;
  customer: NonString<Stripe.Invoice['customer']>;
  payment_intent: NonString<Stripe.Invoice['payment_intent']>;
  subscription: NonString<Stripe.Invoice['subscription']>;
  default_payment_method: NonString<Stripe.Invoice['default_payment_method']>;
  default_source: NonString<Stripe.Invoice['default_source']>;
  discounts: NonString<Stripe.Invoice['discounts']>;
};

export const InvoiceFactory = {
  create(stripeInvoice: Stripe.Invoice): Invoice {
    if (typeof stripeInvoice.charge === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('charge not expanded');
    }

    if (typeof stripeInvoice.customer === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('customer not expanded');
    }

    if (typeof stripeInvoice.payment_intent === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('payment_intent not expanded');
    }

    if (typeof stripeInvoice.subscription === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('subscription not expanded');
    }

    if (typeof stripeInvoice.default_payment_method === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_payment_method not expanded');
    }

    if (typeof stripeInvoice.default_source === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('default_source not expanded');
    }

    if (typeof stripeInvoice.discounts === 'string') {
      // throw error or fetch/expand from stripe
      throw new Error('discounts not expanded');
    }

    const invoice = {
      ...stripeInvoice,
      charge: stripeInvoice.charge,
      customer: stripeInvoice.customer,
      payment_intent: stripeInvoice.payment_intent,
      subscription: stripeInvoice.subscription,
      default_payment_method: stripeInvoice.default_payment_method,
      default_source: stripeInvoice.default_source,
      discounts: stripeInvoice.discounts,
    } satisfies Invoice;

    return invoice;
  },
};
