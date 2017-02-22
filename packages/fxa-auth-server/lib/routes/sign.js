/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const validators = require('./validators')

module.exports = function (log, P, isA, error, signer, db, domain, devices) {

  const HOUR = 1000 * 60 * 60

  var routes = [
    {
      method: 'POST',
      path: '/certificate/sign',
      config: {
        auth: {
          strategy: 'sessionTokenWithDevice',
          payload: 'required'
        },
        validate: {
          query: {
            service: validators.service
          },
          payload: {
            publicKey: isA.object({
              algorithm: isA.string().valid('RS', 'DS').required(),
              n: isA.string(),
              e: isA.string(),
              y: isA.string(),
              p: isA.string(),
              q: isA.string(),
              g: isA.string(),
              version: isA.string()
            }).required(),
            duration: isA.number().integer().min(0).max(24 * HOUR).required()
          }
        }
      },
      handler: function certificateSign(request, reply) {
        log.begin('Sign.cert', request)
        var sessionToken = request.auth.credentials
        var publicKey = request.payload.publicKey
        var duration = request.payload.duration
        var service = request.query.service
        var deviceId, uid, certResult

        // No need to wait for a response, update in the background.
        db.updateSessionToken(sessionToken, request.headers['user-agent'])

        if (! sessionToken.emailVerified) {
          return reply(error.unverifiedAccount())
        }

        return P.resolve()
          .then(
            function () {
              if (sessionToken.deviceId) {
                deviceId = sessionToken.deviceId.toString('hex')
              } else if (! service || service === 'sync') {
                // Synthesize a device record for Sync sessions that don't already have one.
                // Include the UA info so that we can synthesize a device name
                // for any push notifications.
                var deviceInfo = {
                  uaBrowser: sessionToken.uaBrowser,
                  uaBrowserVersion: sessionToken.uaBrowserVersion,
                  uaOS: sessionToken.uaOS,
                  uaOSVersion: sessionToken.uaOSVersion
                }
                return devices.upsert(request, sessionToken, deviceInfo)
                  .then(
                    function (result) {
                      deviceId = result.id.toString('hex')
                    }
                  )
              }
            }
          )
          .then(
            function () {
              if (publicKey.algorithm === 'RS') {
                if (! publicKey.n) {
                  return reply(error.missingRequestParameter('n'))
                }
                if (! publicKey.e) {
                  return reply(error.missingRequestParameter('e'))
                }
              }
              else { // DS
                if (! publicKey.y) {
                  return reply(error.missingRequestParameter('y'))
                }
                if (! publicKey.p) {
                  return reply(error.missingRequestParameter('p'))
                }
                if (! publicKey.q) {
                  return reply(error.missingRequestParameter('q'))
                }
                if (! publicKey.g) {
                  return reply(error.missingRequestParameter('g'))
                }
              }

              if (! sessionToken.locale) {
                if (request.app.acceptLanguage) {
                  // Log details to sanity-check locale backfilling.
                  log.info({
                    op: 'signer.updateLocale',
                    locale: request.app.acceptLanguage
                  })
                  db.updateLocale(sessionToken.uid, request.app.acceptLanguage)
                  // meh on the result
                } else {
                  // We're seeing a surprising number of accounts that don't get
                  // a proper locale.  Log details to help debug this.
                  log.info({
                    op: 'signer.emptyLocale',
                    email: sessionToken.email,
                    locale: request.app.acceptLanguage,
                    agent: request.headers['user-agent']
                  })
                }
              }
              uid = sessionToken.uid.toString('hex')

              return signer.sign(
                {
                  email: uid + '@' + domain,
                  publicKey: publicKey,
                  domain: domain,
                  duration: duration,
                  generation: sessionToken.verifierSetAt,
                  lastAuthAt: sessionToken.lastAuthAt(),
                  verifiedEmail: sessionToken.email,
                  deviceId: deviceId,
                  tokenVerified: sessionToken.tokenVerified
                }
              )
            }
          )
          .then(
            function(result) {
              certResult = result
              return request.emitMetricsEvent('account.signed', {
                uid: uid,
                account_created_at: sessionToken.accountCreatedAt,
                device_id: deviceId
              })
            }
          )
          .then(
            function () {
              reply(certResult)
            },
            reply
          )
      }
    }
  ]

  return routes
}
