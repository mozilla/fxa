/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { ConflictException } from '@nestjs/common';
import { Request } from 'express';
import type Redis from 'ioredis';
import { MozLoggerService } from '@fxa/shared/mozlog';
import {
  AccountMatch,
  AccountStateService,
  DisableMatchingProgress,
} from './account-state.service';
import {
  DisableMatchingJobService,
  ScanRequest,
} from './disable-matching-job.service';

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }));

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('DisableMatchingJobService', () => {
  const match: AccountMatch = { domains: ['evil.com'] };
  const request: ScanRequest = {
    page: 'domain',
    event: 'domainBlocklist.disableMatching',
    user: 'admin@example.com',
    values: ['evil.com'],
  };
  const req = {
    headers: { 'user-agent': 'test' },
    ip: '127.0.0.1',
    socket: {},
  } as unknown as Request;
  const running = {
    status: 'running',
    scanned: 0,
    total: 0,
    disabled: 0,
  };

  let store: Map<string, string>;
  let redis: Record<'set' | 'get' | 'eval', jest.Mock>;
  let logger: Record<'info' | 'warn' | 'error', jest.Mock>;
  let disableMatching: jest.Mock;
  let service: DisableMatchingJobService;
  // Handles on the scan that the service started.
  let onProgress: (progress: DisableMatchingProgress) => Promise<void>;
  let finishScan: (disabled: number) => void;
  let failScan: (err: Error) => void;

  const setInStore = async (
    key: string,
    value: unknown,
    ...flags: unknown[]
  ) => {
    if (flags.includes('NX') && store.has(key)) {
      return null;
    }
    store.set(key, String(value));
    return 'OK';
  };

  beforeEach(() => {
    store = new Map();
    redis = {
      set: jest.fn(setInStore),
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      // Stands in for the two lock scripts: both act only for the lock's owner.
      eval: jest.fn(
        async (script: string, _keys, key: string, owner: string) => {
          if (store.get(key) !== owner) {
            return 0;
          }
          if (script.includes("'del'")) {
            store.delete(key);
          }
          return 1;
        }
      ),
    };
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    disableMatching = jest.fn(
      (_match, _origin, progress) =>
        new Promise<number>((resolve, reject) => {
          onProgress = progress;
          finishScan = resolve;
          failScan = reject;
        })
    );
    service = new DisableMatchingJobService(
      redis as unknown as Redis,
      { disableMatching } as unknown as AccountStateService,
      logger as unknown as MozLoggerService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('returns a running status while the scan still runs', async () => {
      await expect(service.start(match, req, request)).resolves.toEqual(
        running
      );
      await expect(service.get('domain')).resolves.toEqual(running);
    });

    it('takes the lock for 60 seconds and stores the status for an hour', async () => {
      await service.start(match, req, request);
      const owner = store.get('lock');

      expect(redis.set).toHaveBeenCalledWith('lock', owner, 'EX', 60, 'NX');
      expect(redis.set).toHaveBeenCalledWith(
        'status:domain',
        JSON.stringify({ ...running, owner }),
        'EX',
        3600
      );
    });

    it('logs who started the scan and for how many entries', async () => {
      await service.start(match, req, request);

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching.started',
        { user: 'admin@example.com', count: 1 }
      );
    });

    it('scans with the request headers and ip captured at the start', async () => {
      await service.start(match, req, request);

      expect(disableMatching).toHaveBeenCalledWith(
        match,
        { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' },
        expect.any(Function)
      );
    });

    it('refuses a second scan from either page while one is running', async () => {
      await service.start(match, req, request);

      await expect(
        service.start(match, req, { ...request, page: 'email' })
      ).rejects.toThrow(ConflictException);
      expect(disableMatching).toHaveBeenCalledTimes(1);
    });

    it('releases the lock when the status cannot be stored', async () => {
      redis.set
        .mockImplementationOnce(setInStore)
        .mockRejectedValueOnce(new Error('ECONNRESET'));

      await expect(service.start(match, req, request)).rejects.toThrow(
        'ECONNRESET'
      );
      expect(store.has('lock')).toBe(false);
      expect(disableMatching).not.toHaveBeenCalled();
    });
  });

  describe('progress', () => {
    it('shows the progress the scan reports', async () => {
      await service.start(match, req, request);

      await onProgress({ scanned: 10_000, total: 25_000, disabled: 3 });

      await expect(service.get('domain')).resolves.toEqual({
        status: 'running',
        scanned: 10_000,
        total: 25_000,
        disabled: 3,
      });
    });

    it('refreshes the lock for its owner', async () => {
      await service.start(match, req, request);

      await onProgress({ scanned: 10_000, total: 25_000, disabled: 3 });

      expect(redis.eval).toHaveBeenCalledWith(
        expect.stringContaining("'expire'"),
        1,
        'lock',
        store.get('lock'),
        60
      );
    });

    it('stops the scan as failed when another scan holds the lock', async () => {
      await service.start(match, req, request);
      store.set('lock', 'another-scan');

      const lost = onProgress({ scanned: 10_000, total: 25_000, disabled: 3 });
      await expect(lost).rejects.toThrow('The scan lost its lock');
      // disableMatching passes the progress error on, which ends the scan.
      lost.catch(failScan);
      await flush();

      await expect(service.get('domain')).resolves.toEqual({
        status: 'failed',
        scanned: 10_000,
        total: 25_000,
        disabled: 3,
      });
      expect(store.get('lock')).toBe('another-scan');
    });

    it('leaves the status of a newer scan on the page alone', async () => {
      await service.start(match, req, request);
      const newer = JSON.stringify({
        status: 'running',
        scanned: 0,
        total: 0,
        disabled: 0,
        owner: 'another-scan',
      });
      store.set('lock', 'another-scan');
      store.set('status:domain', newer);

      const lost = onProgress({ scanned: 10_000, total: 25_000, disabled: 3 });
      await expect(lost).rejects.toThrow('The scan lost its lock');
      lost.catch(failScan);
      await flush();

      expect(store.get('status:domain')).toBe(newer);
    });
  });

  describe('when the scan finishes', () => {
    it('marks the status done with the final count', async () => {
      await service.start(match, req, request);
      await onProgress({ scanned: 25_000, total: 25_000, disabled: 3 });

      finishScan(4);
      await flush();

      await expect(service.get('domain')).resolves.toEqual({
        status: 'done',
        scanned: 25_000,
        total: 25_000,
        disabled: 4,
      });
    });

    it('logs the count against the admin', async () => {
      await service.start(match, req, request);

      finishScan(4);
      await flush();

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching',
        { user: 'admin@example.com', count: 1, disabled: 4 }
      );
    });

    it('stores the final status before it releases the lock', async () => {
      await service.start(match, req, request);
      let statusAtRelease: string | undefined;
      redis.eval.mockImplementationOnce(async () => {
        statusAtRelease = JSON.parse(
          store.get('status:domain') as string
        ).status;
        store.delete('lock');
        return 1;
      });

      finishScan(4);
      await flush();

      expect(statusAtRelease).toBe('done');
    });

    it('still logs the scan as done when the final status cannot be stored', async () => {
      await service.start(match, req, request);
      const error = new Error('ECONNRESET');
      redis.set.mockRejectedValueOnce(error);

      finishScan(4);
      await flush();

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching',
        { user: 'admin@example.com', count: 1, disabled: 4 }
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'disableMatching.statusNotSaved',
        { err: error }
      );
    });

    it('ignores a failure to release the lock', async () => {
      await service.start(match, req, request);
      redis.eval.mockRejectedValueOnce(new Error('ECONNRESET'));

      finishScan(4);
      await flush();

      expect(logger.error).not.toHaveBeenCalled();
      await expect(service.get('domain')).resolves.toEqual({
        ...running,
        status: 'done',
        disabled: 4,
      });
    });

    it('lets a new scan start', async () => {
      await service.start(match, req, request);
      finishScan(0);
      await flush();

      await expect(service.start(match, req, request)).resolves.toEqual(
        running
      );
    });
  });

  describe('when the scan fails', () => {
    it('marks the status failed and keeps the counts it had reached', async () => {
      await service.start(match, req, request);
      await onProgress({ scanned: 10_000, total: 25_000, disabled: 2 });

      failScan(new Error('ECONNREFUSED'));
      await flush();

      await expect(service.get('domain')).resolves.toEqual({
        status: 'failed',
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
      });
    });

    it('logs the admin, the progress and the error, and reports to Sentry', async () => {
      const error = new Error('ECONNREFUSED');
      await service.start(match, req, request);
      await onProgress({ scanned: 10_000, total: 25_000, disabled: 2 });

      failScan(error);
      await flush();

      expect(logger.error).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching.failed',
        {
          user: 'admin@example.com',
          count: 1,
          scanned: 10_000,
          total: 25_000,
          disabled: 2,
          err: error,
        }
      );
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('releases the lock', async () => {
      await service.start(match, req, request);

      failScan(new Error('ECONNREFUSED'));
      await flush();

      expect(store.has('lock')).toBe(false);
    });
  });

  describe('get', () => {
    it('returns idle when the page has no status', async () => {
      await expect(service.get('domain')).resolves.toEqual({
        status: 'idle',
        scanned: 0,
        total: 0,
        disabled: 0,
      });
    });

    it('returns idle for the other page while a scan runs', async () => {
      await service.start(match, req, request);

      await expect(service.get('email')).resolves.toEqual({
        ...running,
        status: 'idle',
      });
    });

    it('does not return the lock owner', async () => {
      await service.start(match, req, request);

      await expect(service.get('domain')).resolves.not.toHaveProperty('owner');
    });

    it('reports a running scan as failed when its lock is gone', async () => {
      await service.start(match, req, request);
      store.delete('lock');

      await expect(service.get('domain')).resolves.toEqual({
        ...running,
        status: 'failed',
      });
    });

    it('reports a running scan as failed when another scan holds the lock', async () => {
      await service.start(match, req, request);
      store.set('lock', 'another-scan');

      await expect(service.get('domain')).resolves.toEqual({
        ...running,
        status: 'failed',
      });
    });

    it('reports a scan as done when it finishes between the status and lock reads', async () => {
      const stored = { ...running, owner: 'scan-1' };
      const done = { ...stored, status: 'done', disabled: 4 };
      // The reads, in order: the status while running, the lock already released, the status again.
      redis.get
        .mockResolvedValueOnce(JSON.stringify(stored))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify(done));

      await expect(service.get('domain')).resolves.toEqual({
        status: 'done',
        scanned: 0,
        total: 0,
        disabled: 4,
      });
    });
  });
});
