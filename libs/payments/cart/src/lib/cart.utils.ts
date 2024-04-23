/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';
import { EligibilityStatus } from '@fxa/payments/eligibility';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';

export const handleEligibilityStatusMap = {
  [EligibilityStatus.BLOCKED_IAP]: CartEligibilityStatus.BLOCKED_IAP,
  [EligibilityStatus.CREATE]: CartEligibilityStatus.CREATE,
  [EligibilityStatus.DOWNGRADE]: CartEligibilityStatus.DOWNGRADE,
  [EligibilityStatus.UPGRADE]: CartEligibilityStatus.UPGRADE,
  [EligibilityStatus.INVALID]: CartEligibilityStatus.INVALID,
};

export function stripeErrorToErrorReasonId(
  stripeError: Stripe.StripeRawError
): CartErrorReasonId {
  switch (stripeError.type) {
    case 'card_error':
    default:
      return CartErrorReasonId.Unknown;
  }
}
