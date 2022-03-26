/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const emailUtils = require('./email');
const isA = require('joi');
const validators = require('../validators');
const butil = require('../../crypto/butil');
const error = require('../../error');
const { emailsMatch } = require('fxa-shared').email.helpers;

const BASE_36 = validators.BASE_36;

// An arbitrary, but very generous, limit on the number of active sessions.
// Currently only for metrics purposes, not enforced.
const MAX_ACTIVE_SESSIONS = 200;

module.exports = (log, config, customs, db, mailer, cadReminders) => {
  const unblockCodeLifetime =
    (config.signinUnblock && config.signinUnblock.codeLifetime) || 0;
  const unblockCodeLen =
    (config.signinUnblock && config.signinUnblock.codeLength) || 8;
  const otpOptions = config.otp;
  const otpUtils = require('../utils/otp')(log, config, db);

  return {
    validators: {
      UNBLOCK_CODE: isA
        .string()
        .regex(BASE_36)
        .length(unblockCodeLen)
        .optional(),
    },

    /**
     * Check if the password a user entered matches the one on
     * file for the account. If it does not, flag the account with
     * customs. Higher level code will take care of
     * returning an error to the user.
     */
    async checkPassword(accountRecord, password, clientAddress) {
      if (butil.buffersAreEqual(accountRecord.authSalt, butil.ONES)) {
        await customs.flag(clientAddress, {
          email: accountRecord.email,
          errno: error.ERRNO.ACCOUNT_RESET,
        });
        throw error.mustResetAccount(accountRecord.email);
      }
      const verifyHash = await password.verifyHash();
      const match = await db.checkPassword(accountRecord.uid, verifyHash);
      if (match) {
        return match;
      }
      await customs.flag(clientAddress, {
        email: accountRecord.email,
        errno: error.ERRNO.INCORRECT_PASSWORD,
      });
      return match;
    },

    /**
     * Check if the user is logging in with the correct email address
     * for their account.
     */
    checkEmailAddress(accountRecord, email, originalLoginEmail) {
      // The `originalLoginEmail` param, if specified, tells us the email address
      // that the user typed into the login form.  This might differ from the address
      // used for calculating the password hash, which is provided in `email` param.
      if (!originalLoginEmail) {
        originalLoginEmail = email;
      }
      // Logging in with a secondary email address is not currently supported.
      if (
        !emailsMatch(
          originalLoginEmail,
          accountRecord.primaryEmail.normalizedEmail
        )
      ) {
        throw error.cannotLoginWithSecondaryEmail();
      }
      return Promise.resolve(true);
    },

    /**
     * Check if user is allowed a password-checking attempt, and if so then
     * load their accountRecord.  These two operations are intertwined due
     * to the "unblock codes" feature, which allows users to bypass customs
     * checks and which requires us to load the account record for processing.
     *
     * Returns an object with the following information about the process:
     *
     *  {
     *    accountRecord:     the user's account record loaded form the db
     *    didSigninUnblock:  whether an unblock code was successfully used
     *  }
     */
    async checkCustomsAndLoadAccount(request, email) {
      let accountRecord, originalError;
      let didSigninUnblock = false;

      try {
        try {
          // For testing purposes, some email addresses are forced
          // to go through signin unblock on every login attempt.
          const forced =
            config.signinUnblock && config.signinUnblock.forcedEmailAddresses;
          if (forced && forced.test(email)) {
            throw error.requestBlocked(true);
          }
          await customs.check(request, email, 'accountLogin');
        } catch (e) {
          originalError = e;

          // Non-customs-related errors get thrown straight back to the caller.
          if (
            e.errno !== error.ERRNO.REQUEST_BLOCKED &&
            e.errno !== error.ERRNO.THROTTLED
          ) {
            throw e;
          }
          await request.emitMetricsEvent('account.login.blocked');

          // If this customs error cannot be bypassed with email confirmation,
          // throw it straight back to the caller.
          const verificationMethod = e.output.payload.verificationMethod;
          if (
            verificationMethod !== 'email-captcha' ||
            !request.payload.unblockCode
          ) {
            throw e;
          }

          // Check for a valid unblockCode, to allow the request to proceed.
          // This requires that we load the accountRecord to learn the uid.
          const unblockCode = request.payload.unblockCode.toUpperCase();
          accountRecord = await db.accountRecord(email);
          try {
            const code = await db.consumeUnblockCode(
              accountRecord.uid,
              unblockCode
            );
            if (Date.now() - code.createdAt > unblockCodeLifetime) {
              log.info('Account.login.unblockCode.expired', {
                uid: accountRecord.uid,
              });
              throw error.invalidUnblockCode();
            }
            didSigninUnblock = true;
            await request.emitMetricsEvent(
              'account.login.confirmedUnblockCode'
            );
          } catch (e) {
            if (e.errno !== error.ERRNO.INVALID_UNBLOCK_CODE) {
              throw e;
            }
            await request.emitMetricsEvent('account.login.invalidUnblockCode');
            throw e;
          }
        }

        // If we didn't load it above while checking unblock codes,
        // it's now safe to load the account record from the db.
        if (!accountRecord) {
          // If `originalLoginEmail` is specified, we need to fetch the account record tied
          // to that email. In the case where a user has changed their primary email, the `email`
          // value here is really the value used to hash the password and has no guarantee to
          // belong to the user.
          if (request.payload.originalLoginEmail) {
            accountRecord = await db.accountRecord(
              request.payload.originalLoginEmail
            );
          } else {
            accountRecord = await db.accountRecord(email);
          }
        }
        return { accountRecord, didSigninUnblock };
      } catch (e) {
        // Some errors need to be flagged with customs.
        if (
          e.errno === error.ERRNO.INVALID_UNBLOCK_CODE ||
          e.errno === error.ERRNO.ACCOUNT_UNKNOWN
        ) {
          customs.flag(request.app.clientAddress, {
            email: email,
            errno: e.errno,
          });
        }
        // For any error other than INVALID_UNBLOCK_CODE, hide it behind the original customs error.
        // This prevents us from accidentally leaking additional info to a caller that's been
        // blocked, including e.g. whether or not the target account exists.
        if (originalError && e.errno !== error.ERRNO.INVALID_UNBLOCK_CODE) {
          throw originalError;
        }
        throw e;
      }
    },

    /**
     * Send all the various notifications that result from a new signin.
     * This includes emailing the user, logging metrics events, and
     * notifying attached services.
     */
    async sendSigninNotifications(
      request,
      accountRecord,
      sessionToken,
      verificationMethod
    ) {
      const service = request.payload.service || request.query.service;
      const redirectTo = request.payload.redirectTo;
      const resume = request.payload.resume;
      const ip = request.app.clientAddress;
      const isUnverifiedAccount = !accountRecord.primaryEmail.isVerified;

      let sessions;

      const { deviceId, flowId, flowBeginTime } = await request.app
        .metricsContext;

      const mustVerifySession =
        sessionToken.mustVerify && !sessionToken.tokenVerified;

      // The final event to complete the login flow depends on the details
      // of the flow being undertaken, so prepare accordingly.
      let flowCompleteSignal;
      if (service === 'sync') {
        // Sync signins are only complete when the browser actually syncs.
        flowCompleteSignal = 'account.signed';
      } else if (mustVerifySession) {
        // Sessions that require verification are only complete once confirmed.
        flowCompleteSignal = 'account.confirmed';
      } else {
        // Otherwise, the login itself is the end of the flow.
        flowCompleteSignal = 'account.login';
      }
      request.setMetricsFlowCompleteSignal(flowCompleteSignal, 'login');

      await stashMetricsContext();
      await checkNumberOfActiveSessions();
      await emitLoginEvent();
      await sendEmail();
      await recordSecurityEvent();
      return;

      async function stashMetricsContext() {
        await request.stashMetricsContext(sessionToken);
        if (mustVerifySession) {
          // There is no session token when we emit account.confirmed
          // so stash the data against a synthesized "token" instead.
          return request.stashMetricsContext({
            uid: accountRecord.uid,
            id: sessionToken.tokenVerificationId,
          });
        }
      }

      async function checkNumberOfActiveSessions() {
        sessions = await db.sessions(accountRecord.uid);
        if (sessions.length > MAX_ACTIVE_SESSIONS) {
          // There's no spec-compliant way to error out
          // as a result of having too many active sessions.
          // For now, just log metrics about it.
          log.error('Account.login', {
            uid: accountRecord.uid,
            userAgent: request.headers['user-agent'],
            numSessions: sessions.length,
          });
        }
      }

      async function emitLoginEvent() {
        await request.emitMetricsEvent('account.login', {
          uid: accountRecord.uid,
        });

        if (request.payload.reason === 'signin') {
          const geoData = request.app.geo;
          const country = geoData.location && geoData.location.country;
          const countryCode = geoData.location && geoData.location.countryCode;
          await log.notifyAttachedServices('login', request, {
            country,
            countryCode,
            deviceCount: sessions.length,
            email: accountRecord.primaryEmail.email,
            service,
            uid: accountRecord.uid,
            userAgent: request.headers['user-agent'],
          });
        }
      }

      function sendEmail() {
        // For unverified accounts, we always re-send the account verification email.
        if (isUnverifiedAccount) {
          return sendVerifyAccountEmail();
        }
        // If the session needs to be verified, send the sign-in confirmation email.
        if (mustVerifySession) {
          return sendVerifySessionEmail();
        }
        // Otherwise, no email is necessary.
      }

      function sendVerifyAccountEmail() {
        if (verificationMethod === 'email-otp') {
          return sendVerifyLoginCodeEmail();
        }
        // If the session doesn't require verification,
        // fall back to the account-level email code for the link.
        const emailCode =
          sessionToken.tokenVerificationId ||
          accountRecord.primaryEmail.emailCode;
        return mailer
          .sendVerifyEmail([], accountRecord, {
            code: emailCode,
            service,
            redirectTo,
            resume,
            acceptLanguage: request.app.acceptLanguage,
            deviceId,
            flowId,
            flowBeginTime,
            ip,
            location: request.app.geo.location,
            timeZone: request.app.geo.timeZone,
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uid: sessionToken.uid,
          })
          .then(() => request.emitMetricsEvent('email.verification.sent'));
      }

      function sendVerifySessionEmail() {
        // If this login requires a confirmation, check to see if a specific method was specified in
        // the request. If none was specified, use the `email` verificationMethod.
        switch (verificationMethod) {
          case 'email':
            // Sends an email containing a link to verify login
            return sendVerifyLoginEmail();
          case 'email-2fa':
          case 'email-otp':
            // Sends an email containing a code that can verify a login
            return sendVerifyLoginCodeEmail();
          case 'email-captcha':
            // `email-captcha` is a custom verification method used only for
            // unblock codes. We do not need to send a verification email
            // in this case.
            break;
          case 'totp-2fa':
            // This verification method requires a user to use a third-party
            // application.
            break;
          default:
            return sendVerifyLoginEmail();
        }
      }

      async function sendVerifyLoginEmail() {
        log.info('account.signin.confirm.start', {
          uid: accountRecord.uid,
          tokenVerificationId: sessionToken.tokenVerificationId,
        });

        const geoData = request.app.geo;
        try {
          await mailer.sendVerifyLoginEmail(
            accountRecord.emails,
            accountRecord,
            {
              acceptLanguage: request.app.acceptLanguage,
              code: sessionToken.tokenVerificationId,
              deviceId,
              flowId,
              flowBeginTime,
              ip,
              location: geoData.location,
              redirectTo: redirectTo,
              resume: resume,
              service: service,
              timeZone: geoData.timeZone,
              uaBrowser: request.app.ua.browser,
              uaBrowserVersion: request.app.ua.browserVersion,
              uaOS: request.app.ua.os,
              uaOSVersion: request.app.ua.osVersion,
              uaDeviceType: request.app.ua.deviceType,
              uid: sessionToken.uid,
            }
          );
          await request.emitMetricsEvent('email.confirmation.sent');
        } catch (err) {
          log.error('mailer.confirmation.error', { err });
          throw emailUtils.sendError(err, isUnverifiedAccount);
        }
      }

      async function sendVerifyLoginCodeEmail() {
        log.info('account.token.code.start', {
          uid: accountRecord.uid,
        });

        const secret = accountRecord.primaryEmail.emailCode;
        const code = otpUtils.generateOtpCode(secret, otpOptions);
        const { location, timeZone } = request.app.geo;
        await mailer.sendVerifyLoginCodeEmail(
          accountRecord.emails,
          accountRecord,
          {
            acceptLanguage: request.app.acceptLanguage,
            code,
            deviceId,
            flowId,
            flowBeginTime,
            ip,
            location,
            redirectTo,
            resume,
            service,
            timeZone,
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uid: sessionToken.uid,
          }
        );

        request.emitMetricsEvent('email.tokencode.sent');
      }

      function recordSecurityEvent() {
        db.securityEvent({
          name: 'account.login',
          uid: accountRecord.uid,
          ipAddr: ip,
          tokenId: sessionToken.id,
        });
      }
    },

    async createKeyFetchToken(request, accountRecord, password, sessionToken) {
      const wrapKb = await password.unwrap(accountRecord.wrapWrapKb);
      const keyFetchToken = await db.createKeyFetchToken({
        uid: accountRecord.uid,
        kA: accountRecord.kA,
        wrapKb: wrapKb,
        emailVerified: accountRecord.primaryEmail.isVerified,
        tokenVerificationId: sessionToken.tokenVerificationId,
      });
      await request.stashMetricsContext(keyFetchToken);
      return keyFetchToken;
    },

    getSessionVerificationStatus(sessionToken, verificationMethod) {
      if (!sessionToken.emailVerified) {
        // for unverified accounts, only 'email', and 'email-otp' are valid.
        // email-otp is the end goal, but a transition train is needed.
        // Set the default to 'email' to handle train->train upgrades. If
        // a user of content-server X loads their JS and then auth-server X+1
        // is deployed, the content server of train X is not able to handle
        // the 'email-otp' result and still send the user to the /confirm screen
        // that expect verification links.
        if (verificationMethod !== 'email-otp') {
          verificationMethod = 'email';
        }
        return {
          verified: false,
          verificationMethod: verificationMethod,
          verificationReason: 'signup',
        };
      }
      if (sessionToken.mustVerify && !sessionToken.tokenVerified) {
        return {
          verified: false,
          // Override the verification method if it was explicitly specified in the request.
          verificationMethod: verificationMethod || 'email',
          verificationReason: 'login',
        };
      }
      return { verified: true };
    },

    /**
     * Remove verification reminders for the account.
     */
    async cleanupReminders(response, account) {
      // We should only really remove reminders if the session
      // was marked as verified, ie have met all the requirements
      // to start syncing
      if (response.verified) {
        await cadReminders.delete(account.uid);
      }
      return;
    },
  };
};
