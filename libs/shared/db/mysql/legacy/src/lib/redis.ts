/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { readdirSync, readFileSync } from 'fs';
import Redis, { RedisOptions } from 'ioredis';
import { basename, extname, resolve } from 'path';
import { StatsD } from 'hot-shots';

import type { ILogger } from '@fxa/shared/log';
import { LUA_SCRIPTS } from './lua-scripts';
import { AccessToken as AccessToken } from './models/auth/access-token';
import { RefreshTokenMetadata } from './models/auth/refresh-token-meta-data';

import opentelemetry from '@opentelemetry/api';
const tracer = opentelemetry.trace.getTracer('redis-tracer');
const hex = (v: Buffer | string): string =>
  Buffer.isBuffer(v) ? v.toString('hex') : v;

export type Config = {
  enabled?: boolean;
  enableMetrics?: boolean;
  prefix?: string;
  recordLimit?: number;
  maxttl?: number | string;
  timeoutMs?: number;
} & RedisOptions;

interface ICustomRedisCache {
  getAccessToken(uid: string): Promise<any>;
  getAccessTokens(uid: string): Promise<any>;
  touchSessionToken(uid: string, token: any): Promise<any>;
}

// Packing scheme written by the touchSessionToken Lua script; see
// https://github.com/mozilla/fxa-auth-server/pull/2254
const SESSION_TOKEN_PROPERTIES = [
  'lastAccessTime',
  'location',
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'uaFormFactor',
];
const SESSION_TOKEN_LOCATION_PROPERTIES = [
  'city',
  'state',
  'stateCode',
  'country',
  'countryCode',
];

function unpackArray(keys: string[], values: unknown[]) {
  const result: Record<string, unknown> = {};
  keys.forEach((key, i) => {
    if (values[i] !== undefined) result[key] = values[i];
  });
  return result;
}

// Throws if the blob is not a JSON object.
function parseSessionTokens(value: string | null): Record<string, unknown> {
  if (!value) return {};
  const tokens = JSON.parse(value);
  if (tokens === null || typeof tokens !== 'object') {
    throw new Error('session token blob is not an object');
  }
  return tokens;
}

/**
 * Expands a stored session-token blob into `{ [tokenId]: token }`.
 * Entries that are not packed arrays pass through unchanged.
 * Throws if the blob is not a JSON object.
 */
export function unpackSessionTokens(value: string | null) {
  const tokens = parseSessionTokens(value);
  const result: Record<string, unknown> = {};
  for (const [id, values] of Object.entries(tokens)) {
    if (!Array.isArray(values)) {
      result[id] = values;
      continue;
    }
    const token = unpackArray(SESSION_TOKEN_PROPERTIES, values);
    if (Array.isArray(token.location)) {
      token.location = unpackArray(
        SESSION_TOKEN_LOCATION_PROPERTIES,
        token.location
      );
    }
    result[id] = token;
  }
  return result;
}

// Type guard for ICustomRedisCache
function isCustomRedisCache(redis: any): redis is Redis & ICustomRedisCache {
  if (
    'getAccessToken' in redis &&
    'getAccessTokens' in redis &&
    'touchSessionToken' in redis
  ) {
    return true;
  }
  return false;
}

export class RedisShared {
  public readonly redis: Redis & ICustomRedisCache;
  // WATCH state is per connection, so prunes share their own connection, one at a time.
  private pruneRedis?: Redis;
  private pruneQueue: Promise<void> = Promise.resolve();

  protected get keyPrefix() {
    return this.config.keyPrefix;
  }
  protected get recordLimit() {
    return this.config.recordLimit;
  }
  protected get maxttl() {
    return this.config.maxttl;
  }
  protected get timeoutMs() {
    return this.config.timeoutMs || 1000;
  }

  constructor(
    protected readonly config: Config,
    protected readonly log?: ILogger,
    protected readonly metrics?: StatsD
  ) {
    if (!config.keyPrefix && config.prefix) {
      config.keyPrefix = config.prefix;
    }

    const redis = new Redis(config);

    // Listen to all client events
    redis.on('connect', () => {
      this.metrics?.increment('redis.connect');
    });

    redis.on('ready', () => {
      this.metrics?.increment('redis.ready');
    });

    redis.on('error', (err) => {
      this.metrics?.increment('redis.error');
      log?.error('RedisShared', {
        msg: `RedisShared: Redis error encountered ${err}`,
        host: config.host,
        port: config.port,
        error: err,
      });
    });

    redis.on('close', () => {
      this.metrics?.increment('redis.close');
    });

    redis.on('reconnecting', () => {
      this.metrics?.increment('redis.reconnecting');
    });

    redis.on('end', () => {
      this.metrics?.increment('redis.end');
    });

    // Applies custom scripts which are turned into methods on
    // the redis object.
    for (const [scriptName, lua] of Object.entries(LUA_SCRIPTS)) {
      const [name, numberOfKeys] = scriptName.split('_');
      redis.defineCommand(name, { lua, numberOfKeys: +numberOfKeys });
    }

    // Invoke type guard to make sure custom scripts were loaded
    // properly. Fail hard otherwise.
    if (isCustomRedisCache(redis)) {
      this.redis = redis;
    } else {
      this.log?.warn('RedisShared', {
        msg: 'RedisShared: Missing scripts to fully define a customized redis instance.',
      });
      throw new Error(
        'Missing scripts to fully define a customized redis instance.'
      );
    }
  }

