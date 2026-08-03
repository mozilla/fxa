/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { determineCurrencyAction } from './determineCurrency';

const mockDetermineCurrency = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  determineCurrency: mockDetermineCurrency,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('determineCurrencyAction', () => {
  const MOCK_IP = '192.168.1.1';

  beforeEach(() => {
    mockDetermineCurrency.mockReset();
  });

  it('calls determineCurrency with the ip address', async () => {
    mockDetermineCurrency.mockResolvedValue({ currency: 'usd' });

    await determineCurrencyAction(MOCK_IP);

    expect(mockDetermineCurrency).toHaveBeenCalledWith({
      ip: MOCK_IP,
    });
  });

  it('returns only the currency string from the result', async () => {
    mockDetermineCurrency.mockResolvedValue({ currency: 'eur' });

    const result = await determineCurrencyAction(MOCK_IP);

    expect(result).toBe('eur');
  });

  it('propagates errors when the actions service rejects', async () => {
    mockDetermineCurrency.mockRejectedValue(
      new Error('Unable to determine currency')
    );

    await expect(determineCurrencyAction(MOCK_IP)).rejects.toThrow(
      'Unable to determine currency'
    );
  });
});
