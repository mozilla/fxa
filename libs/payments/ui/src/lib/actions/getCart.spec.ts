/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCartAction } from './getCart';

const mockGetCart = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getCart: mockGetCart,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('getCartAction', () => {
  const MOCK_CART_ID = 'cart-abc-123';

  beforeEach(() => {
    mockGetCart.mockReset();
  });

  it('calls getCart with the cartId', async () => {
    const mockResult = { cartId: MOCK_CART_ID, state: 'START' };
    mockGetCart.mockResolvedValue(mockResult);

    await getCartAction(MOCK_CART_ID);

    expect(mockGetCart).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      cartId: MOCK_CART_ID,
      state: 'START',
      version: 1,
    };
    mockGetCart.mockResolvedValue(mockResult);

    const result = await getCartAction(MOCK_CART_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetCart.mockRejectedValue(new Error('Cart not found'));

    await expect(getCartAction(MOCK_CART_ID)).rejects.toThrow('Cart not found');
  });
});
