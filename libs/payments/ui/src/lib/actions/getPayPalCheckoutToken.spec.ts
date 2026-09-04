/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getPayPalCheckoutToken } from './getPayPalCheckoutToken';

const mockGetPayPalCheckoutToken = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getPayPalCheckoutToken: mockGetPayPalCheckoutToken,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('getPayPalCheckoutToken', () => {
  const MOCK_CURRENCY_CODE = 'USD';

  beforeEach(() => {
    mockGetPayPalCheckoutToken.mockReset();
  });

  it('calls getPayPalCheckoutToken with the currencyCode', async () => {
    mockGetPayPalCheckoutToken.mockResolvedValue({ token: 'pp-token-123' });

    await getPayPalCheckoutToken(MOCK_CURRENCY_CODE);

    expect(mockGetPayPalCheckoutToken).toHaveBeenCalledWith({
      currencyCode: MOCK_CURRENCY_CODE,
    });
  });

  it('returns only the token string from the result', async () => {
    mockGetPayPalCheckoutToken.mockResolvedValue({ token: 'pp-token-456' });

    const result = await getPayPalCheckoutToken(MOCK_CURRENCY_CODE);

    expect(result).toBe('pp-token-456');
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetPayPalCheckoutToken.mockRejectedValue(
      new Error('PayPal unavailable')
    );

    await expect(getPayPalCheckoutToken(MOCK_CURRENCY_CODE)).rejects.toThrow(
      'PayPal unavailable'
    );
  });
});
