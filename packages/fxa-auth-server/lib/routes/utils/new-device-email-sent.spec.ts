/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  markNewDeviceEmailSent,
  wasNewDeviceEmailSent,
} from './new-device-email-sent';

const SESSION_ID = 'a'.repeat(64);
const KEY = `newDeviceEmailSent:${SESSION_ID}`;

describe('new-device-email-sent', () => {
  let redis: any;
  let log: any;

  beforeEach(() => {
    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };
    log = { warn: jest.fn() };
  });

  describe('markNewDeviceEmailSent', () => {
    it('writes a one-hour marker keyed by session', async () => {
      await markNewDeviceEmailSent(redis, log, SESSION_ID);
      expect(redis.set).toHaveBeenCalledWith(KEY, '1', 'EX', 3600);
    });

    it('swallows and logs a Redis failure', async () => {
      redis.set.mockRejectedValue(new Error('boom'));
      await expect(
        markNewDeviceEmailSent(redis, log, SESSION_ID)
      ).resolves.toBeUndefined();
      expect(log.warn).toHaveBeenCalledWith('newDeviceEmailSent.writeFailed', {
        error: 'boom',
      });
    });

    it('is a no-op without Redis', async () => {
      await expect(
        markNewDeviceEmailSent(undefined, log, SESSION_ID)
      ).resolves.toBeUndefined();
    });
  });

  describe('wasNewDeviceEmailSent', () => {
    it('is true when the marker exists and consumes it', async () => {
      redis.get.mockResolvedValue('1');
      await expect(wasNewDeviceEmailSent(redis, log, SESSION_ID)).resolves.toBe(
        true
      );
      expect(redis.get).toHaveBeenCalledWith(KEY);
      expect(redis.del).toHaveBeenCalledWith(KEY);
    });

    it('is false when the marker is missing', async () => {
      redis.get.mockResolvedValue(null);
      await expect(wasNewDeviceEmailSent(redis, log, SESSION_ID)).resolves.toBe(
        false
      );
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('is false and logs on a Redis failure', async () => {
      redis.get.mockRejectedValue(new Error('boom'));
      await expect(wasNewDeviceEmailSent(redis, log, SESSION_ID)).resolves.toBe(
        false
      );
      expect(log.warn).toHaveBeenCalledWith('newDeviceEmailSent.readFailed', {
        error: 'boom',
      });
    });

    it('is false without Redis or a session id', async () => {
      await expect(
        wasNewDeviceEmailSent(undefined, log, SESSION_ID)
      ).resolves.toBe(false);
      await expect(wasNewDeviceEmailSent(redis, log, undefined)).resolves.toBe(
        false
      );
      expect(redis.get).not.toHaveBeenCalled();
    });
  });
});
