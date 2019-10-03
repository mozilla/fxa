/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const isA = require('joi');
const createBackendServiceAPI = require('../backendService');

const PATH_PREFIX = '/v1';

// Very generic validator, because there's not really a useful response
// here other than that it didn't fail in error
const DeleteCacheResponse = isA.any();

module.exports = function(log, config, statsd) {
  const ProfileAPI = createBackendServiceAPI(
    log,
    config,
    'subhub',
    {
      deleteCache: {
        path: `${PATH_PREFIX}/cache/:uid`,
        method: 'DELETE',
        validate: {
          params: {
            uid: isA.string().required(),
          },
          response: DeleteCacheResponse,
        },
      },
    },
    statsd
  );

  const api = new ProfileAPI(config.profileServer.url, {
    headers: {
      Authorization: `Bearer ${config.profileServer.secretBearerToken}`,
    },
    timeout: 15000,
  });

  return {
    async deleteCache(uid) {
      try {
        return await api.deleteCache(uid);
      } catch (err) {
        log.error('profile.deleteCache.failed', { uid, err });
        throw err;
      }
    },
  };
};
