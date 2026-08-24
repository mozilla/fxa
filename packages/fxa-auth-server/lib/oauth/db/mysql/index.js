/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const encrypt = require('fxa-shared/auth/encrypt');
const ScopeSet = require('fxa-shared').oauth.scopes;
const unique = require('../../unique');
const { ScopeIdCache } = require('../../scopes-cache');

// Shared base class
const { MysqlOAuthShared } = require('fxa-shared/db/mysql');
const { Container } = require('typedi');
const { AuthLogger } = require('../../../types');
const { StatsD } = require('hot-shots');

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];

const QUERY_GET_LOCK = 'SELECT GET_LOCK(?, ?) AS acquired';
const QUERY_RELEASE_LOCK = 'SELECT RELEASE_LOCK(?)';
const QUERY_CLIENT_REGISTER =
  'INSERT INTO clients ' +
  '(id, name, imageUri, hashedSecret, hashedSecretPrevious, redirectUri,' +
  'trusted, allowedScopes, canGrant, publicClient) ' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
const QUERY_CLIENT_DEVELOPER_INSERT =
  'INSERT INTO clientDevelopers ' +
  '(rowId, developerId, clientId) ' +
  'VALUES (?, ?, ?);';
const QUERY_CLIENT_DEVELOPER_LIST_BY_CLIENT_ID =
  'SELECT developers.email, developers.createdAt ' +
  'FROM clientDevelopers, developers ' +
  'WHERE clientDevelopers.developerId = developers.developerId ' +
  'AND clientDevelopers.clientId=?;';
const QUERY_DEVELOPER_OWNS_CLIENT =
  'SELECT clientDevelopers.rowId ' +
  'FROM clientDevelopers, developers ' +
  'WHERE developers.developerId = clientDevelopers.developerId ' +
  'AND developers.email =? AND clientDevelopers.clientId =?;';
const QUERY_DEVELOPER_INSERT =
  'INSERT INTO developers ' + '(developerId, email) ' + 'VALUES (?, ?);';
const QUERY_CLIENT_GET = 'SELECT * FROM clients WHERE id=?';
const QUERY_CLIENT_IDS = 'SELECT id FROM clients';
const QUERY_CLIENT_LIST =
  'SELECT id, name, redirectUri, imageUri, ' +
  'canGrant, publicClient, trusted ' +
  'FROM clients, clientDevelopers, developers ' +
  'WHERE clients.id = clientDevelopers.clientId AND ' +
  'developers.developerId = clientDevelopers.developerId AND ' +
  'developers.email =?;';
const QUERY_CLIENT_UPDATE =
  'UPDATE clients SET ' +
  'name=COALESCE(?, name), imageUri=COALESCE(?, imageUri), ' +
  'hashedSecret=COALESCE(?, hashedSecret), ' +
  'hashedSecretPrevious=COALESCE(?, hashedSecretPrevious), ' +
  'redirectUri=COALESCE(?, redirectUri), ' +
  'trusted=COALESCE(?, trusted), allowedScopes=COALESCE(?, allowedScopes), ' +
  'canGrant=COALESCE(?, canGrant) ' +
  'WHERE id=?';
// This query deletes everything related to the client, and is thus quite expensive!
// Don't worry, it's not exposed to any production-facing routes.
const QUERY_CLIENT_DELETE =
  'DELETE clients, codes, refreshTokens, clientDevelopers ' +
  'FROM clients ' +
  'LEFT JOIN codes ON clients.id = codes.clientId ' +
  'LEFT JOIN refreshTokens ON clients.id = refreshTokens.clientId ' +
  'LEFT JOIN clientDevelopers ON clients.id = clientDevelopers.clientId ' +
  'WHERE clients.id=?';
const QUERY_CODE_INSERT =
  'INSERT INTO codes (clientId, userId, scope, authAt, amr, aal, offline, code, codeChallengeMethod, codeChallenge, keysJwe, profileChangedAt, sessionTokenId) ' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
const QUERY_REFRESH_TOKEN_INSERT =
  'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt) VALUES ' +
  '(?, ?, ?, ?, ?)';
// Note that the `token` field stores the hash of the token rather than the raw token,
// and hence would more properly be called `tokenId`.
const QUERY_REFRESH_TOKEN_FIND =
  'SELECT token AS tokenId, clientId, userId, scope, createdAt, ' +
  'lastUsedAt, profileChangedAt ' +
  'FROM refreshTokens where token=?';
const QUERY_REFRESH_TOKEN_LAST_USED_UPDATE =
  'UPDATE refreshTokens SET lastUsedAt=? WHERE token=?';
const QUERY_CODE_FIND = 'SELECT * FROM codes WHERE code=?';
const QUERY_CODE_DELETE = 'DELETE FROM codes WHERE code=?';
const QUERY_REFRESH_TOKEN_DELETE = 'DELETE FROM refreshTokens WHERE token=?';
// This query can be very expensive if MySQL tries to filter by clientId before
// userId, so we add an explicit index hint to help ensure this doesn't happen.
const QUERY_DELETE_REFRESH_TOKEN_FOR_PUBLIC_CLIENTS =
  'DELETE refreshTokens ' +
  'FROM refreshTokens FORCE INDEX (tokens_user_id)' +
  'INNER JOIN clients ON refreshTokens.clientId = clients.id ' +
  'WHERE refreshTokens.userId=? AND (clients.publicClient = 1 OR clients.canGrant = 1)';
const QUERY_REFRESH_TOKEN_DELETE_USER =
  'DELETE FROM refreshTokens WHERE userId=?';
