/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { OauthError } = require('@fxa/accounts/errors');
const oauthDB = require('./db');
const ScopeSet = require('fxa-shared/oauth/scopes');

// Helper function to render each returned record in the expected form.
function serialize(clientIdHex, token) {
  const createdTime = token.createdAt.getTime();
  const lastAccessTime = token.lastUsedAt.getTime();
  return {
    client_id: clientIdHex,
    refresh_token_id: token.tokenId ? token.tokenId.toString('hex') : undefined,
    client_name: token.clientName,
    created_time: createdTime,
    last_access_time: lastAccessTime,
    // Sort the scopes alphabetically, for consistent output.
    scope: token.scope.getScopeValues().sort(),
  };
}

/**
 * Sorts authorized clients by last_access_time, client_name, created_time, and scope.
 */
function sortAuthorizedClients(clients) {
  return clients.sort(function (a, b) {
    if (b.last_access_time > a.last_access_time) {
      return 1;
    }
    if (b.last_access_time < a.last_access_time) {
      return -1;
    }
    if (a.client_name > b.client_name) {
      return 1;
    }
    if (a.client_name < b.client_name) {
      return -1;
    }
    if (a.created_time > b.created_time) {
      return 1;
    }
    if (a.created_time < b.created_time) {
      return -1;
    }
    // To help provide a deterministic result order to simplify testing, also sort of scope values.
    if (a.scope > b.scope) {
      return 1;
    }
    if (a.scope < b.scope) {
      return -1;
    }
    return 0;
  });
}

/**
 * Processes access tokens into unified records by clientId.
 * Merges multiple access tokens for the same client.
 * Filters out clients already seen in refresh tokens and canGrant clients.
 * @param {Array} accessTokens
 * @param {Set} seenClientIds - ClientIds to exclude
 * @returns {Array} Array of serialized records
 */
function processAccessTokens(accessTokens, seenClientIds) {
  const accessTokenRecordsByClientId = new Map();

  for (const token of accessTokens) {
    const clientId = token.clientId.toString('hex');
    if (!seenClientIds.has(clientId) && !token.clientCanGrant) {
      let record = accessTokenRecordsByClientId.get(clientId);
      if (typeof record === 'undefined') {
        record = {
          clientId,
          clientName: token.clientName,
          createdAt: token.createdAt,
          lastUsedAt: token.createdAt,
          scope: ScopeSet.fromArray([]),
        };
        accessTokenRecordsByClientId.set(clientId, record);
      }
      // Merge details of all access tokens into a single record.
      record.scope.add(token.scope);
      if (token.createdAt < record.createdAt) {
        record.createdAt = token.createdAt;
      }
      if (record.lastUsedAt < token.createdAt) {
        record.lastUsedAt = token.createdAt;
      }
    }
  }

  return Array.from(accessTokenRecordsByClientId.values()).map((record) =>
    serialize(record.clientId, record)
  );
}

/**
 * Processes refresh tokens into serialized records.
 * @param {Array} refreshTokens
 * @returns {Object} { records: Array, seenClientIds: Set }
 */
function processRefreshTokens(refreshTokens) {
  const records = [];
  const seenClientIds = new Set();

  for (const token of refreshTokens) {
    const clientId = token.clientId.toString('hex');
    records.push(serialize(clientId, token));
    seenClientIds.add(clientId);
  }

  return { records, seenClientIds };
}

module.exports = {
  async destroy(clientId, uid, refreshTokenId) {
    await oauthDB.ready();
    if (refreshTokenId) {
      if (
        !(await oauthDB.deleteClientRefreshToken(refreshTokenId, clientId, uid))
      ) {
        throw OauthError.unknownToken();
      }
    } else {
      await oauthDB.deleteClientAuthorization(clientId, uid);
    }
  },
  /**
   * Fetches all authorized clients for a given user ID,
   * @param {*} uid
   * @returns
   */
  async list(uid) {
    await oauthDB.ready();
    // get both refresh and access tokens in parallel
    const [refreshTokens, accessTokens] = await Promise.all([
      oauthDB.getRefreshTokensByUid(uid),
      oauthDB.getAccessTokensByUid(uid),
    ]);

    const { records: refreshRecords, seenClientIds } =
      processRefreshTokens(refreshTokens);

    const accessRecords = processAccessTokens(accessTokens, seenClientIds);

    const authorizedClients = [...refreshRecords, ...accessRecords];
    return sortAuthorizedClients(authorizedClients);
  },

  /**
   * Fetches a list of unique OAuth clients authorized by a user.
   * Each clientId appears only once. The DB layer handles uniqueness
   * and selects the token with the most recent lastAccessTime.
   */
  async listUnique(uid) {
    await oauthDB.ready();

    const [refreshTokens, accessTokens] = await Promise.all([
      oauthDB.getUniqueRefreshTokensByUid(uid),
      oauthDB.getAccessTokensByUid(uid),
    ]);

    const { records: refreshRecords, seenClientIds } =
      processRefreshTokens(refreshTokens);

    const accessRecords = processAccessTokens(accessTokens, seenClientIds);

    const authorizedClients = [...refreshRecords, ...accessRecords];
    return sortAuthorizedClients(authorizedClients);
  },
};
