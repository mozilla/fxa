/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


export function getStaySubscribedErrorInfo(
  reason: string,
  productTitle: string
) {
  switch (reason) {
    case 'no_churn_intervention_found':
      return {
        message: `This offer has expired.`,   // ? not sure if 'not found' means expired
        messageFtl: 'stay-subscribed-error-expired',
      };

    case 'discount_already_applied':
      return {
        message: `Discount code already applied.`,
        messageFtl: 'stay-subscribed-error-discount-used',
      };

    case 'subscription_not_active':
      return {
        message: `This discount is only available to current ${productTitle} subscribers.`,
        messageFtl: 'stay-subscribed-error-not-current-subscriber',
      };

    case 'subscription_still_active':
      return {
        message: `Your ${productTitle} subscription is still active.`,
        messageFtl: 'stay-subscribed-error-still-active',
      };

    case 'general_error':
    default:
      return {
        message: `There was an issue with renewing your subscription.`,
        messageFtl: 'stay-subscribed-error-general',
      };
  }
}
