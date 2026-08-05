/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { serverLogAction } from './serverLog';

const mockServerLog = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  serverLog: mockServerLog,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('serverLogAction', () => {
  const MOCK_MESSAGE = 'Test log message';

  beforeEach(() => {
    mockServerLog.mockReset();
  });

  it('calls serverLog with message and data', async () => {
    const mockData = { key: 'value' };
    mockServerLog.mockResolvedValue(undefined);

    await serverLogAction(MOCK_MESSAGE, mockData);

    expect(mockServerLog).toHaveBeenCalledWith({
      message: MOCK_MESSAGE,
      data: mockData,
    });
  });

  it('calls serverLog with message only when data is omitted', async () => {
    mockServerLog.mockResolvedValue(undefined);

    await serverLogAction(MOCK_MESSAGE);

    expect(mockServerLog).toHaveBeenCalledWith({
      message: MOCK_MESSAGE,
      data: undefined,
    });
  });

  it('propagates errors when the actions service rejects', async () => {
    mockServerLog.mockRejectedValue(new Error('Log service error'));

    await expect(serverLogAction(MOCK_MESSAGE)).rejects.toThrow(
      'Log service error'
    );
  });
});
