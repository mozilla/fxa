/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const errors = require('../error')
const isA = require('joi')
const validators = require('./validators')
const HEX_STRING = validators.HEX_STRING

module.exports = (log, db, config, customs, mailer) => {
  const codeConfig = config.recoveryCodes
  const RECOVERY_CODE_LENGTH = codeConfig && codeConfig.length || 8
  const RECOVERY_CODE_COUNT = codeConfig && codeConfig.count || 8

  return [
    {
      method: 'GET',
      path: '/recoveryCodes',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: {
            recoveryCodes: isA.array().items(isA.string().regex(HEX_STRING))
          }
        }
      },
      handler(request, reply) {
        log.begin('replaceRecoveryCodes', request)

        const uid = request.auth.credentials.uid
        const sessionToken = request.auth.credentials
        const geoData = request.app.geo
        const ip = request.app.clientAddress
        let codes

        customs.check(request, 'replaceRecoveryCodes')
          .then(replaceRecoveryCodes)
          .then(sendEmailNotification)
          .then(emitMetrics)
          .then(() => reply({recoveryCodes: codes}), reply)

        function replaceRecoveryCodes() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession()
          }

          return db.replaceRecoveryCodes(uid, RECOVERY_CODE_COUNT)
            .then((result) => {
              codes = result
            })
        }

        function sendEmailNotification() {
          return db.account(sessionToken.uid)
            .then((account) => {
              mailer.sendPostNewRecoveryCodesNotification(account.emails, account, {
                acceptLanguage: request.app.acceptLanguage,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: request.app.ua.browser,
                uaBrowserVersion: request.app.ua.browserVersion,
                uaOS: request.app.ua.os,
                uaOSVersion: request.app.ua.osVersion,
                uaDeviceType: request.app.ua.deviceType,
                uid: sessionToken.uid
              })
            })
        }

        function emitMetrics() {
          log.info({
            op: 'account.recoveryCode.replaced',
            uid: uid
          })

          return request.emitMetricsEvent('recoveryCode.replaced', {uid: uid})
            .then(() => ({}))
        }
      }
    },
    {
      method: 'POST',
      path: '/session/verify/recoveryCode',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            code: isA.string().length(RECOVERY_CODE_LENGTH).regex(HEX_STRING).required()
          }
        },
        response: {
          schema: {
            remaining: isA.number()
          }
        }
      },
      handler(request, reply) {
        log.begin('session.verify.recoveryCode', request)

        const code = request.payload.code
        const uid = request.auth.credentials.uid
        const sessionToken = request.auth.credentials
        const geoData = request.app.geo
        const ip = request.app.clientAddress
        let remaining

        customs.check(request, 'verifyRecoveryCode')
          .then(consumeRecoveryCode)
          .then(verifySession)
          .then(sendEmailNotification)
          .then(emitMetrics)
          .then(() => {
            return reply({remaining: remaining})
          }, reply)

        function consumeRecoveryCode() {
          return db.consumeRecoveryCode(uid, code)
            .then((result) => {
              remaining = result.remaining
              if (remaining === 0) {
                log.info({
                  op: 'account.recoveryCode.consumedAllCodes',
                  uid: uid
                })
              }
            })
        }

        function verifySession() {
          if (sessionToken.tokenVerificationId) {
            return db.verifyTokensWithMethod(sessionToken.id, 'recovery-code')
          }
        }

        function sendEmailNotification() {
          return db.account(sessionToken.uid)
            .then((account) => {
              return mailer.sendPostConsumeRecoveryCodeNotification(account.emails, account, {
                acceptLanguage: request.app.acceptLanguage,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: request.app.ua.browser,
                uaBrowserVersion: request.app.ua.browserVersion,
                uaOS: request.app.ua.os,
                uaOSVersion: request.app.ua.osVersion,
                uaDeviceType: request.app.ua.deviceType,
                uid: sessionToken.uid
              })
            })
        }

        function emitMetrics() {
          log.info({
            op: 'account.recoveryCode.verified',
            uid: uid
          })

          return request.emitMetricsEvent('recoveryCode.verified', {uid: uid})
            .then(() => ({}))
        }
      }
    }
  ]
}
