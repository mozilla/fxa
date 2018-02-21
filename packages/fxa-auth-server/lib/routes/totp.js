/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const errors = require('../error')
const isA = require('joi')
const P = require('../promise')
const otplib = require('otplib')
const qrcode = require('qrcode')
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema

module.exports = (log, db, customs, config) => {

  // Default options for TOTP
  otplib.authenticator.options = {
    encoding: 'hex',
    step: config.step
  }

  // Currently, QR codes are rendered with the highest possible
  // error correction, which should in theory allow clients to
  // scan the image better.
  // Ref: https://github.com/soldair/node-qrcode#error-correction-level
  const qrCodeOptions = {errorCorrectionLevel: 'H'}

  P.promisify(qrcode.toDataURL)

  return [
    {
      method: 'POST',
      path: '/totp/create',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {
          schema: isA.object({
            qrCodeUrl: isA.string().required(),
            secret: isA.string().required()
          })
        }
      },
      handler(request, reply) {
        log.begin('totp.create', request)

        let response
        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        customs.check(request, 'totpCreate')
          .then(createTotpToken)
          .then(emitMetrics)
          .then(createResponse)
          .then(() => reply(response), reply)

        const secret = otplib.authenticator.generateSecret()

        function createTotpToken() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession()
          }

          return db.createTotpToken(uid, secret, 0)
        }

        function createResponse() {
          const otpauth = otplib.authenticator.keyuri(sessionToken.email, config.serviceName, secret)

          return qrcode.toDataURL(otpauth, qrCodeOptions)
            .then((qrCodeUrl) => {
              response = {
                qrCodeUrl,
                secret
              }
            })
        }

        function emitMetrics() {
          log.info({
            op: 'totpToken.created',
            uid: uid
          })
          return request.emitMetricsEvent('totpToken.created', {uid: uid})
        }
      }
    },
    {
      method: 'POST',
      path: '/totp/destroy',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {}
      },
      handler(request, reply) {
        log.begin('totp.destroy', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        customs.check(request, 'totpDestroy')
          .then(deleteTotpToken)
          .then(() => reply({}), reply)


        function deleteTotpToken() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession()
          }

          return db.deleteTotpToken(uid)
        }
      }
    },
    {
      method: 'GET',
      path: '/totp/exists',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.object({
            exists: isA.boolean()
          })
        }
      },
      handler(request, reply) {
        log.begin('totp.exists', request)

        const sessionToken = request.auth.credentials
        let exists = false

        return getTotpToken()
          .then(() => reply({exists}), reply)

        function getTotpToken() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession()
          }

          return db.totpToken(sessionToken.uid)
            .then((token) => {
              if (token) {
                exists = true
              }
            }, (err) => {
              if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
                exists = false
                return
              }
              throw err
            })
        }
      }
    },
    {
      method: 'POST',
      path: '/session/verify/totp',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            code: isA.string().max(32).required(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {}
      },
      handler(request, reply) {
        log.begin('session.verify.totp', request)

        const code = request.payload.code
        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        let sharedSecret, isVerified

        customs.check(request, 'sessionVerifyTotp')
          .then(getTotpToken)
          .then(verifyTotpCode)
          .then(verifySession)
          .then(emitMetrics)
          .then(() => reply({success: isVerified}), reply)

        function getTotpToken() {
          return db.totpToken(sessionToken.uid)
            .then((token) => sharedSecret = token.sharedSecret)
        }

        function verifyTotpCode() {
          isVerified = otplib.authenticator.check(code, sharedSecret)
        }

        // If a valid code was sent, this verifies the session using the same method
        // as sign-in confirmation. Once the updated db verification methods land in
        // https://github.com/mozilla/fxa-auth-db-mysql/issues/301, we should update
        // this.
        function verifySession() {
          if (isVerified && sessionToken.tokenVerificationId) {
            return db.verifyTokens(sessionToken.tokenVerificationId, {uid: sessionToken.uid})
          }
        }

        function emitMetrics() {
          if (isVerified) {
            log.info({
              op: 'totp.verified',
              uid: uid
            })
            request.emitMetricsEvent('totpToken.verified', {uid: uid})
          } else {
            log.info({
              op: 'totp.unverified',
              uid: uid
            })
            request.emitMetricsEvent('totpToken.unverified', {uid: uid})
          }
        }
      }
    }
  ]
}

