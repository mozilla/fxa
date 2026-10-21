/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';

import {
  DeepPartial,
  filterCustomer,
  filterSubscription,
  filterPrice,
  filterProduct,
  filterIntent,
  filterInvoice,
  getSubscriptionUpdateEligibility,
  getMinimumAmount,
} from './stripe';
import {
  Plan,
  SubscriptionStripeError,
  SubscriptionStripeErrorType,
  SubscriptionUpdateEligibility,
} from './types';
// require() keeps the fixtures untyped; typed JSON imports do not match the Stripe types.
const customer1WithSubscription = require('./fixtures/customer1_with_subscription.json');
const subscriptionExpanded = require('./fixtures/subscription_expanded.json');
const price1 = require('./fixtures/price1_with_product.json');
const plan = require('./fixtures/plan1_with_product.json');

function assertKeys(item: unknown, keys: string[]) {
  expect(Object.keys(item as object).sort()).toEqual([...keys].sort());
}

function assertSubscription(item?: DeepPartial<Stripe.Subscription>) {
  assertKeys(item, [
    'cancel_at_period_end',
    'cancel_at',
    'canceled_at',
    'created',
    'ended_at',
    'id',
    'items',
    'latest_invoice',
    'status',
  ]);
}

function assertSubscriptionItem(item?: DeepPartial<Stripe.SubscriptionItem>) {
  assertKeys(item, ['id', 'created', 'price']);
}

function assertSource(item?: DeepPartial<Stripe.CustomerSource>) {
  assertKeys(item, ['id', 'object', 'brand', 'exp_month', 'exp_year', 'last4']);
}

function assertInvoice(item?: DeepPartial<Stripe.Invoice>) {
  assertKeys(item, ['id', 'object', 'status']);
}

function assertIntent(
  item?: DeepPartial<Stripe.PaymentIntent | Stripe.SetupIntent>
) {
  assertKeys(item, [
    'client_secret',
    'created',
    'next_action',
    'payment_method',
    'status',
  ]);
}

function assertPrice(item?: DeepPartial<Stripe.Price>) {
  assertKeys(item, [
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
  expect(
    Object.keys(item?.metadata as any).filter(
      (k) => !k.startsWith('capabilities')
    )
  ).toHaveLength(6);
}

function assertProduct(item?: DeepPartial<Stripe.Product>) {
  assertKeys(item, ['id', 'active', 'description', 'metadata', 'name']);
}

describe('stripe', () => {
  describe('filterCustomer', () => {
    it('filters recursively', () => {
      const result = filterCustomer(customer1WithSubscription);
      assertKeys(result, ['invoice_settings', 'sources', 'subscriptions']);
      assertSource(result.sources?.data?.[0]);
      assertKeys(result.invoice_settings, ['default_payment_method']);
      assertSubscription(result.subscriptions?.data?.[0]);
    });
  });

  describe('filterSubscription', () => {
    it('filters recursively', () => {
      const result = filterSubscription(subscriptionExpanded);
      assertSubscription(result);
      assertSubscriptionItem(result.items?.data?.[0]);
      assertInvoice(result.latest_invoice as any);
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
    });
  });

  describe('filterIntent', () => {
    it('filters', () => {
      const result = filterIntent(
        subscriptionExpanded.latest_invoice.payments.data[0].payment
          .payment_intent
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
      expect(actual).toBe(SubscriptionUpdateEligibility.INVALID);
    });

    it('returns upgrade when plan "upgrade" is allowed', () => {
      const actual = getSubscriptionUpdateEligibility(currentPlan, newPlan);
      expect(actual).toBe(SubscriptionUpdateEligibility.UPGRADE);
    });

    it('returns downgrade for a plan "downgrade"', () => {
      const actual = getSubscriptionUpdateEligibility(newPlan, currentPlan);
      expect(actual).toBe(SubscriptionUpdateEligibility.DOWNGRADE);
    });

    it('returns invalid when a plan is not in a product set', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: undefined },
      };
      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
      expect(getSubscriptionUpdateEligibility(x, currentPlan)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when the product sets do not match', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: 'testo' },
      };
      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when a plan does not have a product order', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productOrder: undefined },
      };
      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
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
      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid when the plans has the same product order', () => {
      const x = {
        ...newPlan,
        plan_metadata: {
          ...newPlan.plan_metadata,
          productOrder: currentPlan.plan_metadata?.productOrder,
        },
      };
      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid if the current plan does not have any productSet', () => {
      const x = {
        ...currentPlan,
        plan_metadata: { ...currentPlan.plan_metadata, productSet: null },
      };

      expect(getSubscriptionUpdateEligibility(x, newPlan)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid if the new plan does not have any productSet', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: null },
      };

      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid if the new plan product set is an empty array', () => {
      const x = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: [] },
      };

      expect(getSubscriptionUpdateEligibility(currentPlan, x)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid if the current plan productSet is an empty array', () => {
      const x = {
        ...currentPlan,
        plan_metadata: { ...currentPlan.plan_metadata, productSet: [] },
      };

      expect(getSubscriptionUpdateEligibility(x, newPlan)).toBe(
        SubscriptionUpdateEligibility.INVALID
      );
    });

    it('returns invalid if there is not at least one element of overlap in the productSet arrays', () => {
      const newPlanCopy = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: ['1'] },
      };

      const currentPlanCopy = {
        ...currentPlan,
        plan_metadata: { ...currentPlan.plan_metadata, productSet: ['2'] },
      };

      expect(
        getSubscriptionUpdateEligibility(currentPlanCopy, newPlanCopy)
      ).toBe(SubscriptionUpdateEligibility.INVALID);
    });

    it('returns upgrade if there is 1 element of overlap in the productSet arrays', () => {
      const newPlanCopy = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: ['1'] },
      };

      const currentPlanCopy = {
        ...currentPlan,
        plan_metadata: { ...currentPlan.plan_metadata, productSet: ['1', '2'] },
      };

      expect(
        getSubscriptionUpdateEligibility(currentPlanCopy, newPlanCopy)
      ).toBe(SubscriptionUpdateEligibility.UPGRADE);
    });

    it('returns upgrade if there is more than 1 element of overlap in the productSet arrays', () => {
      const newPlanCopy = {
        ...newPlan,
        plan_metadata: { ...newPlan.plan_metadata, productSet: ['1', '2'] },
      };

      const currentPlanCopy = {
        ...currentPlan,
        plan_metadata: { ...currentPlan.plan_metadata, productSet: ['1', '2'] },
      };

      expect(
        getSubscriptionUpdateEligibility(currentPlanCopy, newPlanCopy)
      ).toBe(SubscriptionUpdateEligibility.UPGRADE);
    });
  });

  describe('getMinimumAmount', () => {
    it('should return min amount for valid currency', () => {
      const expected = 50;
      const result = getMinimumAmount('usd');

      expect(result).toBe(expected);
    });

    it('should throw SubscriptionTypeError for invalid currency', () => {
      expect(() => getMinimumAmount('fake')).toThrow(SubscriptionStripeError);
      expect(() => getMinimumAmount('fake')).toThrow(
        SubscriptionStripeErrorType.NO_MIN_CHARGE_AMOUNT
      );
    });
  });
});
