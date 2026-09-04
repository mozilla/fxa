/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { finalizeProcessingCartAction } from './finalizeProcessingCart';

const mockFinalizeProcessingCart = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  finalizeProcessingCart: mockFinalizeProcessingCart,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('finalizeProcessingCartAction', () => {
  const MOCK_CART_ID = 'cart-abc-123';

  beforeEach(() => {
    mockFinalizeProcessingCart.mockReset();
  });

  it('calls finalizeProcessingCart with the cartId', async () => {
    const mockResult = { cartId: MOCK_CART_ID, state: 'SUCCESS' };
    mockFinalizeProcessingCart.mockResolvedValue(mockResult);

    await finalizeProcessingCartAction(MOCK_CART_ID);

    expect(mockFinalizeProcessingCart).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { cartId: MOCK_CART_ID, state: 'SUCCESS' };
    mockFinalizeProcessingCart.mockResolvedValue(mockResult);

    const result = await finalizeProcessingCartAction(MOCK_CART_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockFinalizeProcessingCart.mockRejectedValue(
      new Error('Cart not in PROCESSING state')
    );

    await expect(finalizeProcessingCartAction(MOCK_CART_ID)).rejects.toThrow(
      'Cart not in PROCESSING state'
    );
  });
});
