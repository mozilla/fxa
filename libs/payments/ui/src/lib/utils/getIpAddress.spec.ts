/**
 * @jest-environment node
 */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('server-only', () => ({}));

import { getIpAddress } from './getIpAddress';

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

describe('getIpAddress', () => {
  beforeEach(() => {
    mockHeaders.mockReset();
  });

  it('returns the first IP from x-forwarded-for header', async () => {
    mockHeaders.mockResolvedValue({
      get: jest.fn((key: string) =>
        key === 'x-forwarded-for' ? '10.0.0.1,192.168.1.1' : null
      ),
    });

    const result = await getIpAddress();

    expect(result).toBe('10.0.0.1');
  });

  it('returns a single IP when x-forwarded-for has one value', async () => {
    mockHeaders.mockResolvedValue({
      get: jest.fn((key: string) =>
        key === 'x-forwarded-for' ? '203.0.113.50' : null
      ),
    });

    const result = await getIpAddress();

    expect(result).toBe('203.0.113.50');
  });

  it('returns 127.0.0.1 when x-forwarded-for is absent', async () => {
    mockHeaders.mockResolvedValue({
      get: jest.fn().mockReturnValue(null),
    });

    const result = await getIpAddress();

    expect(result).toBe('127.0.0.1');
  });
});
