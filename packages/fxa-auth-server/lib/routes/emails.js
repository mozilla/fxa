/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const butil = require('../crypto/butil');
const emailUtils = require('./utils/email');
const error = require('../error');
const isA = require('@hapi/joi');
const random = require('../crypto/random');
const Sentry = require('@sentry/node');
const validators = require('./validators');

const HEX_STRING = validators.HEX_STRING;
const MAX_SECONDARY_EMAILS = 3;

async function updateZendeskPrimaryEmail(
  zendeskClient,
  uid,
  currentPrimaryEmail,
  newPrimaryEmail
) {
  const { result: searchResult } = await zendeskClient.searchQueryAll(
    `type:user user_id:${uid}`
  );
  const zenUser = searchResult.find(user => user.email === currentPrimaryEmail);
  if (!zenUser) {
    return;
  }
  const { result: identityResult } = await zendeskClient.listIdentities(
    zenUser.id
  );
  const primaryIdentity = identityResult.find(
    identity =>
      identity.type === 'email' &&
      identity.primary &&
      identity.value !== newPrimaryEmail
  );
  if (!primaryIdentity) {
    return;
  }
  return zendeskClient.updateIdentity(zenUser.id, primaryIdentity.id, {
    identity: {
      verified: true,
      value: newPrimaryEmail,
    },
  });
}

/**
 * Update the primary email in Stripe
 *
 * @param {import('../payments/stripe').StripeHelper} stripeHelper
 * @param {string} uid
 * @param {string} currentPrimaryEmail
 * @param {string} newPrimaryEmail
 * @returns {Promise<void | import('stripe').Stripe.Customer>}
 */
async function updateStripeEmail(
  stripeHelper,
  uid,
  currentPrimaryEmail,
  newPrimaryEmail
) {
  const customer = await stripeHelper.fetchCustomer(uid, currentPrimaryEmail);
  if (!customer) {
    // No customer to update, or already updated.
    return;
  }
  return stripeHelper.stripe.customers.update(customer.id, {
    email: newPrimaryEmail,
  });
}

