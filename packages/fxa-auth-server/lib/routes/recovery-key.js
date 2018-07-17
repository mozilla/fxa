/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const errors = require('../error')
const validators = require('./validators')
const isA = require('joi')
const butil = require('../crypto/butil')

module.exports = (log, db, Password, verifierVersion, customs) => {
  return [
    {
      method: 'POST',
      path: '/recoveryKey',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            recoveryKeyId: validators.recoveryKeyId,
            recoveryData: validators.recoveryData
          }
        }
      },
      handler: async function (request) {
        log.begin('createRecoveryKey', request)

        const uid = request.auth.credentials.uid
        const sessionToken = request.auth.credentials
        const {recoveryKeyId, recoveryData} = request.payload

        return createRecoveryKey()
          .then(emitMetrics)
          .then(() => { return {} })

        function createRecoveryKey() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession()
          }

          return db.createRecoveryKey(uid, recoveryKeyId, recoveryData)
        }

        function emitMetrics() {
          log.info({
            op: 'account.recoveryKey.created',
            uid
          })

          return request.emitMetricsEvent('recoveryKey.created', {uid})
        }
      }
    },
    {
      method: 'GET',
      path: '/recoveryKey/{recoveryKeyId}',
      options: {
        auth: {
          strategy: 'accountResetToken'
        },
        validate: {
          params: {
            recoveryKeyId: validators.recoveryKeyId
          }
        }
      },
      handler: async function (request) {
        log.begin('getRecoveryKey', request)

        const uid = request.auth.credentials.uid
        const ip = request.app.clientAddress
        const recoveryKeyId = request.params.recoveryKeyId
        let recoveryData

        return customs.checkAuthenticated('getRecoveryKey', ip, uid)
          .then(getRecoveryKey)
          .then(() => { return {recoveryData} })

        function getRecoveryKey() {
          return db.getRecoveryKey(uid)
            .then((res) => {
              // `db.getRecoveryKey` doesn't require recoveryKeyId to retrieve
              // the recovery bundle, however, we should perform a security
              // check to ensure that the returned bundle contains the recoveryKeyId.
              if (! butil.buffersAreEqual(res.recoveryKeyId, recoveryKeyId)) {
                throw errors.recoveryKeyInvalid()
              }
              recoveryData = res.recoveryData
            })
        }
      }
    },
    {
      method: 'POST',
      path: '/recoveryKey/exists',
      options: {
        auth: {
          mode: 'optional',
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            email: validators.email().optional()
          }
        },
        response: {
          schema: {
            exists: isA.boolean().required()
          }
        }
      },
      handler(request) {
        log.begin('recoveryKeyExists', request)

        const email = request.payload.email
        let exists = false, uid

        if (request.auth.credentials) {
          uid = request.auth.credentials.uid
        }

        return Promise.resolve()
          .then(() => {
            if (! uid) {
              // If not using a sessionToken, an email is required to check
              // for a recovery key. This occurs when checking from the
              // password reset page and allows us to redirect the user to either
              // the regular password reset or account recovery password reset.
              if (! email) {
                throw errors.missingRequestParameter('email')
              }

              return customs.check(request, email, 'recoveryKeyExists')
                .then(() => db.accountRecord(email))
                .then((result) => uid = result.uid)
            }

            // When checking from `/settings` a sessionToken is required and the
            // request is not rate limited.
          })
          .then(() => {
            return db.getRecoveryKey(uid)
              .then((recoveryKey) => {
                if (recoveryKey) {
                  exists = true
                }
              }, (err) => {
                if (err.errno === errors.ERRNO.RECOVERY_KEY_NOT_FOUND) {
                  exists = false
                  return
                }
                throw err
              })
          })
          .then(() => {
            return {exists}
          })
      }
    },
    {
      method: 'DELETE',
      path: '/recoveryKey',
      options: {
        auth: {
          strategy: 'sessionToken'
        }
      },
      handler(request) {
        log.begin('recoveryKeyDelete', request)

        return Promise.resolve()
          .then(() => {
            const sessionToken = request.auth.credentials

            if (sessionToken.tokenVerificationId) {
              throw errors.unverifiedSession()
            }

            return db.deleteRecoveryKey(sessionToken.uid)
              .then(() => {
                return {}
              })
          })
      }
    }
  ]
}
