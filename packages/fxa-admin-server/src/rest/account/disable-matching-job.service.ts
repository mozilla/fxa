/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';
import {
  ConflictException,
  Inject,
  Injectable,
  Provider,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Redis from 'ioredis';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AppConfig } from '../../config';
import type { DisableMatchingJob } from '../../types';
import {
  AccountMatch,
  AccountStateService,
  RequestOrigin,
} from './account-state.service';

/** One lock for both blocklist pages, because the scans read the same table. */
const LOCK_KEY = 'lock';
/** A scan whose process dies stops refreshing the lock, which frees it after this long. */
const LOCK_TTL_S = 60;
const STATUS_TTL_S = 60 * 60;

// Both act only on a lock this scan still owns, so one scan never extends or frees another's.
const REFRESH_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('expire', KEYS[1], ARGV[2]) end return 0`;
const RELEASE_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0`;

const IDLE: DisableMatchingJob = {
  status: 'idle',
  scanned: 0,
  total: 0,
  disabled: 0,
};

export const DisableMatchingRedis = Symbol('DISABLE_MATCHING_REDIS');

export const DisableMatchingRedisProvider: Provider = {
  provide: DisableMatchingRedis,
  useFactory: (config: ConfigService<AppConfig>) =>
    new Redis({
      ...(config.get('redis') as AppConfig['redis']),
      keyPrefix: 'admin:disableMatching:',
    }),
  inject: [ConfigService],
};

/** Which page asked for a scan, who asked, and of what; `event` names its log lines. */
export type ScanRequest = {
  page: 'domain' | 'email';
  event: string;
  user: string;
  /** the blocklist entries being matched */
  values: string[];
};

type StoredJob = DisableMatchingJob & { owner: string };

/**
 * Runs disable-matching scans outside the request that starts them, because a
 * scan of every account outlasts the gateway timeout. The lock and the status
 * live in Redis, so that any replica can refuse a second scan or answer a poll.
 */
@Injectable()
export class DisableMatchingJobService {
  constructor(
    @Inject(DisableMatchingRedis) private redis: Redis,
    private accountState: AccountStateService,
    private log: MozLoggerService
  ) {}

  /** Starts a scan and returns its status without waiting for it. */
  public async start(
    match: AccountMatch,
    req: Request,
    request: ScanRequest
  ): Promise<DisableMatchingJob> {
    const job: StoredJob = { ...IDLE, status: 'running', owner: randomUUID() };
    if (!(await this.redis.set(LOCK_KEY, job.owner, 'EX', LOCK_TTL_S, 'NX'))) {
      throw new ConflictException(
        'Another disable matching scan is running. Try again when it finishes.'
      );
    }
    try {
      await this.save(request.page, job);
    } catch (err) {
      await this.release(job.owner);
      throw err;
    }
    this.log.info(`${request.event}.started`, {
      user: request.user,
      count: request.values.length,
    });
    // req.ip reads the socket, which is gone once the response has been sent.
    const origin = { headers: req.headers, ip: req.ip };
    void this.run(job, match, origin, request);
    return withoutOwner(job);
  }

  /** The page's last scan, or `idle` when its status has expired. */
  public async get(page: ScanRequest['page']): Promise<DisableMatchingJob> {
    const stored = await this.redis.get(statusKey(page));
    if (!stored) {
      return IDLE;
    }
    const job: StoredJob = JSON.parse(stored);
    if (
      job.status === 'running' &&
      (await this.redis.get(LOCK_KEY)) !== job.owner
    ) {
      // The scan may have finished and released the lock between the two reads.
      const latest = await this.redis.get(statusKey(page));
      const settled: StoredJob = latest ? JSON.parse(latest) : job;
      return withoutOwner(
        settled.status === 'running'
          ? { ...settled, status: 'failed' }
          : settled
      );
    }
    return withoutOwner(job);
  }

  private async run(
    job: StoredJob,
    match: AccountMatch,
    origin: RequestOrigin,
    request: ScanRequest
  ) {
    const audit = { user: request.user, count: request.values.length };
    try {
      job.disabled = await this.accountState.disableMatching(
        match,
        origin,
        async (progress) => {
          Object.assign(job, progress);
          await this.keepLock(job.owner);
          await this.save(request.page, job);
        }
      );
      job.status = 'done';
      this.log.info(request.event, { ...audit, disabled: job.disabled });
    } catch (err) {
      job.status = 'failed';
      Sentry.captureException(err);
      this.log.error(`${request.event}.failed`, {
        ...audit,
        scanned: job.scanned,
        total: job.total,
        disabled: job.disabled,
        err,
      });
    }
    // The outcome is logged above; failing to store it must not change it.
    await this.saveFinal(request.page, job).catch((err) =>
      this.log.warn('disableMatching.statusNotSaved', { err })
    );
    await this.release(job.owner);
  }

  /** Skips the write when a newer scan on the page has stored its own status. */
  private async saveFinal(page: ScanRequest['page'], job: StoredJob) {
    const stored = await this.redis.get(statusKey(page));
    if (stored && (JSON.parse(stored) as StoredJob).owner !== job.owner) {
      return;
    }
    await this.save(page, job);
  }

  /** Refreshes the lock, and stops the scan when it no longer holds it. */
  private async keepLock(owner: string) {
    if (
      (await this.redis.eval(REFRESH_LOCK, 1, LOCK_KEY, owner, LOCK_TTL_S)) !==
      1
    ) {
      throw new Error('The scan lost its lock');
    }
  }

  private async save(page: ScanRequest['page'], job: StoredJob) {
    await this.redis.set(
      statusKey(page),
      JSON.stringify(job),
      'EX',
      STATUS_TTL_S
    );
  }

  private async release(owner: string) {
    try {
      await this.redis.eval(RELEASE_LOCK, 1, LOCK_KEY, owner);
    } catch {
      // The lock expires on its own.
    }
  }
}

function statusKey(page: ScanRequest['page']) {
  return `status:${page}`;
}

function withoutOwner({ owner, ...job }: StoredJob): DisableMatchingJob {
  return job;
}
