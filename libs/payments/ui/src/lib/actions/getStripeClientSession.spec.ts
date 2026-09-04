/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getStripeClientSession } from './getStripeClientSession';

const mockGetStripePaymentManagementDetails = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getStripePaymentManagementDetails: mockGetStripePaymentManagementDetails,
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

describe('getStripeClientSession', () => {
  const MOCK_UID = 'uid-abc-123';

  beforeEach(() => {
    mockGetStripePaymentManagementDetails.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls getStripePaymentManagementDetails with the uid', async () => {
    const mockResult = { clientSecret: 'cs_test_123' };
    mockGetStripePaymentManagementDetails.mockResolvedValue(mockResult);

    await getStripeClientSession();

    expect(mockGetStripePaymentManagementDetails).toHaveBeenCalledWith({
      uid: MOCK_UID,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { clientSecret: 'cs_test_123' };
    mockGetStripePaymentManagementDetails.mockResolvedValue(mockResult);

    const result = await getStripeClientSession();

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(getStripeClientSession()).rejects.toThrow('Not authenticated');

    expect(mockGetStripePaymentManagementDetails).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetStripePaymentManagementDetails.mockRejectedValue(
      new Error('Stripe session error')
    );

    await expect(getStripeClientSession()).rejects.toThrow(
      'Stripe session error'
    );
  });
});
