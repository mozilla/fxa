import {
  StripeSubscription,
  StripeSubscriptionItem,
} from '@fxa/payments/stripe';
import {
  SubscriptionItemMissingItemError,
  SubscriptionItemMultipleItemsError,
} from '../customer.error';

export function retrieveSubscriptionItem(
  subscription: StripeSubscription
): StripeSubscriptionItem {
  if (subscription.items.data.length > 1) {
    throw new SubscriptionItemMultipleItemsError(
      subscription.id,
      subscription.items.data.map((subscriptionItem) => subscriptionItem.id)
    );
  }

  const firstSubscriptionItem = subscription.items.data.at(0);
  if (!firstSubscriptionItem) {
    throw new SubscriptionItemMissingItemError(subscription.id);
  }

  return firstSubscriptionItem;
}
