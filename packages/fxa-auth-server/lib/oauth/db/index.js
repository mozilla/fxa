/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import hexModule from "buf";

const hex = hexModule.to.hex;

import { config } from '../../../config';
import encrypt from 'fxa-shared/auth/encrypt';
import * as mysql from './mysql';
import redis from './redis';
import AccessToken from './accessToken';
import { SHORT_ACCESS_TOKEN_TTL_IN_MS } from 'fxa-shared/oauth/constants';
import RefreshTokenMetadata from './refreshTokenMetadata';
import { ConnectedServicesDb } from 'fxa-shared/connected-services';

const JWT_ACCESS_TOKENS_ENABLED = config.get(
  'oauthServer.jwtAccessTokens.enabled'
);
const JWT_ACCESS_TOKENS_CLIENT_IDS = new Set(
  config.get('oauthServer.jwtAccessTokens.enabledClientIds')
);

const REFRESH_LAST_USED_AT_UPDATE_AFTER_MS = config.get(
  'oauthServer.refreshToken.updateAfter'
);

function getPocketIds(idNameMap) {
  return Object.entries(idNameMap)
    .filter(([_, name]) => name.startsWith('pocket'))
    .map(([id, _]) => id);
}

const POCKET_IDS = getPocketIds(
  config.get('oauthServer.clientIdToServiceNames')
);

class OauthDB extends ConnectedServicesDb {
  get mysql() {
    return this.db;
  }

  get redis() {
    return this.cache;
  }

  constructor() {
    super(mysql.connect(config.get('oauthServer.mysql')), redis());

    // A better inheritance model would be preferable, but for now
    // this is still backwards compatible.
    for (const functionName of this.mysql.getProxyableFunctions()) {
      if (this[functionName] === undefined) {
        this[functionName] = (...args) => {
          return this.proxy(functionName, ...args);
        };
      }
    }
  }

  async proxy(method, ...args) {
    await this.ready();
    return await this.mysql[method](...args);
  }

  async ready() {
    if (!this._isReady) {
      this._isReady = initDb(this.mysql);
    }
    await this._isReady;
  }

  disconnect() {}

  async generateAccessToken(vals) {
    await this.ready();
    const token = AccessToken.generate(
      vals.clientId,
      vals.name,
      vals.canGrant,
      vals.publicClient,
      vals.userId,
      vals.scope,
      vals.profileChangedAt,
      vals.expiresAt,
      vals.ttl
    );
    if (
      JWT_ACCESS_TOKENS_ENABLED &&
      JWT_ACCESS_TOKENS_CLIENT_IDS.has(vals.clientId) &&
      token.ttl <= SHORT_ACCESS_TOKEN_TTL_IN_MS
    ) {
      // We avoid revocation concerns with short-lived
      // tokens, so we do not store them.
      return token;
    } else if (POCKET_IDS.includes(hex(vals.clientId))) {
      // Pocket tokens are persisted past their expiration for legacy
      // reasons: https://bugzilla.mozilla.org/show_bug.cgi?id=1547902
      // since they are long lived we continue to store them in mysql
      // so that redis can be exclusively ephemeral
      await this.mysql._generateAccessToken(token);
    } else {
      await this.redis.setAccessToken(token);
    }
    return token;
  }

  async getAccessToken(id) {
    await this.ready();
    const t = await this.redis.getAccessToken(id);
    if (t) {
      return t;
    }
    return await this.mysql._getAccessToken(id);
  }

  async removeAccessToken(token) {
    await this.ready();
    const done = await this.redis.removeAccessToken(token.tokenId);
    if (!done) {
      return await this.mysql._removeAccessToken(token.tokenId);
    }
  }

  async getAccessTokensByUid(uid) {
    await this.ready();
    const tokens = await this.redis.getAccessTokens(uid);
    const otherTokens = await this.mysql._getAccessTokensByUid(uid);
    return tokens.concat(otherTokens);
  }

  async getRefreshToken(id) {
    await this.ready();
    const t = await this.mysql._getRefreshToken(id);
    if (t) {
      const extraMetadata = new RefreshTokenMetadata(new Date());
      await this.redis.setRefreshToken(t.userId, id, extraMetadata);
      // Periodically update timestamp in MySQL as well.
      if (
        extraMetadata.lastUsedAt - t.lastUsedAt >
        REFRESH_LAST_USED_AT_UPDATE_AFTER_MS
      ) {
        await this.mysql._touchRefreshToken(
          t.tokenId,
          extraMetadata.lastUsedAt
        );
      }
      Object.assign(t, extraMetadata || {});
    }
    return t;
  }

