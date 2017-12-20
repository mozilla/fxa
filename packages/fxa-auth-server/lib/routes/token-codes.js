/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const errors = require('../error')
const isA = require('joi')
const validators = require('./validators')
const HEX_STRING = validators.HEX_STRING
const P = require('../promise')

module.exports = (log, db, customs) => {
  return [
    {
      method: 'POST',
      path: '/session/verify/token',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            code: isA.string().min(0).max(1024).required() // code length is configurable but lets add some sane min/max values
          }
        }
      },
      handler (request, reply) {
        log.begin('session.verify.token', request)

        const uid = request.payload.uid
        const code = request.payload.code.toUpperCase()
        const email = request.auth.credentials.email

        customs.check(request, email, 'verifyTokenCode')
          .then(verifyCode)
          .then(emitMetrics)
          .then(reply, reply)

        function verifyCode() {
          return db.verifyTokenCode(code, {uid: uid})
            .then(() => {}, (err) => {
              if (err.errno === errors.ERRNO.EXPIRED_TOKEN_VERIFICATION_CODE) {
                log.error({
                  op: 'account.token.code.expired',
                  uid: uid,
                  err: err
                })
              }
              throw err
            })
        }

        function emitMetrics() {
          log.info({
            op: 'account.token.code.verified',
            uid: uid
          })

          return P.all([request.emitMetricsEvent('tokenCodes.verified', {uid: uid}), request.emitMetricsEvent('account.confirmed', {uid: uid})])
            .then(() => ({}))
        }
      }
    }
  ]
}

