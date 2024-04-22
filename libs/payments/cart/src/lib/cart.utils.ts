/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Stripe } from 'stripe';
import { EligibilityStatus } from '@fxa/payments/eligibility';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
} from '@fxa/shared/db/mysql/account';

export function handleEligibilityStatus(
  eligibilityStatus: EligibilityStatus
): CartEligibilityStatus {
  switch (eligibilityStatus) {
    case EligibilityStatus.BLOCKED_IAP:
      return CartEligibilityStatus.BLOCKED_IAP;
    case EligibilityStatus.CREATE:
      return CartEligibilityStatus.CREATE;
    case EligibilityStatus.DOWNGRADE:
      return CartEligibilityStatus.DOWNGRADE;
    case EligibilityStatus.UPGRADE:
      return CartEligibilityStatus.UPGRADE;
    case EligibilityStatus.INVALID:
      return CartEligibilityStatus.INVALID;
    default:
      console.error(eligibilityStatus);
      return CartEligibilityStatus.INVALID;
  }
}

export function stripeErrorToErrorReasonId(
  stripeError: Stripe.StripeRawError
): CartErrorReasonId {
  switch (stripeError.type) {
    case 'card_error':
    default:
      return CartErrorReasonId.Unknown;
  }
}
