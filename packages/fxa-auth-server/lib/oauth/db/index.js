/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = (v) => (Buffer.isBuffer(v) ? v.toString('hex') : v);

const { config } = require('../../../config');
const encrypt = require('fxa-shared/auth/encrypt');
const mysql = require('./mysql');
const redis = require('./redis');
const AccessToken = require('./accessToken');
const { SHORT_ACCESS_TOKEN_TTL_IN_MS } = require('fxa-shared/oauth/constants');
const RefreshTokenMetadata = require('./refreshTokenMetadata');
const { ConnectedServicesDb } = require('fxa-shared/connected-services');
const resolveScopesForService = require('./resolve-scopes-for-service');

const JWT_ACCESS_TOKENS_ENABLED = config.get(
  'oauthServer.jwtAccessTokens.enabled'
);
const JWT_ACCESS_TOKENS_CLIENT_IDS = new Set(
  config.get('oauthServer.jwtAccessTokens.enabledClientIds')
);

const REFRESH_LAST_USED_AT_UPDATE_AFTER_MS = config.get(
  'oauthServer.refreshToken.updateAfter'
);

// Service map and policy flags for token-exchange consent gating. Read
// once at module load; updates require a process restart.
const EXCHANGE_SERVICE_SCOPES = config.get(
  'oauthServer.exchange.serviceScopes'
);
const EXCHANGE_KNOWN_SERVICES = new Set(Object.keys(EXCHANGE_SERVICE_SCOPES));
// Inverse map: canonical scope URL -> service name. Used by the
// exchange path to resolve the requested scope to its owning service
// without touching the DB.
const EXCHANGE_SCOPE_TO_SERVICE = new Map(
  Object.entries(EXCHANGE_SERVICE_SCOPES).map(([service, scope]) => [
    scope,
    service,
  ])
);
const EXCHANGE_DENY_SILENT_FOR_SERVICES = new Set(
  config.get('oauthServer.exchange.denySilentForServices')
);
const EXCHANGE_BYPASS_CONSENT_FOR_SERVICES = new Set(
  config.get('oauthServer.exchange.bypassConsentForServices')
);
// service -> Set<clientId> of OAuth clients permitted to write a consent row
// for that service. Services not present here are unrestricted.
const EXCHANGE_ALLOWED_CLIENTS_FOR_SERVICE = new Map(
  Object.entries(
    config.get('oauthServer.exchange.allowedClientsForService') || {}
  ).map(([service, clientIds]) => [
    service,
    new Set((clientIds || []).map((c) => c.toLowerCase())),
  ])
);

// `/oauth/authorization` scope resolution: per-service base scope set,
// plus a single conditional scope added when keysJwe is present.
const AUTHORIZATION_SERVICE_SCOPES = config.get(
  'oauthServer.authorization.serviceScopes'
);
const AUTHORIZATION_KEYS_CONDITIONAL_SCOPE = config.get(
  'oauthServer.authorization.keysConditionalScope'
);

