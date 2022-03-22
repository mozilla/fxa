/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ILogger } from '../log';
import { hex } from './util';

/** Base token cache interface */
export interface ITokenCache {
  close(): Promise<void>;
}

/**
 * Provides access to the access token cache
 */
export interface IAccessTokensCache extends ITokenCache {
  getAccessToken(uid: string | Buffer): Promise<any>;
  getAccessTokens(uid: string | Buffer): Promise<any>;
}

/**
 * Provides access to the refresh token cache
 */
export interface IRefreshTokensCache extends ITokenCache {
  getRefreshTokens(uid: string | Buffer): Promise<any>;
  pruneRefreshTokens(
    uid: string | Buffer,
    tokenIdsToPrune: Buffer[] | string[]
  ): Promise<any>;
}

/**
 * Provides access to the session token cache
 */
export interface ISessionTokensCache extends ITokenCache {
  getSessionTokens(uid: string): Promise<any>;
}

/**
 * Wrapper around redis operations pertaining to connected services.
 */
export class ConnectedServicesCache {
  /**
   * Creates new instance
   * @param redisAccessTokens a redis instance configured to point at an access tokens store
   * @param redisRefreshTokens a redis instance configured to point at a refresh tokens store
   * @param redisSessionTokens a redis instance configured to point at a session tokens store
   * @param log optional logger
   */
  constructor(
    protected readonly redisAccessTokens: IAccessTokensCache,
    protected readonly redisRefreshTokens: IRefreshTokensCache,
    protected readonly redisSessionTokens: ISessionTokensCache,
    protected readonly log?: ILogger
  ) {}

  async pruneRefreshTokens(
    uid: Buffer | string,
    tokenIdsToPrune: Buffer[] | string[]
  ): Promise<void | null> {
    if (!this.redisRefreshTokens) {
      this.log?.warn('ConnectedServicesCache', {
        msg: 'ConnectedServicesCache: pruneRefreshTokens invoked but redisRefreshTokens instance not provided.',
      });
      return null;
    }
    return await this.redisRefreshTokens.pruneRefreshTokens(
      uid,
      tokenIdsToPrune
    );
  }

  async getAccessTokens(uid: Buffer | string) {
    return this.redisAccessTokens.getAccessTokens(uid);
  }

  async getAccessToken(uid: Buffer | string) {
    return this.redisAccessTokens.getAccessToken(uid);
  }

  async getRefreshTokens(uid: Buffer | string) {
    if (!this.redisRefreshTokens) {
      this.log?.warn('ConnectedServicesCache', {
        msg: 'ConnectedServicesCache: getRefreshTokens invoked but redisRefreshTokens instance not provided.',
      });
      return {};
    }
    return this.redisRefreshTokens.getRefreshTokens(uid);
  }

  async getSessionTokens(uid: string) {
    if (!this.redisSessionTokens) {
      this.log?.warn('ConnectedServicesCache', {
        msg: 'ConnectedServicesCache: getSessionTokens invoked but redisSessionTokens instance not provided.',
      });
      return {};
    }
    return await this.redisSessionTokens.getSessionTokens(uid);
  }

  async close() {
    await this.redisAccessTokens?.close();
    await this.redisRefreshTokens?.close();
    await this.redisSessionTokens?.close();
  }
}

/**
 * Provides access to database operations required by connected services
 */
export interface IConnectedServicesDbStore {
  getRefreshTokensByUid(uid: string): Promise<any>;
  getAccessTokensByUid(uid: string): Promise<any>;
  close(): Promise<void>;
}

/**
 * Wrapper around around database operations pertaining to connected services.
 */
export class ConnectedServicesDb {
  constructor(
    public readonly db: IConnectedServicesDbStore,
    public readonly cache: ConnectedServicesCache
  ) {}

  async getRefreshTokensByUid(uid: string) {
    const tokens = await this.db.getRefreshTokensByUid(uid);
    const extraMetadata = await this.cache.getRefreshTokens(uid);
    // We'll take this opportunity to clean up any tokens that exist in redis but
    // not in mysql, so this loop deletes each token from `extraMetadata` once handled.
    for (const t of tokens) {
      const id = hex(t.tokenId);
      if (id in extraMetadata) {
        Object.assign(t, extraMetadata[id]);
        delete extraMetadata[id];
      }
    }
    // Now we can prune any tokens found in redis but not mysql.
    const toDel = Object.keys(extraMetadata);
    if (toDel.length > 0) {
      await this.cache.pruneRefreshTokens(uid, toDel);
    }
    return tokens;
  }

  async getAccessTokensByUid(uid: string) {
    const tokens = await this.cache.getAccessTokens(uid);
    const otherTokens = await this.db.getAccessTokensByUid(uid);
    return tokens.concat(otherTokens);
  }

  async close() {
    await this.cache.close();
    await this.db.close();
  }
}
