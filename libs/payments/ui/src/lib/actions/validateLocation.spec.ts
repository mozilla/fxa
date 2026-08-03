/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { validateLocationAction } from './validateLocation';

const mockValidateLocation = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  validateLocation: mockValidateLocation,
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

describe('validateLocationAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_OFFERING_ID = 'offering-vpn-123';
  const MOCK_TAX_ADDRESS = { countryCode: 'US', postalCode: '90210' };
  const MOCK_INTERVAL = 'monthly';

  beforeEach(() => {
    mockValidateLocation.mockReset();
    mockGetSessionUid.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls validateLocation with all parameters', async () => {
    const mockResult = { valid: true };
    mockValidateLocation.mockResolvedValue(mockResult);

    await validateLocationAction(
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS,
      MOCK_INTERVAL
    );

    expect(mockValidateLocation).toHaveBeenCalledWith({
      offeringId: MOCK_OFFERING_ID,
      taxAddress: MOCK_TAX_ADDRESS,
      uid: MOCK_UID,
      interval: MOCK_INTERVAL,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { valid: true };
    mockValidateLocation.mockResolvedValue(mockResult);

    const result = await validateLocationAction(
      MOCK_OFFERING_ID,
      MOCK_TAX_ADDRESS,
      MOCK_INTERVAL
    );

    expect(result).toEqual(mockResult);
  });

  it('handles optional taxAddress and interval parameters', async () => {
    mockValidateLocation.mockResolvedValue({ valid: true });

    await validateLocationAction(MOCK_OFFERING_ID);

    expect(mockValidateLocation).toHaveBeenCalledWith({
      offeringId: MOCK_OFFERING_ID,
      taxAddress: undefined,
      uid: MOCK_UID,
      interval: undefined,
    });
  });

  it('propagates errors when the actions service rejects', async () => {
    mockValidateLocation.mockRejectedValue(new Error('Location not supported'));

    await expect(validateLocationAction(MOCK_OFFERING_ID)).rejects.toThrow(
      'Location not supported'
    );
  });
});
