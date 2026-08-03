/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { determineCurrencyForCustomerAction } from './determineCurrencyForCustomer';

const mockDetermineCurrencyForCustomer = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  determineCurrencyForCustomer: mockDetermineCurrencyForCustomer,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockRequireSessionUid = jest.fn();
jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  requireSessionUid: () => mockRequireSessionUid(),
}));

describe('determineCurrencyForCustomerAction', () => {
  const MOCK_UID = 'uid-abc-123';

  beforeEach(() => {
    mockDetermineCurrencyForCustomer.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls determineCurrencyForCustomer with the uid', async () => {
    mockDetermineCurrencyForCustomer.mockResolvedValue({ currency: 'usd' });

    await determineCurrencyForCustomerAction();

    expect(mockDetermineCurrencyForCustomer).toHaveBeenCalledWith({
      uid: MOCK_UID,
    });
  });

  it('returns only the currency string from the result', async () => {
    mockDetermineCurrencyForCustomer.mockResolvedValue({ currency: 'gbp' });

    const result = await determineCurrencyForCustomerAction();

    expect(result).toBe('gbp');
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(determineCurrencyForCustomerAction()).rejects.toThrow(
      'Not authenticated'
    );

    expect(mockDetermineCurrencyForCustomer).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockDetermineCurrencyForCustomer.mockRejectedValue(
      new Error('Customer not found')
    );

    await expect(determineCurrencyForCustomerAction()).rejects.toThrow(
      'Customer not found'
    );
  });
});
