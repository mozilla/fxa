/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const validators = require('./validators')
const HEX_STRING = validators.HEX_STRING

const butil = require('../crypto/butil')
const P = require('../promise')
const userAgent = require('../userAgent')
const random = require('../crypto/random')
const requestHelper = require('../routes/utils/request_helper')

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema

module.exports = function (
  log,
  isA,
  error,
  db,
  Password,
  redirectDomain,
  mailer,
  verifierVersion,
  customs,
  checkPassword,
  push
  ) {

  const getGeoData = require('../geodb')(log)

  function failVerifyAttempt(passwordForgotToken) {
    return (passwordForgotToken.failAttempt()) ?
      db.deletePasswordForgotToken(passwordForgotToken) :
      db.updatePasswordForgotToken(passwordForgotToken)
  }

  var routes = [
    {
      method: 'POST',
      path: '/password/change/start',
      config: {
        validate: {
          payload: {
            email: validators.email().required(),
            oldAuthPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.changeStart', request)
        var form = request.payload
        var oldAuthPW = Buffer(form.oldAuthPW, 'hex')

        customs.check(
          request,
          form.email,
          'passwordChange')
          .then(db.emailRecord.bind(db, form.email))
          .then(
            function (emailRecord) {
              return checkPassword(emailRecord, oldAuthPW, request.app.clientAddress)
              .then(
                function (match) {
                  if (! match) {
                    throw error.incorrectPassword(emailRecord.email, form.email)
                  }
                  var password = new Password(
                    oldAuthPW,
                    emailRecord.authSalt,
                    emailRecord.verifierVersion
                  )
                  return password.unwrap(emailRecord.wrapWrapKb)
                }
              )
              .then(
                function (wrapKb) {
                  return db.createKeyFetchToken(
                    {
                      uid: emailRecord.uid,
                      kA: emailRecord.kA,
                      wrapKb: wrapKb,
                      emailVerified: emailRecord.emailVerified
                    }
                  )
                  .then(
                    function (keyFetchToken) {
                      return db.createPasswordChangeToken({
                        uid: emailRecord.uid
                      })
                      .then(
                        function (passwordChangeToken) {
                          return {
                            keyFetchToken: keyFetchToken,
                            passwordChangeToken: passwordChangeToken
                          }
                        }
                      )
                    }
                  )
                }
              )
            },
            function (err) {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                customs.flag(request.app.clientAddress, {
                  email: form.email,
                  errno: err.errno
                })
              }
              throw err
            }
          )
          .then(
            function (tokens) {
              reply(
                {
                  keyFetchToken: tokens.keyFetchToken.data.toString('hex'),
                  passwordChangeToken: tokens.passwordChangeToken.data.toString('hex'),
                  verified: tokens.keyFetchToken.emailVerified
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      config: {
        auth: {
          strategy: 'passwordChangeToken'
        },
        validate: {
          query: {
            keys: isA.boolean().optional()
          },
          payload: {
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            wrapKb: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            sessionToken: isA.string().min(64).max(64).regex(HEX_STRING).optional()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.changeFinish', request)
        var passwordChangeToken = request.auth.credentials
        var authPW = Buffer(request.payload.authPW, 'hex')
        var wrapKb = Buffer(request.payload.wrapKb, 'hex')
        var sessionTokenId = request.payload.sessionToken
        var wantsKeys = requestHelper.wantsKeys(request)
        const ip = request.app.clientAddress
        var account, verifyHash, sessionToken, keyFetchToken, verifiedStatus,
          devicesToNotify

        getSessionVerificationStatus()
          .then(fetchDevicesToNotify)
          .then(changePassword)
          .then(notifyAccount)
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(createResponse)
          .then(reply, reply)

        function getSessionVerificationStatus() {
          if (sessionTokenId) {
            var tokenId = Buffer(sessionTokenId, 'hex')
            return db.sessionTokenWithVerificationStatus(tokenId)
              .then(
                function (tokenData) {
                  verifiedStatus = tokenData.tokenVerified
                }
              )
          } else {
            // Don't create a verified session unless they already had one.
            verifiedStatus = false
            return P.resolve()
          }
        }

        function fetchDevicesToNotify() {
          // We fetch the devices to notify before changePassword() because
          // db.resetAccount() deletes all the devices saved in the account.
          return db.devices(passwordChangeToken.uid)
            .then(
              function(devices) {
                devicesToNotify = devices
              }
            )
        }

        function changePassword() {
          let authSalt, password
          return random(32)
            .then(bytes => {
              authSalt = bytes
              password = new Password(authPW, authSalt, verifierVersion)
              return db.deletePasswordChangeToken(passwordChangeToken)
            })
            .then(
              function () {
                return password.verifyHash()
              }
            )
            .then(
              function (hash) {
                verifyHash = hash
                return password.wrap(wrapKb)
              }
            )
            .then(
              function (wrapWrapKb) {
                // Reset account, delete all sessions and tokens
                return db.resetAccount(
                  passwordChangeToken,
                  {
                    verifyHash: verifyHash,
                    authSalt: authSalt,
                    wrapWrapKb: wrapWrapKb,
                    verifierVersion: password.version
                  }
                )
              }
            )
            .then(
              function (result) {
                return request.emitMetricsEvent('account.changedPassword', {
                  uid: passwordChangeToken.uid.toString('hex')
                })
                .then(
                  function () {
                    return result
                  }
                )
              }
            )
        }

        function notifyAccount() {
          if (devicesToNotify) {
            // Notify the devices that the account has changed.
            push.notifyPasswordChanged(passwordChangeToken.uid, devicesToNotify)
          }

          return db.account(passwordChangeToken.uid)
            .then(
              function (accountData) {
                account = accountData
              }
            )
            .then(
              function () {
                return getGeoData(ip)
                  .then(
                    function (geoData) {
                      return mailer.sendPasswordChangedNotification(
                        account.email,
                        userAgent.call({
                          acceptLanguage: request.app.acceptLanguage,
                          ip: ip,
                          location: geoData.location,
                          timeZone: geoData.timeZone
                        }, request.headers['user-agent'], log)
                      )
                    }
                  )
              }
            )
        }

        function createSessionToken() {
          return P.resolve()
            .then(() => {
              if (! verifiedStatus) {
                return random(16)
              }
            })
            .then(maybeToken => {
              // Create a sessionToken with the verification status of the current session
              const sessionTokenOptions = {
                uid: account.uid,
                email: account.email,
                emailCode: account.emailCode,
                emailVerified: account.emailVerified,
                verifierSetAt: account.verifierSetAt,
                mustVerify: wantsKeys,
                tokenVerificationId: maybeToken
              }

              return db.createSessionToken(sessionTokenOptions, request.headers['user-agent'])
            })
            .then(
              function (result) {
                sessionToken = result
              }
            )
        }

        function createKeyFetchToken() {
          if (wantsKeys) {
            // Create a verified keyFetchToken. This is deliberately verified because we don't
            // want to perform an email confirmation loop.
            return db.createKeyFetchToken({
              uid: account.uid,
              kA: account.kA,
              wrapKb: wrapKb,
              emailVerified: account.emailVerified
            })
            .then(
              function (result) {
                keyFetchToken = result
              }
            )
          }
        }

        function createResponse () {
          // If no sessionToken, this could be a legacy client
          // attempting to change password, return legacy response.
          if (! sessionTokenId) {
            return {}
          }

          var response = {
            uid: sessionToken.uid.toString('hex'),
            sessionToken: sessionToken.data.toString('hex'),
            verified: sessionToken.emailVerified && sessionToken.tokenVerified,
            authAt: sessionToken.lastAuthAt()
          }

          if (wantsKeys) {
            response.keyFetchToken = keyFetchToken.data.toString('hex')
          }

          return response
        }
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      config: {
        validate: {
          query: {
            service: validators.service,
            keys: isA.boolean().optional()
          },
          payload: {
            email: validators.email().required(),
            service: validators.service,
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotSend', request)
        var email = request.payload.email
        var service = request.payload.service || request.query.service
        const ip = request.app.clientAddress

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        request.emitMetricsEvent('password.forgot.send_code.start')
          .then(
            customs.check.bind(
              customs,
              request,
              email,
              'passwordForgotSendCode')
          )
          .then(db.emailRecord.bind(db, email))
          .then(
            function (emailRecord) {
              // The token constructor sets createdAt from its argument.
              // Clobber the timestamp to prevent prematurely expired tokens.
              emailRecord.createdAt = undefined
              return db.createPasswordForgotToken(emailRecord)
            }
          )
          .then(
            function (passwordForgotToken) {
              return getGeoData(ip)
                .then(
                  function (geoData) {
                    return mailer.sendRecoveryCode(
                      passwordForgotToken,
                      passwordForgotToken.passCode,
                      userAgent.call({
                        service: service,
                        redirectTo: request.payload.redirectTo,
                        resume: request.payload.resume,
                        acceptLanguage: request.app.acceptLanguage,
                        flowId: flowId,
                        flowBeginTime: flowBeginTime,
                        ip: ip,
                        location: geoData.location,
                        timeZone: geoData.timeZone
                      }, request.headers['user-agent'], log)
                    )
                  }
                )
                .then(
                  function () {
                    return request.emitMetricsEvent('password.forgot.send_code.completed')
                  }
                )
                .then(
                  function () {
                    return passwordForgotToken
                  }
                )
            }
          )
          .then(
            function (passwordForgotToken) {
              reply(
                {
                  passwordForgotToken: passwordForgotToken.data.toString('hex'),
                  ttl: passwordForgotToken.ttl(),
                  codeLength: passwordForgotToken.passCode.length,
                  tries: passwordForgotToken.tries
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        validate: {
          query: {
            service: validators.service
          },
          payload: {
            email: validators.email().required(),
            service: validators.service,
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotResend', request)
        var passwordForgotToken = request.auth.credentials
        var service = request.payload.service || request.query.service
        const ip = request.app.clientAddress

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        request.emitMetricsEvent('password.forgot.resend_code.start')
          .then(
            customs.check.bind(
              customs,
              request,
              passwordForgotToken.email,
              'passwordForgotResendCode')
          )
          .then(
            function () {
              return getGeoData(ip)
                .then(
                  function (geoData) {
                    return mailer.sendRecoveryCode(
                      passwordForgotToken,
                      passwordForgotToken.passCode,
                      userAgent.call({
                        service: service,
                        redirectTo: request.payload.redirectTo,
                        resume: request.payload.resume,
                        acceptLanguage: request.app.acceptLanguage,
                        flowId: flowId,
                        flowBeginTime: flowBeginTime,
                        ip: ip,
                        location: geoData.location,
                        timeZone: geoData.timeZone
                      }, request.headers['user-agent'], log)
                    )
                  }
                )
            }
          )
          .then(
            function(){
              return request.emitMetricsEvent('password.forgot.resend_code.completed')
            }
          )
          .then(
            function () {
              reply(
                {
                  passwordForgotToken: passwordForgotToken.data.toString('hex'),
                  ttl: passwordForgotToken.ttl(),
                  codeLength: passwordForgotToken.passCode.length,
                  tries: passwordForgotToken.tries
                }
              )
            },
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        validate: {
          payload: {
            code: isA.string().min(32).max(32).regex(HEX_STRING).required(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        },
        response: {
          schema: {
            accountResetToken: isA.string()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotVerify', request)
        var passwordForgotToken = request.auth.credentials
        var code = Buffer(request.payload.code, 'hex')

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        request.emitMetricsEvent('password.forgot.verify_code.start')
          .then(
            customs.check.bind(
              customs,
              request,
              passwordForgotToken.email,
              'passwordForgotVerifyCode')
          )
          .then(
            function () {
              if (butil.buffersAreEqual(passwordForgotToken.passCode, code) &&
                  passwordForgotToken.ttl() > 0) {
                db.forgotPasswordVerified(passwordForgotToken)
                  .then(
                    function (accountResetToken) {
                      return mailer.sendPasswordResetNotification(
                        passwordForgotToken.email,
                        {
                          acceptLanguage: request.app.acceptLanguage,
                          flowId: flowId,
                          flowBeginTime: flowBeginTime
                        }
                      )
                      .then(
                        function () {
                          return request.emitMetricsEvent('password.forgot.verify_code.completed')
                        }
                      )
                      .then(
                        function () {
                          return accountResetToken
                        }
                      )
                    }
                  )
                  .then(
                    function (accountResetToken) {

                      reply(
                        {
                          accountResetToken: accountResetToken.data.toString('hex')
                        }
                      )
                    },
                    reply
                  )
              }
              else {
                failVerifyAttempt(passwordForgotToken)
                  .then(
                    function () {
                      reply(
                        error.invalidVerificationCode({
                          tries: passwordForgotToken.tries,
                          ttl: passwordForgotToken.ttl()
                        })
                      )
                    },
                    reply
                  )
              }
            }
          )
      }
    },
    {
      method: 'GET',
      path: '/password/forgot/status',
      config: {
        auth: {
          strategy: 'passwordForgotToken'
        },
        response: {
          schema: {
            tries: isA.number(),
            ttl: isA.number()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Password.forgotStatus', request)
        var passwordForgotToken = request.auth.credentials
        reply(
          {
            tries: passwordForgotToken.tries,
            ttl: passwordForgotToken.ttl()
          }
        )
      }
    }
  ]

  return routes
}
