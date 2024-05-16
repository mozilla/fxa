/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeError } from '@stripe/stripe-js';
import { EligibilityStatus } from '@fxa/payments/eligibility';
import {
  CartEligibilityStatus,
  CartErrorReasonId,
  CartState,
} from '@fxa/shared/db/mysql/account';
import { CartEligibilityDetails } from './cart.types';

export const handleEligibilityStatusMap = {
  [EligibilityStatus.BLOCKED_IAP]: CartEligibilityStatus.BLOCKED_IAP,
  [EligibilityStatus.CREATE]: CartEligibilityStatus.CREATE,
  [EligibilityStatus.DOWNGRADE]: CartEligibilityStatus.DOWNGRADE,
  [EligibilityStatus.UPGRADE]: CartEligibilityStatus.UPGRADE,
  [EligibilityStatus.INVALID]: CartEligibilityStatus.INVALID,
};

export const cartEligibilityDetailsMap: Record<
  EligibilityStatus,
  CartEligibilityDetails
> = {
  [EligibilityStatus.CREATE]: {
    eligibilityStatus: CartEligibilityStatus.CREATE,
    state: CartState.START,
  },
  [EligibilityStatus.UPGRADE]: {
    eligibilityStatus: CartEligibilityStatus.UPGRADE,
    state: CartState.START,
  },
  [EligibilityStatus.DOWNGRADE]: {
    eligibilityStatus: CartEligibilityStatus.DOWNGRADE,
    state: CartState.FAIL,
    errorReasonId: CartErrorReasonId.BASIC_ERROR,
  },
  [EligibilityStatus.BLOCKED_IAP]: {
    eligibilityStatus: CartEligibilityStatus.BLOCKED_IAP,
    state: CartState.FAIL,
    errorReasonId: CartErrorReasonId.IAP_UPGRADE_CONTACT_SUPPORT,
  },
  [EligibilityStatus.INVALID]: {
    eligibilityStatus: CartEligibilityStatus.INVALID,
    state: CartState.FAIL,
    errorReasonId: CartErrorReasonId.Unknown,
  },
};

export function stripeErrorToErrorReasonId(
  stripeError: StripeError
): CartErrorReasonId {
  switch (stripeError.type) {
    case 'card_error':
    default:
      return CartErrorReasonId.Unknown;
  }
}
