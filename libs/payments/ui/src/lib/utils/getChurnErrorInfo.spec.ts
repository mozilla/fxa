/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ChurnErrorReason } from '@fxa/payments/management';
import { getChurnErrorInfo } from './getChurnErrorInfo';

// Mock @fxa/payments/management to avoid pulling in heavy transitive deps.
// Only the ChurnErrorReason enum is needed by getChurnErrorInfo.
jest.mock('@fxa/payments/management', () => ({
  ChurnErrorReason: {
    OfferExpired: 'no_churn_intervention_found',
    DiscountAlreadyApplied: 'discount_already_applied',
    SubscriptionNotActive: 'subscription_not_active',
    SubscriptionStillActive: 'subscription_still_active',
    GeneralError: 'general_error',
  },
}));

const MOCK_PRODUCT_NAME = 'Mozilla VPN';

describe('getChurnErrorInfo', () => {
  it.each([
    {
      reason: ChurnErrorReason.OfferExpired,
      expectedMessage: 'This offer has expired.',
      expectedFtl: 'stay-subscribed-error-expired',
    },
    {
      reason: ChurnErrorReason.DiscountAlreadyApplied,
      expectedMessage: 'Discount code already applied.',
      expectedFtl: 'stay-subscribed-error-discount-used',
    },
    {
      reason: ChurnErrorReason.GeneralError,
      expectedMessage: 'There was an issue with renewing your subscription.',
      expectedFtl: 'stay-subscribed-error-general',
    },
  ])(
    'returns the correct message and FTL id for $reason',
    ({ reason, expectedMessage, expectedFtl }) => {
      expect(getChurnErrorInfo(reason, MOCK_PRODUCT_NAME)).toEqual({
        message: expectedMessage,
        messageFtl: expectedFtl,
      });
    }
  );

  it('interpolates productName into the message for SubscriptionNotActive', () => {
    expect(
      getChurnErrorInfo(
        ChurnErrorReason.SubscriptionNotActive,
        MOCK_PRODUCT_NAME
      )
    ).toEqual({
      message: `This discount is only available to current ${MOCK_PRODUCT_NAME} subscribers.`,
      messageFtl: 'stay-subscribed-error-not-current-subscriber',
    });
  });

  it('interpolates productName into the message for SubscriptionStillActive', () => {
    expect(
      getChurnErrorInfo(
        ChurnErrorReason.SubscriptionStillActive,
        MOCK_PRODUCT_NAME
      )
    ).toEqual({
      message: `Your ${MOCK_PRODUCT_NAME} subscription is still active.`,
      messageFtl: 'stay-subscribed-error-still-active',
    });
  });

  it('returns the general error for an unknown reason', () => {
    expect(getChurnErrorInfo('unknown_reason', MOCK_PRODUCT_NAME)).toEqual({
      message: 'There was an issue with renewing your subscription.',
      messageFtl: 'stay-subscribed-error-general',
    });
  });
});
