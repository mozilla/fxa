/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { SubscriptionAttributionParams } from '@fxa/payments/cart';
import { checkoutCartWithPaypal } from './checkoutCartWithPaypal';

const mockCheckoutCartWithPaypal = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  checkoutCartWithPaypal: mockCheckoutCartWithPaypal,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

const mockGetSessionUid = jest.fn();
jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  getSessionUid: () => mockGetSessionUid(),
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

describe('checkoutCartWithPaypal', () => {
  const MOCK_SESSION_UID = 'uid-abc-123';
  const MOCK_CART_ID = 'cart-abc-123';
  const MOCK_VERSION = 1;
  const MOCK_ATTRIBUTION: SubscriptionAttributionParams = {
    utm_source: 'email',
    utm_medium: 'link',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    session_flow_id: '',
    session_entrypoint: '',
    session_entrypoint_experiment: '',
    session_entrypoint_variation: '',
  };
  const MOCK_PARAMS = { locale: 'en', offeringId: 'vpn' };
  const MOCK_SEARCH_PARAMS = { utm_campaign: 'summer' };
  const MOCK_TOKEN = 'pp-token-123';
  const MOCK_FLATTENED_PARAMS = { locale: 'en', offeringId: 'vpn' };
  const MOCK_FLATTENED_SEARCH_PARAMS = { utm_campaign: 'summer' };
  const MOCK_ADDITIONAL_ARGS = { ip: '127.0.0.1' };

  beforeEach(() => {
    mockCheckoutCartWithPaypal.mockReset();
    mockGetSessionUid.mockReset();
    mockFlattenRouteParams.mockReset();
    mockGetAdditionalRequestArgs.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_SESSION_UID);
    mockFlattenRouteParams
      .mockReturnValueOnce(MOCK_FLATTENED_PARAMS)
      .mockReturnValueOnce(MOCK_FLATTENED_SEARCH_PARAMS);
    mockGetAdditionalRequestArgs.mockResolvedValue(MOCK_ADDITIONAL_ARGS);
  });

  it('calls checkoutCartWithPaypal with all parameters including token', async () => {
    mockCheckoutCartWithPaypal.mockResolvedValue(undefined);

    await checkoutCartWithPaypal(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_ATTRIBUTION,
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS,
      MOCK_TOKEN
    );

    expect(mockCheckoutCartWithPaypal).toHaveBeenCalledWith({
      cartId: MOCK_CART_ID,
      version: MOCK_VERSION,
      attribution: MOCK_ATTRIBUTION,
      requestArgs: {
        ...MOCK_ADDITIONAL_ARGS,
        params: MOCK_FLATTENED_PARAMS,
        searchParams: MOCK_FLATTENED_SEARCH_PARAMS,
      },
      sessionUid: MOCK_SESSION_UID,
      token: MOCK_TOKEN,
    });
  });

  it('calls checkoutCartWithPaypal with undefined token when omitted', async () => {
    mockCheckoutCartWithPaypal.mockResolvedValue(undefined);

    await checkoutCartWithPaypal(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_ATTRIBUTION,
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS
    );

    expect(mockCheckoutCartWithPaypal).toHaveBeenCalledWith(
      expect.objectContaining({ token: undefined })
    );
  });

  it('flattens route params and search params', async () => {
    mockCheckoutCartWithPaypal.mockResolvedValue(undefined);

    await checkoutCartWithPaypal(
      MOCK_CART_ID,
      MOCK_VERSION,
      MOCK_ATTRIBUTION,
      MOCK_PARAMS,
      MOCK_SEARCH_PARAMS
    );

    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_PARAMS);
    expect(mockFlattenRouteParams).toHaveBeenCalledWith(MOCK_SEARCH_PARAMS);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockCheckoutCartWithPaypal.mockRejectedValue(
      new Error('PayPal checkout failed')
    );

    await expect(
      checkoutCartWithPaypal(
        MOCK_CART_ID,
        MOCK_VERSION,
        MOCK_ATTRIBUTION,
        MOCK_PARAMS,
        MOCK_SEARCH_PARAMS
      )
    ).rejects.toThrow('PayPal checkout failed');
  });
});
