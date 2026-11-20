/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import type Redis from 'ioredis';
import { MozLoggerService } from '@fxa/shared/mozlog';
import type { DisableMatchingJob } from '../../types';
import {
  AccountMatch,
  AccountStateService,
  DisableMatchingOptions,
} from './account-state.service';
import {
  DisableMatchingJobService,
  ScanRequest,
} from './disable-matching-job.service';

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }));

const flush = () => new Promise((resolve) => setImmediate(resolve));
const HEARTBEAT_MS = 20_000;

describe('DisableMatchingJobService', () => {
  const match: AccountMatch = { domains: ['evil.com'] };
  const request: ScanRequest = {
    event: 'domainBlocklist.disableMatching',
    user: 'admin@example.com',
    values: ['evil.com'],
  };
  const req = {
    headers: { 'user-agent': 'test' },
    ip: '127.0.0.1',
    socket: {},
  } as unknown as Request;

  let store: Map<string, string>;
  let redis: Record<'set' | 'get' | 'del' | 'eval' | 'quit', jest.Mock>;
  let logger: Record<'info' | 'warn' | 'error', jest.Mock>;
  let disableMatching: jest.Mock;
  let service: DisableMatchingJobService;
  // Handles on the scan that the service started.
  let options: Required<DisableMatchingOptions>;
  let finishScan:
    | ((counts: { disabled: number; errors: number }) => void)
    | undefined;
  let failScan: (err: Error) => void;

  const running = (overrides: Partial<DisableMatchingJob> = {}) => ({
    id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    status: 'running',
    scanned: 0,
    total: 0,
    disabled: 0,
    errors: 0,
    ...overrides,
  });
  const resumePoints = () =>
    [...store].filter(([key]) => key.startsWith('resume:')).map(([, v]) => v);

  beforeEach(() => {
    finishScan = undefined;
    store = new Map();
    redis = {
      set: jest.fn(async (key: string, value: unknown, ...flags: unknown[]) => {
        if (flags.includes('NX') && store.has(key)) {
          return null;
        }
        store.set(key, String(value));
        return 'OK';
      }),
      get: jest.fn(async (key: string) => store.get(key) ?? null),
      del: jest.fn(async (key: string) => Number(store.delete(key))),
      // Stands in for the two lock scripts: both act only for the lock's owner.
      eval: jest.fn(async (script: string, _keys, key: string, id: string) => {
        if (store.get(key) !== id) {
          return 0;
        }
        if (script.includes("'del'")) {
          store.delete(key);
        }
        return 1;
      }),
      quit: jest.fn().mockResolvedValue('OK'),
    };
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    disableMatching = jest.fn(
      (_match, _origin, scanOptions) =>
        new Promise<{ disabled: number; errors: number }>((resolve, reject) => {
          options = scanOptions;
          finishScan = resolve;
          failScan = reject;
          scanOptions.signal.addEventListener('abort', () =>
            reject(scanOptions.signal.reason)
          );
        })
    );
    service = new DisableMatchingJobService(
      redis as unknown as Redis,
      { disableMatching } as unknown as AccountStateService,
      logger as unknown as MozLoggerService
    );
  });

  afterEach(async () => {
    // Ends any scan a test left running, which clears its heartbeat timer.
    finishScan?.({ disabled: 0, errors: 0 });
    await flush();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('returns a running job without waiting for the scan', async () => {
      const job = await service.start(match, req, request);

      expect(job).toEqual(running());
      await expect(service.get(job.id)).resolves.toEqual(job);
    });

    it('logs who started the scan and for how many entries', async () => {
      const job = await service.start(match, req, request);

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching.started',
        { id: job.id, user: 'admin@example.com', count: 1, resumedAfter: 0 }
      );
    });

    it('scans with the request headers and ip captured at the start', async () => {
      await service.start(match, req, request);

      expect(disableMatching).toHaveBeenCalledWith(
        match,
        { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' },
        {
          after: 0,
          signal: expect.any(AbortSignal),
          onProgress: expect.any(Function),
        }
      );
    });

    it('refuses to start a second scan while one is running', async () => {
      await service.start(match, req, request);

      await expect(service.start(match, req, request)).rejects.toThrow(
        ConflictException
      );
      expect(disableMatching).toHaveBeenCalledTimes(1);
    });

    it('releases the lock when the job cannot be stored', async () => {
      redis.get.mockRejectedValueOnce(new Error('ECONNRESET'));

      await expect(service.start(match, req, request)).rejects.toThrow(
        'ECONNRESET'
      );
      expect(store.has('lock')).toBe(false);
      expect(disableMatching).not.toHaveBeenCalled();
    });
  });

  describe('progress', () => {
    it('shows the progress the scan reports', async () => {
      const job = await service.start(match, req, request);

      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 3,
        errors: 0,
      });

      await expect(service.get(job.id)).resolves.toEqual({
        id: job.id,
        status: 'running',
        scanned: 10_000,
        total: 25_000,
        disabled: 3,
        errors: 0,
      });
    });

    it('keeps scanning and warns once when saving progress fails', async () => {
      const job = await service.start(match, req, request);
      const error = new Error('ECONNRESET');
      redis.set.mockRejectedValueOnce(error).mockRejectedValueOnce(error);

      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 3,
        errors: 0,
      });
      await options.onProgress({
        scanned: 20_000,
        total: 25_000,
        disabled: 3,
        errors: 0,
      });

      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        'disableMatching.progressNotSaved',
        { id: job.id, err: error }
      );
    });
  });

  describe('when the scan finishes', () => {
    it('marks the job done with the final count', async () => {
      const job = await service.start(match, req, request);
      await options.onProgress({
        scanned: 25_000,
        total: 25_000,
        disabled: 4,
        errors: 0,
      });

      finishScan?.({ disabled: 4, errors: 0 });
      await flush();

      await expect(service.get(job.id)).resolves.toEqual({
        id: job.id,
        status: 'done',
        scanned: 25_000,
        total: 25_000,
        disabled: 4,
        errors: 0,
      });
    });

    it('logs the count against the job and the admin', async () => {
      const job = await service.start(match, req, request);

      finishScan?.({ disabled: 4, errors: 0 });
      await flush();

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching',
        {
          id: job.id,
          user: 'admin@example.com',
          count: 1,
          disabled: 4,
          errors: 0,
        }
      );
    });

    it('still logs the scan as done when the final status cannot be stored', async () => {
      const job = await service.start(match, req, request);
      const error = new Error('ECONNRESET');
      redis.set.mockRejectedValueOnce(error);

      finishScan?.({ disabled: 4, errors: 0 });
      await flush();

      expect(logger.info).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching',
        {
          id: job.id,
          user: 'admin@example.com',
          count: 1,
          disabled: 4,
          errors: 0,
        }
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'disableMatching.statusNotSaved',
        { id: job.id, err: error }
      );
    });

    it('stores the final status before it releases the lock', async () => {
      const job = await service.start(match, req, request);
      let statusAtRelease: string | undefined;
      redis.eval.mockImplementationOnce(async () => {
        statusAtRelease = JSON.parse(
          store.get(`job:${job.id}`) as string
        ).status;
        store.delete('lock');
        return 1;
      });

      finishScan?.({ disabled: 4, errors: 0 });
      await flush();

      expect(statusAtRelease).toBe('done');
    });

    it('records the accounts the scan could not disable', async () => {
      const job = await service.start(match, req, request);

      finishScan?.({ disabled: 4, errors: 2 });
      await flush();

      await expect(service.get(job.id)).resolves.toEqual({
        id: job.id,
        status: 'done',
        scanned: 0,
        total: 0,
        disabled: 4,
        errors: 2,
      });
    });

    it('lets a new scan start from the beginning', async () => {
      const first = await service.start(match, req, request);
      await options.onProgress({
        scanned: 25_000,
        total: 25_000,
        disabled: 0,
        errors: 0,
      });
      finishScan?.({ disabled: 0, errors: 0 });
      await flush();

      const second = await service.start(match, req, request);

      expect(second).toEqual(running());
      expect(second.id).not.toBe(first.id);
    });
  });

  describe('when the scan fails', () => {
    it('marks the job failed and keeps the count it had reached', async () => {
      const job = await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });

      failScan(new Error('ECONNREFUSED'));
      await flush();

      await expect(service.get(job.id)).resolves.toEqual({
        id: job.id,
        status: 'failed',
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });
    });

    it('logs the admin, the progress and the error, and reports to Sentry', async () => {
      const error = new Error('ECONNREFUSED');
      const job = await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });

      failScan(error);
      await flush();

      expect(logger.error).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching.failed',
        {
          id: job.id,
          user: 'admin@example.com',
          count: 1,
          scanned: 10_000,
          total: 25_000,
          disabled: 2,
          errors: 0,
          err: error,
        }
      );
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('resumes a rerun for the same entries after the last id it reached', async () => {
      await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });
      failScan(new Error('ECONNREFUSED'));
      await flush();

      const rerun = await service.start(match, req, {
        ...request,
        user: 'other-admin@example.com',
      });

      expect(rerun).toEqual(running({ scanned: 10_000 }));
      expect(disableMatching).toHaveBeenLastCalledWith(
        match,
        expect.anything(),
        expect.objectContaining({ after: 10_000 })
      );
    });

    it('resumes a rerun from the first range that had a failed account', async () => {
      await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 30_000,
        disabled: 2,
        errors: 0,
      });
      await options.onProgress({
        scanned: 20_000,
        total: 30_000,
        disabled: 3,
        errors: 1,
      });
      failScan(new Error('ECONNREFUSED'));
      await flush();

      const rerun = await service.start(match, req, request);

      expect(rerun).toEqual(running({ scanned: 10_000 }));
    });

    it('starts a scan for different entries from the beginning', async () => {
      await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });
      failScan(new Error('ECONNREFUSED'));
      await flush();

      const other = await service.start({ domains: ['spam.net'] }, req, {
        ...request,
        values: ['spam.net'],
      });

      expect(other).toEqual(running());
    });

    it('forgets the resume point once a scan finishes', async () => {
      await service.start(match, req, request);
      await options.onProgress({
        scanned: 10_000,
        total: 25_000,
        disabled: 2,
        errors: 0,
      });
      expect(resumePoints()).toEqual(['10000']);

      finishScan?.({ disabled: 2, errors: 0 });
      await flush();

      expect(resumePoints()).toEqual([]);
    });
  });

  describe('get', () => {
    it('reports a running job as failed when its lock is gone', async () => {
      const job = await service.start(match, req, request);
      store.delete('lock');

      await expect(service.get(job.id)).resolves.toEqual({
        ...job,
        status: 'failed',
      });
    });

    it('reports a running job as failed when another scan holds the lock', async () => {
      const job = await service.start(match, req, request);
      store.set('lock', 'another-scan');

      await expect(service.get(job.id)).resolves.toEqual({
        ...job,
        status: 'failed',
      });
    });

    it('reports a scan as done when it finishes between the status and lock reads', async () => {
      const job = await service.start(match, req, request);
      const done = { ...job, status: 'done', disabled: 4 };
      // The reads, in order: the job while running, the lock already released, the job again.
      redis.get
        .mockResolvedValueOnce(JSON.stringify(job))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify(done));

      await expect(service.get(job.id)).resolves.toEqual(done);
    });

    it('throws NotFound for a job it does not have', async () => {
      await expect(
        service.get('5f0c5f0e-6b0f-4a7e-9d59-2f4f8f5b9c11')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('the lock', () => {
    const beat = async () => {
      jest.advanceTimersByTime(HEARTBEAT_MS);
      await flush();
    };

    beforeEach(() => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] });
    });

    it('is refreshed every 20 seconds while the scan runs', async () => {
      const job = await service.start(match, req, request);

      await beat();

      expect(redis.eval).toHaveBeenCalledWith(
        expect.stringContaining("'expire'"),
        1,
        'lock',
        job.id,
        60
      );
      expect(options.signal.aborted).toBe(false);
    });

    it('is taken back when Redis lost it and no other scan holds it', async () => {
      const job = await service.start(match, req, request);
      store.delete('lock');

      await beat();

      expect(store.get('lock')).toBe(job.id);
      expect(options.signal.aborted).toBe(false);
    });

    it('stops the scan when another scan holds it, and leaves that lock alone', async () => {
      const job = await service.start(match, req, request);
      store.set('lock', 'another-scan');

      await beat();

      expect(options.signal.aborted).toBe(true);
      expect(store.get('lock')).toBe('another-scan');
      await expect(service.get(job.id)).resolves.toEqual(
        expect.objectContaining({ status: 'failed' })
      );
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('keeps the scan running when Redis cannot be reached', async () => {
      await service.start(match, req, request);
      redis.eval.mockRejectedValueOnce(new Error('ECONNRESET'));

      await beat();

      expect(options.signal.aborted).toBe(false);
    });

    it('is no longer refreshed once the scan has finished', async () => {
      await service.start(match, req, request);
      finishScan?.({ disabled: 0, errors: 0 });
      await flush();
      redis.eval.mockClear(); // only refreshes after this point matter

      await beat();

      expect(redis.eval).not.toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('stops a running scan and records it as failed before closing Redis', async () => {
      const job = await service.start(match, req, request);
      // A closed connection takes no more writes, so a late save would be lost.
      redis.quit.mockImplementationOnce(async () => {
        redis.set.mockRejectedValue(new Error('Connection is closed.'));
        redis.eval.mockRejectedValue(new Error('Connection is closed.'));
        return 'OK';
      });

      await service.onModuleDestroy();

      expect(options.signal.aborted).toBe(true);
      expect(JSON.parse(store.get(`job:${job.id}`) as string).status).toBe(
        'failed'
      );
      expect(store.has('lock')).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'domainBlocklist.disableMatching.failed',
        expect.objectContaining({ id: job.id, user: 'admin@example.com' })
      );
      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(redis.quit).toHaveBeenCalledTimes(1);
    });

    it('closes Redis when no scan is running', async () => {
      await service.onModuleDestroy();

      expect(redis.quit).toHaveBeenCalled();
    });
  });
});