  protected defineCommands(redis: Redis, directory: string) {
    this.getScriptNames(directory).forEach((name: string) =>
      this.defineCommand(redis, name, directory)
    );
  }

  protected resolveInMs(
    cancel: Promise<any>,
    ms: number,
    value?: any
  ): Promise<any> {
    return new Promise((resolve) =>
      this.cacellableAction(() => resolve(value), ms, cancel)
    );
  }

  protected async rejectInMs(
    cancel: Promise<any>,
    ms: number,
    err = new Error('redis timeout')
  ) {
    return new Promise((_, reject) =>
      this.cacellableAction(() => reject(err), ms, cancel)
    );
  }

  protected cacellableAction(cb: () => void, ms: number, cancel: Promise<any>) {
    const id = setTimeout(cb, ms);
    cancel.then(() => clearTimeout(id));
  }

  private defineCommand(redis: Redis, scriptName: string, directory: string) {
    const [name, numberOfKeys] = scriptName.split('_');

    redis.defineCommand(name, {
      lua: this.readScript(directory, scriptName),
      numberOfKeys: +numberOfKeys,
    });
  }

  private readScript(directory: string, name: string) {
    return readFileSync(resolve(directory, `${name}.lua`), {
      encoding: 'utf8',
    });
  }

  private getScriptNames(directory: string) {
    const dir = resolve(directory);
    const scriptNames = readdirSync(dir, { withFileTypes: true })
      .filter(
        (dirent: any) => dirent.isFile() && extname(dirent.name) === '.lua'
      )
      .map((dirent: any) => basename(dirent.name, '.lua'));

    return scriptNames;
  }

  async close() {
    await this.pruneQueue;
    try {
      await this.pruneRedis?.quit();
    } catch (error) {
      // Stops the reconnect loop of a prune connection that cannot QUIT.
      this.pruneRedis?.disconnect();
      this.log?.error('RedisShared', {
        msg: 'RedisShared: prune connection quit failed',
        error,
      });
    } finally {
      await this.redis.quit();
    }
  }

  async del(key: string): Promise<number | undefined> {
    const result = await this.redis.del(key);
    return result;
  }

  async getRefreshTokens(uid: Buffer | string) {
    this.metrics?.increment('redis.getRefreshTokens');
    const span = tracer.startSpan('redis.getRefreshTokens');
    try {
      const p1 = this.redis.hgetall(hex(uid));
      const p2 = this.resolveInMs(p1, this.timeoutMs, {});
      const tokens = await Promise.race([p1, p2]);
      span.setAttribute(
        'redis.getRefreshTokens.tokens.length',
        Object.keys(tokens).length
      );
      this.metrics?.histogram(
        'redis.getRefreshTokens.tokens.length',
        Object.keys(tokens).length
      );
      for (const id of Object.keys(tokens)) {
        tokens[id] = RefreshTokenMetadata.parse(tokens[id]);
      }
      return tokens;
    } catch (e) {
      this.metrics?.increment('redis.getRefreshTokens.error');
      this.log?.error('RedisShared', { error: e });
      return {};
    } finally {
      span.end();
    }
  }

  // Pruning is opportunistic and the cron job prunes too, so callers do not wait.
  pruneSessionTokens(uid: string, tokenIds: string[] = []): void {
    this.metrics?.increment('redis.pruneSessionTokens');
    const span = tracer.startSpan('redis.pruneSessionTokens');
    this.pruneQueue = this.pruneQueue
      .then(() => this.prunePendingSessionTokens(uid, tokenIds))
      .finally(() => span.end());
  }

