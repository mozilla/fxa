/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { cancelSubscriptionAtPeriodEndAction } from './cancelSubscriptionAtPeriodEnd';

const mockCancelSubscriptionAtPeriodEnd = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  cancelSubscriptionAtPeriodEnd: mockCancelSubscriptionAtPeriodEnd,
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

describe('cancelSubscriptionAtPeriodEndAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';

  beforeEach(() => {
    mockCancelSubscriptionAtPeriodEnd.mockReset();
    mockRequireSessionUid.mockReset();
    mockRevalidatePath.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
  });

  it('calls cancelSubscriptionAtPeriodEnd with the session uid and subscription id', async () => {
    mockCancelSubscriptionAtPeriodEnd.mockResolvedValue({ success: true });

    await cancelSubscriptionAtPeriodEndAction(MOCK_SUBSCRIPTION_ID);

    expect(mockCancelSubscriptionAtPeriodEnd).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
    });
  });

  it('revalidates the cancel page path after successful cancellation', async () => {
    mockCancelSubscriptionAtPeriodEnd.mockResolvedValue({ success: true });

    await cancelSubscriptionAtPeriodEndAction(MOCK_SUBSCRIPTION_ID);

    expect(mockRevalidatePath).toHaveBeenCalledWith(
      '/[locale]/subscriptions/[subscriptionId]/cancel',
      'page'
    );
  });

  it('returns the result from the actions service', async () => {
    const mockResult = {
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      cancelledAt: 1700000000,
    };
    mockCancelSubscriptionAtPeriodEnd.mockResolvedValue(mockResult);

    const result =
      await cancelSubscriptionAtPeriodEndAction(MOCK_SUBSCRIPTION_ID);

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      cancelSubscriptionAtPeriodEndAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Not authenticated');

    expect(mockCancelSubscriptionAtPeriodEnd).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockCancelSubscriptionAtPeriodEnd.mockRejectedValue(
      new Error('Customer mismatch')
    );

    await expect(
      cancelSubscriptionAtPeriodEndAction(MOCK_SUBSCRIPTION_ID)
    ).rejects.toThrow('Customer mismatch');
  });
});
