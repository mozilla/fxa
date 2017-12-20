/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('../error')
const isA = require('joi')
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema
const P = require('../promise')
const random = require('../crypto/random')
const requestHelper = require('../routes/utils/request_helper')
const uuid = require('uuid')
const validators = require('./validators')

const HEX_STRING = validators.HEX_STRING
const BASE_36 = validators.BASE_36

// An arbitrary, but very generous, limit on the number of active sessions.
// Currently only for metrics purposes, not enforced.
const MAX_ACTIVE_SESSIONS = 200

const MS_ONE_HOUR = 1000 * 60 * 60
const MS_ONE_DAY = MS_ONE_HOUR * 24
const MS_ONE_WEEK = MS_ONE_DAY * 7
const MS_ONE_MONTH = MS_ONE_DAY * 30

module.exports = (log, db, mailer, Password, config, customs, checkPassword, push) => {
  const verificationReminder = require('../verification-reminders')(log, db)

  const unblockCodeLifetime = config.signinUnblock && config.signinUnblock.codeLifetime || 0
  const unblockCodeLen = config.signinUnblock && config.signinUnblock.codeLength || 8

  const tokenCodeConfig = config.signinConfirmation.tokenVerificationCode
  const tokenCodeLifetime = tokenCodeConfig && tokenCodeConfig.codeLifetime || MS_ONE_HOUR
  const tokenCodeLength = tokenCodeConfig && tokenCodeConfig.codeLength || 8
  const TokenCode = require('../../lib/crypto/base32')(tokenCodeLength)

  const routes = [
    {
      method: 'POST',
      path: '/account/create',
      config: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service
          },
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            preVerified: isA.boolean(),
            service: validators.service,
            redirectTo: validators.redirectTo(config.smtp.redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }
        },
        response: {
          schema: {
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            authAt: isA.number().integer()
          }
        }
      },
      handler: function accountCreate(request, reply) {
        log.begin('Account.create', request)

        const form = request.payload
        const query = request.query
        const email = form.email
        const authPW = form.authPW
        const locale = request.app.acceptLanguage
        const userAgentString = request.headers['user-agent']
        const service = form.service || query.service
        const preVerified = !! form.preVerified
        const ip = request.app.clientAddress
        let password, verifyHash, account, sessionToken, keyFetchToken, emailCode, tokenVerificationId, tokenVerificationCode,
          authSalt

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        customs.check(request, email, 'accountCreate')
          .then(deleteAccountIfUnverified)
          .then(setMetricsFlowCompleteSignal)
          .then(generateRandomValues)
          .then(createPassword)
          .then(createAccount)
          .then(createSessionToken)
          .then(sendVerifyCode)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse)
          .then(reply, reply)


        function deleteAccountIfUnverified() {
          return db.getSecondaryEmail(email)
            .then((secondaryEmailRecord) => {
              // Currently, users can not create an account from a verified
              // secondary email address
              if (secondaryEmailRecord.isPrimary) {
                if (secondaryEmailRecord.isVerified) {
                  throw error.accountExists(secondaryEmailRecord.email)
                }
                request.app.accountRecreated = true
                return db.deleteAccount(secondaryEmailRecord)
              } else {
                if (secondaryEmailRecord.isVerified) {
                  throw error.verifiedSecondaryEmailAlreadyExists()
                }

                return db.deleteEmail(secondaryEmailRecord.uid, secondaryEmailRecord.email)
              }
            })
            .catch((err) => {
              if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
                throw err
              }
            })
        }

        function setMetricsFlowCompleteSignal () {
          let flowCompleteSignal
          if (service === 'sync') {
            flowCompleteSignal = 'account.signed'
          } else {
            flowCompleteSignal = 'account.verified'
          }
          request.setMetricsFlowCompleteSignal(flowCompleteSignal, 'registration')

          return P.resolve()
        }

        function generateRandomValues() {
          return P.all([random.hex(16), random.hex(32), TokenCode()])
            .spread((hex16, hex32, tokenCode) => {
              emailCode = hex16
              tokenVerificationId = emailCode
              tokenVerificationCode = tokenCode
              authSalt = hex32
            })
        }

        function createPassword () {
          password = new Password(authPW, authSalt, config.verifierVersion)
          return password.verifyHash()
            .then(
              function (result) {
                verifyHash = result
              }
            )
        }

        function createAccount () {
          if (! locale) {
            // We're seeing a surprising number of accounts created
            // without a proper locale. Log details to help debug this.
            log.info({
              op: 'account.create.emptyLocale',
              email: email,
              locale: locale,
              agent: userAgentString
            })
          }

          return random.hex(32, 32)
          .then(hexes => db.createAccount({
            uid: uuid.v4('binary').toString('hex'),
            createdAt: Date.now(),
            email: email,
            emailCode: emailCode,
            emailVerified: preVerified,
            kA: hexes[0],
            wrapWrapKb: hexes[1],
            accountResetToken: null,
            passwordForgotToken: null,
            authSalt: authSalt,
            verifierVersion: password.version,
            verifyHash: verifyHash,
            verifierSetAt: Date.now(),
            locale: locale
          }))
          .then(
            function (result) {
              account = result

              return request.emitMetricsEvent('account.created', {
                uid: account.uid
              })
            }
          )
          .then(
            function () {
              if (account.emailVerified) {
                return log.notifyAttachedServices('verified', request, {
                  email: account.email,
                  uid: account.uid,
                  locale: account.locale
                })
              }
            }
          )
          .then(
            function () {
              if (service === 'sync') {
                return log.notifyAttachedServices('login', request, {
                  service: 'sync',
                  uid: account.uid,
                  email: account.email,
                  deviceCount: 1,
                  userAgent: userAgentString
                })
              }
            }
          )
        }

        function createSessionToken () {
          // Verified sessions should only be created for preverified accounts.
          if (preVerified) {
            tokenVerificationId = undefined
          }

          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
            formFactor: uaFormFactor
          } = request.app.ua

          return db.createSessionToken({
            uid: account.uid,
            email: account.email,
            emailCode: account.emailCode,
            emailVerified: account.emailVerified,
            verifierSetAt: account.verifierSetAt,
            mustVerify: requestHelper.wantsKeys(request),
            tokenVerificationCode: tokenVerificationCode,
            tokenVerificationCodeExpiresAt: Date.now() + tokenCodeLifetime,
            tokenVerificationId: tokenVerificationId,
            uaBrowser,
            uaBrowserVersion,
            uaOS,
            uaOSVersion,
            uaDeviceType,
            uaFormFactor
          })
            .then(
              function (result) {
                sessionToken = result
                return request.stashMetricsContext(sessionToken)
              }
            )
            .then(
              function () {
                // There is no session token when we emit account.verified
                // so stash the data against a synthesized "token" instead.
                return request.stashMetricsContext({
                  uid: account.uid,
                  id: account.emailCode
                })
              }
            )
        }

        function sendVerifyCode () {
          if (! account.emailVerified) {
            return request.app.geo
              .then(function (geoData) {
                mailer.sendVerifyCode([], account, {
                  code: account.emailCode,
                  service: form.service || query.service,
                  redirectTo: form.redirectTo,
                  resume: form.resume,
                  acceptLanguage: request.app.acceptLanguage,
                  flowId: flowId,
                  flowBeginTime: flowBeginTime,
                  ip: ip,
                  location: geoData.location,
                  uaBrowser: sessionToken.uaBrowser,
                  uaBrowserVersion: sessionToken.uaBrowserVersion,
                  uaOS: sessionToken.uaOS,
                  uaOSVersion: sessionToken.uaOSVersion,
                  uaDeviceType: sessionToken.uaDeviceType,
                  uid: sessionToken.uid
                })
                  .then(function () {
                    // only create reminder if sendVerifyCode succeeds
                    verificationReminder.create({
                      uid: account.uid
                    }).catch(function (err) {
                      log.error({op: 'Account.verificationReminder.create', err: err})
                    })

                    if (tokenVerificationId) {
                      // Log server-side metrics for confirming verification rates
                      log.info({
                        op: 'account.create.confirm.start',
                        uid: account.uid,
                        tokenVerificationId: tokenVerificationId
                      })
                    }
                  })
                  .catch(function (err) {
                    log.error({op: 'mailer.sendVerifyCode.1', err: err})

                    if (tokenVerificationId) {
                      // Log possible email bounce, used for confirming verification rates
                      log.error({
                        op: 'account.create.confirm.error',
                        uid: account.uid,
                        err: err,
                        tokenVerificationId: tokenVerificationId
                      })
                    }
                  })
              })
          }
        }

        function createKeyFetchToken () {
          if (requestHelper.wantsKeys(request)) {
            return password.unwrap(account.wrapWrapKb)
              .then(
                function (wrapKb) {
                  return db.createKeyFetchToken({
                    uid: account.uid,
                    kA: account.kA,
                    wrapKb: wrapKb,
                    emailVerified: account.emailVerified,
                    tokenVerificationId: tokenVerificationId
                  })
                }
              )
              .then(
                function (result) {
                  keyFetchToken = result
                  return request.stashMetricsContext(keyFetchToken)
                }
              )
          }
        }

        function recordSecurityEvent() {
          db.securityEvent({
            name: 'account.create',
            uid: account.uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken.id
          })
        }

        function createResponse () {
          const response = {
            uid: account.uid,
            sessionToken: sessionToken.data,
            authAt: sessionToken.lastAuthAt()
          }

          if (keyFetchToken) {
            response.keyFetchToken = keyFetchToken.data
          }

          return P.resolve(response)
        }
      }
    },
    {
      method: 'POST',
      path: '/account/login',
      config: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
            verificationMethod: isA.string().valid(['email', 'email-2fa', 'email-captcha']).optional()
          },
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            service: validators.service,
            redirectTo: isA.string().uri().optional(),
            resume: isA.string().optional(),
            reason: isA.string().max(16).optional(),
            unblockCode: isA.string().regex(BASE_36).length(unblockCodeLen).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: isA.string().valid(['email', 'email-2fa', 'email-captcha']).optional()
          }
        },
        response: {
          schema: {
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            verificationMethod: isA.string().optional(),
            verificationReason: isA.string().optional(),
            verified: isA.boolean().required(),
            authAt: isA.number().integer()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.login', request)

        const form = request.payload
        const email = form.email
        const authPW = form.authPW
        const service = request.payload.service || request.query.service
        const redirectTo = request.payload.redirectTo
        const resume = request.payload.resume
        const ip = request.app.clientAddress
        const requestNow = Date.now()
        const originalLoginEmail = request.payload.originalLoginEmail
        const verificationMethod = request.payload.verificationMethod || request.query.verificationMethod

        let needsVerificationId = true
        let accountRecord, sessions, sessionToken, keyFetchToken, mustVerifySession, doSigninConfirmation,
          unblockCode, customsErr, didSigninUnblock, tokenVerificationId, tokenVerificationCode

        let securityEventRecency = Infinity, securityEventVerified = false

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        checkIsBlockForced()
          .then(() => customs.check(request, email, 'accountLogin'))
          .catch(extractUnblockCode)
          .then(readEmailRecord)
          .then(checkUnblockCode)
          .then(checkSecurityHistory)
          .then(checkEmailAndPassword)
          .then(checkNumberOfActiveSessions)
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(emitSyncLoginEvent)
          .then(sendVerifyAccountEmail)
          .then(sendNewDeviceLoginNotification)
          .then(sendVerificationIfNeeded)
          .then(recordSecurityEvent)
          .then(createResponse)
          .then(reply, reply)

        function checkIsBlockForced () {
          // For testing purposes, some email addresses are forced
          // to go through signin unblock on every login attempt.
          const forced = config.signinUnblock && config.signinUnblock.forcedEmailAddresses

          if (forced && forced.test(email)) {
            return P.reject(error.requestBlocked(true))
          }

          return P.resolve()
        }

        function extractUnblockCode (e) {
          // If it's a customs-related error...
          if (e.errno === error.ERRNO.REQUEST_BLOCKED || e.errno === error.ERRNO.THROTTLED) {
            return request.emitMetricsEvent('account.login.blocked')
              .then(() => {
                var verificationMethod = e.output.payload.verificationMethod
                // ...and if they can verify their way around it,
                // then extract any unblockCode from the request.
                // We'll re-throw the error later if the code is invalid.
                if (verificationMethod === 'email-captcha') {
                  unblockCode = request.payload.unblockCode
                  if (unblockCode) {
                    unblockCode = unblockCode.toUpperCase()
                  }
                  customsErr = e
                  return
                }
                throw e
              })
          }
          // Any other errors are propagated back to the user.
          throw e
        }

        function readEmailRecord () {
          return db.accountRecord(email)
            .then(
              function (result) {

                // The `originalLoginEmail` param is specified in the login request if the user has
                // changed their primary email address. This param must match the current primary
                // email address of the user before the login can succeed.
                if (originalLoginEmail) {
                  if (originalLoginEmail.toLowerCase() !== result.primaryEmail.normalizedEmail) {
                    throw error.cannotLoginWithSecondaryEmail()
                  }

                  // Emails are considered valid if that email exists in the `account.emails` property.
                  // This block covers an edge case where the user deletes the original email they
                  // created the account with and then attempts to login with that email.
                  let usingValidEmail = false
                  result.emails.some((emailData) => {
                    if (emailData.normalizedEmail === originalLoginEmail.toLowerCase()) {
                      usingValidEmail = true
                      return true
                    }
                  })

                  // This error will not give the user an option to create an account from
                  // this email.
                  if (! usingValidEmail) {
                    throw error.cannotLoginWithEmail()
                  }
                } else if (email.toLowerCase() !== result.primaryEmail.normalizedEmail) {
                  throw error.cannotLoginWithSecondaryEmail()
                }

                accountRecord = result
              },
              function (err) {
                if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                  customs.flag(request.app.clientAddress, {
                    email: email,
                    errno: err.errno
                  })

                  // We rate-limit attempts to check whether an account exists, so
                  // we have to be careful to re-throw any customs-server errors here.
                  // We also have to be careful not to leak info about whether the account
                  // existed, for example by saying sign-in unblock is unavailable on
                  // accounts that don't exist. We pass a fake uid into the feature-flag
                  // test to mask whether the account existed.
                  if (customsErr) {
                    throw customsErr
                  }

                  throw err
                }
                throw err
              }
            )
        }

        function checkUnblockCode() {
          if (unblockCode) {
            return db.consumeUnblockCode(accountRecord.uid, unblockCode)
              .then(
                (code) => {
                  if (requestNow - code.createdAt > unblockCodeLifetime) {
                    log.info({
                      op: 'Account.login.unblockCode.expired',
                      uid: accountRecord.uid
                    })
                    throw error.invalidUnblockCode()
                  }
                  didSigninUnblock = true
                  return request.emitMetricsEvent('account.login.confirmedUnblockCode')
                }
              )
              .catch(
                (err) => {
                  if (err.errno === error.ERRNO.INVALID_UNBLOCK_CODE) {
                    return request.emitMetricsEvent('account.login.invalidUnblockCode')
                      .then(() => {
                        customs.flag(request.app.clientAddress, {
                          email: email,
                          errno: err.errno
                        })
                        throw err
                      })
                  }
                  throw err
                }
              )
          }
          if (! didSigninUnblock && customsErr) {
            throw customsErr
          }
        }

        function checkSecurityHistory () {
          return db.securityEvents({
            uid: accountRecord.uid,
            ipAddr: request.app.clientAddress
          })
            .then(
              (events) => {
                if (events.length > 0) {
                  let latest = 0
                  events.forEach(function(ev) {
                    if (ev.verified) {
                      securityEventVerified = true
                      if (ev.createdAt > latest) {
                        latest = ev.createdAt
                      }
                    }
                  })
                  if (securityEventVerified) {
                    securityEventRecency = requestNow - latest
                    let coarseRecency
                    if (securityEventRecency < MS_ONE_DAY) {
                      coarseRecency = 'day'
                    } else if (securityEventRecency < MS_ONE_WEEK) {
                      coarseRecency = 'week'
                    } else if (securityEventRecency < MS_ONE_MONTH) {
                      coarseRecency = 'month'
                    } else {
                      coarseRecency = 'old'
                    }

                    log.info({
                      op: 'Account.history.verified',
                      uid: accountRecord.uid,
                      events: events.length,
                      recency: coarseRecency
                    })
                  } else {
                    log.info({
                      op: 'Account.history.unverified',
                      uid: accountRecord.uid,
                      events: events.length
                    })
                  }
                }
              },
              function (err) {
                // for now, security events are purely for metrics
                // so errors shouldn't stop the login attempt
                log.error({
                  op: 'Account.history.error',
                  err: err,
                  uid: accountRecord.uid
                })
              }
            )
        }

        function checkEmailAndPassword () {
          // All sessions are considered unverified by default.
          needsVerificationId = true

          // However! To help simplify the login flow, we can use some heuristics to
          // decide whether to consider the session pre-verified.  Some accounts
          // get excluded from this process, e.g. testing accounts where we want
          // to know for sure what flow they're going to see.
          if (! forceTokenVerification(request, accountRecord)) {
            if (skipTokenVerification(request, accountRecord)) {
              needsVerificationId = false
            }
          }

          // If they just went through the sigin-unblock flow, they have already verified their email.
          // We don't need to force them to do that again, just make a verified session.
          if (didSigninUnblock) {
            needsVerificationId = false
          }

          // If the request wants keys or specifies a verificationMethod, user *must* confirm their
          // login session before they can actually use it. Otherwise, they don't *have* to verify
          // their session. All sessions are created unverified because it prevents them from being
          // used for sync.
          mustVerifySession = needsVerificationId && (requestHelper.wantsKeys(request) || verificationMethod)

          // If the email itself is unverified, we'll re-send the "verify your account email" and
          // that will suffice to confirm the sign-in.  No need for a separate confirmation email.
          doSigninConfirmation = mustVerifySession && accountRecord.primaryEmail.isVerified

          let flowCompleteSignal
          if (service === 'sync') {
            flowCompleteSignal = 'account.signed'
          } else if (doSigninConfirmation) {
            flowCompleteSignal = 'account.confirmed'
          } else {
            flowCompleteSignal = 'account.login'
          }
          request.setMetricsFlowCompleteSignal(flowCompleteSignal, 'login')

          return checkPassword(accountRecord, authPW, request.app.clientAddress)
            .then(
              function (match) {
                if (! match) {
                  throw error.incorrectPassword(accountRecord.email, email)
                }

                return request.emitMetricsEvent('account.login', {
                  uid: accountRecord.uid
                })
              }
            )
        }

        function forceTokenVerification (request, account) {
          // If there was anything suspicious about the request,
          // we should force token verification.
          if (request.app.isSuspiciousRequest) {
            return true
          }
          // If it's an email address used for testing etc,
          // we should force token verification.
          if (config.signinConfirmation) {
            if (config.signinConfirmation.forcedEmailAddresses) {
              if (config.signinConfirmation.forcedEmailAddresses.test(account.primaryEmail.email)) {
                return true
              }
            }
          }

          // If relier has specified a verification method we should use it
          if (verificationMethod) {
            return true
          }

          return false
        }

        function skipTokenVerification (request, account) {
          // If they're logging in from an IP address on which they recently did
          // another, successfully-verified login, then we can consider this one
          // verified as well without going through the loop again.
          const allowedRecency = config.securityHistory.ipProfiling.allowedRecency || 0
          if (securityEventVerified && securityEventRecency < allowedRecency) {
            log.info({
              op: 'Account.ipprofiling.seenAddress',
              uid: account.uid
            })
            return true
          }

          // If the account was recently created, don't make the user
          // confirm sign-in for a configurable amount of time. This will reduce
          // the friction of a user adding a second device.
          const skipForNewAccounts = config.signinConfirmation.skipForNewAccounts
          if (skipForNewAccounts && skipForNewAccounts.enabled) {
            const accountAge = requestNow - account.createdAt
            if (accountAge <= skipForNewAccounts.maxAge) {
              log.info({
                op: 'account.signin.confirm.bypass.age',
                uid: account.uid
              })
              return true
            }
          }

          return false
        }

        function checkNumberOfActiveSessions () {
          return db.sessions(accountRecord.uid)
            .then(
              function (s) {
                sessions = s
                if (sessions.length > MAX_ACTIVE_SESSIONS) {
                  // There's no spec-compliant way to error out
                  // as a result of having too many active sessions.
                  // For now, just log metrics about it.
                  log.error({
                    op: 'Account.login',
                    uid: accountRecord.uid,
                    userAgent: request.headers['user-agent'],
                    numSessions: sessions.length
                  })
                }
              }
            )
        }

        function createSessionToken () {
          return P.resolve()
            .then(() => {
              if (needsVerificationId) {
                return P.all([random.hex(16), TokenCode()])
                  .spread((hex16, tokenCode) => {
                    tokenVerificationId = hex16
                    tokenVerificationCode = tokenCode
                  })
              }
            })
            .then(() => {
              const {
                browser: uaBrowser,
                browserVersion: uaBrowserVersion,
                os: uaOS,
                osVersion: uaOSVersion,
                deviceType: uaDeviceType,
                formFactor: uaFormFactor
              } = request.app.ua

              const sessionTokenOptions = {
                uid: accountRecord.uid,
                email: accountRecord.primaryEmail.email,
                emailCode: accountRecord.primaryEmail.emailCode,
                emailVerified: accountRecord.primaryEmail.isVerified,
                verifierSetAt: accountRecord.verifierSetAt,
                mustVerify: mustVerifySession,
                tokenVerificationId: tokenVerificationId,
                tokenVerificationCode: tokenVerificationCode,
                tokenVerificationCodeExpiresAt: Date.now() + tokenCodeLifetime,
                uaBrowser,
                uaBrowserVersion,
                uaOS,
                uaOSVersion,
                uaDeviceType,
                uaFormFactor
              }

              return db.createSessionToken(sessionTokenOptions)
            })
            .then(
              function (result) {
                sessionToken = result
                return request.stashMetricsContext(sessionToken)
              }
            )
            .then(
              function () {
                if (doSigninConfirmation) {
                  // There is no session token when we emit account.confirmed
                  // so stash the data against a synthesized "token" instead.
                  return request.stashMetricsContext({
                    uid: accountRecord.uid,
                    id: tokenVerificationId
                  })
                }
              }
            )
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            var password = new Password(
              authPW,
              accountRecord.authSalt,
              accountRecord.verifierVersion
            )

            return password.unwrap(accountRecord.wrapWrapKb)
              .then(
                function (wrapKb) {
                  return db.createKeyFetchToken({
                    uid: accountRecord.uid,
                    kA: accountRecord.kA,
                    wrapKb: wrapKb,
                    emailVerified: accountRecord.primaryEmail.isVerified,
                    tokenVerificationId: tokenVerificationId
                  })
                  .then(
                    function (result) {
                      keyFetchToken = result
                      return request.stashMetricsContext(keyFetchToken)
                    }
                  )
                }
              )
          }
        }

        function emitSyncLoginEvent () {
          if (service === 'sync' && request.payload.reason === 'signin') {
            return log.notifyAttachedServices('login', request, {
              service: 'sync',
              uid: accountRecord.uid,
              email: accountRecord.primaryEmail.email,
              deviceCount: sessions.length,
              userAgent: request.headers['user-agent']
            })
          }
        }

        function sendVerifyAccountEmail() {
          if (! accountRecord.primaryEmail.isVerified) {
            if (didSigninUnblock) {
              log.info({
                op: 'Account.login.unverified.unblocked',
                uid: accountRecord.uid
              })
            }

            // Only use tokenVerificationId if it is set, otherwise use the corresponding email code
            // This covers the cases where sign-in confirmation is disabled or not needed.
            var emailCode = tokenVerificationId ? tokenVerificationId : accountRecord.primaryEmail.emailCode

            return request.app.geo
              .then(
                function (geoData) {
                  return mailer.sendVerifyCode([], accountRecord, {
                    code: emailCode,
                    service: service,
                    redirectTo: redirectTo,
                    resume: resume,
                    acceptLanguage: request.app.acceptLanguage,
                    flowId: flowId,
                    flowBeginTime: flowBeginTime,
                    ip: ip,
                    location: geoData.location,
                    uaBrowser: sessionToken.uaBrowser,
                    uaBrowserVersion: sessionToken.uaBrowserVersion,
                    uaOS: sessionToken.uaOS,
                    uaOSVersion: sessionToken.uaOSVersion,
                    uaDeviceType: sessionToken.uaDeviceType,
                    uid: sessionToken.uid
                  })
                }
              )
              .then(() => request.emitMetricsEvent('email.verification.sent'))
          }
        }

        function sendNewDeviceLoginNotification() {
          // New device notification emails should only be sent when requesting keys.
          // They're not sent if performing a sign-in confirmation
          // (in which case you get the sign-in confirmation email)
          var shouldSendNewDeviceLoginEmail = config.newLoginNotificationEnabled
            && requestHelper.wantsKeys(request)
            && ! doSigninConfirmation
            && accountRecord.primaryEmail.isVerified
          if (shouldSendNewDeviceLoginEmail) {
            return P.all([request.app.geo, db.accountEmails(sessionToken.uid)])
              .spread((geoData, emails) => {
                // New device notifications are always sent to the primary account email (emailRecord.email)
                // and CCed to all secondary email if enabled.
                mailer.sendNewDeviceLoginNotification(
                  emails,
                  accountRecord,
                  {
                    acceptLanguage: request.app.acceptLanguage,
                    flowId: flowId,
                    flowBeginTime: flowBeginTime,
                    ip: ip,
                    location: geoData.location,
                    service,
                    timeZone: geoData.timeZone,
                    uaBrowser: sessionToken.uaBrowser,
                    uaBrowserVersion: sessionToken.uaBrowserVersion,
                    uaOS: sessionToken.uaOS,
                    uaOSVersion: sessionToken.uaOSVersion,
                    uaDeviceType: sessionToken.uaDeviceType,
                    uid: sessionToken.uid
                  }
                )
                  .catch(e => {
                    // If we couldn't email them, no big deal. Log
                    // and pretend everything worked.
                    log.trace({
                      op: 'Account.login.sendNewDeviceLoginNotification.error',
                      error: e
                    })
                  })
              })
          }
        }

        function sendVerificationIfNeeded() {
          // If this login requires a confirmation, check to see if one was specified in
          // the request. If none was specified, use the `email` verficationMethod.
          if (doSigninConfirmation) {
            if (verificationMethod === 'email') {
              // Sends an email containing a link to verify login
              return sendVerifyLoginEmail()
            } else if (verificationMethod === 'email-2fa') {
              // Sends an email containing a code that can verify a login
              return sendVerifyLoginCodeEmail()
            } else if (verificationMethod === 'email-captcha') {
              // `email-captcha` is a custom verification method used only for
              // unblock codes. We do not need to send a verification email
              // in this case.
            } else {
              return sendVerifyLoginEmail()
            }
          }
        }

        function sendVerifyLoginEmail() {
          log.info({
            op: 'account.signin.confirm.start',
            uid: accountRecord.uid,
            tokenVerificationId: tokenVerificationId
          })

          return P.all([request.app.geo, db.accountEmails(sessionToken.uid)])
            .spread((geoData, emails) => {
              return mailer.sendVerifyLoginEmail(
                emails,
                accountRecord,
                {
                  acceptLanguage: request.app.acceptLanguage,
                  code: tokenVerificationId,
                  flowId: flowId,
                  flowBeginTime: flowBeginTime,
                  ip: ip,
                  location: geoData.location,
                  redirectTo: redirectTo,
                  resume: resume,
                  service: service,
                  timeZone: geoData.timeZone,
                  uaBrowser: sessionToken.uaBrowser,
                  uaBrowserVersion: sessionToken.uaBrowserVersion,
                  uaOS: sessionToken.uaOS,
                  uaOSVersion: sessionToken.uaOSVersion,
                  uaDeviceType: sessionToken.uaDeviceType,
                  uid: sessionToken.uid
                }
              )
            })
            .then(() => request.emitMetricsEvent('email.confirmation.sent'))
        }

        function sendVerifyLoginCodeEmail() {
          log.info({
            op: 'account.token.code.start',
            uid: accountRecord.uid
          })

          return P.all([request.app.geo, db.accountEmails(sessionToken.uid)])
            .spread((geoData, emails) => {
              return mailer.sendVerifyLoginCodeEmail(
                emails,
                accountRecord,
                {
                  acceptLanguage: request.app.acceptLanguage,
                  code: tokenVerificationCode,
                  flowId: flowId,
                  flowBeginTime: flowBeginTime,
                  ip: ip,
                  location: geoData.location,
                  redirectTo: redirectTo,
                  resume: resume,
                  service: service,
                  timeZone: geoData.timeZone,
                  uaBrowser: sessionToken.uaBrowser,
                  uaBrowserVersion: sessionToken.uaBrowserVersion,
                  uaOS: sessionToken.uaOS,
                  uaOSVersion: sessionToken.uaOSVersion,
                  uaDeviceType: sessionToken.uaDeviceType,
                  uid: sessionToken.uid
                }
              )
            })
            .then(() => request.emitMetricsEvent('email.tokencode.sent'))
        }

        function recordSecurityEvent() {
          db.securityEvent({
            name: 'account.login',
            uid: accountRecord.uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id
          })
        }

        function createResponse () {
          var response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            verified: sessionToken.emailVerified,
            authAt: sessionToken.lastAuthAt()
          }

          const mustVerify = requestHelper.wantsKeys(request) || verificationMethod
          if (! mustVerify) {
            return P.resolve(response)
          }

          if (requestHelper.wantsKeys(request)) {
            response.keyFetchToken = keyFetchToken.data
          }

          if (! accountRecord.primaryEmail.isVerified) {
            response.verified = false
            response.verificationMethod = 'email'
            response.verificationReason = 'signup'
          } else if (doSigninConfirmation) {
            response.verified = false

            // Override the verification method if it was explicitly specified in the request
            response.verificationMethod = verificationMethod || 'email'
            response.verificationReason = 'login'
          }

          return P.resolve(response)
        }
      }
    },
    {
      method: 'GET',
      path: '/account/status',
      config: {
        auth: {
          mode: 'optional',
          strategy: 'sessionToken'
        },
        validate: {
          query: {
            uid: isA.string().min(32).max(32).regex(HEX_STRING)
          }
        }
      },
      handler: function (request, reply) {
        var sessionToken = request.auth.credentials
        if (sessionToken) {
          reply({ exists: true, locale: sessionToken.locale })
        }
        else if (request.query.uid) {
          var uid = request.query.uid
          db.account(uid)
            .then(
              function (account) {
                reply({ exists: true })
              },
              function (err) {
                if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                  return reply({ exists: false })
                }
                reply(err)
              }
            )
        }
        else {
          reply(error.missingRequestParameter('uid'))
        }
      }
    },
    {
      method: 'POST',
      path: '/account/status',
      config: {
        validate: {
          payload: {
            email: validators.email().required()
          }
        },
        response: {
          schema: {
            exists: isA.boolean().required()
          }
        }
      },
      handler: function (request, reply) {
        var email = request.payload.email

        customs.check(
          request,
          email,
          'accountStatusCheck')
          .then(
            db.accountExists.bind(db, email)
          )
          .then(
            function (exist) {
              reply({
                exists: exist
              })
            },
            function (err) {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                return reply({ exists: false })
              }
              reply(err)
            }
          )
      }
    },
    {
      method: 'GET',
      path: '/account/profile',
      config: {
        auth: {
          mode: 'optional',
          strategies: [
            'sessionToken',
            'oauthToken'
          ]
        }
      },
      handler: function (request, reply) {
        var auth = request.auth
        var uid
        if (auth.strategy === 'sessionToken') {
          uid = auth.credentials.uid
        } else {
          uid = auth.credentials.user
        }
        function hasProfileItemScope(item) {
          if (auth.strategy === 'sessionToken') {
            return true
          }
          var scopes = auth.credentials.scope
          for (var i = 0; i < scopes.length; i++) {
            if (scopes[i] === 'profile') {
              return true
            }
            if (scopes[i] === 'profile:write') {
              return true
            }
            if (scopes[i] === 'profile:' + item) {
              return true
            }
            if (scopes[i] === 'profile:' + item + ':write') {
              return true
            }
          }
          return false
        }
        db.account(uid)
          .then(
            function (account) {
              reply({
                email: hasProfileItemScope('email') ? account.primaryEmail.email : undefined,
                locale: hasProfileItemScope('locale') ? account.locale : undefined
              })
            },
            function (err) {
              reply(err)
            }
          )
      }
    },
    {
      method: 'GET',
      path: '/account/keys',
      config: {
        auth: {
          strategy: 'keyFetchTokenWithVerificationStatus'
        },
        response: {
          schema: {
            bundle: isA.string().regex(HEX_STRING)
          }
        }
      },
      handler: function accountKeys(request, reply) {
        log.begin('Account.keys', request)
        var keyFetchToken = request.auth.credentials

        var verified = keyFetchToken.tokenVerified && keyFetchToken.emailVerified
        if (! verified) {
          // don't delete the token on use until the account is verified
          return reply(error.unverifiedAccount())
        }
        db.deleteKeyFetchToken(keyFetchToken)
          .then(
            function () {
              return request.emitMetricsEvent('account.keyfetch', {
                uid: keyFetchToken.uid
              })
            }
          )
          .then(
            function () {
              return {
                bundle: keyFetchToken.keyBundle
              }
            }
          )
          .then(reply, reply)
      }
    },
    {
      method: 'POST',
      path: '/account/unlock/resend_code',
      config: {
        validate: {
          payload: true
        }
      },
      handler: function (request, reply) {
        log.error({ op: 'Account.UnlockCodeResend', request: request })
        reply(error.gone())
      }
    },
    {
      method: 'POST',
      path: '/account/unlock/verify_code',
      config: {
        validate: {
          payload: true
        }
      },
      handler: function (request, reply) {
        log.error({ op: 'Account.UnlockCodeVerify', request: request })
        reply(error.gone())
      }
    },
    {
      method: 'POST',
      path: '/account/reset',
      config: {
        auth: {
          strategy: 'accountResetToken',
          payload: 'required'
        },
        validate: {
          query: {
            keys: isA.boolean().optional()
          },
          payload: {
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            sessionToken: isA.boolean().optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        }
      },
      handler: function accountReset(request, reply) {
        log.begin('Account.reset', request)
        const accountResetToken = request.auth.credentials
        const authPW = request.payload.authPW
        const hasSessionToken = request.payload.sessionToken
        let account, sessionToken, keyFetchToken, verifyHash, wrapKb

        request.validateMetricsContext()

        let flowCompleteSignal
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed'
        } else {
          flowCompleteSignal = 'account.reset'
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal)

        return resetAccountData()
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse)
          .then(reply, reply)

        function resetAccountData () {
          let authSalt, password, wrapWrapKb
          return random.hex(32, 32)
            .then(hexes => {
              authSalt = hexes[0]
              wrapWrapKb = hexes[1]
              password = new Password(authPW, authSalt, config.verifierVersion)
              return password.verifyHash()
            })
            .then(
              function (verifyHashData) {
                verifyHash = verifyHashData

                return db.resetAccount(
                  accountResetToken,
                  {
                    authSalt: authSalt,
                    verifyHash: verifyHash,
                    wrapWrapKb: wrapWrapKb,
                    verifierVersion: password.version
                  }
                )
              }
            )
            .then(
              function () {
                // Delete all passwordChangeTokens, passwordForgotTokens and
                // accountResetTokens associated with this uid
                return db.resetAccountTokens(accountResetToken.uid)
              }
            )
            .then(
              function () {
                // Notify the devices that the account has changed.
                request.app.devices.then(devices =>
                  push.notifyPasswordReset(accountResetToken.uid, devices)
                )

                return db.account(accountResetToken.uid)
                  .then((accountData) => {
                    account = accountData
                  })
              }
            )
            .then(
              function () {
                return P.all([
                  request.emitMetricsEvent('account.reset', {
                    uid: account.uid
                  }),
                  log.notifyAttachedServices('reset', request, {
                    uid: account.uid,
                    iss: config.domain,
                    generation: account.verifierSetAt
                  }),
                  customs.reset(account.email),
                  password.unwrap(account.wrapWrapKb)
                ])
              }
            )
            .then(
              function (results) {
                wrapKb = results[3]
              }
            )
        }

        function createSessionToken () {
          if (hasSessionToken) {
            const {
              browser: uaBrowser,
              browserVersion: uaBrowserVersion,
              os: uaOS,
              osVersion: uaOSVersion,
              deviceType: uaDeviceType,
              formFactor: uaFormFactor
            } = request.app.ua

            // Since the only way to reach this point is clicking a
            // link from the user's email, we create a verified sessionToken
            const sessionTokenOptions = {
              uid: account.uid,
              email: account.primaryEmail.email,
              emailCode: account.primaryEmail.emailCode,
              emailVerified: account.primaryEmail.isVerified,
              verifierSetAt: account.verifierSetAt,
              uaBrowser,
              uaBrowserVersion,
              uaOS,
              uaOSVersion,
              uaDeviceType,
              uaFormFactor
            }

            return db.createSessionToken(sessionTokenOptions)
              .then(
                function (result) {
                  sessionToken = result
                  return request.stashMetricsContext(sessionToken)
                }
              )
          }
        }

        function createKeyFetchToken () {
          if (requestHelper.wantsKeys(request)) {
            if (! hasSessionToken) {
              // Sanity-check: any client requesting keys,
              // should also be requesting a sessionToken.
              throw error.missingRequestParameter('sessionToken')
            }
            return db.createKeyFetchToken({
              uid: account.uid,
              kA: account.kA,
              wrapKb: wrapKb,
              emailVerified: account.primaryEmail.isVerified
            })
            .then(
              function (result) {
                keyFetchToken = result
                return request.stashMetricsContext(keyFetchToken)
              }
            )
          }
        }

        function recordSecurityEvent() {
          db.securityEvent({
            name: 'account.reset',
            uid: account.uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id
          })
        }

        function createResponse () {
          // If no sessionToken, this could be a legacy client
          // attempting to reset an account password, return legacy response.
          if (! hasSessionToken) {
            return {}
          }


          var response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            verified: sessionToken.emailVerified,
            authAt: sessionToken.lastAuthAt()
          }

          if (requestHelper.wantsKeys(request)) {
            response.keyFetchToken = keyFetchToken.data
          }

          return response
        }
      }
    },
    {
      method: 'POST',
      path: '/account/destroy',
      config: {
        validate: {
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required()
          }
        }
      },
      handler: function accountDestroy(request, reply) {
        log.begin('Account.destroy', request)
        var form = request.payload
        var authPW = form.authPW
        var uid
        var devicesToNotify
        customs.check(
          request,
          form.email,
          'accountDestroy')
          .then(db.accountRecord.bind(db, form.email))
          .then(
            function (emailRecord) {
              uid = emailRecord.uid

              return checkPassword(emailRecord, authPW, request.app.clientAddress)
                .then(
                  function (match) {
                    if (! match) {
                      throw error.incorrectPassword(emailRecord.email, form.email)
                    }
                    // We fetch the devices to notify before deleteAccount()
                    // because obviously we can't retrieve the devices list after!
                    return db.devices(uid)
                  }
                )
                .then(
                  function (devices) {
                    devicesToNotify = devices
                    return db.deleteAccount(emailRecord)
                  }
                )
                .then(
                  function () {
                    push.notifyAccountDestroyed(uid, devicesToNotify)
                      .catch(() => {})
                    return P.all([
                      log.notifyAttachedServices('delete', request, {
                        uid: uid,
                        iss: config.domain
                      }),
                      request.emitMetricsEvent('account.deleted', {
                        uid: uid
                      })
                    ])
                  }
                )
                .then(
                  function () {
                    return {}
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
          .then(reply, reply)
      }
    }
  ]

  if (config.isProduction) {
    delete routes[0].config.validate.payload.preVerified
  } else {
    // programmatic account lockout was only available in
    // non-production mode.
    routes.push({
      method: 'POST',
      path: '/account/lock',
      config: {
        validate: {
          payload: true
        }
      },
      handler: function (request, reply) {
        log.error({ op: 'Account.lock', request: request })
        reply(error.gone())
      }
    })
  }

  return routes
}
