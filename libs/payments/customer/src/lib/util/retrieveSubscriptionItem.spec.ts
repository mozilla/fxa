import {
  StripeSubscriptionFactory,
  StripeSubscriptionItemFactory,
} from '@fxa/payments/stripe';
import { retrieveSubscriptionItem } from './retrieveSubscriptionItem';
import {
  SubscriptionItemMissingItemError,
  SubscriptionItemMultipleItemsError,
} from '../error';

describe('retrieveSubscriptionItem', () => {
  const mockSubscription = StripeSubscriptionFactory();
  it('successfully returns the subsriptions item', () => {
    const result = retrieveSubscriptionItem(mockSubscription);
    expect(result.id).toEqual(mockSubscription.items.data[0].id);
  });

  it('throws an error if there are multiple subscription items', async () => {
    const mockSubscription = StripeSubscriptionFactory({
      items: {
        object: 'list',
        data: [
          StripeSubscriptionItemFactory(),
          StripeSubscriptionItemFactory(),
        ],
        has_more: false,
        url: '/v1/subscription_items?subscription=sub_24',
      },
    });
    expect(() => retrieveSubscriptionItem(mockSubscription)).toThrowError(
      SubscriptionItemMultipleItemsError
    );
  });

  it('throws an error if no subscription item is found', () => {
    const mockSubscription = StripeSubscriptionFactory({
      items: {
        object: 'list',
        data: [],
        has_more: false,
        url: '/v1/subscription_items?subscription=sub_24',
      },
    });
    expect(() => retrieveSubscriptionItem(mockSubscription)).toThrowError(
      SubscriptionItemMissingItemError
    );
  });
});
