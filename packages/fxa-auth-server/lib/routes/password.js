/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const validators = require('./validators');
const HEX_STRING = validators.HEX_STRING;

const butil = require('../crypto/butil');
const error = require('../error');
const isA = require('joi');
const random = require('../crypto/random');
const requestHelper = require('../routes/utils/request_helper');

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

module.exports = function(
  log,
  db,
  Password,
  redirectDomain,
  mailer,
  verifierVersion,
  customs,
  signinUtils,
  push,
  config
) {
  const totpUtils = require('../../lib/routes/utils/totp')(log, config, db);

  function failVerifyAttempt(passwordForgotToken) {
    return passwordForgotToken.failAttempt()
      ? db.deletePasswordForgotToken(passwordForgotToken)
      : db.updatePasswordForgotToken(passwordForgotToken);
  }

  const routes = [
    {
      method: 'POST',
      path: '/password/change/start',
      options: {
        validate: {
          payload: {
            email: validators.email().required(),
            oldAuthPW: validators.authPW,
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.changeStart', request);
        const form = request.payload;
        const oldAuthPW = form.oldAuthPW;

        await customs.check(request, form.email, 'passwordChange');
        let tokens;
        try {
          const emailRecord = await db.accountRecord(form.email);
          const password = new Password(
            oldAuthPW,
            emailRecord.authSalt,
            emailRecord.verifierVersion
          );
          const match = await signinUtils.checkPassword(
            emailRecord,
            password,
            request.app.clientAddress
          );
          if (!match) {
            throw error.incorrectPassword(emailRecord.email, form.email);
          }
          const wrapKb = await password.unwrap(emailRecord.wrapWrapKb);
          const keyFetchToken = await db.createKeyFetchToken({
            uid: emailRecord.uid,
            kA: emailRecord.kA,
            wrapKb: wrapKb,
            emailVerified: emailRecord.emailVerified,
          });
          const passwordChangeToken = await db.createPasswordChangeToken({
            uid: emailRecord.uid,
          });
          tokens = {
            keyFetchToken: keyFetchToken,
            passwordChangeToken: passwordChangeToken,
          };
        } catch (err) {
          if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
            customs.flag(request.app.clientAddress, {
              email: form.email,
              errno: err.errno,
            });
          }
          throw err;
        }
        return {
          keyFetchToken: tokens.keyFetchToken.data,
          passwordChangeToken: tokens.passwordChangeToken.data,
          verified: tokens.keyFetchToken.emailVerified,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      options: {
        auth: {
          strategy: 'passwordChangeToken',
        },
        validate: {
          query: {
            keys: isA.boolean().optional(),
          },
          payload: {
            authPW: validators.authPW,
            wrapKb: validators.wrapKb,
            sessionToken: isA
              .string()
              .min(64)
              .max(64)
              .regex(HEX_STRING)
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.changeFinish', request);
        const passwordChangeToken = request.auth.credentials;
        const authPW = request.payload.authPW;
        const wrapKb = request.payload.wrapKb;
        const sessionTokenId = request.payload.sessionToken;
        const wantsKeys = requestHelper.wantsKeys(request);
        const ip = request.app.clientAddress;
        let account,
          verifyHash,
          sessionToken,
          keyFetchToken,
          verifiedStatus,
          devicesToNotify,
          originatingDeviceId,
          hasTotp = false;

        await checkTotpToken();
        await getSessionVerificationStatus();
        await fetchDevicesToNotify();
        await changePassword();
        await notifyAccount();
        await createSessionToken();
        await createKeyFetchToken();
        await createResponse();

        async function checkTotpToken() {
          const result = await totpUtils.hasTotpToken(passwordChangeToken);
          hasTotp = result;

          // Currently, users that have a TOTP token must specify a sessionTokenId to complete the
          // password change process. While the `sessionTokenId` is optional, we require it
          // in the case of TOTP because we want to check that session has been verified
          // by TOTP.
          if (result && !sessionTokenId) {
            throw error.unverifiedSession();
          }
        }

        async function getSessionVerificationStatus() {
          if (sessionTokenId) {
            const tokenData = await db.sessionToken(sessionTokenId);
            verifiedStatus = tokenData.tokenVerified;
            if (tokenData.deviceId) {
              originatingDeviceId = tokenData.deviceId;
            }

            if (hasTotp && tokenData.authenticatorAssuranceLevel <= 1) {
              throw error.unverifiedSession();
            }
          } else {
            // Don't create a verified session unless they already had one.
            verifiedStatus = false;
          }
        }

        async function fetchDevicesToNotify() {
          // We fetch the devices to notify before changePassword() because
          // db.resetAccount() deletes all the devices saved in the account.
          devicesToNotify = await request.app.devices;
          // If the originating sessionToken belongs to a device,
          // do not send the notification to that device. It will
          // get informed about the change via WebChannel message.
          if (originatingDeviceId) {
            devicesToNotify = devicesToNotify.filter(
              d => d.id !== originatingDeviceId
            );
          }
        }

        async function changePassword() {
          let authSalt, password;
          const hex = await random.hex(32);
          authSalt = hex;
          password = new Password(authPW, authSalt, verifierVersion);
          await db.deletePasswordChangeToken(passwordChangeToken);
          const hash = await password.verifyHash();
          verifyHash = hash;
          const wrapWrapKb = await password.wrap(wrapKb);
          // Reset account, delete all sessions and tokens
          const result = await db.resetAccount(passwordChangeToken, {
            verifyHash: verifyHash,
            authSalt: authSalt,
            wrapWrapKb: wrapWrapKb,
            verifierVersion: password.version,
          });
          await request.emitMetricsEvent('account.changedPassword', {
            uid: passwordChangeToken.uid,
          });
          return result;
        }

        async function notifyAccount() {
          if (devicesToNotify) {
            // Notify the devices that the account has changed.
            push.notifyPasswordChanged(
              passwordChangeToken.uid,
              devicesToNotify
            );
          }

          account = await db.account(passwordChangeToken.uid);

          log.notifyAttachedServices('passwordChange', request, {
            uid: passwordChangeToken.uid,
            generation: account.verifierSetAt,
          });
          const emails = await db.accountEmails(passwordChangeToken.uid);
          const geoData = request.app.geo;
          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
          } = request.app.ua;

          try {
            return await mailer.sendPasswordChangedNotification(
              emails,
              account,
              {
                acceptLanguage: request.app.acceptLanguage,
                ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser,
                uaBrowserVersion,
                uaOS,
                uaOSVersion,
                uaDeviceType,
                uid: passwordChangeToken.uid,
              }
            );
          } catch (e) {
            // If we couldn't email them, no big deal. Log
            // and pretend everything worked.
            log.trace(
              'Password.changeFinish.sendPasswordChangedNotification.error',
              {
                error: e,
              }
            );
          }
        }

        async function createSessionToken() {
          let maybeToken;
          if (!verifiedStatus) {
            maybeToken = await random.hex(16);
          }
          const {
            browser: uaBrowser,
            browserVersion: uaBrowserVersion,
            os: uaOS,
            osVersion: uaOSVersion,
            deviceType: uaDeviceType,
            formFactor: uaFormFactor,
          } = request.app.ua;

          // Create a sessionToken with the verification status of the current session
          const sessionTokenOptions = {
            uid: account.uid,
            email: account.email,
            emailCode: account.emailCode,
            emailVerified: account.emailVerified,
            verifierSetAt: account.verifierSetAt,
            mustVerify: wantsKeys,
            tokenVerificationId: maybeToken,
            uaBrowser,
            uaBrowserVersion,
            uaOS,
            uaOSVersion,
            uaDeviceType,
            uaFormFactor,
          };

          sessionToken = await db.createSessionToken(sessionTokenOptions);
        }

        async function createKeyFetchToken() {
          if (wantsKeys) {
            // Create a verified keyFetchToken. This is deliberately verified because we don't
            // want to perform an email confirmation loop.
            const result = await db.createKeyFetchToken({
              uid: account.uid,
              kA: account.kA,
              wrapKb: wrapKb,
              emailVerified: account.emailVerified,
            });
            keyFetchToken = result;
            return result;
          }
        }

        async function createResponse() {
          // If no sessionToken, this could be a legacy client
          // attempting to change password, return legacy response.
          if (!sessionTokenId) {
            return {};
          }

          const response = {
            uid: sessionToken.uid,
            sessionToken: sessionToken.data,
            verified: sessionToken.emailVerified && sessionToken.tokenVerified,
            authAt: sessionToken.lastAuthAt(),
          };

          if (wantsKeys) {
            response.keyFetchToken = keyFetchToken.data;
          }

          return response;
        }
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      options: {
        validate: {
          query: {
            service: validators.service,
            keys: isA.boolean().optional(),
          },
          payload: {
            email: validators.email().required(),
            service: validators.service,
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA
              .string()
              .max(2048)
              .optional(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          },
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.forgotSend', request);
        const email = request.payload.email;
        const service = request.payload.service || request.query.service;
        const ip = request.app.clientAddress;

        request.validateMetricsContext();

        let flowCompleteSignal;
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed';
        } else {
          flowCompleteSignal = 'account.reset';
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal);

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.send_code.start'),
          customs.check(request, email, 'passwordForgotSendCode'),
        ]);
        const accountRecord = await db.accountRecord(email);
        if (
          accountRecord.primaryEmail.normalizedEmail !== email.toLowerCase()
        ) {
          throw error.cannotResetPasswordWithSecondaryEmail();
        }
        // The token constructor sets createdAt from its argument.
        // Clobber the timestamp to prevent prematurely expired tokens.
        accountRecord.createdAt = undefined;
        const passwordForgotToken = await db.createPasswordForgotToken(
          accountRecord
        );
        const [_, emails] = await Promise.all([
          request.stashMetricsContext(passwordForgotToken),
          db.accountEmails(passwordForgotToken.uid),
        ]);
        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendRecoveryCode(emails, passwordForgotToken, {
          token: passwordForgotToken,
          code: passwordForgotToken.passCode,
          service: service,
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid: passwordForgotToken.uid,
        });
        await request.emitMetricsEvent('password.forgot.send_code.completed');
        return {
          passwordForgotToken: passwordForgotToken.data,
          ttl: passwordForgotToken.ttl(),
          codeLength: passwordForgotToken.passCode.length,
          tries: passwordForgotToken.tries,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      options: {
        auth: {
          strategy: 'passwordForgotToken',
        },
        validate: {
          query: {
            service: validators.service,
          },
          payload: {
            email: validators.email().required(),
            service: validators.service,
            redirectTo: validators.redirectTo(redirectDomain).optional(),
            resume: isA
              .string()
              .max(2048)
              .optional(),
          },
        },
        response: {
          schema: {
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.forgotResend', request);
        const passwordForgotToken = request.auth.credentials;
        const service = request.payload.service || request.query.service;
        const ip = request.app.clientAddress;

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.resend_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotResendCode'
          ),
        ]);
        const emails = await db.accountEmails(passwordForgotToken.uid);
        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        await mailer.sendRecoveryCode(emails, passwordForgotToken, {
          code: passwordForgotToken.passCode,
          token: passwordForgotToken,
          service,
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uid: passwordForgotToken.uid,
        });

        await request.emitMetricsEvent('password.forgot.resend_code.completed');
        return {
          passwordForgotToken: passwordForgotToken.data,
          ttl: passwordForgotToken.ttl(),
          codeLength: passwordForgotToken.passCode.length,
          tries: passwordForgotToken.tries,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      options: {
        auth: {
          strategy: 'passwordForgotToken',
        },
        validate: {
          payload: {
            code: isA
              .string()
              .min(32)
              .max(32)
              .regex(HEX_STRING)
              .required(),
            accountResetWithRecoveryKey: isA.boolean().optional(),
          },
        },
        response: {
          schema: {
            accountResetToken: isA.string(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.forgotVerify', request);
        const passwordForgotToken = request.auth.credentials;
        const code = request.payload.code;
        const accountResetWithRecoveryKey =
          request.payload.accountResetWithRecoveryKey;

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        let accountResetToken;

        await Promise.all([
          request.emitMetricsEvent('password.forgot.verify_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotVerifyCode'
          ),
        ]);

        if (
          butil.buffersAreEqual(passwordForgotToken.passCode, code) &&
          passwordForgotToken.ttl() > 0
        ) {
          accountResetToken = await db.forgotPasswordVerified(
            passwordForgotToken
          );
        } else {
          await failVerifyAttempt(passwordForgotToken);
          throw error.invalidVerificationCode({
            tries: passwordForgotToken.tries,
            ttl: passwordForgotToken.ttl(),
          });
        }
        const [_, emails] = await Promise.all([
          request.propagateMetricsContext(
            passwordForgotToken,
            accountResetToken
          ),
          db.accountEmails(passwordForgotToken.uid),
        ]);
        if (accountResetWithRecoveryKey) {
          // To prevent multiple password change emails being sent to a user,
          // we check for a flag to see if this is a reset using an account recovery key.
          // If it is, then the notification email will be sent in `/account/reset`
          return;
        }

        await mailer.sendPasswordResetNotification(
          emails,
          passwordForgotToken,
          {
            code,
            acceptLanguage: request.app.acceptLanguage,
            deviceId,
            flowId,
            flowBeginTime,
            uid: passwordForgotToken.uid,
          }
        );
        await request.emitMetricsEvent('password.forgot.verify_code.completed');
        return {
          accountResetToken: accountResetToken.data,
        };
      },
    },
    {
      method: 'GET',
      path: '/password/forgot/status',
      options: {
        auth: {
          strategy: 'passwordForgotToken',
        },
        response: {
          schema: {
            tries: isA.number(),
            ttl: isA.number(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Password.forgotStatus', request);
        const passwordForgotToken = request.auth.credentials;
        return {
          tries: passwordForgotToken.tries,
          ttl: passwordForgotToken.ttl(),
        };
      },
    },
  ];

  return routes;
};
