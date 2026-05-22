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

  it('forwards isFreeTrial=true through requestArgs', async () => {
    await recordEmitterEventAction(
      'checkoutView',
      { offeringId: 'foo' },
      {},
      undefined,
      undefined,
      true
    );

    expect(mockRecordEmitterEvent).toHaveBeenCalledTimes(1);
    expect(mockRecordEmitterEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'checkoutView',
        requestArgs: expect.objectContaining({ isFreeTrial: true }),
      })
    );
  });

  it('defaults isFreeTrial to false when omitted', async () => {
    await recordEmitterEventAction('checkoutView', { offeringId: 'foo' }, {});

    expect(mockRecordEmitterEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        requestArgs: expect.objectContaining({ isFreeTrial: false }),
      })
    );
  });

  it('defaults isFreeTrial to false when explicitly undefined', async () => {
    await recordEmitterEventAction(
      'checkoutSuccess',
      {},
      {},
      undefined,
      undefined,
      undefined
    );

    expect(mockRecordEmitterEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        requestArgs: expect.objectContaining({ isFreeTrial: false }),
      })
    );
  });

  it('overrides the isFreeTrial default from getAdditionalRequestArgs', async () => {
    await recordEmitterEventAction(
      'checkoutFail',
      {},
      {},
      undefined,
      undefined,
      true
    );

    const call = mockRecordEmitterEvent.mock.calls[0][0];
    expect(call.requestArgs.isFreeTrial).toBe(true);
  });
});
