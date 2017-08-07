/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const butil = require('../crypto/butil')
const error = require('../error')
const isA = require('joi')
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema
const P = require('../promise')
const random = require('../crypto/random')
const validators = require('./validators')

const HEX_STRING = validators.HEX_STRING

module.exports = (log, db, mailer, config, customs, push) => {
  const getGeoData = require('../geodb')(log)
  const features = require('../features')(config)
  const verificationReminder = require('../verification-reminders')(log, db)

  return [
    {
      method: 'GET',
      path: '/recovery_email/check_can_add_secondary_address',
      config: {
        auth: {
          strategy: 'sessionToken'
        }
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailEnabled', request)

        const sessionToken = request.auth.credentials
        let isEnabled = false

        return db.account(sessionToken.uid)
          .then((account) =>{
            // Secondary emails are enabled if email address matches config and the session is verified
            if (features.isSecondaryEmailEnabled(account.email) && sessionToken.tokenVerified) {
              isEnabled = true
            }

            return reply({ ok: isEnabled })
          })
      }
    },
    {
      method: 'GET',
      path: '/recovery_email/status',
      config: {
        auth: {
          strategy: 'sessionToken'
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
      handler (request, reply) {
        log.begin('Account.RecoveryEmailStatus', request)

        const sessionToken = request.auth.credentials

        if (request.query && request.query.reason === 'push') {
          // log to the push namespace that account was verified via push
          log.info({
            op: 'push.pushToDevices',
            name: 'recovery_email_reason.push'
          })
        }
        cleanUpIfAccountInvalid()
          .then(createResponse)
          .then(reply, reply)

        function cleanUpIfAccountInvalid () {
          const now = new Date().getTime()
          const staleTime = now - config.emailStatusPollingTimeout

          if (sessionToken.createdAt < staleTime) {
            log.info({
              op: 'recovery_email.status.stale',
              email: sessionToken.email,
              createdAt: sessionToken.createdAt,
              lifeTime: sessionToken.lifetime,
              emailVerified: sessionToken.emailVerified,
              tokenVerified: sessionToken.tokenVerified,
              browser: `${sessionToken.uaBrowser} ${sessionToken.uaBrowserVersion}`
            })
          }
          if (! sessionToken.emailVerified) {
            // Some historical bugs mean we've allowed creation
            // of accounts with invalid email addresses. These
            // can never be verified, so the best we can do is
            // to delete them so the browser will stop polling.
            if (! validators.isValidEmailAddress(sessionToken.email)) {
              return db.deleteAccount(sessionToken)
                .then(() => {
                  // Act as though we deleted the account asynchronously
                  // and caused the sessionToken to become invalid.
                  throw error.invalidToken('This account was invalid and has been deleted')
                })
            }
          }

          return P.resolve()
        }

        function createResponse () {
          const sessionVerified = sessionToken.tokenVerified
          const emailVerified = !! sessionToken.emailVerified

          // For backwards-compatibility reasons, the reported verification status
          // depends on whether the sessionToken was created with keys=true and
          // whether it has subsequently been verified.  If it was created with
          // keys=true then we musn't say verified=true until the session itself
          // has been verified.  Otherwise, desktop clients will attempt to use
          // an unverified session to connect to sync, and produce a very confusing
          // user experience.
          let isVerified = emailVerified
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
          strategy: 'sessionToken'
        },
        validate: {
          query: {
            service: validators.service
          },
          payload: {
            email: validators.email().optional(),
            service: validators.service,
            redirectTo: validators.redirectTo(config.smtp.redirectDomain).optional(),
            resume: isA.string().max(2048).optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        }
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailResend', request)

        const email = request.payload.email
        const sessionToken = request.auth.credentials
        const service = request.payload.service || request.query.service

        // This endpoint can verify multiple types of codes, set these values once it
        // is known what is being verified.
        let code
        let verifyFunction
        let event
        let emails = []

        // Return immediately if this session or token is already verified. Only exception
        // is if the email param has been specified, which means that this is
        // a request to verify a secondary email.
        if (sessionToken.emailVerified && sessionToken.tokenVerified && ! email) {
          return reply({})
        }

        customs.check(request, sessionToken.email, 'recoveryEmailResendCode')
          .then(setVerifyCode)
          .then(setVerifyFunction)
          .then(() => {
            const mailerOpts = {
              code: code,
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

            return verifyFunction(emails, sessionToken, mailerOpts)
          })
          .then(() => request.emitMetricsEvent(`email.${event}.resent`))
          .then(
            () => reply({}),
            reply
          )

        function setVerifyCode () {
          return db.accountEmails(sessionToken.uid)
            .then((emailData) => {
              if (email) {
                // If an email address is specified in payload, this is a request to verify
                // a secondary email. This should return the corresponding email code for verification.
                let emailVerified = false
                emailData.some((userEmail) => {
                  if (userEmail.normalizedEmail === email.toLowerCase()) {
                    code = userEmail.emailCode
                    emailVerified = userEmail.isVerified
                    emails = [userEmail]
                    return true
                  }
                })

                // Don't resend code for already verified emails
                if (emailVerified) {
                  return reply({})
                }
              } else if (sessionToken.tokenVerificationId) {
                emails = emailData
                code = sessionToken.tokenVerificationId
              } else {
                code = sessionToken.emailCode
              }
            })
        }

        function setVerifyFunction () {
          if (email) {
            verifyFunction = mailer.sendVerifySecondaryEmail
            event = 'verification_email'
          } else if (! sessionToken.emailVerified) {
            verifyFunction = mailer.sendVerifyCode
            event = 'verification'
          } else {
            verifyFunction = mailer.sendVerifyLoginEmail
            event = 'confirmation'
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      config: {
        validate: {
          query: {
            service: validators.service,
            reminder: isA.string().max(32).alphanum().optional(),
            type: isA.string().max(32).alphanum().optional()
          },
          payload: {
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            code: isA.string().min(32).max(32).regex(HEX_STRING).required(),
            service: validators.service,
            reminder: isA.string().max(32).alphanum().optional(),
            type: isA.string().max(32).alphanum().optional(),
            marketingOptIn: isA.boolean()
          }
        }
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailVerify', request)

        const uid = request.payload.uid
        const code = request.payload.code
        const service = request.payload.service || request.query.service
        const reminder = request.payload.reminder || request.query.reminder
        const type = request.payload.type || request.query.type
        const marketingOptIn = request.payload.marketingOptIn

        // verify_code because we don't know what type this is yet, but
        // we want to record right away before anything could fail, so
        // we can see in a flow that a user tried to verify, even if it
        // failed right away.
        request.emitMetricsEvent('email.verify_code.clicked')

        /**
         * Below is a summary of the verify_code flow. This flow is used to verify emails, sign-in and
         * account codes.
         *
         * 1) Check request against customs server, proceed if valid.
         *
         * 2) If type=`secondary` then this is an email code and verify it
         *    accordingly.
         *
         * 3) Otherwise attempt to verify code as sign-in code then account code.
         */
        return db.account(uid)
          .then((account) => {
            // This endpoint is not authenticated, so we need to look up
            // the target email address before we can check it with customs.
            return customs.check(request, account.email, 'recoveryEmailVerifyCode')
              .then(() => account)
          })
          .then((account) => {
            // Check if param `type` is specified and equal to `secondary`
            // If so, verify the secondary email and respond
            if (type && type === 'secondary' && features.isSecondaryEmailEnabled(account.email)) {
              let matchedEmail
              return db.accountEmails(account.uid)
                .then((emails) => {
                  const isEmailVerification = emails.some((email) => {
                    if (email.emailCode && (code === email.emailCode)) {
                      matchedEmail = email
                      log.info({
                        op: 'account.verifyEmail.secondary.started',
                        uid: uid,
                        code: request.payload.code
                      })
                      return true
                    }
                  })

                  // Attempt to verify email token not associated with account
                  if (! isEmailVerification) {
                    throw error.invalidVerificationCode()
                  }

                  // User is attempting to verify a secondary email that has already been verified.
                  // Silently succeed and don't send post verification email.
                  if (matchedEmail.isVerified) {
                    log.info({
                      op: 'account.verifyEmail.secondary.already-verified',
                      uid: uid,
                      code: request.payload.code
                    })
                    return P.resolve()
                  }

                  return db.verifyEmail(account, code)
                    .then(() => {
                      log.info({
                        op: 'account.verifyEmail.secondary.confirmed',
                        uid: uid,
                        code: request.payload.code
                      })

                      return mailer.sendPostVerifySecondaryEmail([], account, {
                        acceptLanguage: request.app.acceptLanguage,
                        secondaryEmail: matchedEmail.email
                      })
                    })
                })
            }

            const isAccountVerification = butil.buffersAreEqual(code, account.emailCode)
            let device

            return db.deviceFromTokenVerificationId(uid, code)
              .then(
                associatedDevice => {
                  device = associatedDevice
                },
                err => {
                  if (err.errno !== error.ERRNO.DEVICE_UNKNOWN) {
                    log.error({
                      op: 'Account.RecoveryEmailVerify',
                      err: err,
                      uid: uid,
                      code: code
                    })
                  }
                }
              )
              .then(() => {
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
              })
              .then(() => {
                if (! isAccountVerification) {
                  // Don't log sign-in confirmation success for the account verification case
                  log.info({
                    op: 'account.signin.confirm.success',
                    uid: uid,
                    code: request.payload.code
                  })
                  request.emitMetricsEvent('account.confirmed', {
                    uid: uid
                  })
                  push.notifyUpdate(uid, 'accountConfirm')
                }
              })
              .catch(err => {
                if (err.errno === error.ERRNO.INVALID_VERIFICATION_CODE && isAccountVerification) {
                  // The code is just for the account, not for any sessions
                  return
                }

                log.error({
                  op: 'account.signin.confirm.invalid',
                  uid: uid,
                  code: request.payload.code,
                  error: err
                })
                throw err
              })
              .then(() => {
                if (device) {
                  push.notifyDeviceConnected(uid, device.name, device.id)
                }
              })
              .then(() => {
                // If the account is already verified, the link may have been
                // for sign-in confirmation or they may have been clicking a
                // stale link. Silently succeed.
                if (account.emailVerified) {
                  return
                }

                // Any matching code verifies the account
                return db.verifyEmail(account, account.emailCode)
                  .then(() => {
                    return P.all([
                      log.notifyAttachedServices('verified', request, {
                        email: account.email,
                        uid: account.uid,
                        locale: account.locale,
                        marketingOptIn: marketingOptIn ? true : undefined
                      }),
                      request.emitMetricsEvent('account.verified', {
                        uid: uid
                      })
                    ])
                  })
                  .then(() => {
                    if (reminder === 'first' || reminder === 'second') {
                      const reminderOp = 'account.verified_reminder.' + reminder
                      log.info({
                        op: 'mailer.send',
                        name: reminderOp
                      })

                      return request.emitMetricsEvent('account.reminder', { uid: uid })
                    }
                  })
                  .then(() => {
                    // send a push notification to all devices that the account changed
                    push.notifyUpdate(uid, 'accountVerify')

                    // remove verification reminders
                    verificationReminder.delete({
                      uid: uid
                    }).catch(err => {
                      log.error({op: 'Account.RecoveryEmailVerify', err: err})
                    })
                  })
                  .then(() => {
                    // Our post-verification email is very specific to sync,
                    // so only send it if we're sure this is for sync.
                    if (service === 'sync') {
                      return mailer.sendPostVerifyEmail([], account, {
                        acceptLanguage: request.app.acceptLanguage
                      })
                    }
                  })
              })
          })
          .then(
            () => reply({}),
            reply
          )
      }
    },
    {
      method: 'GET',
      path: '/recovery_emails',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        response: {
          schema: isA.array().items(
            isA.object({
              verified: isA.boolean().required(),
              isPrimary: isA.boolean().required(),
              email: validators.email().required()
            }))
        }
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailEmails', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid

        return db.account(uid)
          .then((account) => {

            if (! features.isSecondaryEmailEnabled(account.email)) {
              throw error.featureNotEnabled()
            }

            return createResponse(account.emails)
          })
          .done(reply, reply)

        function createResponse (emails) {
          return emails.map((email) => ({
            email: email.email,
            isPrimary: !! email.isPrimary,
            verified: !! email.isVerified
          }))
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            email: validators.email().required()
          }
        },
        response: {}
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailCreate', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const primaryEmail = sessionToken.email
        const ip = request.app.clientAddress
        const email = request.payload.email
        const emailData = {
          email: email,
          normalizedEmail: email.toLowerCase(),
          isVerified: false,
          isPrimary: false,
          uid: uid
        }

        customs.check(request, primaryEmail, 'createEmail')
          .then(() => {
            return db.account(uid)
          })
          .then((account) => {
            if (! features.isSecondaryEmailEnabled(account.email)) {
              return reply(error.featureNotEnabled())
            }

            if (! sessionToken.emailVerified) {
              throw error.unverifiedAccount()
            }

            if (sessionToken.tokenVerificationId) {
              throw error.unverifiedSession()
            }

            if (sessionToken.email.toLowerCase() === email.toLowerCase()) {
              throw error.yourPrimaryEmailExists()
            }
          })
          .then(deleteAccountIfUnverified)
          .then(generateRandomValues)
          .then(createEmail)
          .then(sendEmailVerification)
          .then(
            () => reply({}),
            reply
          )

        function deleteAccountIfUnverified() {
          return db.getSecondaryEmail(email)
            .then((secondaryEmailRecord) => {
              if (secondaryEmailRecord.isPrimary) {
                if (secondaryEmailRecord.isVerified) {
                  throw error.verifiedPrimaryEmailAlreadyExists()
                }

                const msSinceCreated = Date.now() - secondaryEmailRecord.createdAt
                const minUnverifiedAccountTime = config.secondaryEmail.minUnverifiedAccountTime
                if (msSinceCreated >= minUnverifiedAccountTime) {
                  return db.deleteAccount(secondaryEmailRecord)
                } else {
                  throw error.unverifiedPrimaryEmailNewlyCreated()
                }
              }

              // Only delete secondary email if it is unverified and does not belong
              // to the current user.
              if (! secondaryEmailRecord.isVerified && ! butil.buffersAreEqual(secondaryEmailRecord.uid, uid)) {
                return db.deleteEmail(secondaryEmailRecord.uid, secondaryEmailRecord.email)
              }
            })
            .catch((err) => {
              if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
                throw err
              }
            })
        }

        function generateRandomValues () {
          return random.hex(16)
            .then(hex => {
              emailData.emailCode = hex
            })
        }

        function createEmail () {
          return db.createEmail(uid, emailData)
        }

        function sendEmailVerification () {
          return getGeoData(ip)
            .then((geoData) => {
              return mailer.sendVerifySecondaryEmail([emailData], sessionToken, {
                code: emailData.emailCode,
                acceptLanguage: request.app.acceptLanguage,
                email: emailData.email,
                primaryEmail: primaryEmail,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: sessionToken.uaBrowser,
                uaBrowserVersion: sessionToken.uaBrowserVersion,
                uaOS: sessionToken.uaOS,
                uaOSVersion: sessionToken.uaOSVersion,
              })
            })
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/destroy',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            email: validators.email().required()
          }
        },
        response: {}
      },
      handler (request, reply) {
        log.begin('Account.RecoveryEmailDestroy', request)

        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const primaryEmail = sessionToken.email
        const email = request.payload.email
        let account

        customs.check(request, primaryEmail, 'deleteEmail')
          .then(() => {
            return db.account(uid)
          })
          .then((result) => {
            account = result

            if (! features.isSecondaryEmailEnabled(account.email)) {
              throw error.featureNotEnabled()
            }

            if (sessionToken.tokenVerificationId) {
              throw error.unverifiedSession()
            }
          })
          .then(deleteEmail)
          .then(() => {
            // Don't notify the secondary email that it has been removed from the account.
            // We only want the primary email and all *other* verified emails to get this.
            const emails = account.emails.filter((item) => {
              if (item.normalizedEmail !== email.toLowerCase()) {
                return item
              }
            })
            return mailer.sendPostRemoveSecondaryEmail(emails, account, {secondaryEmail: email})
          })
          .then(
            () => reply({}),
            reply
          )

        function deleteEmail () {
          return db.deleteEmail(uid, email.toLowerCase())
        }
      }
    },
    {
      method: 'POST',
      path: '/recovery_email/set_primary',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            email: validators.email().required()
          }
        },
        response: {}
      },
      handler: function (request, reply) {
        const sessionToken = request.auth.credentials
        const uid = sessionToken.uid
        const primaryEmail = sessionToken.email
        const email = request.payload.email

        log.begin('Account.RecoveryEmailSetPrimary', request)

        customs.check(request, primaryEmail, 'setPrimaryEmail')
          .then(() => {
            return db.account(uid)
          })
          .then((account) => {
            // If a user changes their primary email, then they will still
            // have access to secondary emails because we check against the original
            // account email.
            if (! features.isSecondaryEmailEnabled(account.email)) {
              throw error.featureNotEnabled()
            }

            if (sessionToken.tokenVerificationId) {
              throw error.unverifiedSession()
            }
          })
          .then(setPrimaryEmail)
          .done(() => {
            reply({})
          }, reply)

        function setPrimaryEmail() {
          return db.getSecondaryEmail(email)
            .then((email) => {
              if (email.uid !== uid) {
                throw error.cannotChangeEmailToUnownedEmail()
              }

              if (! email.isVerified) {
                throw error.cannotChangeEmailToUnverifiedEmail()
              }

              if (email.isPrimary) {
                return
              }

              return db.setPrimaryEmail(uid, email.normalizedEmail)
            })
            .then(() => {
              push.notifyProfileUpdated(uid)
            })
        }
      }
    }
  ]
}

