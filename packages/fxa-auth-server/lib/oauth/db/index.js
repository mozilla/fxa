/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;

const P = require('../../promise');

const config = require('../../../config');
const encrypt = require('../encrypt');
const logger = require('../logging')('db');
const mysql = require('./mysql');
const redis = require('./redis');
const AccessToken = require('./accessToken');
const RefreshTokenMetadata = require('./refreshTokenMetadata');

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

class OauthDB {
  constructor() {
    this.mysql = mysql.connect(config.get('oauthServer.mysql'));
    this.mysql.then(async db => {
      await preClients();
      await scopes();
    });

    this.redis = redis();

    Object.keys(mysql.prototype).forEach(key => {
      const self = this;
      this[key] = async function() {
        const db = await self.mysql;
        return db[key].apply(db, Array.from(arguments));
      };
    });
  }

  disconnect() {}

  async generateAccessToken(vals) {
    const token = AccessToken.generate(
      vals.clientId,
      vals.name,
      vals.canGrant,
      vals.publicClient,
      vals.userId,
      vals.email,
      vals.scope,
      vals.profileChangedAt,
      vals.expiresAt,
      vals.ttl
    );
    if (POCKET_IDS.includes(hex(vals.clientId))) {
      // Pocket tokens are persisted past their expiration for legacy
      // reasons: https://bugzilla.mozilla.org/show_bug.cgi?id=1547902
      // since they are long lived we continue to store them in mysql
      // so that redis can be exclusively ephemeral
      const db = await this.mysql;
      await db._generateAccessToken(token);
    } else {
      await this.redis.setAccessToken(token);
    }
    return token;
  }

  async getAccessToken(id) {
    const t = await this.redis.getAccessToken(id);
    if (t) {
      return t;
    }
    const db = await this.mysql;
    return db._getAccessToken(id);
  }

  async removeAccessToken(token) {
    const done = await this.redis.removeAccessToken(token.tokenId);
    if (!done) {
      const db = await this.mysql;
      return db._removeAccessToken(token.tokenId);
    }
  }

  async getAccessTokensByUid(uid) {
    const tokens = await this.redis.getAccessTokens(uid);
    const db = await this.mysql;
    const otherTokens = await db._getAccessTokensByUid(uid);
    return tokens.concat(otherTokens);
  }

  async getRefreshToken(id) {
    const db = await this.mysql;
    const t = await db._getRefreshToken(id);
    if (t) {
      const extraMetadata = await this.redis.getRefreshToken(t.userId, id);
      Object.assign(t, extraMetadata || {});
    }
    return t;
  }

  async getRefreshTokensByUid(uid) {
    const db = await this.mysql;
    const tokens = await db._getRefreshTokensByUid(uid);
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

  async touchRefreshToken(token) {
    const now = new Date();
    // Always update timestamp in redis.
    await this.redis.setRefreshToken(
      token.userId,
      token.tokenId,
      new RefreshTokenMetadata(now)
    );
    // Periodically update timestamp in MySQL as well.
    if (+now - token.lastUsedAt > REFRESH_LAST_USED_AT_UPDATE_AFTER_MS) {
      const db = await this.mysql;
      await db._touchRefreshToken(token.tokenId, now);
    }
  }

  async removeRefreshToken(token) {
    await this.redis.removeRefreshToken(token.userId, token.tokenId);
    const db = await this.mysql;
    return db._removeRefreshToken(token.tokenId);
  }

  async removePublicAndCanGrantTokens(userId) {
    await this.redis.removeAccessTokensForPublicClients(userId);
    const db = await this.mysql;
    await db._removePublicAndCanGrantTokens(userId);
    // Note that we do not clear metadata for deleted refresh tokens from redis,
    // because it's awkward to enumerate the list of deleted refresh token ids.
    // Instead we rely on a future call to `getRefreshTokensByUid` for lazy cleanup.
  }

  async deleteClientAuthorization(clientId, uid) {
    await this.redis.removeAccessTokensForUserAndClient(uid, clientId);
    const db = await this.mysql;
    return db._deleteClientAuthorization(clientId, uid);
    // Note that we do not clear metadata for deleted refresh tokens from redis,
    // because it's awkward to enumerate the list of deleted refresh token ids.
    // Instead we rely on a future call to `getRefreshTokensByUid` for lazy cleanup.
  }

  async deleteClientRefreshToken(refreshTokenId, clientId, uid) {
    const db = await this.mysql;
    const ok = await db._deleteClientRefreshToken(
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

  async removeUser(uid) {
    await this.redis.removeAccessTokensForUser(uid);
    await this.redis.removeRefreshTokensForUser(uid);
    const db = await this.mysql;
    await db._removeUser(uid);
  }
}

function clientEquals(configClient, dbClient) {
  var props = Object.keys(configClient);
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var configProp = hex(configClient[prop]);
    var dbProp = hex(dbClient[prop]);
    if (configProp !== dbProp) {
      logger.debug('clients.differ', {
        prop: prop,
        configProp: configProp,
        dbProp: dbProp,
      });
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

function preClients() {
  var clients = config.get('oauthServer.clients');
  if (clients && clients.length) {
    logger.debug('predefined.loading', { clients: clients });
    return P.all(
      clients.map(function(c) {
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
          return P.reject(
            new Error('Do not keep client secrets in the config file.')
          );
        }

        // ensure the required keys are present.
        var err = null;
        var REQUIRED_CLIENTS_KEYS = [
          'id',
          'hashedSecret',
          'name',
          'imageUri',
          'redirectUri',
          'trusted',
          'canGrant',
        ];
        REQUIRED_CLIENTS_KEYS.forEach(function(key) {
          if (!(key in c)) {
            var data = { key: key, name: c.name || 'unknown' };
            logger.error('client.missing.keys', data);
            err = new Error('Client config has missing keys');
          }
        });
        if (err) {
          return P.reject(err);
        }

        // ensure booleans are boolean and not undefined
        c.trusted = !!c.trusted;
        c.canGrant = !!c.canGrant;
        c.publicClient = !!c.publicClient;

        // Modification of the database at startup in production and stage is
        // not preferred. This option will be set to false on those stacks.
        if (!config.get('oauthServer.db.autoUpdateClients')) {
          return P.resolve();
        }

        return module.exports.getClient(c.id).then(function(client) {
          if (client) {
            client = convertClientToConfigFormat(client);
            logger.info('client.compare', { id: c.id });
            if (clientEquals(client, c)) {
              logger.info('client.compare.equal', { id: c.id });
            } else {
              logger.warn('client.compare.differs', {
                id: c.id,
                before: client,
                after: c,
              });
              return module.exports.updateClient(c);
            }
          } else {
            return module.exports.registerClient(c);
          }
        });
      })
    );
  } else {
    return P.resolve();
  }
}

/**
 * Insert pre-defined list of scopes into the DB
 */
function scopes() {
  var scopes = config.get('oauthServer.scopes');
  if (scopes && scopes.length) {
    logger.debug('scopes.loading', JSON.stringify(scopes));

    return P.all(
      scopes.map(function(s) {
        return module.exports.getScope(s.scope).then(function(existing) {
          if (existing) {
            logger.verbose('scopes.existing', s);
            return;
          }

          return module.exports.registerScope(s);
        });
      })
    );
  }
}

module.exports = new OauthDB();
