/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { ProfileClient } from './profile.client';
import {
  MockProfileClientConfig,
  MockProfileClientConfigProvider,
} from './profile.config';
import { Logger } from '@nestjs/common';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import {
  MalformedUserinfoError,
  ProfileClientError,
  ProfileClientServiceFailureError,
} from './profile.error';

// Build a minimal fetch Response stand-in for the profile server.
function profileResponse(status: number, body: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as Response;
}

describe('ProfileClient', () => {
  let profileClient: ProfileClient;
  let originalFetch: typeof global.fetch;
  const mockLogger = {
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    originalFetch = global.fetch;

    const moduleRef = await Test.createTestingModule({
      providers: [
        MockProfileClientConfigProvider,
        {
          provide: Logger,
          useValue: mockLogger,
        },
        ProfileClient,
        MockStatsDProvider,
      ],
    }).compile();

    profileClient = moduleRef.get(ProfileClient);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should be defined', () => {
    expect(profileClient).toBeDefined();
  });

  describe('deleteCache', () => {
    it('sends a DELETE to the cache endpoint with the secret bearer token', async () => {
      global.fetch = jest.fn().mockResolvedValue(profileResponse(200, ''));

      await profileClient.deleteCache('uid123');

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      // Normalize a trailing slash off the base: faker.internet.url() may or
      // may not include one, and buildUrl collapses it either way.
      const base = MockProfileClientConfig.url.replace(/\/+$/, '');
      expect(url).toBe(`${base}/v1/cache/uid123`);
      expect(init.method).toBe('DELETE');
      expect(init.headers.Authorization).toBe(
        `Bearer ${MockProfileClientConfig.secretBearerToken}`
      );
    });

    it('appends the path to a base url that already has one (matches axios joining, no path collapse)', async () => {
      // admin-server (and possibly payments) configure a base url ending in
      // /v1. axios concatenated; preserve that exactly rather than letting a
      // URL-based join discard the base path.
      const client = new ProfileClient(
        mockLogger as any,
        { increment: jest.fn(), timing: jest.fn() } as any,
        {
          url: 'http://localhost:1111/v1',
          secretBearerToken: 'token',
          serviceName: 'admin',
        }
      );
      global.fetch = jest.fn().mockResolvedValue(profileResponse(200, ''));

      await client.deleteCache('uid123');

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('http://localhost:1111/v1/v1/cache/uid123');
    });

    it('increments statsd, logs, and rethrows when the request fails', async () => {
      const incSpy = jest.spyOn(profileClient.statsd, 'increment');
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(profileClient.deleteCache('uid123')).rejects.toThrow();
      expect(incSpy).toHaveBeenCalledWith('profile_client', {
        type: 'delete_cache_error',
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateDisplayName', () => {
    it('sends a POST with the display name as a JSON body', async () => {
      global.fetch = jest.fn().mockResolvedValue(profileResponse(200, {}));

      await profileClient.updateDisplayName('uid123', 'New Name');

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      const base = MockProfileClientConfig.url.replace(/\/+$/, '');
      expect(url).toBe(`${base}/v1/_display_name/uid123`);
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(init.body)).toEqual({ name: 'New Name' });
    });

    it('logs and rethrows when the request fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('fail'));

      await expect(
        profileClient.updateDisplayName('uid123', 'New Name')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getUserinfo', () => {
    const userinfoUrl = 'https://profile.example/v1/profile';

    it('sends a GET with the user access token and returns the userinfo', async () => {
      const userinfo = { uid: 'uid123', email: 'user@example.com' };
      global.fetch = jest
        .fn()
        .mockResolvedValue(profileResponse(200, userinfo));

      const result = await profileClient.getUserinfo(
        userinfoUrl,
        'user-access-token'
      );

      expect(result).toEqual(userinfo);
      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(userinfoUrl);
      expect(init.method).toBe('GET');
      expect(init.headers.Authorization).toBe('Bearer user-access-token');
    });

    it('throws MalformedUserinfoError when the response has no uid', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue(profileResponse(200, { email: 'user@example.com' }));

      await expect(
        profileClient.getUserinfo(userinfoUrl, 'user-access-token')
      ).rejects.toBeInstanceOf(MalformedUserinfoError);
    });
  });

  describe('error classification', () => {
    it('throws ProfileClientError on a 4xx response', async () => {
      global.fetch = jest.fn().mockResolvedValue(profileResponse(404, ''));

      await expect(profileClient.deleteCache('uid123')).rejects.toBeInstanceOf(
        ProfileClientError
      );
    });

    it('throws ProfileClientServiceFailureError on a 5xx response', async () => {
      global.fetch = jest.fn().mockResolvedValue(profileResponse(500, ''));

      await expect(profileClient.deleteCache('uid123')).rejects.toBeInstanceOf(
        ProfileClientServiceFailureError
      );
    });

    it('throws ProfileClientServiceFailureError when the request rejects', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(profileClient.deleteCache('uid123')).rejects.toBeInstanceOf(
        ProfileClientServiceFailureError
      );
    });
  });
});
