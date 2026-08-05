/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { redeemChurnCouponAction } from './redeemChurnCoupon';

const mockRedeemChurnCoupon = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  redeemChurnCoupon: mockRedeemChurnCoupon,
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

describe('redeemChurnCouponAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_SUBSCRIPTION_ID = 'sub_test_456';
  const MOCK_PARAMS = { locale: 'en', subscriptionId: MOCK_SUBSCRIPTION_ID };
  const MOCK_SEARCH_PARAMS = { utm_source: 'email' };
  const MOCK_ACCEPT_LANGUAGE = 'en-US';
  const MOCK_SELECTED_LANGUAGE = 'en';
  const MOCK_FLATTENED_PARAMS = {
    locale: 'en',
    subscriptionId: MOCK_SUBSCRIPTION_ID,
  };
  const MOCK_FLATTENED_SEARCH_PARAMS = { utm_source: 'email' };
  const MOCK_ADDITIONAL_ARGS = { ip: '127.0.0.1' };

  beforeEach(() => {
    mockRedeemChurnCoupon.mockReset();
    mockRequireSessionUid.mockReset();
    mockFlattenRouteParams.mockReset();
    mockGetAdditionalRequestArgs.mockReset();
    mockRequireSessionUid.mockResolvedValue(MOCK_UID);
    mockFlattenRouteParams
      .mockReturnValueOnce(MOCK_FLATTENED_PARAMS)
      .mockReturnValueOnce(MOCK_FLATTENED_SEARCH_PARAMS);
    mockGetAdditionalRequestArgs.mockResolvedValue(MOCK_ADDITIONAL_ARGS);
  });

  it('calls redeemChurnCoupon with correct args for cancel churnType', async () => {
    const mockResult = { redeemed: true };
    mockRedeemChurnCoupon.mockResolvedValue(mockResult);

    await redeemChurnCouponAction(
      MOCK_SUBSCRIPTION_ID,
      'cancel',
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS,
      MOCK_ACCEPT_LANGUAGE,
      MOCK_SELECTED_LANGUAGE
    );

    expect(mockRedeemChurnCoupon).toHaveBeenCalledWith({
      uid: MOCK_UID,
      subscriptionId: MOCK_SUBSCRIPTION_ID,
      churnType: 'cancel',
      acceptLanguage: MOCK_ACCEPT_LANGUAGE,
      selectedLanguage: MOCK_SELECTED_LANGUAGE,
      requestArgs: {
        ...MOCK_ADDITIONAL_ARGS,
        params: MOCK_FLATTENED_PARAMS,
        searchParams: MOCK_FLATTENED_SEARCH_PARAMS,
      },
    });
  });

  it('calls redeemChurnCoupon with stay_subscribed churnType', async () => {
    mockRedeemChurnCoupon.mockResolvedValue({ redeemed: true });

    await redeemChurnCouponAction(
      MOCK_SUBSCRIPTION_ID,
      'stay_subscribed',
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS
    );

    expect(mockRedeemChurnCoupon).toHaveBeenCalledWith(
      expect.objectContaining({
        churnType: 'stay_subscribed',
      })
    );
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { redeemed: true, reason: 'coupon_applied' };
    mockRedeemChurnCoupon.mockResolvedValue(mockResult);

    const result = await redeemChurnCouponAction(
      MOCK_SUBSCRIPTION_ID,
      'cancel',
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS
    );

    expect(result).toEqual(mockResult);
  });

  it('flattens route params and search params', async () => {
    mockRedeemChurnCoupon.mockResolvedValue({ redeemed: true });

    await redeemChurnCouponAction(
      MOCK_SUBSCRIPTION_ID,
      'cancel',
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS
    );

    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_PARAMS);
    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_SEARCH_PARAMS);
  });

  it('propagates errors when requireSessionUid rejects', async () => {
    mockRequireSessionUid.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      redeemChurnCouponAction(
        MOCK_SUBSCRIPTION_ID,
        'cancel',
        MOCK_PARAMS,
        MOCK_SEARCH_PARAMS
      )
    ).rejects.toThrow('Not authenticated');

    expect(mockRedeemChurnCoupon).not.toHaveBeenCalled();
  });

  it('propagates errors when the actions service rejects', async () => {
    mockRedeemChurnCoupon.mockRejectedValue(new Error('Coupon expired'));

    await expect(
      redeemChurnCouponAction(
        MOCK_SUBSCRIPTION_ID,
        'cancel',
        MOCK_PARAMS,
        MOCK_SEARCH_PARAMS
      )
    ).rejects.toThrow('Coupon expired');
  });
});
