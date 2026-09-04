/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { determineStaySubscribedEligibilityAction } from './determineStaySubscribedEligibility';

const mockDetermineStaySubscribedEligibility = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  determineStaySubscribedEligibility: mockDetermineStaySubscribedEligibility,
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

describe('determineStaySubscribedEligibilityAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';

  beforeEach(() => {
    mockDetermineStaySubscribedEligibility.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls determineStaySubscribedEligibility with all parameters', async () => {
    const mockResult = { reason: 'eligible' };
    mockDetermineStaySubscribedEligibility.mockResolvedValue(mockResult);

    await determineStaySubscribedEligibilityAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockDetermineStaySubscribedEligibility).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { reason: 'eligible' };
    mockDetermineStaySubscribedEligibility.mockResolvedValue(mockResult);

    const result = await determineStaySubscribedEligibilityAction(
      MOCK_SUBSCRIPTION_ID,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(result).toEqual(mockResult);
  });

  it('handles optional language parameters', async () => {
    const mockResult = { reason: 'no_churn_intervention_found' };
    mockDetermineStaySubscribedEligibility.mockResolvedValue(mockResult);

    await determineStaySubscribedEligibilityAction(MOCK_SUBSCRIPTION_ID);

    expect(mockDetermineStaySubscribedEligibility).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: undefined,
      selectedLanguage: undefined,
    });
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      determineStaySubscribedEligibilityAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockDetermineStaySubscribedEligibility).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockDetermineStaySubscribedEligibility.mockRejectedValue(
      new Error('Service unavailable')
    );

    await expect(
      determineStaySubscribedEligibilityAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Service unavailable');
  });
});
