/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockRecordEmitterEvent = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  recordEmitterEvent: mockRecordEmitterEvent,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
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

import { recordEmitterEventAction } from './recordEmitterEvent';

describe('recordEmitterEventAction', () => {
  beforeEach(() => {
    mockRecordEmitterEvent.mockReset();
  });

  it('forwards requestArgs with route params and search params', async () => {
    await recordEmitterEventAction(
      'checkoutView',
      { offeringId: 'foo', cartId: 'cart-1' },
      { utm_source: 'newsletter' }
    );

    expect(mockRecordEmitterEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'checkoutView',
        requestArgs: expect.objectContaining({
          params: expect.objectContaining({ offeringId: 'foo', cartId: 'cart-1' }),
          searchParams: expect.objectContaining({ utm_source: 'newsletter' }),
        }),
      })
    );
  });

});
