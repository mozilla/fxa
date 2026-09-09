/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('server-only', () => ({}));

import { getAdditionalRequestArgs } from './getAdditionalRequestArgs';

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

const mockGetIpAddress = jest.fn();
jest.mock('./getIpAddress', () => ({
  __esModule: true,
  getIpAddress: () => mockGetIpAddress(),
}));

jest.mock('next/server', () => ({
  __esModule: true,
  userAgentFromString: (ua: string) => ({
    device: { type: ua.includes('Mobile') ? 'mobile' : undefined },
  }),
}));

describe('getAdditionalRequestArgs', () => {
  const MOCK_IP = '192.168.1.1';
  const MOCK_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  const MOCK_EXPERIMENTATION_ID = 'exp-123';

  beforeEach(() => {
    mockHeaders.mockReset();
    mockGetIpAddress.mockReset();
    mockGetIpAddress.mockResolvedValue(MOCK_IP);
    mockHeaders.mockResolvedValue({
      get: jest.fn((key: string) => {
        if (key === 'user-agent') return MOCK_USER_AGENT;
        if (key === 'x-experimentation-id') return MOCK_EXPERIMENTATION_ID;
        return null;
      }),
    });
  });

  it('returns all request args with desktop device type', async () => {
    const result = await getAdditionalRequestArgs();

    expect(result).toEqual({
      ipAddress: MOCK_IP,
      userAgent: MOCK_USER_AGENT,
      deviceType: 'desktop',
      experimentationId: MOCK_EXPERIMENTATION_ID,
      isFreeTrial: false,
    });
  });

  it('returns mobile device type for mobile user agent', async () => {
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS) Mobile/15E148';
    mockHeaders.mockResolvedValue({
      get: jest.fn((key: string) => {
        if (key === 'user-agent') return mobileUA;
        return null;
      }),
    });

    const result = await getAdditionalRequestArgs();

    expect(result.deviceType).toBe('mobile');
  });

  it('defaults to empty string when headers are missing', async () => {
    mockHeaders.mockResolvedValue({
      get: jest.fn().mockReturnValue(null),
    });

    const result = await getAdditionalRequestArgs();

    expect(result.userAgent).toBe('');
    expect(result.experimentationId).toBe('');
  });
});
