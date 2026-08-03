/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setDefaultStripePaymentDetails } from './setDefaultStripePaymentDetails';

const mockSetDefaultStripePaymentDetails = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  setDefaultStripePaymentDetails: mockSetDefaultStripePaymentDetails,
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

const mockGetIpAddress = jest.fn();
jest.mock('../utils/getIpAddress', () => ({
  __esModule: true,
  getIpAddress: () => mockGetIpAddress(),
}));

describe('setDefaultStripePaymentDetails', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_PAYMENT_METHOD_ID = 'pm_test_456';
  const MOCK_IP_ADDRESS = '192.168.1.1';

  beforeEach(() => {
    mockSetDefaultStripePaymentDetails.mockReset();
    mockRequireSessionUid.mockReset();
    mockGetIpAddress.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
    mockGetIpAddress.mockResolvedValue(MOCK_IP_ADDRESS);
  });

  it('calls the service with uid, paymentMethodId, and ipAddress', async () => {
    const mockResult = { success: true };
    mockSetDefaultStripePaymentDetails.mockResolvedValue(mockResult);

    await setDefaultStripePaymentDetails(MOCK_PAYMENT_METHOD_ID);

    expect(mockSetDefaultStripePaymentDetails).toHaveBeenCalledWith({
      uid: MOCK_UID,
      paymentMethodId: MOCK_PAYMENT_METHOD_ID,
      ipAddress: MOCK_IP_ADDRESS,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { success: true };
    mockSetDefaultStripePaymentDetails.mockResolvedValue(mockResult);

    const result = await setDefaultStripePaymentDetails(MOCK_PAYMENT_METHOD_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      setDefaultStripePaymentDetails(MOCK_PAYMENT_METHOD_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockSetDefaultStripePaymentDetails).not.toHaveBeenCalled();
  });

  it('propagates errors when getIpAddress rejects', async () => {
    mockGetIpAddress.mockRejectedValue(new Error('Failed to get IP'));

    await expect(
      setDefaultStripePaymentDetails(MOCK_PAYMENT_METHOD_ID)
    ).rejects.toThrow('Failed to get IP');

    expect(mockSetDefaultStripePaymentDetails).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockSetDefaultStripePaymentDetails.mockRejectedValue(
      new Error('Payment method not found')
    );

    await expect(
      setDefaultStripePaymentDetails(MOCK_PAYMENT_METHOD_ID)
    ).rejects.toThrow('Payment method not found');
  });
});
