/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { validateAndFormatPostalCode } from './validateAndFormatPostalCode';

const mockValidateAndFormatPostalCode = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  validateAndFormatPostalCode: mockValidateAndFormatPostalCode,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('validateAndFormatPostalCode', () => {
  const MOCK_POSTAL_CODE = '90210';
  const MOCK_COUNTRY_CODE = 'US';

  beforeEach(() => {
    mockValidateAndFormatPostalCode.mockReset();
  });

  it('calls validateAndFormatPostalCode with postalCode and countryCode', async () => {
    const mockResult = { postalCode: '90210', valid: true };
    mockValidateAndFormatPostalCode.mockResolvedValue(mockResult);

    await validateAndFormatPostalCode(MOCK_POSTAL_CODE, MOCK_COUNTRY_CODE);

    expect(mockValidateAndFormatPostalCode).toHaveBeenCalledWith({
      postalCode: MOCK_POSTAL_CODE,
      countryCode: MOCK_COUNTRY_CODE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { postalCode: '90210', valid: true };
    mockValidateAndFormatPostalCode.mockResolvedValue(mockResult);

    const result = await validateAndFormatPostalCode(
      MOCK_POSTAL_CODE,
      MOCK_COUNTRY_CODE
    );

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockValidateAndFormatPostalCode.mockRejectedValue(
      new Error('Invalid postal code')
    );

    await expect(
      validateAndFormatPostalCode(MOCK_POSTAL_CODE, MOCK_COUNTRY_CODE)
    ).rejects.toThrow('Invalid postal code');
  });
});
