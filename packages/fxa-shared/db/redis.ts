/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { readdirSync, readFileSync } from 'fs';
import Redis from 'ioredis';
import { basename, extname, resolve } from 'path';
import { StatsD } from 'hot-shots';

import { ILogger } from '../log';
import { AccessToken as AccessToken } from './models/auth/access-token';
import { RefreshTokenMetadata } from './models/auth/refresh-token-meta-data';

import opentelemetry from '@opentelemetry/api';
const tracer = opentelemetry.trace.getTracer('redis-tracer');

const hex = require('buf').to.hex;

export type Config = {
  enabled?: boolean;
  enableMetrics?: boolean;
  prefix?: string;
  recordLimit?: number;
  maxttl?: number | string;
  timeoutMs?: number;
} & Redis.RedisOptions;

interface ICustomRedisCache {
  getAccessToken(uid: string): Promise<any>;
  getAccessTokens(uid: string): Promise<any>;
  getSessionTokens(uid: string): Promise<any>;
  pruneSessionTokens(uid: string, tokenIds: string): Promise<any>;
  touchSessionToken(uid: string, token: any): Promise<any>;
}

// Type guard for ICustomRedisCache
function isCustomRedisCache(
  redis: any
): redis is Redis.Redis & ICustomRedisCache {
  if (
    'getAccessToken' in redis &&
    'getAccessTokens' in redis &&
    'getSessionTokens' in redis &&
    'pruneSessionTokens' in redis &&
    'touchSessionToken' in redis
  ) {
    return true;
  }
  return false;
}

export class RedisShared {
  public readonly redis: Redis.Redis & ICustomRedisCache;

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

    const scriptsDirectory = resolve(__dirname, 'luaScripts');

    // Applies custom scripts which are turned into methods on
    // the redis object.
    this.defineCommands(redis, scriptsDirectory);

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

  protected defineCommands(redis: Redis.Redis, directory: string) {
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
    var id = setTimeout(cb, ms);
    cancel.then(() => clearTimeout(id));
  }

  private defineCommand(
    redis: Redis.Redis,
    scriptName: string,
    directory: string
  ) {
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
    await this.redis.quit();
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

  async pruneSessionTokens(uid: string, tokenIds: string[] = []) {
    this.metrics?.increment('redis.pruneSessionTokens');
    const span = tracer.startSpan('redis.pruneSessionTokens');
    const p1 = this.redis.pruneSessionTokens(uid, JSON.stringify(tokenIds));
    const p2 = this.rejectInMs(p1, this.timeoutMs);
    const result = await Promise.race([p1, p2]);
    span.end();
    return result;
  }

  async pruneRefreshTokens(
    uid: Buffer | String,
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
      const p1 = this.redis.getSessionTokens(uid);
      const p2 = this.rejectInMs(p1, this.timeoutMs);
      const value = await Promise.race([p1, p2]);

      if (value?.length > 0) {
        span.setAttribute('redis.getSessionTokens.tokens.length', value.length);
        this.metrics?.histogram(
          'redis.getSessionTokens.tokens.length',
          value.length
        );
      }
      return JSON.parse(value as string);
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
      return {};
    } finally {
      span.end();
    }
  }

  async getAccessTokens(uid: Buffer | String) {
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

  async getAccessToken(uid: Buffer | String) {
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