const QUERY_CODE_DELETE_USER = 'DELETE FROM codes WHERE userId=?';
// SQL-side throttle: ON DUPLICATE KEY UPDATE skips the lastSeenAt write
// when the existing row was touched within the throttle window. `> lastSeenAt + ?`
// (instead of subtraction) avoids BIGINT UNSIGNED underflow on stale `now`.
// firstSeenAt is set on INSERT only.
// Bulk upsert for accountActivity. The VALUES list is built at call time so
// every resolved scope for a grant lands in one round-trip. firstSeenAt is set
// on INSERT only. `> lastSeenAt + ?` (instead of subtraction) avoids BIGINT
// UNSIGNED underflow on a stale `now`.
const QUERY_ACCOUNT_ACTIVITY_UPSERT_PREFIX =
  'INSERT INTO accountActivity ' +
  '  (userId, clientId, scopeId, firstSeenAt, lastSeenAt) VALUES ';
const QUERY_ACCOUNT_ACTIVITY_UPSERT_SUFFIX =
  ' ON DUPLICATE KEY UPDATE ' +
  '  lastSeenAt = IF(VALUES(lastSeenAt) > lastSeenAt + ?, VALUES(lastSeenAt), lastSeenAt)';
const QUERY_ACCOUNT_ACTIVITY_DELETE_USER =
  'DELETE FROM accountActivity WHERE userId=?';
// Read back a (userId, clientId)'s activity with the scope string resolved from
// the scopes table. Used by support tooling and tests.
const QUERY_ACCOUNT_ACTIVITY_LIST =
  'SELECT s.scope AS scope, a.scopeId, a.firstSeenAt, a.lastSeenAt ' +
  'FROM accountActivity a JOIN scopes s ON s.id = a.scopeId ' +
  'WHERE a.userId=? AND a.clientId=? ' +
  'ORDER BY s.scope';
const QUERY_DEVELOPER = 'SELECT * FROM developers WHERE email=?';
const QUERY_DEVELOPER_DELETE =
  'DELETE developers, clientDevelopers ' +
  'FROM developers ' +
  'LEFT JOIN clientDevelopers ON developers.developerId = clientDevelopers.developerId ' +
  'WHERE developers.email=?';
const QUERY_LIST_REFRESH_TOKENS_BY_UID =
  'SELECT refreshTokens.token AS tokenId, refreshTokens.clientId, refreshTokens.createdAt, refreshTokens.lastUsedAt, ' +
  '  refreshTokens.scope, clients.name as clientName, clients.canGrant AS clientCanGrant ' +
  'FROM refreshTokens LEFT OUTER JOIN clients ON clients.id = refreshTokens.clientId ' +
  'WHERE refreshTokens.userId=?';
// Just what revocation needs to decide whether a peer still sustains a row.
// Skips the clients join and the Redis metadata hydration that
// QUERY_LIST_REFRESH_TOKENS_BY_UID drives, neither of which affects the
// decision.
const QUERY_LIST_REFRESH_TOKEN_SCOPES_BY_UID =
  'SELECT clientId, scope FROM refreshTokens FORCE INDEX (tokens_user_id) ' +
  'WHERE userId=?';

/**
 * Gets a unique list of refresh tokens for a given user.
 * Groups by clientId, returning only the most recently used token for each client.
 */
const QUERY_LIST_UNIQUE_REFRESH_TOKENS_BY_UID =
  'SELECT ' +
  '  rt.clientId, ' +
  '  rt.token AS tokenId, ' +
  '  rt.createdAt, ' +
  '  rt.lastUsedAt, ' +
  '  rt.scope, ' +
  '  clients.name AS clientName, ' +
  '  clients.canGrant AS clientCanGrant ' +
  'FROM refreshTokens rt ' +
  'INNER JOIN ( ' +
  '  SELECT clientId, MAX(lastUsedAt) AS maxLastUsedAt ' +
  '  FROM refreshTokens ' +
  '  WHERE userId=? ' +
  '  GROUP BY clientId ' +
  ') latest ON rt.clientId = latest.clientId AND rt.lastUsedAt = latest.maxLastUsedAt ' +
  'LEFT OUTER JOIN clients ON clients.id = rt.clientId ' +
  'WHERE rt.userId=?';

const QUERY_LIST_REFRESH_TOKENS_BY_CLIENT_ID =
  'SELECT refreshTokens.createdAt, refreshTokens.userId FROM refreshTokens WHERE refreshTokens.clientId=?';
const DELETE_ACTIVE_CODES_BY_CLIENT_AND_UID =
  'DELETE FROM codes WHERE clientId=? AND userId=?';
const DELETE_ACTIVE_REFRESH_TOKENS_BY_CLIENT_AND_UID =
  'DELETE FROM refreshTokens WHERE clientId=? AND userId=?';
const DELETE_REFRESH_TOKEN_WITH_CLIENT_AND_UID =
  'DELETE FROM refreshTokens WHERE token=? AND clientId=? AND userId=?';
const PRUNE_AUTHZ_CODES =
  'DELETE FROM codes WHERE TIMESTAMPDIFF(SECOND, createdAt, NOW()) > ? LIMIT 10000';

// First insert sets both timestamps to now. Later completions for the same PK
// preserve firstAuthorizedTosAt and bump lastAuthorizedTosAt via GREATEST,
// guarding against clock skew or reordered writes moving it backwards.
// The VALUES list is built at call time so all scopes are recorded in one query.
//
// Clearing revokedAt is what makes re-authorization a reactivation rather than
// a new grant: the row keeps its firstAuthorizedTosAt, so the ToS record spans
// the revoke. firstAuthorizedTosAt is deliberately absent from the UPDATE list.
const QUERY_ACCOUNT_CONSENT_UPSERT_PREFIX =
  'INSERT INTO accountAuthorizations ' +
  '(uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt) ' +
  'VALUES ';
const QUERY_ACCOUNT_CONSENT_UPSERT_SUFFIX =
  ' ON DUPLICATE KEY UPDATE ' +
  'lastAuthorizedTosAt = GREATEST(lastAuthorizedTosAt, VALUES(lastAuthorizedTosAt)), ' +
  'revokedAt = NULL';
