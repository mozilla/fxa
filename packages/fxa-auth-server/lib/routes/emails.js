/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const butil = require('../crypto/butil');
const emailUtils = require('./utils/email');
const { AppError: error } = require('@fxa/accounts/errors');
const isA = require('joi');
const random = require('../crypto/random');
const Sentry = require('@sentry/node');
const { Container } = require('typedi');
const { FxaMailer } = require('../senders/fxa-mailer');
const { FxaMailerFormat } = require('../senders/fxa-mailer-format');
const validators = require('./validators');
const { reportSentryError } = require('../sentry');
const { emailsMatch, normalizeEmail } = require('fxa-shared').email.helpers;
const { recordSecurityEvent } = require('./utils/security-event');
const EMAILS_DOCS = require('../../docs/swagger/emails-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;
const HEX_STRING = validators.HEX_STRING;
const MAX_SECONDARY_EMAILS = 3;

async function updateZendeskPrimaryEmail(
  zendeskClient,
  uid,
  currentPrimaryEmail,
  newPrimaryEmail
) {
  const searchResult = await zendeskClient.search.queryAll(
    `type:user user_id:${uid}`
  );
  const zenUser = searchResult.find(
    (user) => user.email === currentPrimaryEmail
  );
  if (!zenUser) {
    return;
  }
  const identityResult = await zendeskClient.useridentities.list(zenUser.id);
  const primaryIdentity = identityResult.find(
    (identity) =>
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
  const customer = await stripeHelper.fetchCustomer(uid);
  if (!customer || customer.email === newPrimaryEmail) {
    // No customer to update, or already updated.
    return;
  }
  return stripeHelper.stripe.customers.update(customer.id, {
    email: newPrimaryEmail,
  });
}

export function toRedisSecondaryEmailReservationKey(normalizedEmail) {
  return `secondary_email:reservation:${normalizedEmail}`;
}

export async function getExistingSecondaryEmailRecord(
  normalizedEmail,
  request,
  authServerCacheRedis
) {
  let rawRecord, parsedRecord;
  const key = toRedisSecondaryEmailReservationKey(normalizedEmail);

  try {
    rawRecord = await authServerCacheRedis.get(key);
    if (!rawRecord) {
      return undefined;
    }
    parsedRecord = JSON.parse(rawRecord);
    return parsedRecord;
  } catch (err) {
    // this should never happen, but if it does it means there is malformed data in redis
    // we should report it to sentry and delete the record
    // we typically do not capture emails, but in this case it is not yet linked to an account
    // and we may need the redis key to determine what went wrong
    try {
      Sentry.withScope((scope) => {
        scope.setContext('secondaryEmailReservation', {
          reservationKey: key,
        });
        reportSentryError(
          new Error('secondaryEmail.reservation.malformedRecord'),
          request
        );
      });
    } catch {}
    try {
      await authServerCacheRedis.del(key);
    } catch {}
    return undefined;
  }
}

module.exports = (
  log,
  db,
  mailer,
  config,
  customs,
  push,
  verificationReminders,
  cadReminders,
  signupUtils,
  zendeskClient,
  /** @type import('../payments/stripe').StripeHelper */
  stripeHelper,
  authServerCacheRedis,
  statsd
) => {
  const fxaMailer = Container.get(FxaMailer);

  const REMINDER_PATTERN = new RegExp(
    `^(?:${verificationReminders.keys.join('|')})$`
  );

  const otpOptions = config.otp;
  const otpUtils = require('./utils/otp').default(db, statsd);
  const SECONDARY_EMAIL_PENDING_TTL = config.secondaryEmail.pendingTtlSeconds;

  const handlers = {
    recoveryEmailPost: async (request) => {
      log.begin('Account.RecoveryEmailCreate', request);

      const sessionToken = request.auth.credentials;

      const uid = sessionToken.uid;
      const primaryEmail = sessionToken.email;
      const { email } = request.payload;
      const normalizedEmail = normalizeEmail(email);

      await customs.checkAuthenticated(
        request,
        uid,
        primaryEmail,
        'createEmail'
      );

      const account = await db.account(uid);
      const secondaryEmails = account.emails.filter((e) => !e.isPrimary);
      // This is compared against all secondary email
      // records in db, both verified and unverified
      if (secondaryEmails.length >= MAX_SECONDARY_EMAILS) {
        throw error.maxSecondaryEmailsReached();
      }

      const normalizedPrimary = normalizeEmail(primaryEmail);
      if (normalizedEmail === normalizedPrimary) {
        // attempting to add the account's existing primary as secondary
        throw error.yourPrimaryEmailExists();
      }
      const existingSecondary = account.emails
        .filter((e) => !e.isPrimary)
        .map((e) => normalizeEmail(e.email));
      if (existingSecondary.includes(normalizedEmail)) {
        // attempting to add an email that already exists on this account (as secondary)
        throw error.alreadyOwnsEmail();
      }

      // Before reserving this address, attempt to free it if it’s being “held”:
      // - If a verified primary exists for this email: fail (cannot reuse).
      // - If a verified secondary exists on another account: fail.
      // - If an unverified primary exists and is old enough with no active subscription:
      //   delete that unverified account to release the email.
      // - If an unverified secondary exists on another account: delete that email record.
      // - No-op if there is no record.
      // Notes:
      // - Does not delete the current account’s own secondary record (skips same uid on secondary path).
      // - Throws specific errors for newly created unverified primary or when there’s an active subscription.
      await attemptToFreeEmail(normalizedEmail);

      // Reserve email globally to prevent cross-account races

      const key = toRedisSecondaryEmailReservationKey(normalizedEmail);
      const existingSecondaryEmailRecord =
        await getExistingSecondaryEmailRecord(
          normalizedEmail,
          request,
          authServerCacheRedis
        );
      const uidStr = Buffer.isBuffer(uid)
        ? uid.toString('base64')
        : String(uid);
      if (
        existingSecondaryEmailRecord &&
        existingSecondaryEmailRecord.uid !== uidStr
      ) {
        // the email is already in use by another account (in-progress secondary email setup)
        // we should abort early and return a conflict error
        throw error.emailExists();
      }
      const secret =
        existingSecondaryEmailRecord?.secret ?? (await random.hex(16));
      const value = JSON.stringify({ uid: uidStr, secret });
      // create new reservation or refresh existing reservation with updated TTL
      const setResult = await authServerCacheRedis.set(
        key,
        value,
        'EX',
        SECONDARY_EMAIL_PENDING_TTL,
        existingSecondaryEmailRecord ? 'XX' : 'NX'
      );
      if (setResult !== 'OK') {
        throw error.emailExists();
      }

      const geoData = request.app.geo;
      try {
        await mailer.sendVerifySecondaryCodeEmail(
          [
            {
              email,
              normalizedEmail,
              isVerified: false,
              isPrimary: false,
              uid,
            },
          ],
          sessionToken,
          {
            code: otpUtils.generateOtpCode(secret, otpOptions),
            deviceId: sessionToken.deviceId,
            acceptLanguage: request.app.acceptLanguage,
            email,
            primaryEmail,
            location: geoData.location,
            timeZone: geoData.timeZone,
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
            uid,
          }
        );
      } catch (err) {
        log.error('secondary_email.sendVerifySecondaryCodeEmail.error', {
          err: err,
          uid,
          normalizedEmail,
        });
        await authServerCacheRedis.del(key);
        throw emailUtils.sendError(err, true);
      }

      return {};

      async function attemptToFreeEmail(normalizedEmail) {
        try {
          const secondaryEmailRecord =
            await db.getSecondaryEmail(normalizedEmail);

          const msSinceCreated = Date.now() - secondaryEmailRecord.createdAt;
          const minUnverifiedAccountTime =
            config.secondaryEmail.minUnverifiedAccountTime;
          const exceedsMinUnverifiedAccountTime =
            msSinceCreated >= minUnverifiedAccountTime;

          if (
            secondaryEmailRecord.isPrimary &&
            secondaryEmailRecord.isVerified
          ) {
            throw error.verifiedPrimaryEmailAlreadyExists();
          }

          // Can't add an email that is already verified
          if (
            !secondaryEmailRecord.isPrimary &&
            secondaryEmailRecord.isVerified
          ) {
            throw error.emailExists();
          }

          // check if unverified account can be deleted to free up the email
          if (
            secondaryEmailRecord.isPrimary &&
            !secondaryEmailRecord.isVerified
          ) {
            if (
              exceedsMinUnverifiedAccountTime &&
              !(await stripeHelper.hasActiveSubscription(
                secondaryEmailRecord.uid
              ))
            ) {
              await db.deleteAccount(secondaryEmailRecord);
              log.info('accountDeleted.unverifiedSecondaryEmail', {
                ...secondaryEmailRecord,
              });
              return;
            } else if (!exceedsMinUnverifiedAccountTime) {
              throw error.unverifiedPrimaryEmailNewlyCreated();
            } else {
              throw error.unverifiedPrimaryEmailHasActiveSubscription();
            }
          }

          // Check if unverified secondary email can be deleted to free up the email
          if (
            !secondaryEmailRecord.isPrimary &&
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
    recoveryEmailSecondaryVerifyCodePost: async (request) => {
      log.begin('Account.RecoveryEmailSecondaryVerify', request);

      const sessionToken = request.auth.credentials;
      const { email, code } = request.payload;
      const normalizedEmail = normalizeEmail(email);

      await customs.checkAuthenticated(
        request,
        sessionToken.uid,
        sessionToken.email,
        'recoveryEmailSecondaryVerifyCode'
      );

      const { uid } = sessionToken;
      const [account, accountEmails] = await Promise.all([
        db.account(uid),
        db.accountEmails(uid),
      ]);

      const accountEmailRecord = accountEmails.find(
        (e) => e.normalizedEmail === normalizedEmail
      );

      // If email is already saved and verified for this account -> silent success
      if (accountEmailRecord?.isVerified) {
        return {};
      }

      // Enforce cap at verify-time
      const verifiedSecondaries = accountEmails.filter(
        (e) => !e.isPrimary && e.isVerified
      );
      if (verifiedSecondaries.length >= MAX_SECONDARY_EMAILS) {
        throw error.maxSecondaryEmailsReached();
      }

      // Verify that the email is not already verified by another account.
      try {
        const emailRecord = await db.getSecondaryEmail(normalizedEmail);
        if (
          emailRecord &&
          emailRecord.isVerified &&
          !butil.buffersAreEqual(emailRecord.uid, uid)
        ) {
          throw error.emailExists();
        }
      } catch (err) {
        if (err && err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
          throw err;
        }
      }

      const key = toRedisSecondaryEmailReservationKey(normalizedEmail);
      const existingSecondaryEmailRecord =
        await getExistingSecondaryEmailRecord(
          normalizedEmail,
          request,
          authServerCacheRedis
        );
      const uidStr = Buffer.isBuffer(uid)
        ? uid.toString('base64')
        : String(uid);
      if (
        existingSecondaryEmailRecord &&
        existingSecondaryEmailRecord.uid !== uidStr
      ) {
        // Another account is in the process of setting up this email as secondary
        throw error.emailExists();
      }
      let secret = existingSecondaryEmailRecord?.secret;
      if (secret) {
        const { valid } = otpUtils.verifyOtpCode(
          code,
          secret,
          otpOptions,
          'recovery_email.secondary.verify_code'
        );
        if (!valid) {
          throw error.invalidVerificationCode();
        }
        // If a legacy unverified record already exists for this account/email, mark it verified
        if (accountEmailRecord?.emailCode && !accountEmailRecord.isVerified) {
          try {
            await db.verifyEmail(account, accountEmailRecord.emailCode);
          } catch (e) {
            log.error('secondary_email.verify.legacy_record.verify_error', {
              uid,
              normalizedEmail,
              error: e?.message,
            });
            throw e;
          }
        } else {
          try {
            await db.createEmail(uid, {
              email,
              normalizedEmail,
              emailCode: await random.hex(16),
              isVerified: true,
              verifiedAt: Date.now(),
            });
          } catch (e) {
            log.error('secondary_email.verify.dbCreate.error', {
              uid,
              normalizedEmail,
              error: e?.message,
              errno: e?.errno,
              code: e?.code,
              stack: e?.stack,
            });
            try {
              await authServerCacheRedis.del(key);
              secret = undefined;
            } catch {}
            throw e;
          }
        }
        await recordSecurityEvent('account.secondary_email_added', {
          db,
          request,
          account,
        });
        try {
          await authServerCacheRedis.del(key);
        } catch {}
      }
      // Fallback to legacy unverified record if present
      // Only needed until "old" unverified secondary email records are cleaned up
      // See FXA-10083 for more details
      if (!secret) {
        // Recheck for the email record in the account
        const emailRecord = accountEmails.find(
          (e) => e.normalizedEmail === normalizedEmail
        );
        if (!emailRecord || !emailRecord.emailCode) {
          // No trace of the requested email in the account.
          // This likely means the Redis reservation expired.
          // Return invalidVerificationCode to prompt user to resend the code.
          throw error.invalidVerificationCode();
        }
        if (emailRecord.isVerified) {
          // already verified for this account -> silent success
          return {};
        }
        // there is a legacy unverified record for this email -> verify it
        const { valid } = otpUtils.verifyOtpCode(
          code,
          emailRecord.emailCode,
          otpOptions,
          'recovery_email.secondary.verify_code'
        );
        if (!valid) {
          throw error.invalidVerificationCode();
        }
        try {
          await db.verifyEmail(account, emailRecord.emailCode);
          log.info('account.verifyEmail.secondary.confirmed', { uid });
        } catch (e) {
          log.error('secondary_email.verify.dbVerify.error', {
            uid,
            normalizedEmail,
            error: e?.message,
          });
          throw e;
        }
      }

      try {
        if (fxaMailer.canSend('postVerifySecondary')) {
          await fxaMailer.sendPostVerifySecondaryEmail({
            ...FxaMailerFormat.account(account),
            ...FxaMailerFormat.localTime(request),
            ...FxaMailerFormat.sync(false),
            secondaryEmail: email,
          });
        } else {
          await mailer.sendPostVerifySecondaryEmail([], account, {
            acceptLanguage: request.app.acceptLanguage,
            secondaryEmail: email,
            uid,
          });
        }
      } catch (e) {
        log.error('secondary_email.sendPostVerifySecondaryEmail.error', {
          uid,
          normalizedEmail,
          error: e?.message,
        });
        // don't throw on email send error
      }

      return {};
    },
  };

  /**
   * Helper function to recreate a Redis reservation for secondary email verification.
   * Used when a reservation is missing (expired) or corrupted.
   * Verifies the email is available before creating a new reservation.
   *
   * @param {string} normalizedEmail - The normalized email address
   * @param {Buffer|string} uid - User ID
   * @param {string} uidStr - User ID as base64 string
   * @param {string} key - Redis key for the reservation
   * @param {string} reason - Reason for recreation (for logging): 'expired' or 'corrupted'
   * @param {string} primaryEmail - User's primary email (for validation)
   * @returns {Promise<string>} The secret for the new reservation
   * @throws {AppError} If email is claimed by another account or race condition occurs
   */
  async function recreateSecondaryEmailReservation(
    normalizedEmail,
    uid,
    key,
    reason,
    primaryEmail
  ) {
    // Prevent user from creating reservation for their own primary email
    const normalizedPrimary = normalizeEmail(primaryEmail);
    if (normalizedEmail === normalizedPrimary) {
      throw error.yourPrimaryEmailExists();
    }

    // Check if the email is claimed by another account in the DB
    try {
      const existingRecord = await db.getSecondaryEmail(normalizedEmail);
      if (existingRecord && !butil.buffersAreEqual(existingRecord.uid, uid)) {
        // Email belongs to another account
        throw error.cannotResendEmailCodeToUnownedEmail();
      }
      // If user already has this email verified, no need to resend
      if (
        existingRecord &&
        butil.buffersAreEqual(existingRecord.uid, uid) &&
        existingRecord.isVerified
      ) {
        throw error.alreadyOwnsEmail();
      }
    } catch (err) {
      if (err && err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
        throw err;
      }
      // Email not found in DB, which is expected for new reservations
    }

    // Email is available - create a new reservation with a new secret
    const secret = await random.hex(16);
    const uidStr = Buffer.isBuffer(uid) ? uid.toString('base64') : String(uid);
    const value = JSON.stringify({ uid: uidStr, secret });
    const setResult = await authServerCacheRedis.set(
      key,
      value,
      'EX',
      SECONDARY_EMAIL_PENDING_TTL,
      'NX'
    );
    if (setResult !== 'OK') {
      // Another process claimed it between our checks
      throw error.emailExists();
    }
    log.info('secondary_email.reservation_recreated', {
      uid,
      normalizedEmail,
      reason,
    });
    return secret;
  }

  const routes = [
    {
      method: 'GET',
      path: '/recovery_email/status',
      options: {
        ...EMAILS_DOCS.RECOVERY_EMAIL_STATUS_GET,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            reason: isA.string().max(16).optional(),
          },
        },
        response: {
          schema: isA.object({
            // There's code in the handler that checks for a valid email,
            // no point adding overhead by doing it again here.
            email: isA.string().required(),
            verified: isA.boolean().required(),
            sessionVerified: isA.boolean().optional(),
            emailVerified: isA.boolean().optional(),
          }),
        },
      },
      handler: async function (request) {
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
            if (
              !validators.isValidEmailAddress(sessionToken.email) &&
              !(await stripeHelper.hasActiveSubscription(sessionToken.uid))
            ) {
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
        ...EMAILS_DOCS.RECOVERY_EMAIL_RESEND_CODE_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.service),
            type: isA
              .string()
              .max(32)
              .alphanum()
              .allow('upgradeSession')
              .optional(),
          }),
          payload: isA.object({
            email: validators.email().optional(),
            service: validators.service.description(DESCRIPTION.service),
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA
              .string()
              .max(2048)
              .optional()
              .description(DESCRIPTION.resume),
            style: isA.string().allow('trailhead').optional(),
            type: isA
              .string()
              .max(32)
              .alphanum()
              .allow('upgradeSession')
              .optional(),
          }),
        },
      },
      handler: async function (request) {
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

        await customs.checkAuthenticated(
          request,
          sessionToken.uid,
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
            const foundEmail = emailData.find((userEmail) =>
              emailsMatch(userEmail.normalizedEmail, email)
            );

            // This user is attempting to verify a secondary email that doesn't belong to the account.
            if (!foundEmail) {
              throw error.cannotResendEmailCodeToUnownedEmail();
            }

            emails = [foundEmail];
            code = foundEmail.emailCode;
            return !foundEmail.isVerified;
          } else if (!sessionToken.tokenVerified) {
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
        ...EMAILS_DOCS.RECOVERY_EMAIL_VERIFY_CODE_POST,
        validate: {
          payload: isA.object({
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            code: isA.string().min(32).max(32).regex(HEX_STRING).required(),
            service: validators.service.description(DESCRIPTION.service),
            reminder: isA
              .string()
              .regex(REMINDER_PATTERN)
              .optional()
              .description(DESCRIPTION.reminder),
            type: isA
              .string()
              .max(32)
              .alphanum()
              .optional()
              .description(DESCRIPTION.type),
            style: isA.string().allow('trailhead').optional(),
            // The `marketingOptIn` is safe to remove after train-167+
            marketingOptIn: isA.boolean().optional(),
            newsletters: validators.newsletters,
          }),
        },
      },
      handler: async function (request) {
        log.begin('Account.RecoveryEmailVerify', request);

        const { code, uid } = request.payload;

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
        await customs.checkAuthenticated(
          request,
          uid,
          account.email,
          'recoveryEmailVerifyCode'
        );

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
          const otherDevices = devices.filter((d) => d.id !== device.id);
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

        // best-effort cleanup: clear any secondary reservation for this primary email
        try {
          const normalized = normalizeEmail(account.email);
          await authServerCacheRedis.del(
            toRedisSecondaryEmailReservationKey(normalized)
          );
        } catch (_) {}

        return {};

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
        ...EMAILS_DOCS.RECOVERY_EMAILS_GET,
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
      handler: async function (request) {
        log.begin('Account.RecoveryEmailEmails', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        const account = await db.account(uid);
        return account.emails.map((email) => ({
          email: email.email,
          isPrimary: !!email.isPrimary,
          verified: !!email.isVerified,
        }));
      },
    },
    {
      method: 'POST',
      path: '/mfa/recovery_email',
      options: {
        ...EMAILS_DOCS.RECOVERY_EMAIL_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:email'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailAdd),
          }),
        },
        response: {},
      },
      handler: handlers.recoveryEmailPost,
    },
    {
      method: 'POST',
      path: '/mfa/recovery_email/destroy',
      options: {
        ...EMAILS_DOCS.MFA_RECOVERY_EMAIL_DESTROY_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:email'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailDelete),
          }),
        },
        response: {},
      },
      handler: async function (request) {
        log.begin('Account.RecoveryEmailDestroy', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;
        const primaryEmail = sessionToken.email;
        const email = request.payload.email;

        await customs.checkAuthenticated(
          request,
          uid,
          primaryEmail,
          'deleteEmail'
        );
        const account = await db.account(uid);

        await db.deleteEmail(uid, normalizeEmail(email));

        await recordSecurityEvent('account.secondary_email_removed', {
          db,
          request,
        });

        await db.resetAccountTokens(uid);

        // Find the email object that corresponds to the email being deleted
        const emailIsVerified = account.emails.find((item) => {
          return emailsMatch(item.normalizedEmail, email) && item.isVerified;
        });

        // Don't bother sending a notification if removing an email that was never verified
        if (!emailIsVerified) {
          return {};
        }

        // Notify any verified email address associated with the account of the deletion.
        const emails = account.emails.filter((item) => {
          if (!emailsMatch(item.normalizedEmail, email)) {
            return item;
          }
        });

        if (fxaMailer.canSend('postRemoveSecondary')) {
          const accountData = FxaMailerFormat.account(account);
          accountData.cc = accountData.cc.filter((e) => e !== email);
          await fxaMailer.sendPostRemoveSecondaryEmail({
            ...accountData,
            ...FxaMailerFormat.localTime(request),
            ...(await FxaMailerFormat.metricsContext(request)),
            ...FxaMailerFormat.sync(false),
            secondaryEmail: email,
          });
        } else {
          await mailer.sendPostRemoveSecondaryEmail(emails, account, {
            deviceId: sessionToken.deviceId,
            secondaryEmail: email,
            uid,
          });
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/mfa/recovery_email/set_primary',
      options: {
        ...EMAILS_DOCS.MFA_RECOVERY_EMAIL_SET_PRIMARY_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:email'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailNewPrimary),
          }),
        },
        response: {},
      },
      handler: async function (request) {
        const sessionToken = request.auth.credentials;
        const { uid } = sessionToken;
        const currentEmail = sessionToken.email;
        const newEmail = request.payload.email;

        log.begin('Account.RecoveryEmailSetPrimary', request);

        await customs.checkAuthenticated(
          request,
          uid,
          currentEmail,
          'setPrimaryEmail'
        );

        const newEmailRecord = await db.getSecondaryEmail(newEmail);
        if (newEmailRecord.uid !== uid) {
          throw error.cannotChangeEmailToUnownedEmail();
        }

        if (!newEmailRecord.isVerified) {
          throw error.cannotChangeEmailToUnverifiedEmail();
        }

        if (!newEmailRecord.isPrimary) {
          await db.setPrimaryEmail(uid, newEmailRecord.normalizedEmail);

          const devices = await request.app.devices;
          push.notifyProfileUpdated(uid, devices);

          log.notifyAttachedServices('primaryEmailChanged', request, {
            uid,
            email: newEmail,
          });

          const handleCriticalError = (err, source) => {
            Sentry.withScope((scope) => {
              scope.setContext('primaryEmailChange', {
                originalEmail: currentEmail,
                newEmail: newEmailRecord.email,
                system: source,
              });
              reportSentryError(err);
            });
          };

          updateZendeskPrimaryEmail(
            zendeskClient,
            uid,
            currentEmail,
            newEmailRecord.email
          ).catch((err) => handleCriticalError(err, 'zendesk'));

          if (stripeHelper) {
            try {
              await updateStripeEmail(
                stripeHelper,
                uid,
                currentEmail,
                newEmailRecord.email
              );
            } catch (err) {
              handleCriticalError(err, 'stripe');
            }
          }

          const account = await db.account(uid);
          if (fxaMailer.canSend('postVerifySecondary')) {
            await fxaMailer.sendPostChangePrimaryEmail({
              ...FxaMailerFormat.account(account),
              ...FxaMailerFormat.sync(false),
              ...FxaMailerFormat.localTime(request),
              ...(await FxaMailerFormat.metricsContext(request)),
              email: FxaMailerFormat.account(account).to,
            });
          } else {
            await mailer.sendPostChangePrimaryEmail(account.emails, account, {
              acceptLanguage: request.app.acceptLanguage,
              uid,
            });
          }

          await recordSecurityEvent('account.primary_secondary_swapped', {
            db,
            request,
          });
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/mfa/recovery_email/secondary/verify_code',
      options: {
        ...EMAILS_DOCS.RECOVERY_EMAIL_SECONDARY_VERIFY_CODE_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:email'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailSecondaryVerify),
            code: isA
              .string()
              .max(32)
              .regex(validators.DIGITS)
              .description(DESCRIPTION.code)
              .required(),
          }),
        },
      },
      handler: handlers.recoveryEmailSecondaryVerifyCodePost,
    },
    {
      method: 'POST',
      path: '/mfa/recovery_email/secondary/resend_code',
      options: {
        ...EMAILS_DOCS.RECOVERY_EMAIL_SECONDARY_RESEND_CODE_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:email'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailSecondaryVerify),
          }),
        },
        response: {},
      },
      handler: async function (request) {
        // This MFA-protected route resends a secondary email verification code
        // when the email is reserved in Redis but not yet stored in the DB.
        // It avoids returning "unowned email" errors for reserved-but-not-stored emails.
        log.begin('Account.RecoveryEmailSecondaryResend.mfa', request);
        const sessionToken = request.auth.credentials;
        const { email } = request.payload;
        const normalizedEmail = normalizeEmail(email);

        await customs.checkAuthenticated(
          request,
          sessionToken.uid,
          sessionToken.email,
          'recoveryEmailSecondaryResendCode'
        );

        const { uid } = sessionToken;
        const uidStr = Buffer.isBuffer(uid)
          ? uid.toString('base64')
          : String(uid);

        // Check Redis reservation
        const key = toRedisSecondaryEmailReservationKey(normalizedEmail);
        const rawRecord = await authServerCacheRedis.get(key);
        let parsedRecord;
        if (rawRecord) {
          try {
            parsedRecord = JSON.parse(rawRecord);
          } catch (err) {
            // Bad/corrupted record: cleanup
            log.warn('secondary_email.corrupted_redis_record', {
              uid,
              normalizedEmail,
              error: err.message,
            });
            await authServerCacheRedis.del(key);
            // Treat as missing and attempt to recreate below
            parsedRecord = null;
          }
        }

        // If reservation exists but belongs to another user, throw.
        if (parsedRecord && parsedRecord.uid !== uidStr) {
          throw error.cannotResendEmailCodeToUnownedEmail();
        }

        // If no reservation exists (expired or corrupted), recreate it if the email is available
        let secret;
        const hadExistingReservation = !!parsedRecord;
        if (parsedRecord) {
          // Use existing secret from the reservation
          secret = parsedRecord.secret;
        } else {
          const reason = rawRecord ? 'corrupted' : 'expired';
          try {
            secret = await recreateSecondaryEmailReservation(
              normalizedEmail,
              uid,
              key,
              reason,
              sessionToken.email
            );
          } catch (err) {
            // If it's a user-facing error (email claimed, etc.), propagate it
            if (
              err.errno === error.ERRNO.RESEND_EMAIL_CODE_TO_UNOWNED_EMAIL ||
              err.errno === error.ERRNO.EMAIL_EXISTS ||
              err.errno === error.ERRNO.ACCOUNT_OWNS_EMAIL ||
              err.errno === error.ERRNO.USER_PRIMARY_EMAIL_EXISTS
            ) {
              throw err;
            }
            // For infrastructure errors (DB/Redis failures), log and return a service error
            log.error('secondary_email.reservation_recreation_failed', {
              uid,
              normalizedEmail,
              reason,
              error: err.message,
              errno: err.errno,
            });
            throw error.backendServiceFailure();
          }
        }

        // Generate a new OTP code using the secret and resend the email.
        const code = otpUtils.generateOtpCode(secret, otpOptions);

        const {
          deviceId,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
        } = sessionToken;

        const geoData = request.app.geo;
        try {
          await mailer.sendVerifySecondaryCodeEmail(
            [
              {
                email,
                normalizedEmail,
                isVerified: false,
                isPrimary: false,
                uid,
              },
            ],
            sessionToken,
            {
              code,
              deviceId,
              acceptLanguage: request.app.acceptLanguage,
              email,
              primaryEmail: sessionToken.email,
              location: geoData.location,
              timeZone: geoData.timeZone,
              uaBrowser,
              uaBrowserVersion,
              uaOS,
              uaOSVersion,
              uaDeviceType,
              uid,
            }
          );
        } catch (err) {
          log.error('secondary_email.resendVerifySecondaryCodeEmail.error', {
            err: err,
            uid,
            normalizedEmail,
          });
          // If we just created a new reservation and email sending fails, clean it up
          // to allow the user to retry from scratch
          if (!hadExistingReservation) {
            try {
              await authServerCacheRedis.del(key);
            } catch (delErr) {
              log.error('secondary_email.resend.redis_cleanup_failed', {
                err: delErr,
                uid,
                normalizedEmail,
              });
            }
          }
          throw emailUtils.sendError(err, true);
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/emails/reminders/cad',
      options: {
        ...EMAILS_DOCS.EMAILS_REMINDERS_CAD_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
      },
      handler: async function (request) {
        log.begin('Account.CadReminderEmail', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        const reminders = await cadReminders.get(uid);
        const exists = cadReminders.keys.some((key) => {
          return reminders[key] !== null;
        });

        if (!exists) {
          await cadReminders.create(uid);
          log.info('cad.reminder.created', {
            uid,
          });
        } else {
          log.info('cad.reminder.exists', {
            uid,
          });
        }

        return {};
      },
    },
  ];

  return routes;
};

// Exported for testing purposes.
module.exports._updateZendeskPrimaryEmail = updateZendeskPrimaryEmail;
module.exports._updateStripeEmail = updateStripeEmail;
module.exports.toRedisSecondaryEmailReservationKey =
  toRedisSecondaryEmailReservationKey;
module.exports.getExistingSecondaryEmailRecord =
  getExistingSecondaryEmailRecord;