// Token-exchange consent-check outcomes. Callers in lib/routes/oauth/token.js
// switch on `result` and convert to metric outcomes and HTTP responses.
const EXCHANGE_DECISION = Object.freeze({
  // The user has a recorded consent row for this (scope, service).
  ALLOWED: 'allowed',
  // The service is on the bypass allowlist; consent is not consulted.
  // Transitional, exists for Relay until mobile clients ship 4xx handling.
  BYPASS: 'bypass',
  // The exchange is rejected. `reason` is one of the EXCHANGE_DENY_REASON values.
  DENIED: 'denied',
  // The scope is not in serviceScopes; caller falls back to clients.allowedScopes.
  FALL_THROUGH: 'fall-through',
});
const EXCHANGE_DENY_REASON = Object.freeze({
  // The service is on the silent-deny list (e.g. sync).
  SILENT_DISALLOWED: 'silent-disallowed',
  // No accountAuthorizations row exists for this (uid, scope, service).
  NO_CONSENT: 'no-consent',
});

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

  /**
   * Processes each refresh token, checking it against the redis cache. If
   * found, it merges the metadata from redis into the token object. Objects
   * found in redis, but not in mysql, are pruned.
   * @param {*} uid
   * @param {*} getTokens
   * @returns
   */
  async _processRefreshTokens(uid, getTokens) {
    const extraMetadata = await this.redis.getRefreshTokens(uid); // REDIS

    const tokens = await (async () => {
      if (Object.keys(extraMetadata)) {
       return await getTokens; // CALLS MYSQL
      }
      return {};
    })();

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

  /**
   * Fetches all refresh tokens for a given uid. Multiple tokens can be
   * returned for a single clientId
   * @param uid
   * @returns {Promise<*>}
   */
  async getRefreshTokensByUid(uid) {
    await this.ready();
    return this._processRefreshTokens(
      uid,
      this.mysql._getRefreshTokensByUid(uid)
    );
  }

  /**
   * Fetches all unique refresh tokens for a given uid. A clientId will
   * only appear once, prioritized by lastUsedAt date
   * @param uid
   * @returns {Promise<*>}
   */
  async getUniqueRefreshTokensByUid(uid) {
    await this.ready();
    return await this._processRefreshTokens(
      uid,
      this.mysql._getUniqueRefreshTokensByUid(uid)
    );
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

  // Called from both account deletion AND password reset, so this must
  // not touch the consent ledger — consent survives credential rotation.
  async removeTokensAndCodes(uid) {
    await this.ready();
    await this.redis.removeAccessTokensForUser(uid);
    await this.redis.removeRefreshTokensForUser(uid);
    await this.mysql._removeTokensAndCodes(uid);
  }

  async recordAccountActivity(userId, clientId, scopes, now, throttleMs) {
    await this.ready();
    return await this.mysql._recordAccountActivity(
      userId,
      clientId,
      scopes,
      now,
      throttleMs
    );
  }

  async listAccountActivity(userId, clientId) {
    await this.ready();
    return await this.mysql._listAccountActivity(userId, clientId);
  }

  async pruneAuthorizationCodes(ttlInMs) {
    return await this.mysql._pruneAuthorizationCodes(
      ttlInMs || config.get('oauthServer.expiration.code')
    );
  }

  // Upserts a consent row for each scope under (uid, service, clientId) in a
  // single atomic statement.
  async recordSignInConsents({ uid, scopes, service, clientId, now }) {
    await this.ready();
    return this.mysql._upsertAccountConsents(
      uid,
      scopes,
      service,
      clientId,
      now || Date.now()
    );
  }

  // True when a consent row exists for the exact (uid, scope, service).
  // Used by the /authorization pre-prompt check.
  async hasConsentForSignIn(uid, scope, service) {
    await this.ready();
    const row = await this.mysql._findAccountConsentForSignIn(
      uid,
      scope,
      service
    );
    return !!row;
  }

  // Applies the token-exchange decision matrix. See EXCHANGE_DECISION for the
  // shape of the returned `result`, and EXCHANGE_DENY_REASON for `reason` when
  // `result` is DENIED. Scope -> service resolution comes from the
  // oauthServer.exchange.serviceScopes config map; unmapped scopes fall
  // through to clients.allowedScopes.
  async hasConsentForExchange(uid, scope) {
    const service = EXCHANGE_SCOPE_TO_SERVICE.get(scope);
    if (!service) {
      return { result: EXCHANGE_DECISION.FALL_THROUGH };
    }
    if (EXCHANGE_DENY_SILENT_FOR_SERVICES.has(service)) {
      return {
        result: EXCHANGE_DECISION.DENIED,
        service,
        reason: EXCHANGE_DENY_REASON.SILENT_DISALLOWED,
      };
    }
    if (EXCHANGE_BYPASS_CONSENT_FOR_SERVICES.has(service)) {
      return { result: EXCHANGE_DECISION.BYPASS, service };
    }
    await this.ready();
    const hasConsent = await this.mysql._hasConsentForScope(
      uid,
      scope,
      service
    );
    if (hasConsent) {
      return { result: EXCHANGE_DECISION.ALLOWED, service };
    }
    return {
      result: EXCHANGE_DECISION.DENIED,
      service,
      reason: EXCHANGE_DENY_REASON.NO_CONSENT,
    };
  }

  // True iff the user has any prior consent for this service (any scope/client).
  // Used for the browser-service grain of the first-authorization signal.
  async hasConsentForService(uid, service) {
    await this.ready();
    return this.mysql._hasConsentForService(uid, service);
  }

  // True iff the user has any prior consent for this client (any scope/service).
  // Used for the web-RP grain of the first-authorization signal.
  async hasConsentForClient(uid, clientId) {
    await this.ready();
    return this.mysql._hasConsentForClient(uid, clientId);
  }

  async deleteAllConsentsForUser(uid) {
    await this.ready();
    return this.mysql._deleteAllAccountConsentsForUser(uid);
  }

  async listAccountConsentsByUid(uid) {
    await this.ready();
    return this.mysql._listAccountConsentsByUid(uid);
  }

  // True iff the (service, clientId) pair is permitted to record a consent
  // row. Services not configured in allowedClientsForService are
  // unrestricted. Configured services require the clientId to be on the
  // list. Used by the /authorization writer to gate the upsert so a
  // non-Mozilla RP cannot forge consent for a privileged service.
  isClientAllowedForService(serviceName, clientId) {
    if (!serviceName) {
      return true;
    }
    const allowed = EXCHANGE_ALLOWED_CLIENTS_FOR_SERVICE.get(serviceName);
    if (!allowed) {
      return true;
    }
    return allowed.has((clientId || '').toLowerCase());
  }

  // True iff serviceName appears in the oauthServer.exchange.serviceScopes
  // config map. Used by the /authorization writer to validate the URL's
  // service= param before persisting it; unknown values are dropped to ''.
  isKnownService(serviceName) {
    if (!serviceName) {
      return false;
    }
    return EXCHANGE_KNOWN_SERVICES.has(serviceName);
  }

  // Canonical scope URL for a configured service, or undefined if the
  // service isn't in oauthServer.exchange.serviceScopes. Used by the
  // /authorization writer to record an explicit consent row for the
  // service's umbrella scope alongside the user's requested scopes,
  // so cross-device token-exchange for that scope has a per-scope
  // match without relying on a service-only lookup.
  getCanonicalScopeForService(serviceName) {
    return EXCHANGE_SERVICE_SCOPES[serviceName];
  }

  // Service name for a canonical scope URL, or undefined if the scope
  // is not the canonical of any configured service. Used by the
  // /authorization writer to recover service= when the URL omits it
  // (e.g. VPN cached sign-in, where the OAuth client only sends scope=).
  // Returns undefined for scopes that no service owns.
  getServiceForCanonicalScope(scope) {
    return EXCHANGE_SCOPE_TO_SERVICE.get(scope);
  }

  // Server-side scope resolution when scope is missing, service is present,
  // and the client is Firefox
  resolveScopesForService(serviceName, withKeys) {
    return resolveScopesForService(
      AUTHORIZATION_SERVICE_SCOPES,
      AUTHORIZATION_KEYS_CONDITIONAL_SCOPE,
      serviceName,
      withKeys
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
module.exports = new OauthDB();
module.exports.EXCHANGE_DECISION = EXCHANGE_DECISION;
module.exports.EXCHANGE_DENY_REASON = EXCHANGE_DENY_REASON;
