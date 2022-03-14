/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { readdirSync, readFileSync } from 'fs';
import Redis from 'ioredis';
import { basename, extname, resolve } from 'path';

import { ILogger } from '../log';
import { AccessToken as AccessToken } from './models/auth/access-token';
import { RefreshTokenMetadata } from './models/auth/refresh-token-meta-data';

const hex = require('buf').to.hex;

export type Config = {
  prefix?: string;
  recordLimit?: number;
  maxttl?: number;
  timeoutMs?: number;
} & Redis.RedisOptions;

interface ICustomRedisCache {
  getAccessToken(uid: string): Promise<any>;
  getAccessTokens(uid: string): Promise<any>;
  getSessionTokens(uid: string): Promise<any>;
  pruneSessionTokens(uid: string, tokenIds: string): Promise<any>;
  touchSessionToken(uid: string, token: any): Promise<any>;
}

// Type gaurd for ICustomRedisCache
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
    protected readonly log?: ILogger
  ) {
    if (!config.keyPrefix && config.prefix) {
      config.keyPrefix = config.prefix;
    }

    log?.info('RedisShared', {
      msg: `RedisShared.FXA-4648: Creating RedisShared host:${config.host} port:${config.port}`,
    });

    const redis = new Redis(config);

    // Listen to all client events
    redis.on('connect', () => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Connected to redis`,
      });
    });

    redis.on('ready', () => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Redis ready`,
      });
    });

    redis.on('error', (err) => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Redis error encountered ${err}`,
        error: err,
      });
    });

    redis.on('close', () => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Redis close`,
      });
    });

    redis.on('reconnecting', () => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Redis reconnecting`,
      });
    });

    redis.on('end', () => {
      log?.info('RedisShared', {
        msg: `RedisShared.FXA-4648: Redis end`,
      });
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
        msg: 'RedisShared.FXA-4648: Missing scripts to fully define a customized redis instance.',
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

    this.log?.info('RedisShared', {
      msg: `RedisShared.FXA-4648: defining redis command name:${name} directory:${directory}, scriptName:${scriptName}`,
    });

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

  async del(key: string) {
    return await this.redis.del(key);
  }

  async getRefreshTokens(uid: Buffer | string) {
    try {
      const p1 = this.redis.hgetall(hex(uid));
      const p2 = this.resolveInMs(p1, this.timeoutMs, {});
      const tokens = await Promise.race([p1, p2]);
      for (const id of Object.keys(tokens)) {
        tokens[id] = RefreshTokenMetadata.parse(tokens[id]);
      }
      return tokens;
    } catch (e) {
      this.log?.error('RedisShared', { error: e });
      return {};
    }
  }

  async pruneSessionTokens(uid: string, tokenIds: string[] = []) {
    const p1 = this.redis.pruneSessionTokens(uid, JSON.stringify(tokenIds));
    const p2 = this.rejectInMs(p1, this.timeoutMs);
    return Promise.race([p1, p2]);
  }

  async pruneRefreshTokens(
    uid: Buffer | String,
    tokenIdsToPrune: Buffer[] | string[]
  ) {
    const p1 = this.redis.hdel(hex(uid), ...tokenIdsToPrune.map((v) => hex(v)));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    return await Promise.race([p1, p2]);
  }

  async getSessionTokens(uid: string) {
    try {
      const p1 = this.redis.getSessionTokens(uid);
      const p2 = this.rejectInMs(p1, this.timeoutMs);
      const value = await Promise.race([p1, p2]);
      return JSON.parse(value as string);
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
      return {};
    }
  }

  async getAccessTokens(uid: Buffer | String) {
    try {
      const values = await this.redis.getAccessTokens(hex(uid));
      return values.map((v: string) => AccessToken.parse(v));
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
      return [];
    }
  }

  async getAccessToken(uid: Buffer | String) {
    try {
      const value = await this.redis.getAccessToken(hex(uid));
      if (value) return AccessToken.parse(value);
    } catch (e) {
      this.log?.error('RedisShared', {
        error: e,
      });
    }

    return null;
  }

  async touchSessionToken(uid: string, token: any) {
    // remove keys with null values
    const json = JSON.stringify(token, (k, v) => (v == null ? undefined : v));
    const p1 = this.redis.touchSessionToken(uid, json);
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    return await Promise.race([p1, p2]);
  }
}