  async getRefreshTokensByUid(uid) {
    await this.ready();
    const tokens = await this.mysql._getRefreshTokensByUid(uid);
    const extraMetadata = await this.redis.getRefreshTokens(uid);
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
      await this.redis.pruneRefreshTokens(uid, toDel);
    }
    return tokens;
  }

  async removeRefreshToken(token) {
    await this.ready();
    await this.redis.removeRefreshToken(token.userId, token.tokenId);
    return this.mysql._removeRefreshToken(token.tokenId);
  }

  async removePublicAndCanGrantTokens(userId) {
    await this.redis.removeAccessTokensForPublicClients(userId);
    const db = await this.mysql;
    await db._removePublicAndCanGrantTokens(userId);
    // Note that we do not clear metadata for deleted refresh tokens from redis,
    // because it's awkward to enumerate the list of deleted refresh token ids.
    // Instead we rely on a future call to `getRefreshTokensByUid` or
    // `getRefreshToken` for lazy cleanup.
  }

  async deleteClientAuthorization(clientId, uid) {
    await this.ready();
    await this.redis.removeAccessTokensForUserAndClient(uid, clientId);
    return await this.mysql._deleteClientAuthorization(clientId, uid);
    // Note that we do not clear metadata for deleted refresh tokens from redis,
    // because it's awkward to enumerate the list of deleted refresh token ids.
    // Instead we rely on a future call to `getRefreshTokensByUid` or
    // `getRefreshToken` for lazy cleanup.
  }

  async deleteClientRefreshToken(refreshTokenId, clientId, uid) {
    await this.ready();
    const ok = await this.mysql._deleteClientRefreshToken(
      refreshTokenId,
      clientId,
      uid
    );
    if (ok) {
      await this.redis.removeRefreshToken(uid, refreshTokenId);
      await this.redis.removeAccessTokensForUserAndClient(uid, clientId);
    }
    return ok;
  }

  async removeTokensAndCodes(uid) {
    await this.ready();
    await this.redis.removeAccessTokensForUser(uid);
    await this.redis.removeRefreshTokensForUser(uid);
    await this.mysql._removeTokensAndCodes(uid);
  }

  getPocketIds() {
    return POCKET_IDS;
  }

  async pruneAuthorizationCodes(ttlInMs) {
    return await this.mysql._pruneAuthorizationCodes(
      ttlInMs || config.get('oauthServer.expiration.code')
    );
  }
}

// Helper functions
function clientEquals(configClient, dbClient) {
  var props = Object.keys(configClient);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var configProp = hex(configClient[prop]);
    var dbProp = hex(dbClient[prop]);
    if (configProp !== dbProp) {
      return false;
    }
  }
  return true;
}

function convertClientToConfigFormat(client) {
  var out = {};

  for (var key in client) {
    if (key === 'hashedSecret' || key === 'hashedSecretPrevious') {
      out[key] = hex(client[key]);
    } else if (key === 'trusted' || key === 'canGrant') {
      out[key] = !!client[key]; // db stores booleans as 0 or 1.
    } else if (typeof client[key] !== 'function') {
      out[key] = hex(client[key]);
    }
  }
  return out;
}

async function initDb(db) {
  await preClients(db);
  await scopes(db);
}

async function preClients(db) {
  var clients = config.get('oauthServer.clients');
  if (clients && clients.length) {
    return await Promise.all(
      clients.map(async function (c) {
        if (c.secret) {
          // eslint-disable-next-line no-console
          console.error(
            'Do not keep client secrets in the config file.' + // eslint-disable-line no-console
              ' Use the `hashedSecret` field instead.\n\n' +
              '\tclient=%s has `secret` field\n' +
              '\tuse hashedSecret="%s" instead',
            c.id,
            hex(encrypt.hash(c.secret))
          );
          throw new Error('Do not keep client secrets in the config file.');
        }

        // ensure the required keys are present.
        var REQUIRED_CLIENTS_KEYS = [
          'id',
          'hashedSecret',
          'name',
          'imageUri',
          'redirectUri',
          'trusted',
          'canGrant',
        ];
        REQUIRED_CLIENTS_KEYS.forEach(function (key) {
          if (!(key in c)) {
            throw new Error('Client config has missing keys');
          }
        });

        // ensure booleans are boolean and not undefined
        c.trusted = !!c.trusted;
        c.canGrant = !!c.canGrant;
        c.publicClient = !!c.publicClient;

        // Modification of the database at startup in production and stage is
        // not preferred. This option will be set to false on those stacks.
        if (!config.get('oauthServer.db.autoUpdateClients')) {
          return;
        }

        let client = await db.getClient(c.id);
        if (client) {
          client = convertClientToConfigFormat(client);
          if (!clientEquals(client, c)) {
            return await db.updateClient(c);
          }
        } else {
          return await db.registerClient(c);
        }
      })
    );
  }
}

/**
 * Insert pre-defined list of scopes into the DB
 */
async function scopes(db) {
  var scopes = config.get('oauthServer.scopes');
  if (scopes && scopes.length) {
    return await Promise.all(
      scopes.map(async function (s) {
        const existing = await db.getScope(s.scope);
        if (existing) {
          return;
        }

        return await db.registerScope(s);
      })
    );
  }
}
export default new OauthDB();
