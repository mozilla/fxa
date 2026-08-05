/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CouponErrorMessageType } from '../utils/error-ftl-messages';
import { applyCouponAction } from './applyCoupon';

const mockUpdateCart = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  updateCart: mockUpdateCart,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  __esModule: true,
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe('applyCouponAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_VERSION = 3;
  const MOCK_COUPON_CODE = 'SAVE20';

  beforeEach(() => {
    mockUpdateCart.mockReset();
    mockRevalidatePath.mockReset();
  });

  it('calls updateCart with cartId, version, and couponCode', async () => {
    mockUpdateCart.mockResolvedValue(undefined);

    await applyCouponAction(MOCK_CART_ID, MOCK_VERSION, MOCK_COUPON_CODE);

    expect(mockUpdateCart).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      version: MOCK_VERSION,
      cartDetails: {
        couponCode: MOCK_COUPON_CODE,
      },
    });
  });

  it('returns undefined on success', async () => {
    mockUpdateCart.mockResolvedValue(undefined);

    const result = await applyCouponAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_COUPON_CODE
    );

    expect(result).toBeUndefined();
  });

  it('revalidates the checkout start page on success', async () => {
    mockUpdateCart.mockResolvedValue(undefined);

    await applyCouponAction(MOCK_CART_ID, MOCK_VERSION, MOCK_COUPON_CODE);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
      'page'
    );
  });

  it('handles optional couponCode parameter', async () => {
    mockUpdateCart.mockResolvedValue(undefined);

    await applyCouponAction(MOCK_CART_ID, MOCK_VERSION);

    expect(mockUpdateCart).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      version: MOCK_VERSION,
      cartDetails: {
        couponCode: undefined,
      },
    });
  });

  it.each([
    {
      errorName: 'CartVersionMismatchError',
      expected: CouponErrorMessageType.Generic,
      revalidates: true,
    },
    {
      errorName: 'CouponErrorCannotRedeem',
      expected: CouponErrorMessageType.CannotRedeem,
      revalidates: false,
    },
    {
      errorName: 'CouponErrorExpired',
      expected: CouponErrorMessageType.Expired,
      revalidates: false,
    },
    {
      errorName: 'CouponErrorGeneric',
      expected: CouponErrorMessageType.Generic,
      revalidates: false,
    },
    {
      errorName: 'CouponErrorLimitReached',
      expected: CouponErrorMessageType.LimitReached,
      revalidates: false,
    },
    {
      errorName: 'CouponErrorInvalidCode',
      expected: CouponErrorMessageType.Invalid,
      revalidates: false,
    },
  ])(
    'returns $expected and revalidates=$revalidates for $errorName',
    async ({ errorName, expected, revalidates }) => {
      const error = new Error(errorName);
      error.name = errorName;
      mockUpdateCart.mockRejectedValue(error);

      const result = await applyCouponAction(
        MOCK_CART_ID,
        MOCK_VERSION,
        MOCK_COUPON_CODE
      );

      expect(result).toBe(expected);
      if (revalidates) {
        expect(mockRevalidatePath).toHaveBeenCalledWith(
          '/[locale]/[offeringId]/[interval]/checkout/[cartId]/start',
          'page'
        );
      } else {
        expect(mockRevalidatePath).not.toHaveBeenCalled();
      }
    }
  );

  it('returns Invalid for unknown error types', async () => {
    const error = new Error('SomeUnknownError');
    error.name = 'SomeUnknownError';
    mockUpdateCart.mockRejectedValue(error);

    const result = await applyCouponAction(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_COUPON_CODE
    );

    expect(result).toBe(CouponErrorMessageType.Invalid);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
