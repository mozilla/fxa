/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSubManPageContentAction } from './getSubManPageContent';

const mockGetSubManPageContent = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getSubManPageContent: mockGetSubManPageContent,
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

const mockFlattenRouteParams = jest.fn();
jest.mock('../utils/flatParam', () => ({
  __esModule: true,
  flattenRouteParams: (...args: unknown[]) => mockFlattenRouteParams(...args),
}));

const mockGetAdditionalRequestArgs = jest.fn();
jest.mock('../utils/getAdditionalRequestArgs', () => ({
  __esModule: true,
  getAdditionalRequestArgs: () => mockGetAdditionalRequestArgs(),
}));

describe('getSubManPageContentAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_PARAMS = { locale: 'en' };
  const MOCK_SEARCH_PARAMS = { utm_source: 'email' };
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';
  const MOCK_FLATTENED_PARAMS = { locale: 'en' };
  const MOCK_FLATTENED_SEARCH_PARAMS = { utm_source: 'email' };
  const MOCK_ADDITIONAL_ARGS = { ip: '127.0.0.1' };

  beforeEach(() => {
    mockGetSubManPageContent.mockReset();
    mockRequireSessionUid.mockReset();
    mockFlattenRouteParams.mockReset();
    mockGetAdditionalRequestArgs.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
    mockFlattenRouteParams
      .mockReturnValueOnce(MOCK_FLATTENED_PARAMS)
      .mockReturnValueOnce(MOCK_FLATTENED_SEARCH_PARAMS);
    mockGetAdditionalRequestArgs.mockResolvedValue(MOCK_ADDITIONAL_ARGS);
  });

  it('calls getSubManPageContent with all parameters', async () => {
    const mockResult = { subscriptions: [] };
    mockGetSubManPageContent.mockResolvedValue(mockResult);

    await getSubManPageContentAction(
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockGetSubManPageContent).toHaveBeenCalledWith({
      uid: MOCK_UID,
      requestArgs: {
        ...MOCK_ADDITIONAL_ARGS,
        params: MOCK_FLATTENED_PARAMS,
        searchParams: MOCK_FLATTENED_SEARCH_PARAMS,
      },
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      subscriptions: [{ id: 'sub_123', productName: 'VPN' }],
    };
    mockGetSubManPageContent.mockResolvedValue(mockResult);

    const result = await getSubManPageContentAction(
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(result).toEqual(mockResult);
  });

  it('flattens route params and search params', async () => {
    mockGetSubManPageContent.mockResolvedValue({});

    await getSubManPageContentAction(MOCK_PARAMS, MOCK_SEARCH_PARAMS);

    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_PARAMS);
    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_SEARCH_PARAMS);
  });

  it('handles optional language parameters', async () => {
    mockGetSubManPageContent.mockResolvedValue({});

    await getSubManPageContentAction(MOCK_PARAMS, MOCK_SEARCH_PARAMS);

    expect(mockGetSubManPageContent).toHaveBeenCalledWith(
      expect.objectContaining({
        acceptLanguage: undefined,
        selectedLanguage: undefined,
      })
    );
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      getSubManPageContentAction(MOCK_PARAMS, MOCK_SEARCH_PARAMS)
    ).rejects.toThrow('Not authenticated');

    expect(mockGetSubManPageContent).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetSubManPageContent.mockRejectedValue(
      new Error('Failed to load content')
    );

    await expect(
      getSubManPageContentAction(MOCK_PARAMS, MOCK_SEARCH_PARAMS)
    ).rejects.toThrow('Failed to load content');
  });
});
