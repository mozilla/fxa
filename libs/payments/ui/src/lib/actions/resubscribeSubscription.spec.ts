/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { resubscribeSubscriptionAction } from './resubscribeSubscription';

const mockResubscribeSubscription = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  resubscribeSubscription: mockResubscribeSubscription,
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

const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  __esModule: true,
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

describe('resubscribeSubscriptionAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';

  beforeEach(() => {
    mockResubscribeSubscription.mockReset();
    mockRequireSessionUid.mockReset();
    mockRevalidatePath.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls resubscribeSubscription with the session uid and subscription id', async () => {
    mockResubscribeSubscription.mockResolvedValue({ success: true });

    await resubscribeSubscriptionAction(MOCK_SUBSCRIPTION_ID);

    expect(mockResubscribeSubscription).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
    });
  });

  it('revalidates the stay-subscribed page path after successful resubscribe', async () => {
    mockResubscribeSubscription.mockResolvedValue({ success: true });

    await resubscribeSubscriptionAction(MOCK_SUBSCRIPTION_ID);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/subscriptions/[subscriptionId]/stay-subscribed',
      'page'
    );
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { subscriptionId: MOCK_SUBSCRIPTION_ID, active: true };
    mockResubscribeSubscription.mockResolvedValue(mockResult);

    const result = await resubscribeSubscriptionAction(MOCK_SUBSCRIPTION_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      resubscribeSubscriptionAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockResubscribeSubscription).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockResubscribeSubscription.mockRejectedValue(
      new Error('Subscription already active')
    );

    await expect(
      resubscribeSubscriptionAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Subscription already active');
  });
});
