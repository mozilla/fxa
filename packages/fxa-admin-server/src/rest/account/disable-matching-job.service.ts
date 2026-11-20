/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHash, randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
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

const LOCK_KEY = 'lock';
/** A scan whose process dies stops refreshing the lock, which frees it after this long. */
const LOCK_TTL_S = 60;
const HEARTBEAT_MS = 20_000;
const JOB_TTL_S = 60 * 60;
/** How long a rerun of an interrupted scan can pick up where it stopped. */
const RESUME_TTL_S = 60 * 60;

// Both act only on a lock this scan still owns, so one scan never extends or frees another's.
const REFRESH_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('expire', KEYS[1], ARGV[2]) end return 0`;
const RELEASE_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0`;

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

/** Who asked for a scan and of what; `event` names its log lines. */
export type ScanRequest = {
  event: string;
  user: string;
  /** the blocklist entries being matched */
  values: string[];
};

/**
 * Runs disable-matching scans outside the request that starts them, because a
 * scan of every account outlasts the gateway timeout. Job state lives in Redis
 * so that any replica can answer a status poll.
 */
@Injectable()
export class DisableMatchingJobService implements OnModuleDestroy {
  private current?: { scan: AbortController; finished: Promise<void> };

  constructor(
    @Inject(DisableMatchingRedis) private redis: Redis,
    private accountState: AccountStateService,
    private log: MozLoggerService
  ) {}

  /**
   * Starts a scan and returns its job without waiting for it. One scan runs at
   * a time. A rerun of an interrupted scan for the same entries resumes it.
   */
  public async start(
    match: AccountMatch,
    req: Request,
    request: ScanRequest
  ): Promise<DisableMatchingJob> {
    const job: DisableMatchingJob = {
      id: randomUUID(),
      status: 'running',
      scanned: 0,
      total: 0,
      disabled: 0,
      errors: 0,
    };
    if (!(await this.redis.set(LOCK_KEY, job.id, 'EX', LOCK_TTL_S, 'NX'))) {
      throw new ConflictException(
        'Another disable matching scan is running. Try again when it finishes.'
      );
    }
    const resumeKey = resumeKeyFor(request);
    try {
      job.scanned = Number(await this.redis.get(resumeKey)) || 0;
      await this.save(job, resumeKey);
    } catch (err) {
      await this.release(job.id);
      throw err;
    }
    this.log.info(`${request.event}.started`, {
      id: job.id,
      user: request.user,
      count: request.values.length,
      resumedAfter: job.scanned,
    });
    // req.ip reads the socket, which is gone once the response has been sent.
    const origin = { headers: req.headers, ip: req.ip };
    const scan = new AbortController();
    const started = { ...job };
    this.current = {
      scan,
      finished: this.run(job, match, origin, request, resumeKey, scan),
    };
    return started;
  }

  public async get(id: string): Promise<DisableMatchingJob> {
    const stored = await this.redis.get(jobKey(id));
    if (!stored) {
      throw new NotFoundException('No such scan, or its result has expired.');
    }
    const job: DisableMatchingJob = JSON.parse(stored);
    if (job.status !== 'running' || (await this.redis.get(LOCK_KEY)) === id) {
      return job;
    }
    // The scan may have finished and released the lock between the two reads.
    const latest = await this.redis.get(jobKey(id));
    const settled: DisableMatchingJob = latest ? JSON.parse(latest) : job;
    return settled.status === 'running'
      ? { ...settled, status: 'failed' }
      : settled;
  }

  public async onModuleDestroy() {
    this.current?.scan.abort(new Error('The admin server is shutting down'));
    await this.current?.finished;
    await this.redis.quit().catch(() => {});
  }

  private async run(
    job: DisableMatchingJob,
    match: AccountMatch,
    origin: RequestOrigin,
    request: ScanRequest,
    resumeKey: string,
    scan: AbortController
  ) {
    const audit = {
      id: job.id,
      user: request.user,
      count: request.values.length,
    };
    const heartbeat = setInterval(
      () => void this.keepLock(job.id, scan),
      HEARTBEAT_MS
    );
    let warned = false;
    try {
      const counts = await this.accountState.disableMatching(match, origin, {
        after: job.scanned,
        signal: scan.signal,
        // Best effort: a Redis error must not stop a scan that is disabling accounts.
        onProgress: async (progress) => {
          Object.assign(job, progress);
          await this.save(job, resumeKey).catch((err) => {
            if (!warned) {
              warned = true;
              this.log.warn('disableMatching.progressNotSaved', {
                id: job.id,
                err,
              });
            }
          });
        },
      });
      Object.assign(job, counts, { status: 'done' });
      this.log.info(request.event, {
        ...audit,
        disabled: job.disabled,
        errors: job.errors,
      });
    } catch (err) {
      job.status = 'failed';
      if (!scan.signal.aborted) {
        Sentry.captureException(err);
      }
      this.log.error(`${request.event}.failed`, {
        ...audit,
        scanned: job.scanned,
        total: job.total,
        disabled: job.disabled,
        errors: job.errors,
        err,
      });
    } finally {
      clearInterval(heartbeat);
    }
    // The outcome is logged above; failing to store it must not change it.
    await this.save(job, resumeKey).catch((err) =>
      this.log.warn('disableMatching.statusNotSaved', { id: job.id, err })
    );
    await this.release(job.id);
    if (this.current?.scan === scan) {
      this.current = undefined;
    }
  }

  /** Refreshes the lock, and stops the scan if another scan now holds it. */
  private async keepLock(id: string, scan: AbortController) {
    try {
      const held =
        (await this.redis.eval(REFRESH_LOCK, 1, LOCK_KEY, id, LOCK_TTL_S)) ===
          1 ||
        // A Redis failover can drop the key; take it back unless another scan has it.
        (await this.redis.set(LOCK_KEY, id, 'EX', LOCK_TTL_S, 'NX')) === 'OK';
      if (!held) {
        scan.abort(new Error('Another scan took the lock'));
      }
    } catch {
      // Redis is unreachable; the next beat tries again.
    }
  }

  private async save(job: DisableMatchingJob, resumeKey: string) {
    await this.redis.set(jobKey(job.id), JSON.stringify(job), 'EX', JOB_TTL_S);
    if (job.status === 'done') {
      await this.redis.del(resumeKey);
    } else if (job.errors === 0) {
      // Stays before the first range with a failed account, so a rerun retries it.
      await this.redis.set(resumeKey, job.scanned, 'EX', RESUME_TTL_S);
    }
  }

  private async release(id: string) {
    try {
      await this.redis.eval(RELEASE_LOCK, 1, LOCK_KEY, id);
    } catch {
      // The lock expires on its own.
    }
  }
}

function jobKey(id: string) {
  return `job:${id}`;
}

function resumeKeyFor({ event, values }: ScanRequest) {
  const entries = JSON.stringify([event, [...values].sort()]);
  return `resume:${createHash('sha256').update(entries).digest('hex')}`;
}
