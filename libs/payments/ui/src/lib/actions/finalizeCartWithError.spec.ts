/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account/kysely-types';
import { finalizeCartWithError } from './finalizeCartWithError';

const mockFinalizeCartWithError = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  finalizeCartWithError: mockFinalizeCartWithError,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('finalizeCartWithError', () => {
  const MOCK_CART_ID = 'cart-abc-123';
  const MOCK_ERROR_REASON_ID = CartErrorReasonId.IAP_BLOCKED_CONTACT_SUPPORT;

  beforeEach(() => {
    mockFinalizeCartWithError.mockReset();
  });

  it('calls finalizeCartWithError with cartId and errorReasonId', async () => {
    mockFinalizeCartWithError.mockResolvedValue(undefined);

    await finalizeCartWithError(MOCK_CART_ID, MOCK_ERROR_REASON_ID);

    expect(mockFinalizeCartWithError).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      errorReasonId: MOCK_ERROR_REASON_ID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { finalized: true };
    mockFinalizeCartWithError.mockResolvedValue(mockResult);

    const result = await finalizeCartWithError(
      MOCK_CART_ID,
      MOCK_ERROR_REASON_ID
    );

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockFinalizeCartWithError.mockRejectedValue(new Error('Cart not found'));

    await expect(
      finalizeCartWithError(MOCK_CART_ID, MOCK_ERROR_REASON_ID)
    ).rejects.toThrow('Cart not found');
  });
});
