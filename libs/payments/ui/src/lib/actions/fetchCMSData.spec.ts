/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fetchCMSData } from './fetchCMSData';

const mockFetchCMSData = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  fetchCMSData: mockFetchCMSData,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('fetchCMSData', () => {
  const MOCK_OFFERING_ID = 'offering-vpn-123';
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';

  beforeEach(() => {
    mockFetchCMSData.mockReset();
  });

  it('calls fetchCMSData with all parameters', async () => {
    const mockResult = { productName: 'VPN' };
    mockFetchCMSData.mockResolvedValue(mockResult);

    await fetchCMSData(
      MOCK_OFFERING_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockFetchCMSData).toHaveBeenCalledWith({
      offeringId: MOCK_OFFERING_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { productName: 'VPN', description: 'VPN service' };
    mockFetchCMSData.mockResolvedValue(mockResult);

    const result = await fetchCMSData(MOCK_OFFERING_ID);

    expect(result).toEqual(mockResult);
  });

  it('handles optional language parameters', async () => {
    mockFetchCMSData.mockResolvedValue({});

    await fetchCMSData(MOCK_OFFERING_ID);

    expect(mockFetchCMSData).toHaveBeenCalledWith({
      offeringId: MOCK_OFFERING_ID,
      acceptLanguage: undefined,
      selectedLanguage: undefined,
    });
  });

  it('propagates errors when the actions service rejects', async () => {
    mockFetchCMSData.mockRejectedValue(new Error('CMS unavailable'));

    await expect(fetchCMSData(MOCK_OFFERING_ID)).rejects.toThrow(
      'CMS unavailable'
    );
  });
});
