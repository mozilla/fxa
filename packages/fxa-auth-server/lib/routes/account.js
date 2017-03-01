/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING
var BASE64_JWT = validators.BASE64_JWT
var DISPLAY_SAFE_UNICODE = validators.DISPLAY_SAFE_UNICODE
var URLSAFEBASE64 = validators.URLSAFEBASE64
var BASE_36 = validators.BASE_36
var PUSH_PAYLOADS_SCHEMA_PATH = '../../docs/pushpayloads.schema.json'

// An arbitrary, but very generous, limit on the number of active sessions.
// Currently only for metrics purposes, not enforced.
var MAX_ACTIVE_SESSIONS = 200

var MS_ONE_DAY = 1000 * 60 * 60 * 24
var MS_ONE_WEEK = MS_ONE_DAY * 7
var MS_ONE_MONTH = MS_ONE_DAY * 30

var path = require('path')
var ajv = require('ajv')()
var fs = require('fs')
var butil = require('../crypto/butil')
var userAgent = require('../userAgent')
var requestHelper = require('../routes/utils/request_helper')

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema

module.exports = function (
  log,
  random,
  P,
  uuid,
  isA,
  error,
  db,
  mailer,
  Password,
  config,
  customs,
  isPreVerified,
  checkPassword,
  push,
  devices
  ) {

  // Loads and compiles a json validator for the payloads received
  // in /account/devices/notify
  var schemaPath = path.resolve(__dirname, PUSH_PAYLOADS_SCHEMA_PATH)
  var schema = fs.readFileSync(schemaPath)
  var validatePushPayload = ajv.compile(schema)
  var verificationReminder = require('../verification-reminders')(log, db)
  var getGeoData = require('../geodb')(log)
  var localizeTimestamp = require('fxa-shared').l10n.localizeTimestamp({
    supportedLanguages: config.i18n.supportedLanguages,
    defaultLanguage: config.i18n.defaultLanguage
  })
  const features = require('../features')(config)

  const unblockCodeLifetime = config.signinUnblock && config.signinUnblock.codeLifetime || 0
  const unblockCodeLen = config.signinUnblock && config.signinUnblock.codeLength || 0

  var routes = [
    {
      method: 'POST',
      path: '/account/create',
      config: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
            _createdAt: isA.number().min(0).optional()
          },
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            preVerified: isA.boolean(),
            service: validators.service,
            redirectTo: validators.redirectTo(config.smtp.redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            preVerifyToken: isA.string().max(2048).regex(BASE64_JWT).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
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

        var form = request.payload
        var query = request.query
        var email = form.email
        var authPW = Buffer(form.authPW, 'hex')
        var locale = request.app.acceptLanguage
        var userAgentString = request.headers['user-agent']
        var service = form.service || query.service
        const ip = request.app.clientAddress
        var preVerified, password, verifyHash, account, sessionToken, keyFetchToken, emailCode, tokenVerificationId, authSalt

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        customs.check(request, email, 'accountCreate')
          .then(db.emailRecord.bind(db, email))
          .then(deleteAccountIfUnverified, ignoreUnknownAccountError)
          .then(checkPreVerified)
          .then(generateRandomValues)
          .then(createPassword)
          .then(createAccount)
          .then(createSessionToken)
          .then(sendVerifyCode)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse)
          .then(reply, reply)

        function deleteAccountIfUnverified (emailRecord) {
          if (emailRecord.emailVerified) {
            throw error.accountExists(emailRecord.email)
          }

          request.app.accountRecreated = true
          return db.deleteAccount(emailRecord)
        }

        function ignoreUnknownAccountError (err) {
          if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
            throw err
          }
        }

        function checkPreVerified () {
          return isPreVerified(form.email, form.preVerifyToken)
            .then(
              function (result) {
                preVerified = result

                let flowCompleteSignal
                if (service === 'sync') {
                  flowCompleteSignal = 'account.signed'
                } else if (preVerified) {
                  flowCompleteSignal = 'account.created'
                } else {
                  flowCompleteSignal = 'account.verified'
                }
                request.setMetricsFlowCompleteSignal(flowCompleteSignal)
              }
            )
        }

        function generateRandomValues() {
          return random(16)
            .then(bytes => {
              emailCode = bytes
              tokenVerificationId = bytes
              return random(32)
            })
            .then(bytes => {
              authSalt = bytes
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

          return random(64)
          .then(bytes => db.createAccount({
            uid: uuid.v4('binary'),
            createdAt: Date.now(),
            email: email,
            emailCode: emailCode,
            emailVerified: form.preVerified || preVerified,
            kA: bytes.slice(0, 32), // 0..31
            wrapWrapKb: bytes.slice(32), // 32..63
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
                uid: account.uid.toString('hex'),
                locale: account.locale
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
                  userAgent: request.headers['user-agent']
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

          if (query._createdAt) {
            // We don't expect this to be set outside the tests so log an error
            // if we do encounter it, to help debug what's going on.
            log.error({
              op: 'account.create.createSessionToken',
              err: new Error('Unexpected _createdAt query parameter'),
              _createdAt: query._createdAt,
              userAgent: request.headers['user-agent'],
              service
            })
          }

          return db.createSessionToken({
            uid: account.uid,
            email: account.email,
            emailCode: account.emailCode,
            emailVerified: account.emailVerified,
            verifierSetAt: account.verifierSetAt,
            createdAt: parseInt(query._createdAt),
            mustVerify: requestHelper.wantsKeys(request),
            tokenVerificationId: tokenVerificationId
          }, userAgentString)
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
                  id: account.emailCode.toString('hex')
                })
              }
            )
        }

        function sendVerifyCode () {
          if (! account.emailVerified) {
            return getGeoData(ip)
              .then(function (geoData) {
                mailer.sendVerifyCode(account, account.emailCode, {
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
                  uaDeviceType: sessionToken.uaDeviceType
                })
                  .then(function () {
                    // only create reminder if sendVerifyCode succeeds
                    verificationReminder.create({
                      uid: account.uid.toString('hex')
                    }).catch(function (err) {
                      log.error({op: 'Account.verificationReminder.create', err: err})
                    })

                    if (tokenVerificationId) {
                      // Log server-side metrics for confirming verification rates
                      log.info({
                        op: 'account.create.confirm.start',
                        uid: account.uid.toString('hex'),
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
                        uid: account.uid.toString('hex'),
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
          if (features.isSecurityHistoryTrackingEnabled()) {
            // don't block response recording db event
            db.securityEvent({
              name: 'account.create',
              uid: account.uid,
              ipAddr: request.app.clientAddress,
              tokenId: sessionToken.tokenId
            })
          }
        }

        function createResponse () {
          var response = {
            uid: account.uid.toString('hex'),
            sessionToken: sessionToken.data.toString('hex'),
            authAt: sessionToken.lastAuthAt()
          }

          if (keyFetchToken) {
            response.keyFetchToken = keyFetchToken.data.toString('hex')
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
            service: validators.service
          },
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            service: validators.service,
            redirectTo: isA.string().uri().optional(),
            resume: isA.string().optional(),
            reason: isA.string().max(16).optional(),
            unblockCode: isA.string().regex(BASE_36).length(unblockCodeLen).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
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
            authAt: isA.number().integer(),
            emailSent: isA.boolean().optional()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.login', request)

        const form = request.payload
        const email = form.email
        const authPW = Buffer(form.authPW, 'hex')
        const service = request.payload.service || request.query.service
        const redirectTo = request.payload.redirectTo
        const resume = request.payload.resume
        const ip = request.app.clientAddress
        const requestNow = Date.now()

        let needsVerificationId = true
        let emailRecord, sessions, sessionToken, keyFetchToken, mustVerifySession, doSigninConfirmation,
          emailSent, unblockCode, customsErr, didSigninUnblock, tokenVerificationId

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
          .then(sendVerifyLoginEmail)
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
          return db.emailRecord(email)
            .then(
              function (result) {

                // If the incorrect email case is used, the password check cannot possibly succeed,
                // and the client will retry automatically with the correct capitalization.
                // Don't tell customs-server this was a failed login attempt, to avoid penalizing the user twice.
                if (email !== result.email) {
                  throw error.incorrectPassword(result.email, email)
                }

                emailRecord = result
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
                }
                throw err
              }
            )
        }

        function checkUnblockCode() {
          if (unblockCode) {
            return db.consumeUnblockCode(emailRecord.uid, unblockCode)
              .then(
                (code) => {
                  if (requestNow - code.createdAt > unblockCodeLifetime) {
                    log.info({
                      op: 'Account.login.unblockCode.expired',
                      uid: emailRecord.uid.toString('hex')
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
          if (! features.isSecurityHistoryTrackingEnabled()) {
            return
          }
          return db.securityEvents({
            uid: emailRecord.uid,
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
                      uid: emailRecord.uid.toString('hex'),
                      events: events.length,
                      recency: coarseRecency
                    })
                  } else {
                    log.info({
                      op: 'Account.history.unverified',
                      uid: emailRecord.uid.toString('hex'),
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
                  uid: emailRecord.uid.toString('hex')
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
          if (! forceTokenVerification(request, emailRecord)) {
            if (skipTokenVerification(request, emailRecord)) {
              needsVerificationId = false
            }
          }

          // If they just went through the sigin-unblock flow, they have already verified their email.
          // We don't need to force them to do that again, just make a verified session.
          if (didSigninUnblock) {
            needsVerificationId = false
          }

          // If the request wants keys, the user *must* confirm their login session before they
          // can actually use it.  If they dont want keys, they don't *have* to verify their
          // their session, but we still create it with a non-null tokenVerificationId, so it will
          // still be considered unverified.  This prevents the session from being used for sync
          // unless the user explicitly requests us to resend the confirmation email, and completes it.
          mustVerifySession = needsVerificationId && requestHelper.wantsKeys(request)

          // If the email itself is unverified, we'll re-send the "verify your account email" and
          // that will suffice to confirm the sign-in.  No need for a separate confirmation email.
          doSigninConfirmation = mustVerifySession && emailRecord.emailVerified

          let flowCompleteSignal
          if (service === 'sync') {
            flowCompleteSignal = 'account.signed'
          } else if (doSigninConfirmation) {
            flowCompleteSignal = 'account.confirmed'
          } else {
            flowCompleteSignal = 'account.login'
          }
          request.setMetricsFlowCompleteSignal(flowCompleteSignal)

          return checkPassword(emailRecord, authPW, request.app.clientAddress)
            .then(
              function (match) {
                if (! match) {
                  throw error.incorrectPassword(emailRecord.email, email)
                }

                return request.emitMetricsEvent('account.login', {
                  uid: emailRecord.uid.toString('hex')
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
              if (config.signinConfirmation.forcedEmailAddresses.test(account.email)) {
                return true
              }
            }
          }
          return false
        }

        function skipTokenVerification (request, account) {
          // If they're logging in from an IP address on which they recently did
          // another, successfully-verified login, then we can consider this one
          // verified as well without going through the loop again.
          if (features.isSecurityHistoryProfilingEnabled()) {
            const allowedRecency = config.securityHistory.ipProfiling.allowedRecency || 0
            if (securityEventVerified && securityEventRecency < allowedRecency) {
              log.info({
                op: 'Account.ipprofiling.seenAddress',
                uid: account.uid.toString('hex')
              })
              return true
            }
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
                uid: account.uid.toString('hex')
              })
              return true
            }
          }

          return false
        }

        function checkNumberOfActiveSessions () {
          return db.sessions(emailRecord.uid)
            .then(
              function (s) {
                sessions = s
                if (sessions.length > MAX_ACTIVE_SESSIONS) {
                  // There's no spec-compliant way to error out
                  // as a result of having too many active sessions.
                  // For now, just log metrics about it.
                  log.error({
                    op: 'Account.login',
                    uid: emailRecord.uid,
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
                return random(16).then(bytes => {
                  tokenVerificationId = bytes
                })
              }
            })
            .then(() => {
              const sessionTokenOptions = {
                uid: emailRecord.uid,
                email: emailRecord.email,
                emailCode: emailRecord.emailCode,
                emailVerified: emailRecord.emailVerified,
                verifierSetAt: emailRecord.verifierSetAt,
                mustVerify: mustVerifySession,
                tokenVerificationId: tokenVerificationId
              }

              return db.createSessionToken(sessionTokenOptions, request.headers['user-agent'])
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
                    uid: emailRecord.uid,
                    id: tokenVerificationId.toString('hex')
                  })
                }
              }
            )
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            var password = new Password(
              authPW,
              emailRecord.authSalt,
              emailRecord.verifierVersion
            )

            return password.unwrap(emailRecord.wrapWrapKb)
              .then(
                function (wrapKb) {
                  return db.createKeyFetchToken({
                    uid: emailRecord.uid,
                    kA: emailRecord.kA,
                    wrapKb: wrapKb,
                    emailVerified: emailRecord.emailVerified,
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
              uid: emailRecord.uid,
              email: emailRecord.email,
              deviceCount: sessions.length,
              userAgent: request.headers['user-agent']
            })
          }
        }

        function sendVerifyAccountEmail() {
          // Delegate sending emails for unverified users to auth-server.
          emailSent = false

          if (! emailRecord.emailVerified) {
            if (didSigninUnblock) {
              log.info({
                op: 'Account.login.unverified.unblocked',
                uid: emailRecord.uid.toString('hex')
              })
            }

            // Only use tokenVerificationId if it is set, otherwise use the corresponding email code
            // This covers the cases where sign-in confirmation is disabled or not needed.
            var emailCode = tokenVerificationId ? tokenVerificationId : emailRecord.emailCode
            emailSent = true

            return getGeoData(ip)
              .then(
                function (geoData) {
                  return mailer.sendVerifyCode(emailRecord, emailCode, {
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
                    uaDeviceType: sessionToken.uaDeviceType
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
          // or if the account is unverified (in which case
          // content-server triggers a resend of the account verification email)
          var shouldSendNewDeviceLoginEmail = config.newLoginNotificationEnabled
            && requestHelper.wantsKeys(request)
            && ! doSigninConfirmation
            && emailRecord.emailVerified
          if (shouldSendNewDeviceLoginEmail) {
            return getGeoData(ip)
              .then(
                function (geoData) {
                  mailer.sendNewDeviceLoginNotification(
                    emailRecord.email,
                    {
                      acceptLanguage: request.app.acceptLanguage,
                      flowId: flowId,
                      flowBeginTime: flowBeginTime,
                      ip: ip,
                      location: geoData.location,
                      timeZone: geoData.timeZone,
                      uaBrowser: sessionToken.uaBrowser,
                      uaBrowserVersion: sessionToken.uaBrowserVersion,
                      uaOS: sessionToken.uaOS,
                      uaOSVersion: sessionToken.uaOSVersion,
                      uaDeviceType: sessionToken.uaDeviceType
                    }
                  )
                }
              )
          }
        }

        function sendVerifyLoginEmail() {
          if (doSigninConfirmation) {
            log.info({
              op: 'account.signin.confirm.start',
              uid: emailRecord.uid.toString('hex'),
              tokenVerificationId: tokenVerificationId
            })

            return getGeoData(ip)
              .then(
                function (geoData) {
                  return mailer.sendVerifyLoginEmail(
                    emailRecord,
                    tokenVerificationId,
                    {
                      acceptLanguage: request.app.acceptLanguage,
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
                      uaDeviceType: sessionToken.uaDeviceType
                    }
                  )
                }
              )
              .then(() => request.emitMetricsEvent('email.confirmation.sent'))
          }
        }

        function recordSecurityEvent() {
          if (features.isSecurityHistoryTrackingEnabled()) {
            // don't block response recording db event
            db.securityEvent({
              name: 'account.login',
              uid: emailRecord.uid,
              ipAddr: request.app.clientAddress,
              tokenId: sessionToken && sessionToken.tokenId
            })
          }
        }

        function createResponse () {
          var response = {
            uid: sessionToken.uid.toString('hex'),
            sessionToken: sessionToken.data.toString('hex'),
            verified: sessionToken.emailVerified,
            authAt: sessionToken.lastAuthAt()
          }

          response.emailSent = emailSent

          if (! requestHelper.wantsKeys(request)) {
            return P.resolve(response)
          }

          response.keyFetchToken = keyFetchToken.data.toString('hex')

          if(! emailRecord.emailVerified) {
            response.verified = false
            response.verificationMethod = 'email'
            response.verificationReason = 'signup'
          } else if (doSigninConfirmation) {
            response.verified = false
            response.verificationMethod = 'email'
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
          var uid = Buffer(request.query.uid, 'hex')
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
          uid = Buffer(auth.credentials.user, 'hex')
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
                email: hasProfileItemScope('email') ? account.email : undefined,
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
                uid: keyFetchToken.uid.toString('hex')
              })
            }
          )
          .then(
            function () {
              return {
                bundle: keyFetchToken.keyBundle.toString('hex')
              }
            }
          )
          .then(reply, reply)
      }
    },
    {
      method: 'POST',
      path: '/account/device',
      config: {
        auth: {
          strategy: 'sessionTokenWithDevice'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              id: isA.string().length(32).regex(HEX_STRING).required(),
              name: isA.string().max(255).regex(DISPLAY_SAFE_UNICODE).optional(),
              type: isA.string().max(16).optional(),
              pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow(''),
              pushPublicKey: isA.string().max(88).regex(URLSAFEBASE64).optional().allow(''),
              pushAuthKey: isA.string().max(24).regex(URLSAFEBASE64).optional().allow('')
            }).or('name', 'type', 'pushCallback', 'pushPublicKey', 'pushAuthKey').and('pushPublicKey', 'pushAuthKey'),
            isA.object({
              name: isA.string().max(255).regex(DISPLAY_SAFE_UNICODE).required(),
              type: isA.string().max(16).required(),
              pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow(''),
              pushPublicKey: isA.string().max(88).regex(URLSAFEBASE64).optional().allow(''),
              pushAuthKey: isA.string().max(24).regex(URLSAFEBASE64).optional().allow('')
            }).and('pushPublicKey', 'pushAuthKey')
          )
        },
        response: {
          schema: isA.object({
            id: isA.string().length(32).regex(HEX_STRING).required(),
            createdAt: isA.number().positive().optional(),
            // We previously allowed devices to register with arbitrary unicode names,
            // so we can't assert DISPLAY_SAFE_UNICODE in the response schema.
            name: isA.string().max(255).optional(),
            type: isA.string().max(16).optional(),
            pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow(''),
            pushPublicKey: isA.string().max(88).regex(URLSAFEBASE64).optional().allow(''),
            pushAuthKey: isA.string().max(24).regex(URLSAFEBASE64).optional().allow('')
          }).and('pushPublicKey', 'pushAuthKey')
        }
      },
      handler: function (request, reply) {
        log.begin('Account.device', request)
        var payload = request.payload
        var sessionToken = request.auth.credentials

        if (payload.id) {
          // Don't write out the update if nothing has actually changed.
          if (isSpuriousUpdate(payload, sessionToken)) {
            log.increment('device.update.spurious')
            return reply(payload)
          }
          // We also reserve the right to disable updates until
          // we're confident clients are behaving correctly.
          if (config.deviceUpdatesEnabled === false) {
            throw error.featureNotEnabled()
          }
        } else if (sessionToken.deviceId) {
          // Keep the old id, which is probably from a synthesized device record
          payload.id = sessionToken.deviceId.toString('hex')
        }

        if (payload.pushCallback && (! payload.pushPublicKey || ! payload.pushAuthKey)) {
          payload.pushPublicKey = ''
          payload.pushAuthKey = ''
        }

        devices.upsert(request, sessionToken, payload).then(
          function (device) {
            reply(butil.unbuffer(device))
          },
          reply
        )

        // Clients have been known to send spurious device updates,
        // which generates lots of unnecessary database load.
        // Check if anything has actually changed, and log lots metrics on what.
        function isSpuriousUpdate(payload, token) {
          var spurious = true
          if(! token.deviceId || payload.id !== token.deviceId.toString('hex')) {
            spurious = false
            log.increment('device.update.sessionToken')
          }
          if (payload.name && payload.name !== token.deviceName) {
            spurious = false
            log.increment('device.update.name')
          }
          if (payload.type && payload.type !== token.deviceType) {
            spurious = false
            log.increment('device.update.type')
          }
          if (payload.pushCallback && payload.pushCallback !== token.deviceCallbackURL) {
            spurious = false
            log.increment('device.update.pushCallback')
          }
          if (payload.pushPublicKey && payload.pushPublicKey !== token.deviceCallbackPublicKey) {
            spurious = false
            log.increment('device.update.pushPublicKey')
          }
          return spurious
        }
      }
    },
    {
      method: 'POST',
      path: '/account/devices/notify',
      config: {
        auth: {
          strategy: 'sessionTokenWithDevice'
        },
        validate: {
          payload: isA.alternatives().try(
            isA.object({
              to: isA.string().valid('all').required(),
              excluded: isA.array().items(isA.string().length(32).regex(HEX_STRING)).optional(),
              payload: isA.object().required(),
              TTL: isA.number().integer().min(0).optional()
            }),
            isA.object({
              to: isA.array().items(isA.string().length(32).regex(HEX_STRING)).required(),
              payload: isA.object().required(),
              TTL: isA.number().integer().min(0).optional()
            })
          )
        },
        response: {
          schema: {}
        }
      },
      handler: function (request, reply) {
        log.begin('Account.devicesNotify', request)

        // We reserve the right to disable notifications until
        // we're confident clients are behaving correctly.
        if (config.deviceNotificationsEnabled === false) {
          throw error.featureNotEnabled()
        }

        var body = request.payload
        var sessionToken = request.auth.credentials
        var uid = sessionToken.uid
        var ip = request.app.clientAddress
        var payload = body.payload

        if (! validatePushPayload(payload)) {
          throw error.invalidRequestParameter('invalid payload')
        }
        var pushOptions = {
          data: Buffer.from(JSON.stringify(payload))
        }
        if (body.excluded) {
          pushOptions.excludedDeviceIds = body.excluded
        }
        if (body.TTL) {
          pushOptions.TTL = body.TTL
        }

        var endpointAction = 'devicesNotify'
        var stringUid = uid.toString('hex')

        function catchPushError(err) {
          // push may fail due to not found devices or a bad push action
          // log the error but still respond with a 200.
          log.error({
            op: 'Account.devicesNotify',
            uid: stringUid,
            error: err
          })
        }

        return customs.checkAuthenticated(endpointAction, ip, stringUid)
          .then(function () {
            if (body.to === 'all') {
              push.pushToAllDevices(uid, endpointAction, pushOptions)
                .catch(catchPushError)
            } else {
              push.pushToDevices(uid, body.to, endpointAction, pushOptions)
                .catch(catchPushError)
            }
          })
          .then(
            function () {
              reply({})
            },
            reply
          )
      }
    },
    {
      method: 'GET',
      path: '/account/devices',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(isA.object({
            id: isA.string().length(32).regex(HEX_STRING).required(),
            isCurrentDevice: isA.boolean().required(),
            lastAccessTime: isA.number().min(0).required().allow(null),
            lastAccessTimeFormatted: isA.string().optional().allow(''),
            // We previously allowed devices to register with arbitrary unicode names,
            // so we can't assert DISPLAY_SAFE_UNICODE in the response schema.
            name: isA.string().max(255).required().allow(''),
            type: isA.string().max(16).required(),
            pushCallback: isA.string().uri({ scheme: 'https' }).max(255).optional().allow('').allow(null),
            pushPublicKey: isA.string().max(88).regex(URLSAFEBASE64).optional().allow('').allow(null),
            pushAuthKey: isA.string().max(24).regex(URLSAFEBASE64).optional().allow('').allow(null)
          }).and('pushPublicKey', 'pushAuthKey'))
        }
      },
      handler: function (request, reply) {
        log.begin('Account.devices', request)
        var sessionToken = request.auth.credentials
        var uid = sessionToken.uid
        db.devices(uid).then(
          function (deviceArray) {
            reply(deviceArray.map(function (device) {
              if (! device.name) {
                device.name = devices.synthesizeName(device)
              }

              if (! device.type) {
                device.type = device.uaDeviceType || 'desktop'
              }

              device.isCurrentDevice =
                device.sessionToken.toString('hex') === sessionToken.tokenId.toString('hex')

              device.lastAccessTimeFormatted = localizeTimestamp.format(device.lastAccessTime,
                request.headers['accept-language'])

              delete device.sessionToken
              delete device.uaBrowser
              delete device.uaBrowserVersion
              delete device.uaOS
              delete device.uaOSVersion
              delete device.uaDeviceType

              return butil.unbuffer(device)
            }))
          },
          reply
        )
      }
    },
    {
      method: 'POST',
      path: '/account/device/destroy',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            id: isA.string().length(32).regex(HEX_STRING).required()
          }
        },
        response: {
          schema: {}
        }
      },
      handler: function (request, reply) {
        log.begin('Account.deviceDestroy', request)
        var sessionToken = request.auth.credentials
        var uid = sessionToken.uid
        var id = request.payload.id
        var result

        return push.notifyDeviceDisconnected(uid, id)
          .catch(function () {})
          .then(
            function () {
              return db.deleteDevice(uid, id)
            }
          )
          .then(
            function (res) {
              result = res
              return request.emitMetricsEvent('device.deleted', {
                uid: uid.toString('hex'),
                device_id: id
              })
            }
          )
          .then(
            function () {
              return log.notifyAttachedServices('device:delete', request, {
                uid: uid,
                id: id,
                timestamp: Date.now()
              })
            }
          )
          .then(function () {
            return result
          })
          .then(reply, reply)
      }
    },
    {
      method: 'GET',
      path: '/recovery_email/status',
      config: {
        auth: {
          strategy: 'sessionTokenWithVerificationStatus'
        },
        validate: {
          query: {
            reason: isA.string().max(16).optional()
          }
        },
        response: {
          schema: {
            // There's code in the handler that checks for a valid email,
            // no point adding overhead by doing it again here.
            email: isA.string().required(),
            verified: isA.boolean().required(),
            sessionVerified: isA.boolean().optional(),
            emailVerified: isA.boolean().optional()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.RecoveryEmailStatus', request)
        var sessionToken = request.auth.credentials
        if (request.query && request.query.reason === 'push') {
          // only log recovery_email requests with 'push' to avoid sending too many requests.
          log.increment('recovery_email_reason.push')
          // log to the push namespace that account was verified via push
          log.info({
            op: 'push.pushToDevices',
            name: 'recovery_email_reason.push'
          })
        }

        cleanUpIfAccountInvalid()
          .then(createResponse)
          .then(reply, reply)

        function cleanUpIfAccountInvalid() {
          // Some historical bugs mean we've allowed creation
          // of accounts with invalid email addresses. These
          // can never be verified, so the best we can do is
          // to delete them so the browser will stop polling.
          if (! sessionToken.emailVerified) {
            if (! validators.isValidEmailAddress(sessionToken.email)) {
              return db.deleteAccount(sessionToken)
                .then(
                  function () {
                    // Act as though we deleted the account asynchronously
                    // and caused the sessionToken to become invalid.
                    throw error.invalidToken('This account was invalid and has been deleted')
                  }
                )
            }
          }
          return P.resolve()
        }

        function createResponse() {

          var sessionVerified = sessionToken.tokenVerified
          var emailVerified = !! sessionToken.emailVerified

          // For backwards-compatibility reasons, the reported verification status
          // depends on whether the sessionToken was created with keys=true and
          // whether it has subsequently been verified.  If it was created with
          // keys=true then we musn't say verified=true until the session itself
          // has been verified.  Otherwise, desktop clients will attempt to use
          // an unverified session to connect to sync, and produce a very confusing
          // user experience.
          var isVerified = emailVerified
          if (sessionToken.mustVerify) {
            isVerified = isVerified && sessionVerified
          }

          return {
            email: sessionToken.email,
            verified: isVerified,
            sessionVerified: sessionVerified,
            emailVerified: emailVerified
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/resend_code',
      config: {
        auth: {
          strategy: 'sessionTokenWithVerificationStatus'
        },
        validate: {
          query: {
            service: validators.service
          },
          payload: {
            service: validators.service,
            redirectTo: validators.redirectTo(config.smtp.redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.RecoveryEmailResend', request)
        const sessionToken = request.auth.credentials
        const service = request.payload.service || request.query.service
        if (sessionToken.emailVerified && sessionToken.tokenVerified) {
          return reply({})
        }

        // Choose which type of email and code to resend
        let code, func, event
        if (sessionToken.tokenVerificationId) {
          code = sessionToken.tokenVerificationId
        } else {
          code = sessionToken.emailCode
        }

        if (! sessionToken.emailVerified) {
          func = mailer.sendVerifyCode
          event = 'verification'
        } else {
          func = mailer.sendVerifyLoginEmail
          event = 'confirmation'
        }

        return customs.check(
          request,
          sessionToken.email,
          'recoveryEmailResendCode')
          .then(func.bind(
            mailer,
            sessionToken,
            code,
            {
              service: service,
              timestamp: Date.now(),
              redirectTo: request.payload.redirectTo,
              resume: request.payload.resume,
              acceptLanguage: request.app.acceptLanguage,
              uaBrowser: sessionToken.uaBrowser,
              uaBrowserVersion: sessionToken.uaBrowserVersion,
              uaOS: sessionToken.uaOS,
              uaOSVersion: sessionToken.uaOSVersion,
              uaDeviceType: sessionToken.uaDeviceType
            }
          ))
          .then(() => request.emitMetricsEvent(`email.${event}.resent`))
          .then(
            () => reply({}),
            reply
          )
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      config: {
        validate: {
          query: {
            service: validators.service,
            reminder: isA.string().max(32).alphanum().optional()
          },
          payload: {
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            code: isA.string().min(32).max(32).regex(HEX_STRING).required(),
            service: validators.service,
            reminder: isA.string().max(32).alphanum().optional()
          }
        }
      },
      handler: function (request, reply) {
        const uidHex = request.payload.uid
        const uid = Buffer(uidHex, 'hex')
        const code = Buffer(request.payload.code, 'hex')
        const service = request.payload.service || request.query.service
        const reminder = request.payload.reminder || request.query.reminder

        log.begin('Account.RecoveryEmailVerify', request)

        // verify_code because we don't know what type this is yet, but
        // we want to record right away before anything could fail, so
        // we can see in a flow that a user tried to verify, even if it
        // failed right away.
        request.emitMetricsEvent('email.verify_code.clicked')

        db.account(uid)
          .then(
            (account) => {
              // This endpoint is not authenticated, so we need to look up
              // the target email address before we can check it with customs.
              return customs.check(request, account.email, 'recoveryEmailVerifyCode')
                .then(
                  () => account
                )
            }
          )
          .then(
            (account) => {
              const isAccountVerification = butil.buffersAreEqual(code, account.emailCode)
              let device
              return db.deviceFromTokenVerificationId(uid, code)
                .then(function (associatedDevice) {
                  device = associatedDevice
                }, function (err) {
                  if (err.errno !== error.ERRNO.DEVICE_UNKNOWN) {
                    log.error({
                      op: 'Account.RecoveryEmailVerify',
                      err: err,
                      uid: uidHex,
                      code: code
                    })
                  }
                })
                .then(function () {
                  /**
                   * Logic for account and token verification
                   *
                   * 1) Attempt to use code as tokenVerificationId to verify session.
                   *
                   * 2) An error is thrown if tokenVerificationId does not exist (check to see if email
                   *    verification code) or the tokenVerificationId does not correlate to the
                   *    account uid (damaged linked/spoofed account)
                   *
                   * 3) Verify account email if not already verified.
                   */
                  return db.verifyTokens(code, account)
                    .then(function () {
                      if (! isAccountVerification) {
                        // Don't log sign-in confirmation success for the account verification case
                        log.info({
                          op: 'account.signin.confirm.success',
                          uid: uidHex,
                          code: request.payload.code
                        })
                        request.emitMetricsEvent('account.confirmed', {
                          uid: uidHex
                        })
                        push.notifyUpdate(uid, 'accountConfirm')
                      }
                    })
                    .catch(function (err) {
                      if (err.errno === error.ERRNO.INVALID_VERIFICATION_CODE && isAccountVerification) {
                        // The code is just for the account, not for any sessions
                        return true
                      }
                      log.error({
                        op: 'account.signin.confirm.invalid',
                        uid: uidHex,
                        code: request.payload.code,
                        error: err
                      })
                      throw err
                    })
                    .then(function () {
                      if (device) {
                        push.notifyDeviceConnected(uidHex, device.name, device.id.toString('hex'))
                      }
                    })
                    .then(function () {

                      // If the account is already verified, the link may have been
                      // for sign-in confirmation or they may have been clicking a
                      // stale link. Silently succeed.
                      if (account.emailVerified) {
                        if (butil.buffersAreEqual(code, account.emailCode)) {
                          log.increment('account.already_verified')
                        }
                        return true
                      }

                      // Any matching code verifies the account
                      return db.verifyEmail(account)
                        .then(function () {
                          log.timing('account.verified', Date.now() - account.createdAt)
                          log.increment('account.verified')
                          return log.notifyAttachedServices('verified', request, {
                            email: account.email,
                            uid: account.uid,
                            locale: account.locale
                          })
                        })
                        .then(function () {
                          return request.emitMetricsEvent('account.verified', {
                            uid: uidHex
                          })
                        })
                        .then(function () {
                          if (reminder === 'first' || reminder === 'second') {
                            // if verified using a known reminder
                            var reminderOp = 'account.verified_reminder.' + reminder

                            log.increment(reminderOp)
                            // log to the mailer namespace that account was verified via a reminder
                            log.info({
                              op: 'mailer.send',
                              name: reminderOp
                            })
                            return request.emitMetricsEvent('account.reminder', {
                              uid: uidHex
                            })
                          }
                        })
                        .then(function () {
                          // send a push notification to all devices that the account changed
                          push.notifyUpdate(uid, 'accountVerify')
                          // remove verification reminders
                          verificationReminder.delete({
                            uid: uidHex
                          }).catch(function (err) {
                            log.error({ op: 'Account.RecoveryEmailVerify', err: err })
                          })
                        })
                        .then(function () {
                          // Our post-verification email is very specific to sync,
                          // so only send it if we're sure this is for sync.
                          if (service === 'sync') {
                            return mailer.sendPostVerifyEmail(
                              account.email,
                              {
                                acceptLanguage: request.app.acceptLanguage
                              }
                            )
                          }
                        })
                    })
                })
            }
          )
          .then(
            function () {
              reply({})
            },
            reply
          )
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
      path: '/account/login/send_unblock_code',
      config: {
        validate: {
          payload: {
            email: validators.email().required(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Account.SendUnblockCode', request)

        var email = request.payload.email
        var ip = request.app.clientAddress
        var emailRecord

        request.validateMetricsContext()

        // Store flowId and flowBeginTime to send in email
        let flowId, flowBeginTime
        if (request.payload.metricsContext) {
          flowId = request.payload.metricsContext.flowId
          flowBeginTime = request.payload.metricsContext.flowBeginTime
        }

        return customs.check(request, email, 'sendUnblockCode')
          .then(lookupAccount)
          .then(createUnblockCode)
          .then(mailUnblockCode)
          .then(() => request.emitMetricsEvent('account.login.sentUnblockCode'))
          .then(() => {
            reply({})
          }, reply)

        function lookupAccount() {
          return db.emailRecord(email)
            .then((record) => {
              emailRecord = record
              return record.uid
            })
        }

        function createUnblockCode(uid) {
          return db.createUnblockCode(uid)
        }

        function mailUnblockCode(code) {
          return getGeoData(ip)
            .then((geoData) => {
              return mailer.sendUnblockCode(emailRecord, code, userAgent.call({
                acceptLanguage: request.app.acceptLanguage,
                flowId: flowId,
                flowBeginTime: flowBeginTime,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone
              }, request.headers['user-agent'], log))
            })
        }
      }
    },
    {
      method: 'POST',
      path: '/account/login/reject_unblock_code',
      config: {
        validate: {
          payload: {
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            unblockCode: isA.string().regex(BASE_36).length(unblockCodeLen).required()
          }
        }
      },
      handler: function (request, reply) {
        var uid = Buffer(request.payload.uid, 'hex')
        var code = request.payload.unblockCode.toUpperCase()

        log.begin('Account.RejectUnblockCode', request)
        db.consumeUnblockCode(uid, code)
          .then(
            () => {
              log.info({
                op: 'account.login.rejectedUnblockCode',
                uid: request.payload.uid,
                unblockCode: code
              })
              return {}
            }
          ).then(reply, reply)
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
        var accountResetToken = request.auth.credentials
        var authPW = Buffer(request.payload.authPW, 'hex')
        var account, sessionToken, keyFetchToken, verifyHash, wrapKb, devicesToNotify
        var hasSessionToken = request.payload.sessionToken

        request.validateMetricsContext()

        let flowCompleteSignal
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed'
        } else {
          flowCompleteSignal = 'account.reset'
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal)

        return fetchDevicesToNotify()
          .then(resetAccountData)
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(recordSecurityEvent)
          .then(createResponse)
          .then(reply, reply)

        function fetchDevicesToNotify() {
          // We fetch the devices to notify before resetAccountData() because
          // db.resetAccount() deletes all the devices saved in the account.
          return db.devices(accountResetToken.uid)
            .then(
              function(devices) {
                devicesToNotify = devices
              }
            )
        }

        function resetAccountData () {
          let authSalt, password, wrapWrapKb
          return random(64)
            .then(bytes => {
              authSalt = bytes.slice(0, 32) // 0..31
              wrapWrapKb = bytes.slice(32) // 32..63
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
                // Notify the devices that the account has changed.
                push.notifyPasswordReset(accountResetToken.uid, devicesToNotify)

                return db.account(accountResetToken.uid)
              }
            )
            .then(
              function (accountData) {
                account = accountData
                return request.emitMetricsEvent('account.reset', {
                  uid: account.uid.toString('hex')
                })
              }
            )
            .then(
              function () {
                return log.notifyAttachedServices('reset', request, {
                  uid: account.uid.toString('hex') + '@' + config.domain,
                  generation: account.verifierSetAt
                })
              }
            )
            .then(
              function () {
                return customs.reset(account.email)
              }
            )
            .then(
              function () {
                return password.unwrap(account.wrapWrapKb)
              }
            )
            .then(
              function (wrapKbData) {
                wrapKb = wrapKbData
              }
            )
        }

        function createSessionToken () {
          if (hasSessionToken) {
            // Since the only way to reach this point is clicking a
            // link from the user's email, we create a verified sessionToken
            var sessionTokenOptions = {
              uid: account.uid,
              email: account.email,
              emailCode: account.emailCode,
              emailVerified: account.emailVerified,
              verifierSetAt: account.verifierSetAt
            }

            return db.createSessionToken(sessionTokenOptions, request.headers['user-agent'])
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
              emailVerified: account.emailVerified
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
          if (features.isSecurityHistoryTrackingEnabled()) {
             // don't block response recording db event
            db.securityEvent({
              name: 'account.reset',
              uid: account.uid,
              ipAddr: request.app.clientAddress,
              tokenId: sessionToken && sessionToken.tokenId
            })
          }
        }

        function createResponse () {
          // If no sessionToken, this could be a legacy client
          // attempting to reset an account password, return legacy response.
          if (! hasSessionToken) {
            return {}
          }


          var response = {
            uid: sessionToken.uid.toString('hex'),
            sessionToken: sessionToken.data.toString('hex'),
            verified: sessionToken.emailVerified,
            authAt: sessionToken.lastAuthAt()
          }

          if (requestHelper.wantsKeys(request)) {
            response.keyFetchToken = keyFetchToken.data.toString('hex')
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
        var authPW = Buffer(form.authPW, 'hex')
        var uid
        customs.check(
          request,
          form.email,
          'accountDestroy')
          .then(db.emailRecord.bind(db, form.email))
          .then(
            function (emailRecord) {
              uid = emailRecord.uid.toString('hex')

              return checkPassword(emailRecord, authPW, request.app.clientAddress)
                .then(
                  function (match) {
                    if (! match) {
                      throw error.incorrectPassword(emailRecord.email, form.email)
                    }
                    return db.deleteAccount(emailRecord)
                  }
                )
                .then(
                  function () {
                    return log.notifyAttachedServices('delete', request, {
                      uid: uid + '@' + config.domain
                    })
                  }
                )
                .then(
                  function () {
                    return request.emitMetricsEvent('account.deleted', {
                      uid: uid
                    })
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
    delete routes[0].config.validate.query._createdAt
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
