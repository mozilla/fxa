/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { cancelSubscriptionImmediatelyAction } from './cancelSubscriptionImmediately';

const mockCancelSubscriptionImmediately = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  cancelSubscriptionImmediately: mockCancelSubscriptionImmediately,
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

describe('cancelSubscriptionImmediatelyAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';

  beforeEach(() => {
    mockCancelSubscriptionImmediately.mockReset();
    mockRequireSessionUid.mockReset();
    mockRevalidatePath.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls cancelSubscriptionImmediately with the session uid and subscription id', async () => {
    mockCancelSubscriptionImmediately.mockResolvedValue({ success: true });

    await cancelSubscriptionImmediatelyAction(MOCK_SUBSCRIPTION_ID);

    expect(mockCancelSubscriptionImmediately).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
    });
  });

  it('revalidates the manage subscriptions page after successful cancellation', async () => {
    mockCancelSubscriptionImmediately.mockResolvedValue({ success: true });

    await cancelSubscriptionImmediatelyAction(MOCK_SUBSCRIPTION_ID);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/subscriptions/manage',
      'page'
    );
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      cancelledAt: 1700000000,
    };
    mockCancelSubscriptionImmediately.mockResolvedValue(mockResult);

    const result =
      await cancelSubscriptionImmediatelyAction(MOCK_SUBSCRIPTION_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      cancelSubscriptionImmediatelyAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockCancelSubscriptionImmediately).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockCancelSubscriptionImmediately.mockRejectedValue(
      new Error('Subscription not found')
    );

    await expect(
      cancelSubscriptionImmediatelyAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Subscription not found');
  });
});
