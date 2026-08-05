/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getStaySubscribedFlowContentAction } from './getStaySubscribedFlowContent';

const mockGetStaySubscribedFlowContent = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getStaySubscribedFlowContent: mockGetStaySubscribedFlowContent,
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

describe('getStaySubscribedFlowContentAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';

  beforeEach(() => {
    mockGetStaySubscribedFlowContent.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls getStaySubscribedFlowContent with all parameters', async () => {
    const mockResult = {
      flowType: 'stay_subscribed',
      productName: 'Test Product',
    };
    mockGetStaySubscribedFlowContent.mockResolvedValue(mockResult);

    await getStaySubscribedFlowContentAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockGetStaySubscribedFlowContent).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      flowType: 'stay_subscribed',
      productName: 'Test Product',
      cancelAtPeriodEnd: true,
    };
    mockGetStaySubscribedFlowContent.mockResolvedValue(mockResult);

    const result = await getStaySubscribedFlowContentAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(result).toEqual(mockResult);
  });

  it('handles optional language parameters', async () => {
    mockGetStaySubscribedFlowContent.mockResolvedValue({});

    await getStaySubscribedFlowContentAction(MOCK_SUBSCRIPTION_ID);

    expect(mockGetStaySubscribedFlowContent).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: undefined,
      selectedLanguage: undefined,
    });
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      getStaySubscribedFlowContentAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockGetStaySubscribedFlowContent).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetStaySubscribedFlowContent.mockRejectedValue(
      new Error('Service unavailable')
    );

    await expect(
      getStaySubscribedFlowContentAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Service unavailable');
  });
});
