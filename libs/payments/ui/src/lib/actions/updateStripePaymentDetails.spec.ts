/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { updateStripePaymentDetails } from './updateStripePaymentDetails';

const mockUpdateStripePaymentDetails = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  updateStripePaymentDetails: mockUpdateStripePaymentDetails,
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

describe('updateStripePaymentDetails', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_CONFIRMATION_TOKEN_ID = 'ctoken_test_456';
  const MOCK_IP_ADDRESS = '192.168.1.1';

  beforeEach(() => {
    mockUpdateStripePaymentDetails.mockReset();
    mockRequireSessionUid.mockReset();
    mockGetIpAddress.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
    mockGetIpAddress.mockResolvedValue(MOCK_IP_ADDRESS);
  });

  it('calls the service with uid, confirmationTokenId, and ipAddress', async () => {
    const mockResult = { success: true };
    mockUpdateStripePaymentDetails.mockResolvedValue(mockResult);

    await updateStripePaymentDetails(MOCK_CONFIRMATION_TOKEN_ID);

    expect(mockUpdateStripePaymentDetails).toHaveBeenCalledWith({
      uid: MOCK_UID,
      confirmationTokenId: MOCK_CONFIRMATION_TOKEN_ID,
      ipAddress: MOCK_IP_ADDRESS,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { success: true, clientSecret: 'cs_test' };
    mockUpdateStripePaymentDetails.mockResolvedValue(mockResult);

    const result = await updateStripePaymentDetails(MOCK_CONFIRMATION_TOKEN_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      updateStripePaymentDetails(MOCK_CONFIRMATION_TOKEN_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockUpdateStripePaymentDetails).not.toHaveBeenCalled();
  });

  it('propagates errors when getIpAddress rejects', async () => {
    mockGetIpAddress.mockRejectedValue(new Error('Failed to get IP'));

    await expect(
      updateStripePaymentDetails(MOCK_CONFIRMATION_TOKEN_ID)
    ).rejects.toThrow('Failed to get IP');

    expect(mockUpdateStripePaymentDetails).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockUpdateStripePaymentDetails.mockRejectedValue(
      new Error('Card declined')
    );

    await expect(
      updateStripePaymentDetails(MOCK_CONFIRMATION_TOKEN_ID)
    ).rejects.toThrow('Card declined');
  });
});
