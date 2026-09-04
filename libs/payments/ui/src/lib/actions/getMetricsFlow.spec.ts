/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getMetricsFlowAction } from './getMetricsFlow';

const mockGetMetricsFlow = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getMetricsFlow: mockGetMetricsFlow,
}));

jest.mock('../nestapp/app', () => ({
  __esModule: true,
  getApp: () => ({
    getActionsService: mockGetActionsService,
  }),
}));

describe('getMetricsFlowAction', () => {
  beforeEach(() => {
    mockGetMetricsFlow.mockReset();
  });

  it('calls getMetricsFlow with no arguments', async () => {
    const mockResult = { flowId: 'flow-123', flowBeginTime: 1700000000000 };
    mockGetMetricsFlow.mockResolvedValue(mockResult);

    await getMetricsFlowAction();

    expect(mockGetMetricsFlow).toHaveBeenCalledWith();
  });

  it('returns the result from the actions service', async () => {
    const mockResult = { flowId: 'flow-123', flowBeginTime: 1700000000000 };
    mockGetMetricsFlow.mockResolvedValue(mockResult);

    const result = await getMetricsFlowAction();

    expect(result).toEqual(mockResult);
  });

  it('propagates errors when the actions service rejects', async () => {
    mockGetMetricsFlow.mockRejectedValue(new Error('Metrics unavailable'));

    await expect(getMetricsFlowAction()).rejects.toThrow('Metrics unavailable');
  });
});
