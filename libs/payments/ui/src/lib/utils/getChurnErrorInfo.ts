/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnErrorReason } from '@fxa/payments/management';

export function getChurnErrorInfo(
  reason: string,
  productName: string
) {
  switch (reason) {
    case ChurnErrorReason.OfferExpired:
      return {
        message: `This offer has expired.`,
        messageFtl: 'stay-subscribed-error-expired',
      };

    case ChurnErrorReason.DiscountAlreadyApplied:
      return {
        message: `Discount code already applied.`,
        messageFtl: 'stay-subscribed-error-discount-used',
      };

    case ChurnErrorReason.SubscriptionNotActive:
      return {
        message: `This discount is only available to current ${productName} subscribers.`,
        messageFtl: 'stay-subscribed-error-not-current-subscriber',
      };

    case ChurnErrorReason.SubscriptionStillActive:
      return {
        message: `Your ${productName} subscription is still active.`,
        messageFtl: 'stay-subscribed-error-still-active',
      };

    case ChurnErrorReason.GeneralError:
    default:
      return {
        message: `There was an issue with renewing your subscription.`,
        messageFtl: 'stay-subscribed-error-general',
      };
  }
}
