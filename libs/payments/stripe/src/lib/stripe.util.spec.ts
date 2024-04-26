/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { StripeApiListFactory } from './factories/api-list.factory';
import { StripePlanFactory } from './factories/plan.factory';
import {
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from './factories/subscription.factory';

import { getSubscribedPlans, getSubscribedProductIds } from './stripe.util';

describe('util', () => {
  describe('getSubscribedPlans', () => {
    it('returns plans successfully', async () => {
      const mockPlan = StripePlanFactory();
      const mockSubItem = StripeSubscriptionItemFactory({
        plan: mockPlan,
      });
      const mockSubscription = StripeSubscriptionFactory({
        items: {
          object: 'list',
          data: [mockSubItem],
          has_more: false,
          url: `/v1/subscription_items?subscription=sub_${faker.string.alphanumeric(
            {
              length: 24,
            }
          )}`,
        },
      });
      const mockSubscriptionList = StripeApiListFactory([mockSubscription]);

      const result = getSubscribedPlans(mockSubscriptionList);
      expect(result).toEqual([mockPlan]);
    });

    it('returns empty array if no subscriptions exist', async () => {
      const mockSubscriptionList = StripeApiListFactory([]);

      const result = getSubscribedPlans(mockSubscriptionList);
      expect(result).toEqual([]);
    });
  });

  describe('getSubscribedProductIds', () => {
    it('returns product IDs successfully', async () => {
      const mockProductId = 'prod_test1';
      const mockPlan = StripePlanFactory({
        product: mockProductId,
      });

      const result = getSubscribedProductIds([mockPlan]);
      expect(result).toEqual([mockProductId]);
    });

    it('returns empty array if no subscriptions exist', async () => {
      const result = getSubscribedProductIds([]);
      expect(result).toEqual([]);
    });
  });
});
