/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const OauthError = require('./error');
const oauthDB = require('./db');
const hex = require('buf').to.hex;
const ScopeSet = require('fxa-shared').oauth.scopes;

// Helper function to render each returned record in the expected form.
function serialize(clientIdHex, token) {
  const createdTime = token.createdAt.getTime();
  const lastAccessTime = token.lastUsedAt.getTime();
  return {
    client_id: clientIdHex,
    refresh_token_id: token.tokenId ? hex(token.tokenId) : undefined,
    client_name: token.clientName,
    created_time: createdTime,
    last_access_time: lastAccessTime,
    // Sort the scopes alphabetically, for consistent output.
    scope: token.scope.getScopeValues().sort(),
  };
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
  async list(uid) {
    await oauthDB.ready();
    const authorizedClients = [];

    // First, enumerate all the refresh tokens.
    // Each of these is a separate instance of an authorized client
    // and should be displayed to the user as such. Nice and simple!
    const seenClientIds = new Set();
    for (const token of await oauthDB.getRefreshTokensByUid(uid)) {
      const clientId = hex(token.clientId);
      authorizedClients.push(serialize(clientId, token));
      seenClientIds.add(clientId);
    }

    // Next, enumerate all the access tokens. In the interests of giving the user a
    // complete-yet-comprehensible list of all the things attached to their account,
    // we want to:
    //
    //  1. Show a single unified record for any client that is not using refresh tokens.
    //  2. Avoid showing access tokens for `canGrant` clients; such clients will always
    //     hold some other sort of token, and we don't want them to appear in the list twice.
    const accessTokenRecordsByClientId = new Map();
    for (const token of await oauthDB.getAccessTokensByUid(uid)) {
      const clientId = hex(token.clientId);
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
    for (const [clientId, record] of accessTokenRecordsByClientId.entries()) {
      authorizedClients.push(serialize(clientId, record));
    }

    // Sort the final list first by last_access_time, then by client_name, then by created_time.
    authorizedClients.sort(function (a, b) {
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
    return authorizedClients;
  },

  /**
   * Gets a list of all the OAuth clients connected to the authenticated user's account.
   * Only one record per clientId is returned, prioritized by most recent last_access_time.
   * @param {*} uid
   * @returns
   */
  async listUnique(uid) {
    await oauthDB.ready();
    const clientsByClientId = new Map();

    const [accessTokens, refreshTokens] = await Promise.all([
      oauthDB.getAccessTokensByUid(uid),
      oauthDB.getRefreshTokensByUid(uid),
    ]);

    // Since we only want one record per clientId, we want to deduplicate.
    // Also, since accessTokens don't have a `lastUsedAt` field, we effectively
    // use the `createdAt` field to achieve the same effect.
    const addOrUpdateClient = (token, effectiveLastUsedAt) => {
      const clientId = hex(token.clientId);
      const existing = clientsByClientId.get(clientId);

      if (!existing || existing.last_access_time < effectiveLastUsedAt) {
        clientsByClientId.set(
          clientId,
          serialize(clientId, {
            ...token,
            lastUsedAt: effectiveLastUsedAt,
          })
        );
      }
    };

    for (const token of refreshTokens) {
      addOrUpdateClient(token, token.lastUsedAt);
    }

    for (const token of accessTokens) {
      addOrUpdateClient(token, token.createdAt);
    }

    return Array.from(clientsByClientId.values());
  },
};