// Active-authorization lookup for the /authorization pre-prompt check: a
// revoked row must re-prompt so the user can re-consent (which clears
// revokedAt above), not be waved through on the strength of the row existing.
const QUERY_ACCOUNT_CONSENT_FIND_SIGNIN =
  'SELECT uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt ' +
  'FROM accountAuthorizations ' +
  'WHERE uid=? AND scope=? AND service=? AND revokedAt IS NULL';
// Direct lookup for the token-exchange gate after the caller has
// resolved scope -> service via config. PK left-prefix on
// (uid, scope, service); no secondary index required. The scope is
// part of the WHERE so a consent recorded for one scope under a
// service cannot silently authorize a different scope under the
// same service.
//
// revokedAt IS NULL has to be in the statement rather than applied to the
// result. (uid, scope, service) is a PK prefix, not the whole key, so it can
// match one row per client; filtering afterwards would let LIMIT 1 return a
// revoked row and deny a user still authorized through another client. The
// column is in no index, so this costs a check on rows the seek already read.
const QUERY_HAS_CONSENT_FOR_SCOPE =
  'SELECT 1 FROM accountAuthorizations ' +
  'WHERE uid=? AND scope=? AND service=? AND revokedAt IS NULL LIMIT 1';
// Full-PK existence check for the VPN-in-Desktop DAU bandaid (FXA-14159).
// Adds clientId to QUERY_HAS_CONSENT_FOR_SCOPE so a VPN consent recorded for a
// different client (e.g. Mobile or the standalone VPN app) does not count as
// Desktop authorization. A complete PK match — the fastest lookup this table
// supports. Revoked rows are excluded for the same reason the gate excludes
// them: a withdrawn authorization must stop counting toward VPN DAU.
const QUERY_HAS_CONSENT_FOR_SCOPE_AND_CLIENT =
  'SELECT 1 FROM accountAuthorizations ' +
  'WHERE uid=? AND scope=? AND service=? AND clientId=? AND revokedAt IS NULL LIMIT 1';
// Existence checks for the first-authorization signal (FXA-13784). Bounded by
// the user's rows (PK prefix on uid) with a LIMIT 1 early-out — cheaper than
// fetching all of a user's consents and filtering in JS.
//
// These two intentionally do not filter on revokedAt. They answer "has this
// user ever authorized this?", and isFirstAuthorization negates them — a user
// who authorized and later revoked is not authorizing for the first time, so
// the historical row is exactly what should be matched.
const QUERY_HAS_CONSENT_FOR_SERVICE =
  'SELECT 1 FROM accountAuthorizations WHERE uid=? AND service=? LIMIT 1';
const QUERY_HAS_CONSENT_FOR_CLIENT =
  'SELECT 1 FROM accountAuthorizations WHERE uid=? AND clientId=? LIMIT 1';
const QUERY_ACCOUNT_CONSENT_DELETE_BY_UID =
  'DELETE FROM accountAuthorizations WHERE uid=?';
// Unfiltered: callers get every row and decide what revokedAt means to them.
const QUERY_ACCOUNT_CONSENT_LIST_BY_UID =
  'SELECT uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt, revokedAt ' +
  'FROM accountAuthorizations WHERE uid=?';
// Row-constructor IN list over the full PK, so a revoke can never widen past
// the rows the caller identified.
//
// lastAuthorizedTosAt is matched as an optimistic guard: a row re-earned by a
// concurrent /oauth/authorization between the caller's read and this write has
// a newer timestamp, falls out of the IN list, and survives. Without it, a
// sign-in racing a disconnect would be revoked immediately after the user
// granted it.
//
// revokedAt IS NULL keeps the first revocation's timestamp authoritative when
// concurrent disconnects target the same row. Connected Services collapses
// entries by display name and fires its destroys in parallel, so this is a
// normal case rather than an edge one.
const QUERY_ACCOUNT_AUTHORIZATION_REVOKE_ROWS_PREFIX =
  'UPDATE accountAuthorizations SET revokedAt=? ' +
  'WHERE uid=? AND revokedAt IS NULL AND ' +
  '(scope, service, clientId, lastAuthorizedTosAt) IN (';

// accountAuthorizations_v2 shadow table (FXA-14169). Same rows as v1 but
// `scope` is replaced by an integer `scopeId` FK to scopes(id). Written
// alongside v1 behind the dualWriteV2 flag; read v2-first / v1-fallback behind
// readV2. The upsert mirrors v1's GREATEST bump so a concurrent backfill can
// never regress a fresher live-written row.
const QUERY_ACCOUNT_CONSENT_V2_UPSERT_PREFIX =
  'INSERT INTO accountAuthorizations_v2 ' +
  '(uid, service, scopeId, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt) ' +
  'VALUES ';
const QUERY_ACCOUNT_CONSENT_V2_UPSERT_SUFFIX =
  ' ON DUPLICATE KEY UPDATE ' +
  'lastAuthorizedTosAt = GREATEST(lastAuthorizedTosAt, VALUES(lastAuthorizedTosAt))';
// Existence checks against v2. scope is resolved to scopeId by the caller
// (via the scopes cache) before these run; all are PK left-prefixes on
// (uid, service, scopeId, clientId).
const QUERY_ACCOUNT_CONSENT_V2_FIND_SIGNIN =
  'SELECT 1 FROM accountAuthorizations_v2 WHERE uid=? AND scopeId=? AND service=? LIMIT 1';
const QUERY_HAS_CONSENT_FOR_SCOPE_V2 =
  'SELECT 1 FROM accountAuthorizations_v2 WHERE uid=? AND scopeId=? AND service=? LIMIT 1';
const QUERY_HAS_CONSENT_FOR_SERVICE_V2 =
  'SELECT 1 FROM accountAuthorizations_v2 WHERE uid=? AND service=? LIMIT 1';
