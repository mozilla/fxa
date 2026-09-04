/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getTaxAddressAction } from './getTaxAddress';

const mockGetTaxAddress = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getTaxAddress: mockGetTaxAddress,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockGetSessionUid = jest.fn();
jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  getSessionUid: () => mockGetSessionUid(),
}));

describe('getTaxAddressAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_IP_ADDRESS = '192.168.1.1';

  beforeEach(() => {
    mockGetTaxAddress.mockReset();
    mockGetSessionUid.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls getTaxAddress with ipAddress and uid', async () => {
    mockGetTaxAddress.mockResolvedValue({
      result: { countryCode: 'US', postalCode: '90210' },
    });

    await getTaxAddressAction(MOCK_IP_ADDRESS);

    expect(mockGetTaxAddress).toHaveBeenCalledWith({
      ipAddress: MOCK_IP_ADDRESS,
      uid: MOCK_UID,
    });
  });

  it('returns only the result property from the response', async () => {
    const mockTaxAddress = { countryCode: 'US', postalCode: '90210' };
    mockGetTaxAddress.mockResolvedValue({ result: mockTaxAddress });

    const result = await getTaxAddressAction(MOCK_IP_ADDRESS);

    expect(result).toEqual(mockTaxAddress);
  });

  it('passes uid as undefined when user is not authenticated', async () => {
    mockGetSessionUid.mockResolvedValue(undefined);
    mockGetTaxAddress.mockResolvedValue({ result: { countryCode: 'US' } });

    await getTaxAddressAction(MOCK_IP_ADDRESS);

    expect(mockGetTaxAddress).toHaveBeenCalledWith({
      ipAddress: MOCK_IP_ADDRESS,
      uid: undefined,
    });
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetTaxAddress.mockRejectedValue(new Error('Geolocation failed'));

    await expect(getTaxAddressAction(MOCK_IP_ADDRESS)).rejects.toThrow(
      'Geolocation failed'
    );
  });
});
