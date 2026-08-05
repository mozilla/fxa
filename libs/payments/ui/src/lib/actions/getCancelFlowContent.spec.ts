/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCancelFlowContentAction } from './getCancelFlowContent';

const mockGetCancelFlowContent = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getCancelFlowContent: mockGetCancelFlowContent,
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

describe('getCancelFlowContentAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';

  beforeEach(() => {
    mockGetCancelFlowContent.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls getCancelFlowContent with all parameters', async () => {
    const mockResult = { flowType: 'cancel', productName: 'Test Product' };
    mockGetCancelFlowContent.mockResolvedValue(mockResult);

    await getCancelFlowContentAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockGetCancelFlowContent).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      flowType: 'cancel',
      productName: 'Test Product',
      active: true,
    };
    mockGetCancelFlowContent.mockResolvedValue(mockResult);

    const result = await getCancelFlowContentAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(result).toEqual(mockResult);
  });

  it('handles optional language parameters', async () => {
    mockGetCancelFlowContent.mockResolvedValue({});

    await getCancelFlowContentAction(MOCK_SUBSCRIPTION_ID);

    expect(mockGetCancelFlowContent).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: undefined,
      selectedLanguage: undefined,
    });
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      getCancelFlowContentAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockGetCancelFlowContent).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetCancelFlowContent.mockRejectedValue(
      new Error('Subscription not found')
    );

    await expect(
      getCancelFlowContentAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Subscription not found');
  });
});
