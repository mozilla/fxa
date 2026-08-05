/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getExperimentsAction } from './getExperimentsAction';

const mockGetExperiments = jest.fn();
const mockGetActionsService = jest.fn(() => ({
  getExperiments: mockGetExperiments,
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

const mockGetIpAddress = jest.fn();
jest.mock('../utils/getIpAddress', () => ({
  __esModule: true,
  getIpAddress: () => mockGetIpAddress(),
}));

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

describe('getExperimentsAction', () => {
  const MOCK_UID = 'uid-abc-123';
  const MOCK_IP = '192.168.1.1';
  const MOCK_EXPERIMENTATION_ID = 'exp-id-456';

  beforeEach(() => {
    mockGetExperiments.mockReset();
    mockGetSessionUid.mockReset();
    mockGetIpAddress.mockReset();
    mockHeaders.mockReset();
    mockGetSessionUid.mockResolvedValue(MOCK_UID);
    mockGetIpAddress.mockResolvedValue(MOCK_IP);
    mockHeaders.mockResolvedValue({
      get: jest.fn((key: string) =>
        key === 'x-experimentation-id' ? MOCK_EXPERIMENTATION_ID : null
      ),
    });
  });

  it('calls getExperiments with all collected parameters', async () => {
    const mockExperiments = { experiments: [{ name: 'test-exp' }] };
    mockGetExperiments.mockResolvedValue(mockExperiments);

    await getExperimentsAction({
      experimentationPreview: false,
      language: 'en',
    });

    expect(mockGetExperiments).toHaveBeenCalledWith({
      experimentationPreview: false,
      language: 'en',
      fxaUid: MOCK_UID,
      ip: MOCK_IP,
      experimentationId: MOCK_EXPERIMENTATION_ID,
    });
  });

  it('returns the experiments array from the result', async () => {
    const mockExperimentsList = [{ name: 'test-exp', variant: 'control' }];
    mockGetExperiments.mockResolvedValue({
      experiments: mockExperimentsList,
    });

    const result = await getExperimentsAction({
      experimentationPreview: false,
      language: 'en',
    });

    expect(result).toEqual(mockExperimentsList);
  });

  it('uses empty string when x-experimentation-id header is missing', async () => {
    mockHeaders.mockResolvedValue({
      get: jest.fn().mockReturnValue(null),
    });
    mockGetExperiments.mockResolvedValue({ experiments: [] });

    await getExperimentsAction({
      experimentationPreview: false,
      language: 'en',
    });

    expect(mockGetExperiments).toHaveBeenCalledWith(
      expect.objectContaining({ experimentationId: '' })
    );
  });

  it('returns undefined when the service throws an error', async () => {
    mockGetExperiments.mockRejectedValue(new Error('Service unavailable'));

    const result = await getExperimentsAction({
      experimentationPreview: false,
      language: 'en',
    });

    expect(result).toBeUndefined();
  });
});
