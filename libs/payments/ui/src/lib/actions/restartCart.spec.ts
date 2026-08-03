/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { restartCartAction } from './restartCart';

const mockRestartCart = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  restartCart: mockRestartCart,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('restartCartAction', () => {
  const MOCK_CART_ID = 'cart-abc-123';

  beforeEach(() => {
    mockRestartCart.mockReset();
  });

  it('calls restartCart with the cartId', async () => {
    const mockResult = { cartId: 'cart-new-456', version: 1 };
    mockRestartCart.mockResolvedValue(mockResult);

    await restartCartAction(MOCK_CART_ID);

    expect(mockRestartCart).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { cartId: 'cart-new-456', version: 1 };
    mockRestartCart.mockResolvedValue(mockResult);

    const result = await restartCartAction(MOCK_CART_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockRestartCart.mockRejectedValue(new Error('Cart not found'));

    await expect(restartCartAction(MOCK_CART_ID)).rejects.toThrow(
      'Cart not found'
    );
  });
});
