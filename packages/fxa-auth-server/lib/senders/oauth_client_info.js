/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Keyv = require('keyv');
const client = require('../oauth/client');

module.exports = (log, config) => {
  const OAUTH_CLIENT_INFO_CACHE_TTL = config.oauth.clientInfoCacheTTL;
  const OAUTH_CLIENT_INFO_CACHE_NAMESPACE = 'oauthClientInfo';
  const FIREFOX_CLIENT = {
    name: 'Firefox',
  };
  const MOZILLA_CLIENT = {
    name: 'Mozilla',
  };
  // TODO: prob don't need this cache anymore now that it's just a db call
  const clientCache = new Keyv({
    ttl: OAUTH_CLIENT_INFO_CACHE_TTL,
    namespace: OAUTH_CLIENT_INFO_CACHE_NAMESPACE,
  });

  /**
   * Fetches OAuth client info from the OAuth server.
   * Stores the data into server memory.
   * @param clientId
   * @returns {Promise<any>}
   */
  async function fetch(clientId) {
    log.trace('fetch.start');

    // if there is no clientId, default to the more general 'Mozilla'
    if (!clientId) {
      log.trace('fetch.noClientId');
      return MOZILLA_CLIENT;
    }

    // if the client is 'sync' or (desktop) relay, client is Firefox
    if (clientId === 'sync' || clientId === 'relay') {
      log.trace('fetch.firefoxClient');
      return FIREFOX_CLIENT;
    }

    const cachedRecord = await clientCache.get(clientId);
    if (cachedRecord) {
      // used the cachedRecord if it exists
      log.trace('fetch.usedCache');
      return cachedRecord;
    }

    let clientInfo;
    try {
      clientInfo = await client.getClientById(clientId);
    } catch (err) {
      // fallback to the Firefox client if request fails
      if (!err.statusCode) {
        log.fatal('fetch.failed', { err });
      } else {
        log.warn('fetch.failedForClient', { clientId });
      }
      // default to the more generic 'Mozilla' if there is an error fetching client info
      // (and client Id is neither 'sync' nor 'relay')
      return MOZILLA_CLIENT;
    }

    log.trace('fetch.usedServer', { body: clientInfo });
    // We deliberately don't wait for this to resolve, since the
    // client doesn't need to wait for us to write to the cache.
    clientCache.set(clientId, clientInfo);
    return clientInfo;
  }

  return {
    fetch: fetch,
    __clientCache: clientCache,
  };
};