module.exports = (
  log,
  db,
  mailer,
  config,
  customs,
  push,
  verificationReminders,
  signupUtils,
  zendeskClient,
  /** @type import('../payments/stripe').StripeHelper */
  stripeHelper
) => {
  const REMINDER_PATTERN = new RegExp(
    `^(?:${verificationReminders.keys.join('|')})$`
  );

  const otpOptions = config.otp;
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);

  return [
    {
      method: 'GET',
      path: '/recovery_email/status',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            reason: isA
              .string()
              .max(16)
              .optional(),
          },
        },
        response: {
          schema: {
            // There's code in the handler that checks for a valid email,
            // no point adding overhead by doing it again here.
            email: isA.string().required(),
            verified: isA.boolean().required(),
            sessionVerified: isA.boolean().optional(),
            emailVerified: isA.boolean().optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailStatus', request);

        const sessionToken = request.auth.credentials;
        if (request.query && request.query.reason === 'push') {
          // log to the push namespace that account was verified via push
          log.info('push.pushToDevices', {
            name: 'recovery_email_reason.push',
          });
        }

        await cleanUpIfAccountInvalid();
        return createResponse();

        async function cleanUpIfAccountInvalid() {
          const now = new Date().getTime();
          const staleTime = now - config.emailStatusPollingTimeout;

          if (sessionToken.createdAt < staleTime) {
            log.info('recovery_email.status.stale', {
              email: sessionToken.email,
              createdAt: sessionToken.createdAt,
              lifeTime: sessionToken.lifetime,
              emailVerified: sessionToken.emailVerified,
              tokenVerified: sessionToken.tokenVerified,
              browser: `${sessionToken.uaBrowser} ${sessionToken.uaBrowserVersion}`,
            });
          }
          if (!sessionToken.emailVerified) {
            // Some historical bugs mean we've allowed creation
            // of accounts with invalid email addresses. These
            // can never be verified, so the best we can do is
            // to delete them so the browser will stop polling.
            if (!validators.isValidEmailAddress(sessionToken.email)) {
              await db.deleteAccount(sessionToken);
              log.info('accountDeleted.invalidEmailAddress', {
                ...sessionToken,
              });
              // Act as though we deleted the account asynchronously
              // and caused the sessionToken to become invalid.
              throw error.invalidToken(
                'This account was invalid and has been deleted'
              );
            }
          }
        }

        function createResponse() {
          const sessionVerified = sessionToken.tokenVerified;
          const emailVerified = !!sessionToken.emailVerified;

          // For backwards-compatibility reasons, the reported verification status
          // depends on whether the sessionToken was created with keys=true and
          // whether it has subsequently been verified.  If it was created with
          // keys=true then we musn't say verified=true until the session itself
          // has been verified.  Otherwise, desktop clients will attempt to use
          // an unverified session to connect to sync, and produce a very confusing
          // user experience.
          let isVerified = emailVerified;
          if (sessionToken.mustVerify) {
            isVerified = isVerified && sessionVerified;
          }

          return {
            email: sessionToken.email,
            verified: isVerified,
            sessionVerified: sessionVerified,
            emailVerified: emailVerified,
          };
        }
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/resend_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            service: validators.service,
            type: isA
              .string()
              .max(32)
              .alphanum()
              .allow(['upgradeSession'])
              .optional(),
          },
          payload: {
            email: validators.email().optional(),
            service: validators.service,
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA
              .string()
              .max(2048)
              .optional(),
            style: isA
              .string()
              .allow(['trailhead'])
              .optional(),
            type: isA
              .string()
              .max(32)
              .alphanum()
              .allow(['upgradeSession'])
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailResend', request);

        const email = request.payload.email;
        const sessionToken = request.auth.credentials;
        const service = request.payload.service || request.query.service;
        const type = request.payload.type || request.query.type;
        const ip = request.app.clientAddress;
        const geoData = request.app.geo;
        const style = request.payload.style;

        // This endpoint can resend multiple types of codes, set these values once it
        // is known what is being verified.
        let code;
        let verifyFunction;
        let event;
        let emails = [];

        // Return immediately if this session or token is already verified. Only exception
        // is if the email param has been specified, which means that this is
        // a request to verify a secondary email.
        if (
          sessionToken.emailVerified &&
          sessionToken.tokenVerified &&
          !email
        ) {
          return {};
        }

        await customs.check(
          request,
          sessionToken.email,
          'recoveryEmailResendCode'
        );

        if (!(await setVerifyCode())) {
          return {};
        }

        setVerifyFunction();

        const { flowId, flowBeginTime } = await request.app.metricsContext;

        const mailerOpts = {
          code,
          deviceId: sessionToken.deviceId,
          flowId,
          flowBeginTime,
          service,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          timestamp: Date.now(),
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          acceptLanguage: request.app.acceptLanguage,
          uaBrowser: sessionToken.uaBrowser,
          uaBrowserVersion: sessionToken.uaBrowserVersion,
          uaOS: sessionToken.uaOS,
          uaOSVersion: sessionToken.uaOSVersion,
          uaDeviceType: sessionToken.uaDeviceType,
          uid: sessionToken.uid,
          style,
        };

        await verifyFunction(emails, sessionToken, mailerOpts);
        await request.emitMetricsEvent(`email.${event}.resent`);
        return {};

        // Returns a boolean to indicate whether to send email.
        async function setVerifyCode() {
          const emailData = await db.accountEmails(sessionToken.uid);

          if (email) {
            // If an email address is specified in payload, this is a request to verify
            // a secondary email. This should return the corresponding email code for verification.
            const foundEmail = emailData.find(
              userEmail => userEmail.normalizedEmail === email.toLowerCase()
            );

            // This user is attempting to verify a secondary email that doesn't belong to the account.
            if (!foundEmail) {
              throw error.cannotResendEmailCodeToUnownedEmail();
            }

            emails = [foundEmail];
            code = foundEmail.emailCode;
            return !foundEmail.isVerified;
          } else if (sessionToken.tokenVerificationId) {
            emails = emailData;
            code = sessionToken.tokenVerificationId;

            // Check to see if this account has a verified TOTP token. If so, then it should
            // not be allowed to bypass TOTP requirement by sending a sign-in confirmation email.
            try {
              const result = await db.totpToken(sessionToken.uid);

              if (result && result.verified && result.enabled) {
                return false;
              }
              return true;
            } catch (err) {
              if (err.errno === error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
                return true;
              }
              throw err;
            }
          } else {
            code = sessionToken.emailCode;
            return true;
          }
        }

        function setVerifyFunction() {
          if (type && type === 'upgradeSession') {
            verifyFunction = mailer.sendVerifyPrimaryEmail;
            event = 'verification_email_primary';
          } else if (email) {
            verifyFunction = mailer.sendVerifySecondaryEmail;
            event = 'verification_email';
          } else if (!sessionToken.emailVerified) {
            verifyFunction = mailer.sendVerifyEmail;
            event = 'verification';
          } else {
            verifyFunction = mailer.sendVerifyLoginEmail;
            event = 'confirmation';
          }
        }
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/verify_code',
      options: {
        validate: {
          payload: {
            uid: isA
              .string()
              .max(32)
              .regex(HEX_STRING)
              .required(),
            code: isA
              .string()
              .min(32)
              .max(32)
              .regex(HEX_STRING)
              .required(),
            service: validators.service,
            reminder: isA
              .string()
              .regex(REMINDER_PATTERN)
              .optional(),
            type: isA
              .string()
              .max(32)
              .alphanum()
              .optional(),
            style: isA
              .string()
              .allow(['trailhead'])
              .optional(),
            marketingOptIn: isA.boolean(),
            newsletters: validators.newsletters,
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailVerify', request);

        const { code, service, type, uid } = request.payload;

        // verify_code because we don't know what type this is yet, but
        // we want to record right away before anything could fail, so
        // we can see in a flow that a user tried to verify, even if it
        // failed right away.
        request.emitMetricsEvent('email.verify_code.clicked');

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
        const account = await db.account(uid);

        // This endpoint is not authenticated, so we need to look up
        // the target email address before we can check it with customs.
        await customs.check(request, account.email, 'recoveryEmailVerifyCode');
        // Check if param `type` is specified and equal to `secondary`
        // If so, verify the secondary email and respond
        if (type && type === 'secondary') {
          await verifySecondaryEmail(account);
          return {};
        }

        const isAccountVerification = butil.buffersAreEqual(
          code,
          account.emailCode
        );

        let device;

        try {
          device = await db.deviceFromTokenVerificationId(uid, code);
        } catch (err) {
          if (err.errno !== error.ERRNO.DEVICE_UNKNOWN) {
            log.error('Account.RecoveryEmailVerify', {
              err,
              uid,
              code,
            });
          }
        }

        await accountAndTokenVerification(isAccountVerification, account);

        if (device) {
          const devices = await request.app.devices;
          const otherDevices = devices.filter(d => d.id !== device.id);
          await push.notifyDeviceConnected(uid, otherDevices, device.name);
        }

        // If the account is already verified, the link may have been
        // for sign-in confirmation or they may have been clicking a
        // stale link. Silently succeed.
        if (account.emailVerified) {
          return {};
        }

        // Any matching code verifies the account
        await signupUtils.verifyAccount(request, account, request.payload);

        return {};

        async function verifySecondaryEmail(account) {
          let matchedEmail;
          const emails = await db.accountEmails(uid);
          const isEmailVerification = emails.some(email => {
            if (email.emailCode && code === email.emailCode) {
              matchedEmail = email;
              log.info('account.verifyEmail.secondary.started', {
                uid,
                code,
              });
              return true;
            }
          });

          // Attempt to verify email token not associated with account
          if (!isEmailVerification) {
            throw error.invalidVerificationCode();
          }

          // User is attempting to verify a secondary email that has already been verified.
          // Silently succeed and don't send post verification email.
          if (matchedEmail.isVerified) {
            log.info('account.verifyEmail.secondary.already-verified', {
              uid,
              code,
            });
            return;
          }

          await db.verifyEmail(account, code);
          log.info('account.verifyEmail.secondary.confirmed', {
            uid,
            code,
          });

          await mailer.sendPostVerifySecondaryEmail([], account, {
            acceptLanguage: request.app.acceptLanguage,
            secondaryEmail: matchedEmail.email,
            service,
            uid,
          });
        }

        async function accountAndTokenVerification(
          isAccountVerification,
          account
        ) {
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
          try {
            await db.verifyTokens(code, account);

            if (!isAccountVerification) {
              // Don't log sign-in confirmation success for the account verification case
              log.info('account.signin.confirm.success', { uid, code });

              request.emitMetricsEvent('account.confirmed', { uid });
              const devices = await request.app.devices;
              await push.notifyAccountUpdated(uid, devices, 'accountConfirm');
            }
          } catch (err) {
            if (
              err.errno === error.ERRNO.INVALID_VERIFICATION_CODE &&
              isAccountVerification
            ) {
              // The code is just for the account, not for any sessions
              return;
            }

            log.error('account.signin.confirm.invalid', {
              err,
              uid,
              code,
            });
            throw err;
          }
        }
      },
    },
    {
      method: 'GET',
      path: '/recovery_emails',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA.array().items(
            isA.object({
              verified: isA.boolean().required(),
              isPrimary: isA.boolean().required(),
              email: validators.email().required(),
            })
          ),
        },
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailEmails', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        const account = await db.account(uid);
        return account.emails.map(email => ({
          email: email.email,
          isPrimary: !!email.isPrimary,
          verified: !!email.isVerified,
        }));
      },
    },
    {
      method: 'POST',
      path: '/recovery_email',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
            verificationMethod: validators.verificationMethod,
          },
        },
        response: {},
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailCreate', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;
        const primaryEmail = sessionToken.email;
        const ip = request.app.clientAddress;
        const { email, verificationMethod } = request.payload;
        const emailData = {
          email: email,
          normalizedEmail: email.toLowerCase(),
          isVerified: false,
          isPrimary: false,
          uid: uid,
        };

        await customs.check(request, primaryEmail, 'createEmail');

        const account = await db.account(uid);
        const secondaryEmails = account.emails.filter(
          email => !email.isPrimary
        );
        // This is compared against all secondary email
        // records, both verified and unverified
        if (secondaryEmails.length >= MAX_SECONDARY_EMAILS) {
          throw error.maxSecondaryEmailsReached();
        }

        if (!sessionToken.emailVerified) {
          throw error.unverifiedAccount();
        }

        if (sessionToken.tokenVerificationId) {
          throw error.unverifiedSession();
        }

        if (sessionToken.email.toLowerCase() === email.toLowerCase()) {
          throw error.yourPrimaryEmailExists();
        }

        await deleteAccountIfUnverified();

        const hex = await random.hex(16);
        emailData.emailCode = hex;

        await db.createEmail(uid, emailData);

        const geoData = request.app.geo;
        try {
          switch (verificationMethod) {
            case 'email-otp':
              await mailer.sendVerifySecondaryCodeEmail(
                [emailData],
                sessionToken,
                {
                  code: otpUtils.generateOtpCode(hex, otpOptions),
                  deviceId: sessionToken.deviceId,
                  acceptLanguage: request.app.acceptLanguage,
                  email: emailData.email,
                  primaryEmail,
                  ip,
                  location: geoData.location,
                  timeZone: geoData.timeZone,
                  uaBrowser: sessionToken.uaBrowser,
                  uaBrowserVersion: sessionToken.uaBrowserVersion,
                  uaOS: sessionToken.uaOS,
                  uaOSVersion: sessionToken.uaOSVersion,
                  uid,
                }
              );
              break;
            default:
              await mailer.sendVerifySecondaryEmail([emailData], sessionToken, {
                code: emailData.emailCode,
                deviceId: sessionToken.deviceId,
                acceptLanguage: request.app.acceptLanguage,
                email: emailData.email,
                primaryEmail,
                ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: sessionToken.uaBrowser,
                uaBrowserVersion: sessionToken.uaBrowserVersion,
                uaOS: sessionToken.uaOS,
                uaOSVersion: sessionToken.uaOSVersion,
                uid,
              });
          }
        } catch (err) {
          log.error('mailer.sendVerifySecondaryEmail', { err: err });
          await db.deleteEmail(emailData.uid, emailData.normalizedEmail);
          throw emailUtils.sendError(err, true);
        }

        return {};

        async function deleteAccountIfUnverified() {
          try {
            const secondaryEmailRecord = await db.getSecondaryEmail(email);
            if (secondaryEmailRecord.isPrimary) {
              if (secondaryEmailRecord.isVerified) {
                throw error.verifiedPrimaryEmailAlreadyExists();
              }

              const msSinceCreated =
                Date.now() - secondaryEmailRecord.createdAt;
              const minUnverifiedAccountTime =
                config.secondaryEmail.minUnverifiedAccountTime;
              if (msSinceCreated >= minUnverifiedAccountTime) {
                await db.deleteAccount(secondaryEmailRecord);
                log.info('accountDeleted.unverifiedSecondaryEmail', {
                  ...secondaryEmailRecord,
                });
                return;
              } else {
                throw error.unverifiedPrimaryEmailNewlyCreated();
              }
            }

            // Only delete secondary email if it is unverified and does not belong
            // to the current user.
            if (
              !secondaryEmailRecord.isVerified &&
              !butil.buffersAreEqual(secondaryEmailRecord.uid, uid)
            ) {
              await db.deleteEmail(
                secondaryEmailRecord.uid,
                secondaryEmailRecord.email
              );
              return;
            }
          } catch (err) {
            if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
              throw err;
            }
          }
        }
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/destroy',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
          },
        },
        response: {},
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailDestroy', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;
        const primaryEmail = sessionToken.email;
        const email = request.payload.email;

        await customs.check(request, primaryEmail, 'deleteEmail');
        const account = await db.account(uid);

        if (sessionToken.tokenVerificationId) {
          throw error.unverifiedSession();
        }

        await db.deleteEmail(uid, email.toLowerCase());
        await db.resetAccountTokens(uid);

        // Find the email object that corresponds to the email being deleted
        const emailIsVerified = account.emails.find(item => {
          return (
            item.normalizedEmail === email.toLowerCase() && item.isVerified
          );
        });

        // Don't bother sending a notification if removing an email that was never verified
        if (!emailIsVerified) {
          return {};
        }

        // Notify any verified email address associated with the account of the deletion.
        const emails = account.emails.filter(item => {
          if (item.normalizedEmail !== email.toLowerCase()) {
            return item;
          }
        });
        await mailer.sendPostRemoveSecondaryEmail(emails, account, {
          deviceId: sessionToken.deviceId,
          secondaryEmail: email,
          uid,
        });

        return {};
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/set_primary',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
          },
        },
        response: {},
      },
      handler: async function(request) {
        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;
        const primaryEmail = sessionToken.email;
        const email = request.payload.email;

        log.begin('Account.RecoveryEmailSetPrimary', request);

        await customs.check(request, primaryEmail, 'setPrimaryEmail');

        if (sessionToken.tokenVerificationId) {
          throw error.unverifiedSession();
        }

        const secondaryEmail = await db.getSecondaryEmail(email);
        if (secondaryEmail.uid !== uid) {
          throw error.cannotChangeEmailToUnownedEmail();
        }

        if (!secondaryEmail.isVerified) {
          throw error.cannotChangeEmailToUnverifiedEmail();
        }

        if (!secondaryEmail.isPrimary) {
          await db.setPrimaryEmail(uid, secondaryEmail.normalizedEmail);

          const devices = await request.app.devices;
          push.notifyProfileUpdated(uid, devices);

          log.notifyAttachedServices('primaryEmailChanged', request, {
            uid,
            email: email,
          });

          // While we typically do not want to capture PII in Sentry, in this
          // case we must record enough data for us to file a bug with Support
          // to update Zendesk so that this users' email matches their new primary.
          const handleCriticalError = (err, source) => {
            Sentry.withScope(scope => {
              scope.setContext('primaryEmailChange', {
                originalEmail: primaryEmail,
                newEmail: secondaryEmail.email,
                system: source,
              });
              Sentry.captureException(err);
            });
          };

          // Fire off intentionally without waiting for all the network requests
          // required to update Zendesk/Stripe. Capture enough to manually update
          // Zendesk/Stripe if needed.
          updateZendeskPrimaryEmail(
            zendeskClient,
            uid,
            primaryEmail,
            secondaryEmail.email
          ).catch(err => handleCriticalError(err, 'zendesk'));

          if (stripeHelper) {
            // Wait here to update stripe and our local cache to avoid loss of
            // valid subscription status.
            try {
              await updateStripeEmail(
                stripeHelper,
                uid,
                primaryEmail,
                secondaryEmail.email
              );
              await stripeHelper.refreshCachedCustomer(
                uid,
                secondaryEmail.email
              );
            } catch (err) {
              // Due to the work involved by this point, we cannot abort the
              // request. We instead report it for manual fixing with sufficient
              // context to locate the user and update Stripe and our cache.
              handleCriticalError(err, 'stripe');
            }
          }

          const account = await db.account(uid);

          await mailer.sendPostChangePrimaryEmail(account.emails, account, {
            acceptLanguage: request.app.acceptLanguage,
            uid,
          });
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/secondary/resend_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
          },
        },
        response: {},
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailSecondaryResend', request);

        const sessionToken = request.auth.credentials;
        const ip = request.app.clientAddress;
        const geoData = request.app.geo;
        const { email } = request.payload;

        await customs.check(
          request,
          sessionToken.email,
          'recoveryEmailSecondaryResendCode'
        );

        const {
          deviceId,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid,
        } = sessionToken;

        const account = await db.account(uid);
        const emails = await db.accountEmails(uid);

        // Get the secondary email code
        const foundEmail = emails.find(
          userEmail => userEmail.normalizedEmail === email.toLowerCase()
        );

        // This user is attempting to verify a secondary email that doesn't belong to the account.
        if (!foundEmail) {
          throw error.cannotResendEmailCodeToUnownedEmail();
        }

        const secret = foundEmail.emailCode;

        const code = otpUtils.generateOtpCode(secret, otpOptions);

        const mailerOpts = {
          code,
          deviceId,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          timestamp: Date.now(),
          acceptLanguage: request.app.acceptLanguage,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid,
        };

        await mailer.sendVerifySecondaryCodeEmail(
          [foundEmail],
          account,
          mailerOpts
        );

        return {};
      },
    },
    {
      method: 'POST',
      path: '/recovery_email/secondary/verify_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().required(),
            code: isA
              .string()
              .max(32)
              .regex(validators.DIGITS)
              .required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Account.RecoveryEmailSecondaryVerify', request);

        const sessionToken = request.auth.credentials;
        const { email, code } = request.payload;

        await customs.check(
          request,
          sessionToken.email,
          'recoveryEmailSecondaryVerifyCode'
        );

        const { uid } = sessionToken;
        const account = await db.account(uid);
        const emails = await db.accountEmails(uid);

        // Get the secondary email code
        const matchedEmail = emails.find(
          userEmail => userEmail.normalizedEmail === email.toLowerCase()
        );

        if (!matchedEmail) {
          throw error.invalidVerificationCode();
        }

        const secret = matchedEmail.emailCode;
        const isValid = otpUtils.verifyOtpCode(code, secret, otpOptions);

        if (!isValid) {
          throw error.invalidVerificationCode();
        }

        // User is attempting to verify a secondary email that has already been verified.
        // Silently succeed and don't send post verification email.
        if (matchedEmail.isVerified) {
          log.info('account.verifyEmail.secondary.already-verified', {
            uid,
          });
          return {};
        }

        await db.verifyEmail(account, matchedEmail.emailCode);
        log.info('account.verifyEmail.secondary.confirmed', {
          uid,
        });

        await mailer.sendPostVerifySecondaryEmail([], account, {
          acceptLanguage: request.app.acceptLanguage,
          secondaryEmail: matchedEmail.email,
          uid,
        });

        return {};
      },
    },
  ];
};

// Exported for testing purposes.
module.exports._updateZendeskPrimaryEmail = updateZendeskPrimaryEmail;
module.exports._updateStripeEmail = updateStripeEmail;
