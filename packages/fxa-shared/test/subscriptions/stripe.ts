import 'chai';
import { assert } from 'chai';
import Stripe from 'stripe';

import {
  DeepPartial,
  filterCustomer,
  filterSubscription,
  filterPrice,
  filterProduct,
  filterIntent,
  filterInvoice,
} from '../../subscriptions/stripe';

const customer1WithSubscription = require('../fixtures/stripe/customer1_with_subscription.json');
const subscriptionExpanded = require('../fixtures/stripe/subscription_expanded.json');
const price1 = require('../fixtures/stripe/price1_with_product.json');

function assertSubscription(item?: DeepPartial<Stripe.Subscription>) {
  assert.hasAllKeys(item, [
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
    'status',
  ]);
}

function assertSubscriptionItem(item?: DeepPartial<Stripe.SubscriptionItem>) {
  assert.hasAllKeys(item, ['id', 'created', 'price']);
}

function assertSource(item?: DeepPartial<Stripe.CustomerSource>) {
  assert.hasAllKeys(item, [
    'id',
    'object',
    'brand',
    'exp_month',
    'exp_year',
    'last4',
  ]);
}

function assertInvoice(item?: DeepPartial<Stripe.Invoice>) {
  assert.hasAllKeys(item, ['id', 'object', 'payment_intent']);
}

function assertIntent(
  item?: DeepPartial<Stripe.PaymentIntent | Stripe.SetupIntent>
) {
  assert.hasAllKeys(item, [
    'client_secret',
    'created',
    'next_action',
    'payment_method',
    'status',
  ]);
}

function assertPrice(item?: DeepPartial<Stripe.Price>) {
  assert.hasAllKeys(item, [
    'id',
    'active',
    'currency',
    'metadata',
    'nickname',
    'product',
    'recurring',
    'type',
    'unit_amount',
  ]);
  assert.lengthOf(
    Object.keys(item?.metadata as any).filter(
      (k) => !k.startsWith('capabilities')
    ),
    5
  );
}

function assertProduct(item?: DeepPartial<Stripe.Product>) {
  assert.hasAllKeys(item, ['id', 'active', 'description', 'metadata', 'name']);
}

describe('stripe', () => {
  describe('filterCustomer', () => {
    it('filters recursively', () => {
      const result = filterCustomer(customer1WithSubscription);
      assert.hasAllKeys(result, [
        'invoice_settings',
        'sources',
        'subscriptions',
      ]);
      assertSource(result.sources?.data?.[0]);
      assert.hasAllKeys(result.invoice_settings, ['default_payment_method']);
      assertSubscription(result.subscriptions?.data?.[0]);
    });
  });

  describe('filterSubscription', () => {
    it('filters recursively', () => {
      const result = filterSubscription(subscriptionExpanded);
      assertSubscription(result);
      assertSubscriptionItem(result.items?.data?.[0]);
      assertInvoice(result.latest_invoice as any);
      assertIntent(
        (result.latest_invoice as Stripe.Invoice)
          .payment_intent as Stripe.PaymentIntent
      );
    });
  });

  describe('filterPrice', () => {
    it('filters recursively', () => {
      const result = filterPrice(price1);
      assertPrice(result);
      assertProduct(result.product as any);
    });
  });

  describe('filterProduct', () => {
    it('filters', () => {
      const result = filterProduct(price1.product as any);
      assertProduct(result);
    });
  });

  describe('filterInvoice', () => {
    it('filters recursively', () => {
      const result = filterInvoice(subscriptionExpanded.latest_invoice);
      assertInvoice(result);
      assertIntent(result.payment_intent as any);
    });
  });

  describe('filterIntent', () => {
    it('filters', () => {
      const result = filterIntent(
        subscriptionExpanded.latest_invoice.payment_intent
      );
      assertIntent(result as any);
    });
  });
});
