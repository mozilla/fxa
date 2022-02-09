import Stripe from 'stripe';
import pick from 'lodash.pick';
import omitBy from 'lodash.omitby';
import {
  Plan,
  SubscriptionStripeError,
  SubscriptionStripeErrorType,
  SubscriptionUpdateEligibility,
} from './types';
import { metadataFromPlan } from './metadata';

const isCapabilityKey = (value: string, key: string) =>
  key.startsWith('capabilities');

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/** Represents all subscription statuses that are considered active for a customer */
export const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription['status'][] = [
  'active',
  'past_due',
  'trialing',
];

// Stripe minimum charge amounts as set here
// https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
export const STRIPE_MINIMUM_CHARGE_AMOUNTS = {
  usd: 50,
  aed: 200,
  aud: 50,
  bgn: 100,
  brl: 50,
  cad: 50,
  chf: 50,
  czk: 1500,
  dkk: 250,
  eur: 50,
  gbp: 30,
  hkd: 400,
  huf: 17500,
  inr: 50,
  jpy: 50,
  mxn: 1000,
  myr: 200,
  nok: 300,
  nzd: 50,
  pln: 200,
  ron: 200,
  sek: 300,
  sgd: 50,
} as { [key: string]: number };

/**
 * Filter a customer for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 *
 * @param item
 */
export function filterCustomer(
  item: Stripe.Customer
): DeepPartial<Stripe.Customer> {
  const customer = pick(item, 'invoice_settings', 'sources', 'subscriptions');
  customer.invoice_settings = pick(
    customer.invoice_settings,
    'default_payment_method'
  ) as any;
  if (customer.sources?.data) {
    customer.sources.data = customer.sources.data.map((s) =>
      pick(s, 'id', 'object', 'brand', 'exp_month', 'exp_year', 'last4')
    ) as any;
    customer.sources = pick(customer.sources, 'data') as any;
  }
  if (customer.subscriptions?.data) {
    customer.subscriptions.data = customer.subscriptions.data.map(
      filterSubscription
    ) as any;
    customer.subscriptions = pick(customer.subscriptions, 'data') as any;
  }
  return customer;
}

/**
 * Filter a subscription for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 *
 * @param sub
 */
export function filterSubscription(
  sub: Stripe.Subscription
): DeepPartial<Stripe.Subscription> {
  const subscription = pick(
    sub,
    'cancel_at_period_end',
    'cancel_at',
    'canceled_at',
    'created',
    'current_period_end',
    'current_period_start',
    'ended_at',
    'id',
    'items',
    'latest_invoice',
    'status'
  );
  if (
    subscription.latest_invoice &&
    typeof subscription.latest_invoice !== 'string'
  ) {
    subscription.latest_invoice = filterInvoice(
      subscription.latest_invoice
    ) as any;
  }
  subscription.items.data = subscription.items.data.map(
    filterSubscriptionItem
  ) as any;
  return subscription;
}

/**
 * Fitler a Subscription Item for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 *
 * @param item
 */
function filterSubscriptionItem(item: Stripe.SubscriptionItem) {
  const si = pick(item, 'id', 'created', 'price');
  si.price = filterPrice(si.price) as any;
  return si;
}

/**
 * Filter a price for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 *
 * @param item
 */
export function filterPrice(item: Stripe.Price) {
  const price = pick(
    item,
    'id',
    'active',
    'currency',
    'metadata',
    'nickname',
    'product',
    'recurring',
    'type',
    'unit_amount'
  );
  price.metadata = omitBy(price.metadata, isCapabilityKey);
  if (
    typeof price.product !== 'string' &&
    price.product &&
    !price.product.deleted
  ) {
    price.product = filterProduct(price.product) as any;
  }
  return price;
}

/**
 * Filter a product for client-safe attributes.
 *
 * @param item
 */
export function filterProduct(item: Stripe.Product) {
  const product = pick(item, 'id', 'active', 'description', 'metadata', 'name');
  product.metadata = omitBy(product.metadata, isCapabilityKey);
  return product;
}

/**
 * Filter an invoice for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 * @param item
 */
export function filterInvoice(item: Stripe.Invoice) {
  const invoice = pick(item, 'id', 'status', 'object', 'payment_intent');
  if (invoice.payment_intent && typeof invoice.payment_intent !== 'string') {
    invoice.payment_intent = filterIntent(invoice.payment_intent) as any;
  }
  return invoice;
}

/**
 * Filter an payment intent for client-safe attributes.
 *
 * Will descend and sanitize nested objects.
 * @param item
 */
export function filterIntent<
  T extends Stripe.PaymentIntent | Stripe.SetupIntent
>(item: T) {
  return pick(
    item,
    'client_secret',
    'created',
    'next_action',
    'payment_method',
    'status'
  );
}

export const hasPaypalSubscription = (customer: Stripe.Customer) =>
  customer.subscriptions?.data.some(
    (sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
      sub.collection_method === 'send_invoice'
  );

/**
 * Returns a single plan from a subscription if there is only one plan
 * present. If there's multiple items, then no plans will be returned.
 */
export function singlePlan(
  subscription: Stripe.Subscription
): Stripe.Plan | null {
  const subItems = subscription.items.data;
  return subItems.length > 1 ? null : subItems[0].plan || subItems[0].price;
}

/**
 * Given two plans, A and B, determine whether B is eligible for a subscription
 * update (upgrade/downgrade) from A.
 */
export const getSubscriptionUpdateEligibility: (
  x: Plan,
  y: Plan
) => SubscriptionUpdateEligibility = (currentPlan: Plan, newPlan: Plan) => {
  const currentPlanMetaData = metadataFromPlan(currentPlan);
  const newPlanMetaData = metadataFromPlan(newPlan);
  const currentOrder =
    !!currentPlanMetaData.productOrder &&
    parseInt(currentPlanMetaData.productOrder);
  const newOrder =
    !!newPlanMetaData.productOrder && parseInt(newPlanMetaData.productOrder);

  if (
    currentPlan.plan_id === newPlan.plan_id ||
    !currentPlanMetaData.productSet ||
    currentPlanMetaData.productSet !== newPlanMetaData.productSet ||
    !currentOrder ||
    Number.isNaN(currentOrder) ||
    !newOrder ||
    Number.isNaN(newOrder) ||
    newOrder === currentOrder
  ) {
    return SubscriptionUpdateEligibility.INVALID;
  }

  if (currentOrder > newOrder) {
    return SubscriptionUpdateEligibility.DOWNGRADE;
  }

  if (currentOrder < newOrder) {
    return SubscriptionUpdateEligibility.UPGRADE;
  }

  return SubscriptionUpdateEligibility.INVALID;
};

export const getMinimumAmount = (currency: string): number => {
  if (STRIPE_MINIMUM_CHARGE_AMOUNTS[currency]) {
    return STRIPE_MINIMUM_CHARGE_AMOUNTS[currency];
  }

  throw new SubscriptionStripeError(
    SubscriptionStripeErrorType.NO_MIN_CHARGE_AMOUNT
  );
};
