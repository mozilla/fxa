/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCouponAction } from './getCoupon';

const mockGetCoupon = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getCoupon: mockGetCoupon,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('getCouponAction', () => {
  const MOCK_CART_ID = 'cart_abc123';
  const MOCK_VERSION = 2;

  beforeEach(() => {
    mockGetCoupon.mockReset();
  });

  it('calls getCoupon with cartId and version', async () => {
    const mockResult = { couponCode: 'SAVE20', discountAmount: 200 };
    mockGetCoupon.mockResolvedValue(mockResult);

    await getCouponAction(MOCK_CART_ID, MOCK_VERSION);

    expect(mockGetCoupon).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      version: MOCK_VERSION,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { couponCode: 'SAVE20', discountAmount: 200 };
    mockGetCoupon.mockResolvedValue(mockResult);

    const result = await getCouponAction(MOCK_CART_ID, MOCK_VERSION);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetCoupon.mockRejectedValue(new Error('Cart not found'));

    await expect(getCouponAction(MOCK_CART_ID, MOCK_VERSION)).rejects.toThrow(
      'Cart not found'
    );
  });
});
