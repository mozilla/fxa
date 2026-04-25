/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StripeSubscription } from '@fxa/payments/stripe';

export const hasSubscriptionRequiringPaymentMethod = (
  subscriptions: StripeSubscription[]
): boolean => subscriptions.some((sub) => !sub.cancel_at_period_end);
