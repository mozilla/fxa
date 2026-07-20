/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockCheckoutCartWithStripe = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  checkoutCartWithStripe: mockCheckoutCartWithStripe,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

jest.mock('@fxa/payments/ui-auth', () => ({
  __esModule: true,
  getSessionUid: async () => 'uid-abc-123',
}));

jest.mock('../utils/getAdditionalRequestArgs', () => ({
  __esModule: true,
  getAdditionalRequestArgs: async () => ({
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    deviceType: 'desktop',
    experimentationId: '',
    isFreeTrial: false,
  }),
}));

import { checkoutCartWithStripe } from './checkoutCartWithStripe';

const MOCK_ATTRIBUTION = {
  utm_campaign: '',
  utm_content: '',
  utm_medium: '',
  utm_source: '',
  utm_term: '',
  session_flow_id: '',
  session_entrypoint: '',
  session_entrypoint_experiment: '',
  session_entrypoint_variation: '',
};

describe('checkoutCartWithStripe', () => {
  beforeEach(() => {
    mockCheckoutCartWithStripe.mockReset();
  });

  it('forwards paymentMethod to the actions service', async () => {
    await checkoutCartWithStripe(
      'cart-1',
      1,
      'ctoken_abc',
      'card',
      MOCK_ATTRIBUTION,
      { cartId: 'cart-1' },
      {}
    );

    expect(mockCheckoutCartWithStripe).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: 'cart-1',
        version: 1,
        confirmationTokenId: 'ctoken_abc',
        paymentMethod: 'card',
      })
    );
  });

  it('forwards apple_pay as the paymentMethod when selected', async () => {
    await checkoutCartWithStripe(
      'cart-1',
      1,
      'ctoken_abc',
      'apple_pay',
      MOCK_ATTRIBUTION,
      {},
      {}
    );

    expect(mockCheckoutCartWithStripe).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: 'apple_pay' })
    );
  });

  it('propagates errors from the actions service', async () => {
    mockCheckoutCartWithStripe.mockRejectedValue(new Error('boom'));

    await expect(
      checkoutCartWithStripe(
        'cart-1',
        1,
        'ctoken_abc',
        'card',
        MOCK_ATTRIBUTION,
        {},
        {}
      )
    ).rejects.toThrow('boom');
  });
});
