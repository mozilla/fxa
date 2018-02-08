/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const request = require('request')
const Keyv = require('keyv')
const Joi = require('joi')

const P = require('../promise')
const config = require('../../config').getProperties()
const log = require('./log')('oauth_client_info')
const { DISPLAY_SAFE_UNICODE } = require('../routes/validators')

const OAUTH_SERVER = config.oauth.url
const OAUTH_CLIENT_INFO_CACHE_TTL = config.oauth.clientInfoCacheTTL
const OAUTH_CLIENT_INFO_CACHE_NAMESPACE = 'oauthClientInfo'
const FIREFOX_CLIENT = {
  name: 'Firefox'
}

const clientCache = new Keyv({
  ttl: OAUTH_CLIENT_INFO_CACHE_TTL,
  namespace: OAUTH_CLIENT_INFO_CACHE_NAMESPACE
})

/**
 * Fetches OAuth client info from the OAuth server.
 * Stores the data into server memory.
 * @param clientId
 * @returns {Promise<any>}
 */
function fetch(clientId) {
  log.trace({ op: 'fetch.start' })

  const options = {
    url: `${OAUTH_SERVER}/v1/client/${clientId}`,
    method: 'GET',
    json: true
  }

  return new P((resolve) => {
    if (! clientId || clientId === 'sync') {
      log.trace({ op: 'fetch.sync' })
      return resolve(FIREFOX_CLIENT)
    }

    clientCache.get(clientId)
      .then((cachedRecord) => {
        if (cachedRecord) {
          // used the cachedRecord
          log.trace({ op: 'fetch.usedCache' })
          return resolve(cachedRecord)
        }

        // request info from the OAuth server
        request(options, function (err, res, body) {
          if (err || res.statusCode !== 200 || ! body.name) {
            if (err) {
              log.critical({ op: 'fetch.failed', err: err })
            } else {
              log.warn({ op: 'fetch.failedForClient', clientId: clientId, name: !! body.name })
            }
            // fallback to the Firefox client if request fails
            return resolve(FIREFOX_CLIENT)
          }

          const validation = Joi.validate(body.name, Joi.string().max(256).regex(DISPLAY_SAFE_UNICODE).required())
          if (validation.error) {
            // fallback to the Firefox client if invalid name
            return resolve(FIREFOX_CLIENT)
          }

          log.trace({ op: 'fetch.usedServer', body: body })
          const clientInfo = {
            // only providing `name` for now
            name: body.name
          }
          resolve(clientInfo)
          clientCache.set(clientId, clientInfo)
        })

      })
  })


}
module.exports = {
  fetch: fetch,
  __clientCache: clientCache
}
