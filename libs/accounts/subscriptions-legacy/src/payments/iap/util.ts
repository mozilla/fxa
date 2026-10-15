import {
  MozillaSubscriptionTypes,
  SubscriptionType,
} from '../../subscriptions/types';
import { AppStoreSubscriptionPurchase } from './apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from './google-play/subscription-purchase';

// This function is only used in the Stripe Helper currently, but it
// may be useful in other places in the future, so I put it here for now.
export function getIapPurchaseType(
  purchase: PlayStoreSubscriptionPurchase | AppStoreSubscriptionPurchase
): Omit<SubscriptionType, typeof MozillaSubscriptionTypes.WEB> {
  if (isAppStoreSubscriptionPurchase(purchase))
    return MozillaSubscriptionTypes.IAP_APPLE;
  if (isPlayStoreSubscriptionPurchase(purchase))
    return MozillaSubscriptionTypes.IAP_GOOGLE;

  throw new Error('Purchase is not recognized as either Google or Apple IAP.');
}

export function isAppStoreSubscriptionPurchase(
  purchase: PlayStoreSubscriptionPurchase | AppStoreSubscriptionPurchase
): purchase is AppStoreSubscriptionPurchase {
  return 'originalTransactionId' in purchase;
}

export function isPlayStoreSubscriptionPurchase(
  purchase: PlayStoreSubscriptionPurchase | AppStoreSubscriptionPurchase
): purchase is PlayStoreSubscriptionPurchase {
  return 'purchaseToken' in purchase;
}
