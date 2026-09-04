/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getNeedsInputAction } from './getNeedsInput';

const mockGetNeedsInput = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getNeedsInput: mockGetNeedsInput,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockCaptureException = jest.fn();
jest.mock('@sentry/nextjs', () => ({
  __esModule: true,
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  __esModule: true,
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe('getNeedsInputAction', () => {
  const MOCK_CART_ID = 'cart-abc-123';

  beforeEach(() => {
    mockGetNeedsInput.mockReset();
    mockCaptureException.mockReset();
    mockRevalidatePath.mockReset();
  });

  it('calls getNeedsInput with the cartId', async () => {
    const mockResult = { inputType: 'requires_action', clientSecret: 'cs_123' };
    mockGetNeedsInput.mockResolvedValue(mockResult);

    await getNeedsInputAction(MOCK_CART_ID);

    expect(mockGetNeedsInput).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { inputType: 'requires_action', clientSecret: 'cs_123' };
    mockGetNeedsInput.mockResolvedValue(mockResult);

    const result = await getNeedsInputAction(MOCK_CART_ID);

    expect(result).toEqual(mockResult);
  });

  it('captures exception and revalidates path when the service rejects', async () => {
    const error = new Error('Intent retrieval failed');
    mockGetNeedsInput.mockRejectedValue(error);

    const result = await getNeedsInputAction(MOCK_CART_ID);

    expect(result).toBeUndefined();
    expect(mockCaptureException).toHaveBeenCalledWith(error);
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/[offeringId]/[interval]/checkout/[cartId]/needs_input',
      'page'
    );
  });
});
