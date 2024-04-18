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
const { recordSecurityEvent } = require('./utils/security-event');
const { emailsMatch } = require('fxa-shared').email.helpers;
const { OtpManager } = require('@fxa/shared/otp');

const PASSWORD_DOCS = require('../../docs/swagger/password-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

module.exports = function (
  log,
  db,
  Password,
  redirectDomain,
  mailer,
  verifierVersion,
  customs,
  signinUtils,
  push,
  config,
  oauth,
  glean,
  authServerCacheRedis,
  statsd
) {
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);
  const otpRedisAdapter = config.passwordForgotOtp.enabled
    ? {
        set: async (key, val) => {
          return authServerCacheRedis.set(
            key,
            val,
            'EX',
            config.passwordForgotOtp.ttl
          );
        },
        get: async (key) => {
          return authServerCacheRedis.get(key);
        },
        del: async (key) => {
          return authServerCacheRedis.del(key);
        },
      }
    : { set: () => {}, get: () => {}, del: () => {} };
  const otpManager = new OtpManager(
    { kind: 'passwordForgot', digits: config.passwordForgotOtp.digits },
    otpRedisAdapter
  );

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
        ...PASSWORD_DOCS.PASSWORD_CHANGE_START_POST,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            oldAuthPW: validators.authPW.description(DESCRIPTION.authPW),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Password.changeStart', request);
        const form = request.payload;
        const { oldAuthPW, email } = form;

        await customs.check(request, email, 'passwordChange');

        let keyFetchToken = undefined;
        let keyFetchToken2 = undefined;
        let passwordChangeToken = undefined;

        try {
          const emailRecord = await db.accountRecord(email);
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

          if (password.clientVersion === 1) {
            const unwrappedKb = await password.unwrap(emailRecord.wrapWrapKb);
            keyFetchToken = await db.createKeyFetchToken({
              uid: emailRecord.uid,
              kA: emailRecord.kA,
              wrapKb: unwrappedKb,
              emailVerified: emailRecord.emailVerified,
            });
          }

          if (password.clientVersion === 2) {
            const unwrappedKb = await password.unwrap(
              emailRecord.wrapWrapKbVersion2
            );
            keyFetchToken2 = await db.createKeyFetchToken({
              uid: emailRecord.uid,
              kA: emailRecord.kA,
              wrapKb: unwrappedKb,
              emailVerified: emailRecord.emailVerified,
            });
          }

          passwordChangeToken = await db.createPasswordChangeToken({
            uid: emailRecord.uid,
          });
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
          keyFetchToken: keyFetchToken?.data,
          keyFetchToken2: keyFetchToken2?.data,
          passwordChangeToken: passwordChangeToken?.data,
          verified:
            keyFetchToken?.emailVerified || keyFetchToken2?.emailVerified,
        };
      },
    },
    {
      method: 'POST',
      path: '/password/change/finish',
      options: {
        ...PASSWORD_DOCS.PASSWORD_CHANGE_FINISH_POST,
        auth: {
          strategy: 'passwordChangeToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            keys: isA.boolean().optional().description(DESCRIPTION.queryKeys),
          }),
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              authPWVersion2: validators.authPW
                .optional()
                .description(DESCRIPTION.authPW),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
              sessionToken: isA
                .string()
                .min(64)
                .max(64)
                .regex(HEX_STRING)
                .optional()
                .description(DESCRIPTION.sessionToken),
            })
            .and('authPWVersion2', 'wrapKbVersion2', 'clientSalt'),
        },
      },
      handler: async function (request) {
        log.begin('Password.changeFinish', request);
        const passwordChangeToken = request.auth.credentials;
        const { authPW, authPWVersion2, wrapKb, wrapKbVersion2, clientSalt } =
          request.payload;
        const sessionTokenId = request.payload.sessionToken;
        const wantsKeys = requestHelper.wantsKeys(request);
        const ip = request.app.clientAddress;
        let account,
          sessionToken,
          previousSessionToken,
          keyFetchToken,
          keyFetchToken2,
          verifiedStatus,
          devicesToNotify,
          originatingDeviceId,
          hasTotp = false;

        return checkTotpToken()
          .then(getSessionVerificationStatus)
          .then(fetchDevicesToNotify)
          .then(changePassword)
          .then(notifyAccount)
          .then(createSessionToken)
          .then(verifySessionToken)
          .then(createKeyFetchToken)
          .then(createResponse);

        function checkTotpToken() {
          return otpUtils.hasTotpToken(passwordChangeToken).then((result) => {
            hasTotp = result;

            // Currently, users that have a TOTP token must specify a sessionTokenId to complete the
            // password change process. While the `sessionTokenId` is optional, we require it
            // in the case of TOTP because we want to check that session has been verified
            // by TOTP.
            if (result && !sessionTokenId) {
              throw error.unverifiedSession();
            }
          });
        }

        function getSessionVerificationStatus() {
          if (sessionTokenId) {
            return db.sessionToken(sessionTokenId).then((tokenData) => {
              previousSessionToken = tokenData;
              verifiedStatus = tokenData.tokenVerified;
              if (tokenData.deviceId) {
                originatingDeviceId = tokenData.deviceId;
              }

              if (hasTotp && tokenData.authenticatorAssuranceLevel <= 1) {
                throw error.unverifiedSession();
              }
            });
          } else {
            // Don't create a verified session unless they already had one.
            verifiedStatus = false;
            return Promise.resolve();
          }
        }

        function fetchDevicesToNotify() {
          // We fetch the devices to notify before changePassword() because
          // db.resetAccount() deletes all the devices saved in the account.
          return request.app.devices.then((devices) => {
            devicesToNotify = devices;
            // If the originating sessionToken belongs to a device,
            // do not send the notification to that device. It will
            // get informed about the change via WebChannel message.
            if (originatingDeviceId) {
              devicesToNotify = devicesToNotify.filter(
                (d) => d.id !== originatingDeviceId
              );
            }
          });
        }

        async function changePassword() {
          const authSalt = await random.hex(32);
          const password = new Password(authPW, authSalt, verifierVersion);
          const verifyHash = await password.verifyHash();
          const wrapWrapKb = await password.wrap(wrapKb);

          // For the time being we store both passwords in the DB. authPW is created
          // with the old quickStretch and authPWVersion2 is created with improved 'quick' stretch.
          let password2 = undefined;
          let verifyHashVersion2 = undefined;
          let wrapWrapKbVersion2 = undefined;
          if (authPWVersion2) {
            password2 = new Password(
              authPWVersion2,
              authSalt,
              verifierVersion,
              2
            );
            verifyHashVersion2 = await password2.verifyHash();
            wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
          }

          await db.deletePasswordChangeToken(passwordChangeToken);

          const result = await db.resetAccount(passwordChangeToken, {
            authSalt: authSalt,
            clientSalt: clientSalt,
            verifierVersion: password.version,
            verifyHash: verifyHash,
            verifyHashVersion2: verifyHashVersion2,
            wrapWrapKb: wrapWrapKb,
            wrapWrapKbVersion2: wrapWrapKbVersion2,
            keysHaveChanged: false,
          });

          await request.emitMetricsEvent('account.changedPassword', {
            uid: passwordChangeToken.uid,
          });

          await recordSecurityEvent('account.password_reset_success', {
            db,
            request,
            account: passwordChangeToken,
          });

          await recordSecurityEvent('account.password_changed', {
            db,
            request,
            account: passwordChangeToken,
          });

          return result;
        }

        function notifyAccount() {
          if (devicesToNotify) {
            // Notify the devices that the account has changed.
            push.notifyPasswordChanged(
              passwordChangeToken.uid,
              devicesToNotify
            );
          }

          return db
            .account(passwordChangeToken.uid)
            .then((accountData) => {
              account = accountData;

              log.notifyAttachedServices('passwordChange', request, {
                uid: passwordChangeToken.uid,
                generation: account.verifierSetAt,
              });
              return oauth.removePublicAndCanGrantTokens(
                passwordChangeToken.uid
              );
            })
            .then(() => {
              return db.accountEmails(passwordChangeToken.uid);
            })
            .then((emails) => {
              const geoData = request.app.geo;
              const {
                browser: uaBrowser,
                browserVersion: uaBrowserVersion,
                os: uaOS,
                osVersion: uaOSVersion,
                deviceType: uaDeviceType,
              } = request.app.ua;

              return mailer
                .sendPasswordChangedEmail(emails, account, {
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
                })
                .catch((e) => {
                  // If we couldn't email them, no big deal. Log
                  // and pretend everything worked.
                  log.trace(
                    'Password.changeFinish.sendPasswordChangedNotification.error',
                    {
                      error: e,
                    }
                  );
                });
            });
        }

        function createSessionToken() {
          return Promise.resolve()
            .then(() => {
              if (!verifiedStatus) {
                return random.hex(16);
              }
            })
            .then((maybeToken) => {
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

              return db.createSessionToken(sessionTokenOptions);
            })
            .then((result) => {
              sessionToken = result;
            });
        }

        function verifySessionToken() {
          if (
            sessionToken &&
            previousSessionToken &&
            previousSessionToken.verificationMethodValue
          ) {
            return db.verifyTokensWithMethod(
              sessionToken.id,
              previousSessionToken.verificationMethodValue
            );
          }
        }

        async function createKeyFetchToken() {
          if (wantsKeys) {
            // Create a verified keyFetchToken. This is deliberately verified because we don't
            // want to perform an email confirmation loop.
            if (authPW) {
              keyFetchToken = await db.createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKb,
                emailVerified: account.emailVerified,
              });
            }

            if (authPWVersion2) {
              keyFetchToken2 = await db.createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKbVersion2,
                emailVerified: account.emailVerified,
              });
            }
          }
        }

        function createResponse() {
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
            if (keyFetchToken) {
              response.keyFetchToken = keyFetchToken.data;
            }

            if (keyFetchToken2) {
              response.keyFetchToken2 = keyFetchToken2.data;
            }
          }

          return response;
        }
      },
    },
    {
      // This endpoint will eventually replace '/password/forgot/send_code'
      // below.  That is also the reason for the similarity between them.
      method: 'POST',
      path: '/password/forgot/send_otp',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_SEND_OTP_POST,
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
            keys: isA.boolean().optional(),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
      },
      handler: async function (request) {
        if (!config.passwordForgotOtp.enabled) {
          throw error.featureNotEnabled();
        }

        log.begin('Password.forgotOtp', request);
        await request.emitMetricsEvent('password.forgot.send_otp.start');
        const email = request.payload.email;

        // TODO FXA-9485
        // await customs.check(request, email, 'passwordForgotSendOtp');

        request.validateMetricsContext();

        let flowCompleteSignal;
        if (requestHelper.wantsKeys(request)) {
          flowCompleteSignal = 'account.signed';
        } else {
          flowCompleteSignal = 'account.reset';
        }
        request.setMetricsFlowCompleteSignal(flowCompleteSignal);

        const account = await db.accountRecord(email);
        const code = await otpManager.create(account.uid);

        const ip = request.app.clientAddress;
        const service = request.payload.service || request.query.service;
        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;
        const geoData = request.app.geo;
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
        } = request.app.ua;

        // TODO FXA-7852
        // await mailer.sendPasswordForgotOtpEmail(account.emails, account, {
        const noopSendMail = () => {};
        noopSendMail(account.emails, account, {
          code,
          service,
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
          uid: account.uid,
        });

        // TODO FXA-9486
        // glean.resetPassword.otpEmailSent(request);

        await request.emitMetricsEvent('password.forgot.send_otp.completed');
        recordSecurityEvent('account.password_reset_otp_sent', {
          db,
          request,
          account: { uid: account.uid },
        });
        statsd.increment('otp.passwordForgot.sent');

        return {};
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/send_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_SEND_CODE_POST,
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
            keys: isA.boolean().optional(),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            redirectTo: validators
              .redirectTo(redirectDomain)
              .optional()
              .description(DESCRIPTION.redirectTo),
            resume: isA
              .string()
              .max(2048)
              .optional()
              .description(DESCRIPTION.resume),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          }),
        },
      },
      handler: async function (request) {
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

        let passwordForgotToken;

        return Promise.all([
          request.emitMetricsEvent('password.forgot.send_code.start'),
          customs.check(request, email, 'passwordForgotSendCode'),
        ])

          .then(db.accountRecord.bind(db, email))
          .then((accountRecord) => {
            if (
              !emailsMatch(accountRecord.primaryEmail.normalizedEmail, email)
            ) {
              throw error.cannotResetPasswordWithSecondaryEmail();
            }
            // The token constructor sets createdAt from its argument.
            // Clobber the timestamp to prevent prematurely expired tokens.
            accountRecord.createdAt = undefined;
            return db.createPasswordForgotToken(accountRecord);
          })
          .then((result) => {
            passwordForgotToken = result;
            return Promise.all([
              request.stashMetricsContext(passwordForgotToken),
              db.accountEmails(passwordForgotToken.uid),
            ]);
          })
          .then(([_, emails]) => {
            const geoData = request.app.geo;
            const {
              browser: uaBrowser,
              browserVersion: uaBrowserVersion,
              os: uaOS,
              osVersion: uaOSVersion,
              deviceType: uaDeviceType,
            } = request.app.ua;

            return mailer.sendRecoveryEmail(emails, passwordForgotToken, {
              emailToHashWith: passwordForgotToken.email,
              token: passwordForgotToken.data,
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
          })
          .then(() =>
            request.emitMetricsEvent('password.forgot.send_code.completed')
          )
          .then(() => glean.resetPassword.emailSent(request))
          .then(() => ({
            passwordForgotToken: passwordForgotToken.data,
            ttl: passwordForgotToken.ttl(),
            codeLength: passwordForgotToken.passCode.length,
            tries: passwordForgotToken.tries,
          }));
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/resend_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_RESEND_CODE_POST,
        auth: {
          strategy: 'passwordForgotToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            service: validators.service.description(DESCRIPTION.serviceRP),
          }),
          payload: isA.object({
            email: validators
              .email()
              .required()
              .description(DESCRIPTION.emailRecovery),
            service: validators.service.description(DESCRIPTION.serviceRP),
            redirectTo: validators
              .redirectTo(redirectDomain)
              .optional()
              .description(DESCRIPTION.redirectTo),
            resume: isA
              .string()
              .max(2048)
              .optional()
              .description(DESCRIPTION.resume),
          }),
        },
        response: {
          schema: isA.object({
            passwordForgotToken: isA.string(),
            ttl: isA.number(),
            codeLength: isA.number(),
            tries: isA.number(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Password.forgotResend', request);
        const passwordForgotToken = request.auth.credentials;
        const service = request.payload.service || request.query.service;
        const ip = request.app.clientAddress;

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        return Promise.all([
          request.emitMetricsEvent('password.forgot.resend_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotResendCode'
          ),
        ])
          .then(() => {
            return db.accountEmails(passwordForgotToken.uid).then((emails) => {
              const geoData = request.app.geo;
              const {
                browser: uaBrowser,
                browserVersion: uaBrowserVersion,
                os: uaOS,
                osVersion: uaOSVersion,
                deviceType: uaDeviceType,
              } = request.app.ua;

              return mailer.sendRecoveryEmail(emails, passwordForgotToken, {
                code: passwordForgotToken.passCode,
                emailToHashWith: passwordForgotToken.email,
                token: passwordForgotToken.data,
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
            });
          })
          .then(() => {
            return request.emitMetricsEvent(
              'password.forgot.resend_code.completed'
            );
          })
          .then(() => {
            recordSecurityEvent('account.password_reset_requested', {
              db,
              request,
            });
          })
          .then(() => {
            return {
              passwordForgotToken: passwordForgotToken.data,
              ttl: passwordForgotToken.ttl(),
              codeLength: passwordForgotToken.passCode.length,
              tries: passwordForgotToken.tries,
            };
          });
      },
    },
    {
      method: 'POST',
      path: '/password/forgot/verify_code',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_VERIFY_CODE_POST,
        auth: {
          strategy: 'passwordForgotToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            code: isA
              .string()
              .min(32)
              .max(32)
              .regex(HEX_STRING)
              .required()
              .description(DESCRIPTION.codeRecovery),
            accountResetWithRecoveryKey: isA.boolean().optional(),
          }),
        },
        response: {
          schema: isA.object({
            accountResetToken: isA.string(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Password.forgotVerify', request);
        const passwordForgotToken = request.auth.credentials;
        const code = request.payload.code;
        const accountResetWithRecoveryKey =
          request.payload.accountResetWithRecoveryKey;

        const { deviceId, flowId, flowBeginTime } = await request.app
          .metricsContext;

        let accountResetToken;

        return Promise.all([
          request.emitMetricsEvent('password.forgot.verify_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotVerifyCode'
          ),
        ])
          .then(() => {
            if (
              butil.buffersAreEqual(passwordForgotToken.passCode, code) &&
              passwordForgotToken.ttl() > 0
            ) {
              return db.forgotPasswordVerified(passwordForgotToken);
            }

            return failVerifyAttempt(passwordForgotToken).then(() => {
              throw error.invalidVerificationCode({
                tries: passwordForgotToken.tries,
                ttl: passwordForgotToken.ttl(),
              });
            });
          })
          .then((result) => {
            accountResetToken = result;
            return Promise.all([
              request.propagateMetricsContext(
                passwordForgotToken,
                accountResetToken
              ),
              db.accountEmails(passwordForgotToken.uid),
            ]);
          })
          .then(([_, emails]) => {
            if (accountResetWithRecoveryKey) {
              // To prevent multiple password change emails being sent to a user,
              // we check for a flag to see if this is a reset using an account recovery key.
              // If it is, then the notification email will be sent in `/account/reset`
              return Promise.resolve();
            }

            return mailer.sendPasswordResetEmail(emails, passwordForgotToken, {
              code,
              acceptLanguage: request.app.acceptLanguage,
              deviceId,
              flowId,
              flowBeginTime,
              uid: passwordForgotToken.uid,
            });
          })
          .then(() =>
            request.emitMetricsEvent('password.forgot.verify_code.completed')
          )
          .then(() => ({
            accountResetToken: accountResetToken.data,
          }));
      },
    },
    {
      method: 'POST',
      path: '/password/create',
      options: {
        ...PASSWORD_DOCS.PASSWORD_CREATE_POST,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              authPWVersion2: validators.authPWVersion2
                .optional()
                .description(DESCRIPTION.authPWVersion2),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
            })
            .and('authPWVersion2', 'wrapKb', 'wrapKbVersion2', 'clientSalt'),
        },
      },
      handler: async function (request) {
        log.begin('Password.create', request);
        const sessionToken = request.auth.credentials;
        const { uid } = sessionToken;

        const { authPW, authPWVersion2, wrapKb, wrapKbVersion2, clientSalt } =
          request.payload;

        const account = await db.account(uid);
        // We don't allow users that have a password set already to create a new password
        // because this process would destroy their original encryption keys and might
        // leave the account in an invalid state.
        if (account.verifierSetAt > 0) {
          throw error.cannotCreatePassword();
        }

        // Users that have enabled 2FA must be in a 2FA verified session to create a password.
        const hasTotpToken = await otpUtils.hasTotpToken(account);
        if (
          hasTotpToken &&
          (sessionToken.tokenVerificationId ||
            sessionToken.authenticatorAssuranceLevel <= 1)
        ) {
          throw error.unverifiedSession();
        }

        const authSalt = await random.hex(32);

        // For V1 credentials
        const password = new Password(authPW, authSalt, config.verifierVersion);
        const verifyHash = await password.verifyHash();
        let wrapWrapKb = undefined;

        // For V2 credentials
        let wrapWrapKbVersion2 = undefined;
        let verifyHashVersion2 = undefined;
        if (authPWVersion2) {
          const password2 = new Password(
            authPWVersion2,
            authSalt,
            config.verifierVersion
          );
          wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
          verifyHashVersion2 = await password2.verifyHash();

          // Important! For V2 credentials, wrapKb and wrapKbVersion2 are supplied by client
          // to ensure that a single kB results from either password. Therefore, we
          // must used supplied wrapKb
          wrapWrapKb = await password.wrap(wrapKb);
        } else {
          wrapWrapKb = await random.hex(32);
        }

        const passwordCreated = await db.createPassword(
          uid,
          authSalt,
          clientSalt,
          verifyHash,
          verifyHashVersion2,
          wrapWrapKb,
          wrapWrapKbVersion2,
          verifierVersion
        );

        recordSecurityEvent('account.password_added', {
          db,
          request,
          account: { uid },
        });

        return passwordCreated;
      },
    },
    {
      method: 'GET',
      path: '/password/forgot/status',
      options: {
        ...PASSWORD_DOCS.PASSWORD_FORGOT_STATUS_GET,
        auth: {
          strategy: 'passwordForgotToken',
        },
        response: {
          schema: isA.object({
            tries: isA.number(),
            ttl: isA.number(),
          }),
        },
      },
      handler: async function (request) {
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
