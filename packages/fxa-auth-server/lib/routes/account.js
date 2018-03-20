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
const authMethods = require('../authMethods')

const HEX_STRING = validators.HEX_STRING

const MS_ONE_HOUR = 1000 * 60 * 60
const MS_ONE_DAY = MS_ONE_HOUR * 24
const MS_ONE_WEEK = MS_ONE_DAY * 7
const MS_ONE_MONTH = MS_ONE_DAY * 30

module.exports = (log, db, mailer, Password, config, customs, signinUtils, push) => {
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
            return mailer.sendVerifyCode([], account, {
              code: account.emailCode,
              service: form.service || query.service,
              redirectTo: form.redirectTo,
              resume: form.resume,
              acceptLanguage: request.app.acceptLanguage,
              flowId,
              flowBeginTime,
              ip,
              location: request.app.geo.location,
              uaBrowser: sessionToken.uaBrowser,
              uaBrowserVersion: sessionToken.uaBrowserVersion,
              uaOS: sessionToken.uaOS,
              uaOSVersion: sessionToken.uaOSVersion,
              uaDeviceType: sessionToken.uaDeviceType,
              uid: sessionToken.uid
            })
              .then(function () {
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
      apidoc: {
        errors: [
          error.unknownAccount,
          error.requestBlocked,
          error.incorrectPassword,
          error.cannotLoginWithSecondaryEmail,
          error.invalidUnblockCode,
          error.cannotLoginWithEmail
        ]
      },
      config: {
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
            verificationMethod: validators.verificationMethod.optional()
          },
          payload: {
            email: validators.email().required(),
            authPW: isA.string().min(64).max(64).regex(HEX_STRING).required(),
            service: validators.service,
            redirectTo: isA.string().uri().optional(),
            resume: isA.string().optional(),
            reason: isA.string().max(16).optional(),
            unblockCode: signinUtils.validators.UNBLOCK_CODE,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: validators.verificationMethod.optional()
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
        const originalLoginEmail = request.payload.originalLoginEmail
        let verificationMethod = request.payload.verificationMethod || request.query.verificationMethod
        const requestNow = Date.now()

        let accountRecord, password, sessionToken, keyFetchToken, didSigninUnblock
        let securityEventRecency = Infinity, securityEventVerified = false

        request.validateMetricsContext()

        return checkCustomsAndLoadAccount()
          .then(checkEmailAndPassword)
          .then(checkSecurityHistory)
          .then(checkTotpToken)
          .then(createSessionToken)
          .then(sendSigninNotifications)
          .then(createKeyFetchToken)
          .then(createResponse)
          .then(reply, reply)

        function checkCustomsAndLoadAccount() {
          return signinUtils.checkCustomsAndLoadAccount(request, email).then((res) => {
            accountRecord = res.accountRecord
            // Remember whether they did a signin-unblock,
            // because we can use it to bypass token verification.
            didSigninUnblock = res.didSigninUnblock
          })
        }

        function checkEmailAndPassword() {
          return signinUtils.checkEmailAddress(accountRecord, email, originalLoginEmail)
            .then(() => {
              password = new Password(
                authPW,
                accountRecord.authSalt,
                accountRecord.verifierVersion
              )
              return signinUtils.checkPassword(accountRecord, password, request.app.clientAddress)
            })
            .then(match => {
              if (! match) {
                throw error.incorrectPassword(accountRecord.email, email)
              }
            })
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
              (err) => {
                // Security event history allows some convenience during login,
                // but errors here shouldn't fail the entire request.
                // so errors shouldn't stop the login attempt
                log.error({
                  op: 'Account.history.error',
                  err: err,
                  uid: accountRecord.uid
                })
              }
            )
        }

        function checkTotpToken () {
          // Check to see if the user has a TOTP token and it is verified and
          // enabled, if so then the verification method is automatically forced so that
          // they have to verify the token.
          return db.totpToken(accountRecord.uid)
            .then((result) => {
              if (result && result.verified && result.enabled) {
                verificationMethod = 'totp-2fa'
              }
            }, (err) => {
              if (err.errno === error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
                return
              }
              throw err
            })
        }

        function createSessionToken () {
          // All sessions are considered unverified by default.
          let needsVerificationId = true

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
          const mustVerifySession = needsVerificationId && (requestHelper.wantsKeys(request) || verificationMethod)

          return P.resolve()
            .then(() => {
              if (! needsVerificationId) {
                return []
              }
              return [random.hex(16), TokenCode()]
            })
            .spread((tokenVerificationId, tokenVerificationCode) => {
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
            .then(result => {
              sessionToken = result
            })
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

        function sendSigninNotifications() {
          return signinUtils.sendSigninNotifications(request, accountRecord, sessionToken, verificationMethod)
            .then(() => {
              // For new sync logins that don't send some other sort of email,
              // send an after-the-fact notification email so that the user
              // is aware that something happened on their account.
              if (accountRecord.primaryEmail.isVerified) {
                if (sessionToken.tokenVerified || ! sessionToken.mustVerify) {
                  if (requestHelper.wantsKeys(request)) {
                    const geoData = request.app.geo
                    const service = request.payload.service || request.query.service
                    const ip = request.app.clientAddress
                    let flowId, flowBeginTime
                    if (request.payload.metricsContext) {
                      flowId = request.payload.metricsContext.flowId
                      flowBeginTime = request.payload.metricsContext.flowBeginTime
                    }
                    mailer.sendNewDeviceLoginNotification(
                      accountRecord.emails,
                      accountRecord,
                      {
                        acceptLanguage: request.app.acceptLanguage,
                        flowId: flowId,
                        flowBeginTime: flowBeginTime,
                        ip: ip,
                        location: geoData.location,
                        service,
                        timeZone: geoData.timeZone,
                        uaBrowser: request.app.ua.browser,
                        uaBrowserVersion: request.app.ua.browserVersion,
                        uaOS: request.app.ua.os,
                        uaOSVersion: request.app.ua.osVersion,
                        uaDeviceType: request.app.ua.deviceType,
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
                  }
                }
              }
            })
        }

        function createKeyFetchToken() {
          if (requestHelper.wantsKeys(request)) {
            return signinUtils.createKeyFetchToken(request, accountRecord, password, sessionToken)
              .then(result => {
                keyFetchToken = result
              })
          }
        }

        function createResponse () {
          var response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            authAt: sessionToken.lastAuthAt()
          }

          if (keyFetchToken) {
            response.keyFetchToken = keyFetchToken.data
          }

          Object.assign(response, signinUtils.getSessionVerificationStatus(sessionToken, verificationMethod))

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
          strategies: [
            'sessionToken',
            'oauthToken'
          ]
        },
        response: {
          schema: {
            email: isA.string().optional(),
            locale: isA.string().optional().allow(null),
            authenticationMethods: isA.array().items(isA.string().required()).optional(),
            authenticatorAssuranceLevel: isA.number().min(0)
          }
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
        const res = {}
        db.account(uid)
          .then(account => {
            if (hasProfileItemScope('email')) {
              res.email = account.primaryEmail.email
            }
            if (hasProfileItemScope('locale')) {
              res.locale = account.locale
            }
            if (hasProfileItemScope('amr')) {
              return authMethods.availableAuthenticationMethods(db, account)
                .then(amrValues => {
                  res.authenticationMethods = Array.from(amrValues)
                  res.authenticatorAssuranceLevel = authMethods.maximumAssuranceLevel(amrValues)
                })
            }
          })
          .then(() => reply(res), reply)
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

              const password = new Password(authPW, emailRecord.authSalt, emailRecord.verifierVersion)
              return signinUtils.checkPassword(emailRecord, password, request.app.clientAddress)
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