const QUERY_HAS_CONSENT_FOR_CLIENT_V2 =
  'SELECT 1 FROM accountAuthorizations_v2 WHERE uid=? AND clientId=? LIMIT 1';
const QUERY_ACCOUNT_CONSENT_V2_DELETE_BY_UID =
  'DELETE FROM accountAuthorizations_v2 WHERE uid=?';

// Scope queries
const QUERY_SCOPE_FIND = 'SELECT * ' + 'FROM scopes ' + 'WHERE scopes.scope=?;';
const QUERY_SCOPES_INSERT =
  'INSERT INTO scopes (scope, hasScopedKeys) ' + 'VALUES (?, ?);';
// Bulk scope-string -> id resolution backing the scopes cache. The IN list is
// built at call time from the uncached scopes.
const QUERY_SCOPES_RESOLVE_IDS_PREFIX = 'SELECT id, scope FROM scopes WHERE scope IN (';

const buf = (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));

// Revokes are batched so one statement never scales with the whole ledger.
// Well under any placeholder or packet limit, and a user's revocable row count
// is normally a handful.
const AUTHORIZATION_REVOKE_BATCH_SIZE = 200;
const chunk = (items, size) => {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

function firstRow(rows) {
  return rows[0];
}

function resolveLogger() {
  if (Container.has(AuthLogger)) return Container.get(AuthLogger);
}
function resolveMetrics() {
  if (Container.has(StatsD)) return Container.get(StatsD);
}

class MysqlStore extends MysqlOAuthShared {
  constructor(config) {
    super(config, undefined, resolveLogger(), resolveMetrics());
  }

  // Process-lifetime scope-string -> scopes.id cache for the
  // accountAuthorizations v2 dual-write/read paths (FXA-14169). Created lazily
  // on first use so the module-load singleton's constructor does no work; the
  // scope rows themselves are resolved on-miss and cached from then on. When
  // both v2 flags are off (the default), it is never created.
  get _scopeIdCache() {
    if (!this.__scopeIdCache) {
      this.__scopeIdCache = new ScopeIdCache((scopes) =>
        this._resolveScopeRows(scopes)
      );
    }
    return this.__scopeIdCache;
  }

  // Bulk scope-string -> {scope, id} lookup for the scopes cache. Never called
  // with an empty list (the cache short-circuits that).
  _resolveScopeRows(scopes) {
    const placeholders = scopes.map(() => '?').join(', ');
    return this._read(
      QUERY_SCOPES_RESOLVE_IDS_PREFIX + placeholders + ')',
      scopes
    );
  }

  async ping() {
    const conn = await this._getConnection();
    try {
      return await new Promise(function (resolve, reject) {
        conn.ping(function (err) {
          if (err) {
            return reject(err);
          }
          resolve({});
        });
      });
    } finally {
      conn.release();
    }
  }

  async _withLock(cb, lockName, timeout = 3) {
    const conn = await this._getConnection();

    try {
      this._queryWithConnection(conn, QUERY_GET_LOCK, [lockName, timeout]);
      return await cb(conn);
    } finally {
      this._queryWithConnection(conn, QUERY_RELEASE_LOCK, [lockName]);
      conn.release();
    }
  }

  // createdAt is DEFAULT NOW() in the schema.sql
  registerClient(client) {
    var id;
    if (client.id) {
      id = buf(client.id);
    } else {
      id = unique.id();
    }
    return this._write(QUERY_CLIENT_REGISTER, [
      id,
      client.name,
      client.imageUri || '',
      buf(client.hashedSecret),
      client.hashedSecretPrevious ? buf(client.hashedSecretPrevious) : null,
      client.redirectUri,
      !!client.trusted,
      client.allowedScopes ? client.allowedScopes : null,
      !!client.canGrant,
      !!client.publicClient,
    ]).then(function () {
      client.id = id;
      return client;
    });
  }
  registerClientDeveloper(developerId, clientId) {
    if (!developerId || !clientId) {
      var err = new Error('Owner registration requires user and developer id');
      return Promise.reject(err);
    }

    var rowId = unique.id();

    return this._write(QUERY_CLIENT_DEVELOPER_INSERT, [
      buf(rowId),
      buf(developerId),
      buf(clientId),
    ]);
  }
  getClientDevelopers(clientId) {
    if (!clientId) {
      return Promise.reject(new Error('Client id is required'));
    }
    return this._read(QUERY_CLIENT_DEVELOPER_LIST_BY_CLIENT_ID, [
      buf(clientId),
    ]);
  }
  activateDeveloper(email) {
    if (!email) {
      return Promise.reject(new Error('Email is required'));
    }

    var developerId = unique.developerId();
    return this._write(QUERY_DEVELOPER_INSERT, [developerId, email]).then(
      function () {
        return this.getDeveloper(email);
      }.bind(this)
    );
  }
  getDeveloper(email) {
    if (!email) {
      return Promise.reject(new Error('Email is required'));
    }

    return this._readOne(QUERY_DEVELOPER, [email]);
  }
  removeDeveloper(email) {
    if (!email) {
      return Promise.reject(new Error('Email is required'));
    }

    return this._write(QUERY_DEVELOPER_DELETE, [email]);
  }
  developerOwnsClient(developerEmail, clientId) {
    return this._readOne(QUERY_DEVELOPER_OWNS_CLIENT, [
      developerEmail,
      buf(clientId),
    ]).then(function (result) {
      if (result) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(false);
      }
    });
  }
  updateClient(client) {
    if (!client.id) {
      return Promise.reject(new Error('Update client needs an id'));
    }
    var secret = client.hashedSecret;
    if (secret) {
      secret = buf(secret);
    }

    var secretPrevious = client.hashedSecretPrevious;
    if (secretPrevious) {
      secretPrevious = buf(secretPrevious);
    }
    return this._write(QUERY_CLIENT_UPDATE, [
      // VALUES
      client.name,
      client.imageUri,
      secret,
      secretPrevious,
      client.redirectUri,
      client.trusted,
      client.allowedScopes,
      client.canGrant,

      // WHERE
      buf(client.id),
    ]);
  }

  getClient(id) {
    return this._readOne(QUERY_CLIENT_GET, [buf(id)]);
  }
  getAllClientIds() {
    return this._read(QUERY_CLIENT_IDS);
  }
  getClients(email) {
    return this._read(QUERY_CLIENT_LIST, [email]);
  }
  removeClient(id) {
    return this._write(QUERY_CLIENT_DELETE, [buf(id)]);
  }
  generateCode(codeObj) {
    var code = unique.code();
    var hash = encrypt.hash(code);
    return this._write(QUERY_CODE_INSERT, [
      codeObj.clientId,
      codeObj.userId,
      codeObj.scope.toString(),
      codeObj.authAt,
      codeObj.amr ? codeObj.amr.join(',') : null,
      codeObj.aal || null,
      !!codeObj.offline,
      hash,
      codeObj.codeChallengeMethod,
      codeObj.codeChallenge,
      codeObj.keysJwe,
      codeObj.profileChangedAt,
      codeObj.sessionTokenId,
    ]).then(function () {
      return code;
    });
  }
  getCode(code) {
    var hash = encrypt.hash(code);
    return this._readOne(QUERY_CODE_FIND, [hash]).then(function (code) {
      if (code) {
        code.scope = ScopeSet.fromString(code.scope);
        if (code.amr !== null) {
          code.amr = code.amr.split(',');
        }
      }
      return code;
    });
  }
  removeCode(code) {
    var hash = encrypt.hash(code);
    return this._write(QUERY_CODE_DELETE, [hash]);
  }

  /**
   * Get all refresh tokens for a given user.
   * @param {String} uid User ID as hex
   * @returns {Promise}
   */
  async _getRefreshTokensByUid(uid) {
    const refreshTokens = await this._read(QUERY_LIST_REFRESH_TOKENS_BY_UID, [
      buf(uid),
    ]);
    refreshTokens.forEach((t) => {
      t.scope = ScopeSet.fromString(t.scope);
    });
    return refreshTokens;
  }

  async _getRefreshTokenScopesByUid(uid) {
    const rows = await this._read(QUERY_LIST_REFRESH_TOKEN_SCOPES_BY_UID, [
      buf(uid),
    ]);
    return rows.map((r) => ({
      clientId: r.clientId,
      scope: ScopeSet.fromString(r.scope),
    }));
  }

  /**
   * Get a unique list of refresh tokens for a given user.
   * @param {String} uid
   * @returns {Promise}
   */
  async _getUniqueRefreshTokensByUid(uid) {
    const uidBuf = buf(uid);
    const refreshTokens = await this._read(
      QUERY_LIST_UNIQUE_REFRESH_TOKENS_BY_UID,
      // we need to pass uid twice because it's used two times in the query
      [uidBuf, uidBuf]
    );
    refreshTokens.forEach((t) => {
      t.scope = ScopeSet.fromString(t.scope);
    });
    return refreshTokens;
  }

  /**
   * Get all refresh tokens for all users for a given clientId.
   * @param {String} clientId
   * @param {String} uid
   * @returns {Promise}
   */
  async getRefreshTokensByClientId(clientId) {
    return this._read(QUERY_LIST_REFRESH_TOKENS_BY_CLIENT_ID, [buf(clientId)]);
  }

  /**
   * Delete the authorization codes and refresh tokens for some clientId and uid.
   *
   * The caller is responsible for also revoking this pair's access tokens,
   * which live only in redis — see `deleteClientAuthorization` in
   * lib/oauth/db/index.js.
   *
   * @param {String} clientId Client ID
   * @param {String} uid User Id as Hex
   * @returns {Promise}
   */
  _deleteClientAuthorization(clientId, uid) {
    const deleteCodes = this._write(DELETE_ACTIVE_CODES_BY_CLIENT_AND_UID, [
      buf(clientId),
      buf(uid),
    ]);

    const deleteRefreshTokens = this._write(
      DELETE_ACTIVE_REFRESH_TOKENS_BY_CLIENT_AND_UID,
      [buf(clientId), buf(uid)]
    );

    return Promise.all([deleteCodes, deleteRefreshTokens]);
  }

  async _pruneAuthorizationCodes(ttl) {
    const pruneAuthzCodes = async (conn) => {
      const ttlInSeconds = ttl / 1000;
      await this._queryWithConnection(conn, PRUNE_AUTHZ_CODES, [ttlInSeconds]);
      const prunedCount = await this._queryWithConnection(
        conn,
        'SELECT ROW_COUNT() AS pruned'
      );
      return firstRow(prunedCount);
    };

    return await this._withLock(
      pruneAuthzCodes,
      'fxa-oauth.auth-codes.prune-lock'
    );
  }

  /**
   * Delete a specific refresh token, for some clientId and uid.
   *
   * The caller is responsible for also revoking *all* access tokens for the
   * clientId and uid combination (they live in redis), otherwise the refresh
   * token is deleted but none of the access tokens created from that refresh
   * token are, leaving ghost access tokens to appear in the users devices &
   * apps list. See:
   *
   * https://github.com/mozilla/fxa/issues/1249
   * https://github.com/mozilla/fxa/issues/3017
   *
   * If a user has multiple refresh tokens for a given client_id, clients
   * will use their active refresh tokens to get new access tokens.
   *
   * @param {String} tokenId Refresh Token ID as Hex
   * @param {String} clientId Client ID as Hex
   * @param {String} uid User Id as Hex
   * @returns {Promise} `true` if the token was found and deleted, `false` otherwise
   */
  async _deleteClientRefreshToken(tokenId, clientId, uid) {
    const deleteRefreshTokenRes = await this._write(
      DELETE_REFRESH_TOKEN_WITH_CLIENT_AND_UID,
      [buf(tokenId), buf(clientId), buf(uid)]
    );

    return deleteRefreshTokenRes.affectedRows > 0;
  }

  generateRefreshToken(vals) {
    const t = {
      clientId: vals.clientId,
      userId: vals.userId,
      scope: vals.scope,
      profileChangedAt: vals.profileChangedAt,
    };
    const token = unique.token();
    const tokenId = encrypt.hash(token);
    return this._write(QUERY_REFRESH_TOKEN_INSERT, [
      t.clientId,
      t.userId,
      t.scope.toString(),
      tokenId,
      t.profileChangedAt,
    ]).then(function () {
      t.token = token;
      t.tokenId = tokenId;
      return t;
    });
  }

  _getRefreshToken(token) {
    return this._readOne(QUERY_REFRESH_TOKEN_FIND, [buf(token)]).then(
      function (t) {
        if (t) {
          t.scope = ScopeSet.fromString(t.scope);
        }
        return t;
      }
    );
  }

  _touchRefreshToken(token, now) {
    return this._write(QUERY_REFRESH_TOKEN_LAST_USED_UPDATE, [
      now,
      // WHERE
      buf(token),
    ]);
  }

  _removeRefreshToken(id) {
    return this._write(QUERY_REFRESH_TOKEN_DELETE, [buf(id)]);
  }

  // Upserts one consent row per scope in a single INSERT. `scopes` must be
  // non-empty; callers return early when there is nothing to record.
  //
  // When dualWriteV2 is set, also writes the row to accountAuthorizations_v2
  // keyed by scopeId. Resolve-only: scopes absent from the scopes table are
  // skipped (v1 stays authoritative, so nothing is dropped), and the v2 write
  // is isolated so a v2 failure never affects the v1 write.
  async _upsertAccountConsents(uid, scopes, service, clientId, now, dualWriteV2) {
    if (!Array.isArray(scopes) || scopes.length === 0) {
      return;
    }
    const uidBuf = buf(uid);
    const clientIdBuf = buf(clientId);
    const tuples = scopes.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const params = [];
    for (const scope of scopes) {
      params.push(uidBuf, scope, service, clientIdBuf, now, now);
    }
    // v1 write — authoritative. A failure bubbles to the caller as today.
    await this._write(
      QUERY_ACCOUNT_CONSENT_UPSERT_PREFIX +
        tuples +
        QUERY_ACCOUNT_CONSENT_UPSERT_SUFFIX,
      params
    );

    if (!dualWriteV2) {
      return;
    }

    // Best-effort v2 mirror. Unresolved scopes are skipped; a v2 failure is
    // swallowed so it can never affect the authoritative v1 write or the grant.
    // Both are logged so the dual-write is observable during the bake.
    try {
      const { resolved, missing } = await this._scopeIdCache.resolve(scopes);
      if (missing.length > 0) {
        // Seed list for the scopes table. Both the list length and each string
        // are capped — scopes are caller-supplied, so the log event has to stay
        // bounded regardless of what was passed in.
        this.log?.warn('accountAuthorizations.v2.missing_scope', {
          scopes: missing.slice(0, 10).map((s) => String(s).slice(0, 128)),
          count: missing.length,
        });
      }
      if (resolved.size > 0) {
        const v2Tuples = [];
        const v2Params = [];
        for (const scopeId of resolved.values()) {
          v2Tuples.push('(?, ?, ?, ?, ?, ?)');
          v2Params.push(uidBuf, service, scopeId, clientIdBuf, now, now);
        }
        await this._write(
          QUERY_ACCOUNT_CONSENT_V2_UPSERT_PREFIX +
            v2Tuples.join(', ') +
            QUERY_ACCOUNT_CONSENT_V2_UPSERT_SUFFIX,
          v2Params
        );
      }
    } catch (err) {
      // Still swallowed; v1 already landed. Log only code/errno — the driver
      // decorates errors with connection options that can include credentials.
      this.log?.error('accountAuthorizations.v2.write_failed', {
        code: err?.code,
        errno: err?.errno,
      });
    }
  }

  // Resolve a single scope string to its scopes.id via the cache, or undefined
  // if it isn't in the scopes table. Used by the v2 read paths.
  async _resolveScopeId(scope) {
    const { resolved } = await this._scopeIdCache.resolve([scope]);
    return resolved.get(scope);
  }

  // Existence check for the sign-in consent row. When readV2 is set, checks
  // accountAuthorizations_v2 first (v2-first / v1-fallback): a v2 hit returns
  // early; otherwise fall through to v1, which stays authoritative until the
  // backfill completes and cutover happens. An unresolvable scope can't be in
  // v2, so it also falls through to v1.
  async _findAccountConsentForSignIn(uid, scope, service, readV2 = false) {
    if (readV2) {
      const scopeId = await this._resolveScopeId(scope);
      if (scopeId !== undefined) {
        const v2 = await this._read(QUERY_ACCOUNT_CONSENT_V2_FIND_SIGNIN, [
          buf(uid),
          scopeId,
          service,
        ]);
        if (v2.length > 0) {
          return { found: true };
        }
      }
    }
    const rows = await this._read(QUERY_ACCOUNT_CONSENT_FIND_SIGNIN, [
      buf(uid),
      scope,
      service,
    ]);
    return firstRow(rows) || null;
  }

  // True iff a consent row exists for the exact (uid, scope, service).
  // Used by the exchange gate after the caller has resolved the
  // requested scope to a service via config. v2-first / v1-fallback when readV2.
  async _hasConsentForScope(uid, scope, service, readV2 = false) {
    if (readV2) {
      const scopeId = await this._resolveScopeId(scope);
      if (scopeId !== undefined) {
        const v2 = await this._read(QUERY_HAS_CONSENT_FOR_SCOPE_V2, [
          buf(uid),
          scopeId,
          service,
        ]);
        if (v2.length > 0) {
          return true;
        }
      }
    }
    const rows = await this._read(QUERY_HAS_CONSENT_FOR_SCOPE, [
      buf(uid),
      scope,
      service,
    ]);
    return rows.length > 0;
  }

  // True iff a consent row exists for the exact (uid, scope, service, clientId).
  // Used by the VPN-in-Desktop DAU bandaid (FXA-14159) to confirm the user
  // authorized VPN for this specific client before counting the token.
  async _hasConsentForScopeAndClient(uid, scope, service, clientId) {
    const rows = await this._read(QUERY_HAS_CONSENT_FOR_SCOPE_AND_CLIENT, [
      buf(uid),
      scope,
      service,
      buf(clientId),
    ]);
    return rows.length > 0;
  }

  // True iff the user has any consent row for this service (any scope/client).
  // Drives the browser-service grain of the first-authorization signal.
  // v2-first / v1-fallback when readV2.
  async _hasConsentForService(uid, service, readV2 = false) {
    if (readV2) {
      const v2 = await this._read(QUERY_HAS_CONSENT_FOR_SERVICE_V2, [
        buf(uid),
        service,
      ]);
      if (v2.length > 0) {
        return true;
      }
    }
    const rows = await this._read(QUERY_HAS_CONSENT_FOR_SERVICE, [
      buf(uid),
      service,
    ]);
    return rows.length > 0;
  }

  // True iff the user has any consent row for this client (any scope/service).
  // Drives the web-RP grain of the first-authorization signal.
  // v2-first / v1-fallback when readV2.
  async _hasConsentForClient(uid, clientId, readV2 = false) {
    if (readV2) {
      const v2 = await this._read(QUERY_HAS_CONSENT_FOR_CLIENT_V2, [
        buf(uid),
        buf(clientId),
      ]);
      if (v2.length > 0) {
        return true;
      }
    }
    const rows = await this._read(QUERY_HAS_CONSENT_FOR_CLIENT, [
      buf(uid),
      buf(clientId),
    ]);
    return rows.length > 0;
  }

  // Clears both tables. Not gated on dualWriteV2 — turning that off stops new
  // v2 writes but existing rows still need purging. v2 first: if the v1 delete
  // then fails, reads fall back to v1 rather than v2 answering "consent exists"
  // for an account whose v1 rows are already gone.
  async _deleteAllAccountConsentsForUser(uid) {
    const uidBuf = buf(uid);
    await this._write(QUERY_ACCOUNT_CONSENT_V2_DELETE_BY_UID, [uidBuf]);
    return this._write(QUERY_ACCOUNT_CONSENT_DELETE_BY_UID, [uidBuf]);
  }

  _listAccountConsentsByUid(uid) {
    return this._read(QUERY_ACCOUNT_CONSENT_LIST_BY_UID, [buf(uid)]);
  }

  // Marks the given rows revoked as of `revokedAt`, leaving the row and its ToS
  // timestamps in place. Each row needs scope, service, clientId and the
  // lastAuthorizedTosAt the caller read, which together form the optimistic
  // guard described on the query.
  //
  // Returns the number of rows actually revoked, which can be lower than
  // rows.length: rows re-authorized since the caller's read, or already
  // revoked, are skipped by design.
  async _revokeAccountAuthorizations(uid, rows, revokedAt) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return 0;
    }
    const uidBuf = buf(uid);
    let affectedRows = 0;
    for (const batch of chunk(rows, AUTHORIZATION_REVOKE_BATCH_SIZE)) {
      const params = [revokedAt, uidBuf];
      for (const r of batch) {
        params.push(r.scope, r.service, buf(r.clientId), r.lastAuthorizedTosAt);
      }
      const result = await this._write(
        QUERY_ACCOUNT_AUTHORIZATION_REVOKE_ROWS_PREFIX +
          batch.map(() => '(?, ?, ?, ?)').join(', ') +
          ')',
        params
      );
      affectedRows += result.affectedRows;
    }
    return affectedRows;
  }

  getEncodingInfo() {
    var info = {};

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var self = this;
    var qry = 'SHOW VARIABLES LIKE "%character\\_set\\_%"';
    return this._read(qry).then(function (rows) {
      rows.forEach(function (row) {
        info[row.Variable_name] = row.Value;
      });

      qry = 'SHOW VARIABLES LIKE "%collation\\_%"';
      return self._read(qry).then(function (rows) {
        rows.forEach(function (row) {
          info[row.Variable_name] = row.Value;
        });
        return info;
      });
    });
  }

  // Access tokens are not touched here; they live only in redis and are
  // revoked by the caller in lib/oauth/db/index.js.
  _removeTokensAndCodes(userId) {
    // TODO this should be a transaction or stored procedure
    var id = buf(userId);
    return this._write(QUERY_REFRESH_TOKEN_DELETE_USER, [id])
      .then(this._write.bind(this, QUERY_CODE_DELETE_USER, [id]))
      .then(this._write.bind(this, QUERY_ACCOUNT_ACTIVITY_DELETE_USER, [id]));
  }

  /**
   * Record per-(userId, clientId, scopeId) liveness for the OAuth grant path.
   *
   * scopeId is resolved from the scopes table by scope string. A
   * token-exchange grant can carry no scopes; since the empty-string scope is a
   * valid scopes row, an empty `scopes` is normalised to [''] so we still
   * record one row. Scopes absent from the scopes table cannot be written (the
   * scopeId FK) and are returned in `missingScopes` for the caller to report;
   * the scopes that do resolve are still written in a single bulk upsert.
   *
   * One read (resolve scope ids) plus one write (bulk upsert). The write uses
   * the SQL throttle in QUERY_ACCOUNT_ACTIVITY_UPSERT_SUFFIX so each scope's
   * `lastSeenAt` advances independently.
   *
   * Caller is responsible for fire-and-forget semantics.
   *
   * @param {Buffer | string} userId
   * @param {Buffer | string} clientId
   * @param {string[]}        scopes      raw scope strings requested/granted on this activity
   * @param {number}          now         current timestamp in ms; used for both firstSeenAt and lastSeenAt
   * @param {number}          throttleMs  skip the lastSeenAt update if the existing row was touched within this window
   * @returns {Promise<{ missingScopes: string[] }>} scopes not present in the scopes table (no row written for them)
   */
  async _recordAccountActivity(userId, clientId, scopes, now, throttleMs) {
    const userIdBuf = buf(userId);
    const clientIdBuf = buf(clientId);
    const requested = scopes && scopes.length > 0 ? scopes : [''];

    const inPlaceholders = requested.map(() => '?').join(', ');
    const scopeRows = await this._read(
      `SELECT id, scope FROM scopes WHERE scope IN (${inPlaceholders})`,
      requested
    );
    const scopeById = new Map(scopeRows.map((r) => [r.scope, r.id]));
    const missingScopes = requested.filter((scope) => !scopeById.has(scope));
    const resolvedScopes = requested.filter((scope) => scopeById.has(scope));

    if (resolvedScopes.length > 0) {
      const placeholders = resolvedScopes
        .map(() => '(?, ?, ?, ?, ?)')
        .join(', ');
      const params = [];
      for (const scope of resolvedScopes) {
        params.push(userIdBuf, clientIdBuf, scopeById.get(scope), now, now);
      }
      params.push(throttleMs);
      await this._write(
        QUERY_ACCOUNT_ACTIVITY_UPSERT_PREFIX +
          placeholders +
          QUERY_ACCOUNT_ACTIVITY_UPSERT_SUFFIX,
        params
      );
    }

    return { missingScopes };
  }

  /**
   * List the accountActivity rows for a (userId, clientId), with the scope
   * string resolved from the scopes table, ordered by scope. Used by support
   * tooling and tests.
   *
   * @param {Buffer | string} userId
   * @param {Buffer | string} clientId
   * @returns {Promise<object[]>}
   */
  _listAccountActivity(userId, clientId) {
    return this._read(QUERY_ACCOUNT_ACTIVITY_LIST, [
      buf(userId),
      buf(clientId),
    ]);
  }

  /**
   * Removes user's refreshTokens for canGrant and publicClient clients.
   * Their access tokens live only in redis and are revoked by the caller in
   * lib/oauth/db/index.js.
   *
   * @param {Buffer | string} userId
   * @returns {Promise}
   */
  _removePublicAndCanGrantTokens(userId) {
    return this._write(QUERY_DELETE_REFRESH_TOKEN_FOR_PUBLIC_CLIENTS, [
      buf(userId),
    ]);
  }

  async getScope(scope) {
    // We currently only have database entries for URL-format scopes,
    // so don't bother hitting the db for common scopes like 'profile'.
    if (!scope.startsWith('https://')) {
      return null;
    }
    return (await this._readOne(QUERY_SCOPE_FIND, [scope])) || null;
  }

  registerScope(scope) {
    return this._write(QUERY_SCOPES_INSERT, [scope.scope, scope.hasScopedKeys]);
  }

  _write(sql, params) {
    return this._query(sql, params);
  }

  _read(sql, params) {
    return this._query(sql, params);
  }

  _readOne(sql, params) {
    return this._read(sql, params).then(firstRow);
  }

  async _getConnection() {
    var pool = this._pool;
    return new Promise(function (resolve, reject) {
      pool.getConnection(function (err, conn) {
        if (err) {
          return reject(err);
        }

        if (conn._fxa_initialized) {
          return resolve(conn);
        }

        // Enforce sane defaults on every new connection.
        // These *should* be set by the database by default, but it's nice
        // to have an additional layer of protection here.
        const query = (sql) =>
          new Promise((resolve, reject) => {
            conn.query(sql, (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            });
          });
        return resolve(
          (async () => {
            // Always communicate timestamps in UTC.
            await query("SET time_zone = '+00:00'");
            // Always use full 4-byte UTF-8 for communicating unicode.
            await query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;');
            // Always have certain modes active. The complexity here is to
            // preserve any extra modes active by default on the server.
            // We also try to preserve the order of the existing mode flags,
            // just in case the order has some obscure effect we don't know about.
            const rows = await query('SELECT @@sql_mode AS mode');
            const modes = rows[0]['mode'].split(',');
            let needToSetMode = false;
            for (const requiredMode of REQUIRED_SQL_MODES) {
              if (modes.indexOf(requiredMode) === -1) {
                modes.push(requiredMode);
                needToSetMode = true;
              }
            }
            if (needToSetMode) {
              const mode = modes.join(',');
              await query("SET SESSION sql_mode = '" + mode + "'");
            }
            // Avoid repeating all that work for existing connections.
            conn._fxa_initialized = true;
            return conn;
          })()
        );
      });
    });
  }

  async _query(sql, params) {
    const conn = await this._getConnection();
    try {
      return await this._queryWithConnection(conn, sql, params);
    } finally {
      conn.release();
    }
  }

  async _queryWithConnection(conn, sql, params) {
    return await new Promise(function (resolve, reject) {
      conn.query(sql, params || [], function (err, results) {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  getProxyableFunctions() {
    return Reflect.ownKeys(MysqlStore.prototype).filter(
      (x) => x !== 'constructor' && /^[a-zA-Z]/.test(x)
    );
  }
}

function connect(config) {
  return new MysqlStore(config);
}

module.exports = connect;
module.exports.connect = connect;
