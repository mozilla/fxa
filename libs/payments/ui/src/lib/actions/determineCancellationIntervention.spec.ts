/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { determineCancellationInterventionAction } from './determineCancellationIntervention';

const mockDetermineCancellationIntervention = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  determineCancellationIntervention: mockDetermineCancellationIntervention,
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

describe('determineCancellationInterventionAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';

  beforeEach(() => {
    mockDetermineCancellationIntervention.mockReset();
    mockRequireSessionUid.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls determineCancellationIntervention with all parameters', async () => {
    const mockResult = { eligible: true, interventionType: 'cancel' };
    mockDetermineCancellationIntervention.mockResolvedValue(mockResult);

    await determineCancellationInterventionAction({
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });

    expect(mockDetermineCancellationIntervention).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
    });
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { eligible: true, interventionType: 'cancel' };
    mockDetermineCancellationIntervention.mockResolvedValue(mockResult);

    const result = await determineCancellationInterventionAction({
      subscriptionId: MOCK_SUBSCRIPTION_ID,
    });

    expect(result).toEqual(mockResult);
  });

  it('handles optional language parameters', async () => {
    mockDetermineCancellationIntervention.mockResolvedValue({});

    await determineCancellationInterventionAction({
      subscriptionId: MOCK_SUBSCRIPTION_ID,
    });

    expect(mockDetermineCancellationIntervention).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      acceptLanguage: undefined,
      selectedLanguage: undefined,
    });
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      determineCancellationInterventionAction({
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    ).rejects.toThrow('Not authenticated');

    expect(mockDetermineCancellationIntervention).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockDetermineCancellationIntervention.mockRejectedValue(
      new Error('Subscription not found')
    );

    await expect(
      determineCancellationInterventionAction({
        subscriptionId: MOCK_SUBSCRIPTION_ID,
      })
    ).rejects.toThrow('Subscription not found');
  });
});