  // Tries once, and only records a conflict or an error.
  private async prunePendingSessionTokens(uid: string, tokenIds: string[]) {
    try {
      if (!this.pruneRedis) {
        // Bounds each queued command, so one hung prune cannot block the queue.
        this.pruneRedis = this.redis.duplicate({
          commandTimeout: this.timeoutMs,
        });
        this.pruneRedis.on('error', (error) => {
          this.log?.error('RedisShared', {
            msg: 'RedisShared: prune connection error',
            error,
          });
        });
      }
      const redis = this.pruneRedis;
      await redis.watch(uid);
      const value = await redis.get(uid);
      let tokens: Record<string, unknown>;
      try {
        tokens = parseSessionTokens(value);
      } catch (e) {
        this.log?.error('RedisShared', {
          msg: 'RedisShared: deleting unparseable session token blob',
          error: e,
        });
        tokens = {};
      }
      for (const id of tokenIds) delete tokens[id];

      const tx = redis.multi();
      if (Object.keys(tokens).length === 0) {
        tx.del(uid);
      } else {
        tx.set(uid, JSON.stringify(tokens));
      }
      // Null when another client changed the key after WATCH.
      const results = await tx.exec();
      if (!results) {
        this.metrics?.increment('redis.pruneSessionTokens.conflict');
        this.log?.warn('RedisShared', {
          msg: 'RedisShared: pruneSessionTokens skipped after a concurrent write',
        });
        return;
      }
      const [err] = results[0];
      if (err) throw err;
    } catch (error) {
      // A stale WATCH would abort the next prune's EXEC.
      this.pruneRedis?.unwatch().catch(() => {});
      this.metrics?.increment('redis.pruneSessionTokens.error');
      this.log?.error('RedisShared', {
        msg: 'RedisShared: pruneSessionTokens failed',
        error,
      });
    }
  }

  async pruneRefreshTokens(
    uid: Buffer | string,
    tokenIdsToPrune: Buffer[] | string[]
  ) {
    this.metrics?.increment('redis.pruneRefreshTokens');
    const span = tracer.startSpan('redis.pruneRefreshTokens');
    const p1 = this.redis.hdel(hex(uid), ...tokenIdsToPrune.map((v) => hex(v)));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    const result = await Promise.race([p1, p2]);
    span.end();
    return result;
  }

  async getSessionTokens(uid: string) {
    this.metrics?.increment('redis.getSessionTokens');
    const span = tracer.startSpan('redis.getSessionTokens');
    try {
      const p1 = this.redis.get(uid);
      // See claimLastAccessTimeWrite: the cancel promise must not reject.
      const p2 = this.rejectInMs(
        p1.catch(() => undefined),
        this.timeoutMs
      );
      const value = (await Promise.race([p1, p2])) as string | null;

      if (value && value.length > 0) {
        span.setAttribute('redis.getSessionTokens.tokens.length', value.length);
        this.metrics?.histogram(
          'redis.getSessionTokens.tokens.length',
          value.length
        );
      }
      try {
        const result = unpackSessionTokens(value);
        this.metrics?.increment('redis.getSessionTokens.unpack.success');
        return result;
      } catch (e) {
        this.metrics?.increment('redis.getSessionTokens.unpack.err');
        this.log?.error('RedisShared', {
          msg: 'RedisShared: deleting unparseable session token blob',
          error: e,
        });
        this.redis.del(uid).catch(() => {});
        return {};
      }
    } catch (e) {
      this.metrics?.increment('redis.getSessionTokens.error');
      this.log?.error('RedisShared', {
        error: e,
      });
      return {};
    } finally {
      span.end();
    }
  }

  async getAccessTokens(uid: Buffer | string) {
    this.metrics?.increment('redis.getAccessTokens');
    const span = tracer.startSpan('redis.getAccessTokens');
    try {
      const values = await this.redis.getAccessTokens(hex(uid));

      if (values?.length) {
        span.setAttribute('redis.getAccessTokens.tokens.length', values.length);
        this.metrics?.histogram(
          'redis.getAccessTokens.tokens.length',
          values.length
        );
      }
      return values.map((v: string) => AccessToken.parse(v));
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
      return [];
    } finally {
      span.end();
    }
  }

  async getAccessToken(uid: Buffer | string) {
    this.metrics?.increment('redis.getAccessToken');
    const span = tracer.startSpan('redis.getAccessToken');
    try {
      const value = await this.redis.getAccessToken(hex(uid));
      if (value) return AccessToken.parse(value);
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
    } finally {
      span.end();
    }

    return null;
  }

  /**
   * Resolves true if no other lastAccessTime write for this token has been
   * claimed in the last `seconds`. Resolves false on timeout or error, so
   * callers skip the write when Redis is struggling.
   */
  async claimLastAccessTimeWrite(tokenId: string, seconds: number) {
    try {
      const p1 = this.redis.set(
        `lastAccessTime:${tokenId}`,
        1,
        'EX',
        seconds,
        'NX'
      );
      // resolveInMs chains .then on its cancel promise; a rejecting one would
      // surface as an unhandled rejection.
      const p2 = this.resolveInMs(
        p1.catch(() => undefined),
        this.timeoutMs,
        null
      );
      return (await Promise.race([p1, p2])) === 'OK';
    } catch (e) {
      this.log?.error('RedisShared', { error: e });
      return false;
    }
  }

  async touchSessionToken(uid: string, token: any) {
    this.metrics?.increment('redis.touchSessionToken');
    const span = tracer.startSpan('redis.touchSessionToken');
    // remove keys with null values
    const json = JSON.stringify(token, (k, v) => (v == null ? undefined : v));
    span.setAttribute('redis.touchSessionToken.json.size', json.length);
    const p1 = this.redis.touchSessionToken(uid, json);
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    const value = await Promise.race([p1, p2]);
    span.end();
    return value;
  }
}
