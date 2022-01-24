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
  getSubscriptionUpdateEligibility,
} from '../../subscriptions/stripe';
import { Plan, SubscriptionUpdateEligibility } from '../../subscriptions/types';

const customer1WithSubscription = require('../fixtures/stripe/customer1_with_subscription.json');
const subscriptionExpanded = require('../fixtures/stripe/subscription_expanded.json');
const price1 = require('../fixtures/stripe/price1_with_product.json');
const plan = require('../fixtures/stripe/plan1_with_product.json');

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
  assert.hasAllKeys(item, ['id', 'object', 'payment_intent', 'status']);
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
    6
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

  describe('isValidSubscriptionPlanUpdate', () => {
    const currentPlan: Plan = {
      ...plan,
      plan_id: plan.id,
      plan_metadata: {
        ...plan.metadata,
        productOrder: '3',
      },
      plan_name: plan.name,
      product_id: plan.product.id,
      product_metadata: plan.product.metadata,
      product_name: plan.product.name,
    };
    const newPlan: Plan = {
      ...currentPlan,
      plan_id: 'quux',
      plan_metadata: {
        ...plan.metadata,
        productOrder: '8',
      },
      plan_name: 'something with better value!',
    };

    it('returns invalid when the same plan is passed', () => {
      const actual = getSubscriptionUpdateEligibility(currentPlan, currentPlan);
      assert.equal(actual, SubscriptionUpdateEligibility.INVALID);
    });

    it('returns upgrade when plan "upgrade" is allowed', () => {
      const actual = getSubscriptionUpdateEligibility(currentPlan, newPlan);
      assert.equal(actual, SubscriptionUpdateEligibility.UPGRADE);
    });

    it('returns downgrade for a plan "downgrade"', () => {
      const actual = getSubscriptionUpdateEligibility(newPlan, currentPlan);
      assert.equal(actual, SubscriptionUpdateEligibility.DOWNGRADE);
    });

    it('returns invalid when a plan is not in a product set', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: undefined },
      };
      assert.equal(
        getSubscriptionUpdateEligibility(currentPlan, x),
        SubscriptionUpdateEligibility.INVALID
      );
      assert.equal(
        getSubscriptionUpdateEligibility(x, currentPlan),
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when the product sets do not match', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: 'testo' },
      };
      assert.equal(
        getSubscriptionUpdateEligibility(currentPlan, x),
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when a plan does not have a product order', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productOrder: undefined },
      };
      assert.equal(
        getSubscriptionUpdateEligibility(currentPlan, x),
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when when a plan has a product order that is not a number', () => {
      const x = {
        ...newPlan,
        plan_metadata: {
          ...newPlan.plan_metadata,
          productOrder: 'not a number',
        },
      };
      assert.equal(
        getSubscriptionUpdateEligibility(currentPlan, x),
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when the plans has the same product order', () => {
      const x = {
        ...newPlan,
        plan_metadata: {
          ...newPlan.plan_metadata,
          productOrder: currentPlan.plan_metadata!.productOrder,
        },
      };
      assert.equal(
        getSubscriptionUpdateEligibility(currentPlan, x),
        SubscriptionUpdateEligibility.INVALID
      );
    });
  });
});
