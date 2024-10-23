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
   * @param service
   * @returns {Promise<any>}
   */
  async function fetch(service) {
    log.trace('fetch.start');

    // Default to 'Mozilla' if the service is undefined
    // If the service is undefined for a sync sign-in (where scope is provided but not service),
    // this may result in some edge cases where the client name is 'Mozilla' instead of 'Firefox' in emails
    // however, defaulting to Mozilla works best for web sign-ins with other browsers (e.g. Chrome)
    // We might want to consider passing in scopes as well to more accurately determine the client name
    if (!service) {
      log.trace('fetch.noService');
      return MOZILLA_CLIENT;
    }

    // Set the client name to 'Firefox' if the service is browser-based
    if (service === 'sync' || service === 'relay') {
      log.trace('fetch.firefoxClient');
      return FIREFOX_CLIENT;
    }

    const cachedRecord = await clientCache.get(service);
    if (cachedRecord) {
      // used the cachedRecord if it exists
      log.trace('fetch.usedCache');
      return cachedRecord;
    }

    let clientInfo;
    try {
      clientInfo = await client.getClientById(service);
    } catch (err) {
      // fallback to the Firefox client if request fails
      if (!err.statusCode) {
        log.fatal('fetch.failed', { err });
      } else {
        log.warn('fetch.failedForClient', { service });
      }
      // default to 'Mozilla' if there is an error fetching client info
      return MOZILLA_CLIENT;
    }

    log.trace('fetch.usedServer', { body: clientInfo });
    // We deliberately don't wait for this to resolve, since the
    // client doesn't need to wait for us to write to the cache.
    clientCache.set(service, clientInfo);
    return clientInfo;
  }

  return {
    fetch: fetch,
    __clientCache: clientCache,
  };
};
