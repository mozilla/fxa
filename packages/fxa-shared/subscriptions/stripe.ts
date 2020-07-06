import Stripe from 'stripe';
import pick from 'lodash.pick';
import omitBy from 'lodash.omitby';

const isCapabilityKey = (value: string, key: string) =>
  key.startsWith('capabilities');

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

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
  const invoice = pick(item, 'id', 'object', 'payment_intent');
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
