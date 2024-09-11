/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum CouponErrorMessageType {
  Expired = 'next-coupon-error-expired',
  Generic = 'next-coupon-error-generic',
  Invalid = 'next-coupon-error-invalid',
  LimitReached = 'next-coupon-error-limit-reached',
}

const BASIC_ERROR = 'next-basic-error-message';

// Dictionary of fluentIds and corresponding human-readable error messages
// Each error ID key should have a matching error ID property in errorToErrorMessageIdMap
const getFallbackTextByFluentId = (key: string) => {
  switch (key) {
    // coupon error messages
    case CouponErrorMessageType.Expired:
      return 'The code you entered has expired.';
    case CouponErrorMessageType.Generic:
      return 'An error occurred processing the code. Please try again.';
    case CouponErrorMessageType.Invalid:
      return 'The code you entered is invalid.';
    case CouponErrorMessageType.LimitReached:
      return 'The code you entered has reached its limit.';

    // generic messages for groups of similar errors
    case BASIC_ERROR:
    default:
      return 'Something went wrong. Please try again later.';
  }
};

// BASIC_ERROR, COUNTRY_CURRENCY_MISMATCH and PAYMENT_ERROR_1 are exported for errors.test.tsx
export { getFallbackTextByFluentId, BASIC_ERROR };
