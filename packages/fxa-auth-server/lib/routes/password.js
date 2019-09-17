/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const validators = require('./validators');
const HEX_STRING = validators.HEX_STRING;

const butil = require('../crypto/butil');
const error = require('../error');
const isA = require('joi');
const P = require('../promise');
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
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);

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

        return customs
          .check(request, form.email, 'passwordChange')
          .then(db.accountRecord.bind(db, form.email))
          .then(
            emailRecord => {
              const password = new Password(
                oldAuthPW,
                emailRecord.authSalt,
                emailRecord.verifierVersion
              );
              return signinUtils
                .checkPassword(emailRecord, password, request.app.clientAddress)
                .then(match => {
                  if (!match) {
                    throw error.incorrectPassword(
                      emailRecord.email,
                      form.email
                    );
                  }
                  const password = new Password(
                    oldAuthPW,
                    emailRecord.authSalt,
                    emailRecord.verifierVersion
                  );
                  return password.unwrap(emailRecord.wrapWrapKb);
                })
                .then(wrapKb => {
                  return db
                    .createKeyFetchToken({
                      uid: emailRecord.uid,
                      kA: emailRecord.kA,
                      wrapKb: wrapKb,
                      emailVerified: emailRecord.emailVerified,
                    })
                    .then(keyFetchToken => {
                      return db
                        .createPasswordChangeToken({
                          uid: emailRecord.uid,
                        })
                        .then(passwordChangeToken => {
                          return {
                            keyFetchToken: keyFetchToken,
                            passwordChangeToken: passwordChangeToken,
                          };
                        });
                    });
                });
            },
            err => {
              if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
                customs.flag(request.app.clientAddress, {
                  email: form.email,
                  errno: err.errno,
                });
              }
              throw err;
            }
          )
          .then(tokens => {
            return {
              keyFetchToken: tokens.keyFetchToken.data,
              passwordChangeToken: tokens.passwordChangeToken.data,
              verified: tokens.keyFetchToken.emailVerified,
            };
          });
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

        return checkTotpToken()
          .then(getSessionVerificationStatus)
          .then(fetchDevicesToNotify)
          .then(changePassword)
          .then(notifyAccount)
          .then(createSessionToken)
          .then(createKeyFetchToken)
          .then(createResponse);

        function checkTotpToken() {
          return otpUtils.hasTotpToken(passwordChangeToken).then(result => {
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
            return db.sessionToken(sessionTokenId).then(tokenData => {
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
            return P.resolve();
          }
        }

        function fetchDevicesToNotify() {
          // We fetch the devices to notify before changePassword() because
          // db.resetAccount() deletes all the devices saved in the account.
          return request.app.devices.then(devices => {
            devicesToNotify = devices;
            // If the originating sessionToken belongs to a device,
            // do not send the notification to that device. It will
            // get informed about the change via WebChannel message.
            if (originatingDeviceId) {
              devicesToNotify = devicesToNotify.filter(
                d => d.id !== originatingDeviceId
              );
            }
          });
        }

        function changePassword() {
          let authSalt, password;
          return random
            .hex(32)
            .then(hex => {
              authSalt = hex;
              password = new Password(authPW, authSalt, verifierVersion);
              return db.deletePasswordChangeToken(passwordChangeToken);
            })
            .then(() => {
              return password.verifyHash();
            })
            .then(hash => {
              verifyHash = hash;
              return password.wrap(wrapKb);
            })
            .then(wrapWrapKb => {
              // Reset account, delete all sessions and tokens
              return db.resetAccount(passwordChangeToken, {
                verifyHash: verifyHash,
                authSalt: authSalt,
                wrapWrapKb: wrapWrapKb,
                verifierVersion: password.version,
              });
            })
            .then(result => {
              return request
                .emitMetricsEvent('account.changedPassword', {
                  uid: passwordChangeToken.uid,
                })
                .then(() => {
                  return result;
                });
            });
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
            .then(accountData => {
              account = accountData;

              log.notifyAttachedServices('passwordChange', request, {
                uid: passwordChangeToken.uid,
                generation: account.verifierSetAt,
              });
              return db.accountEmails(passwordChangeToken.uid);
            })
            .then(emails => {
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
                .catch(e => {
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
          return P.resolve()
            .then(() => {
              if (!verifiedStatus) {
                return random.hex(16);
              }
            })
            .then(maybeToken => {
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
            .then(result => {
              sessionToken = result;
            });
        }

        function createKeyFetchToken() {
          if (wantsKeys) {
            // Create a verified keyFetchToken. This is deliberately verified because we don't
            // want to perform an email confirmation loop.
            return db
              .createKeyFetchToken({
                uid: account.uid,
                kA: account.kA,
                wrapKb: wrapKb,
                emailVerified: account.emailVerified,
              })
              .then(result => {
                keyFetchToken = result;
              });
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

        let passwordForgotToken;

        return P.all([
          request.emitMetricsEvent('password.forgot.send_code.start'),
          customs.check(request, email, 'passwordForgotSendCode'),
        ])
          .then(db.accountRecord.bind(db, email))
          .then(accountRecord => {
            if (
              accountRecord.primaryEmail.normalizedEmail !== email.toLowerCase()
            ) {
              throw error.cannotResetPasswordWithSecondaryEmail();
            }
            // The token constructor sets createdAt from its argument.
            // Clobber the timestamp to prevent prematurely expired tokens.
            accountRecord.createdAt = undefined;
            return db.createPasswordForgotToken(accountRecord);
          })
          .then(result => {
            passwordForgotToken = result;
            return P.all([
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

        return P.all([
          request.emitMetricsEvent('password.forgot.resend_code.start'),
          customs.check(
            request,
            passwordForgotToken.email,
            'passwordForgotResendCode'
          ),
        ])
          .then(() => {
            return db.accountEmails(passwordForgotToken.uid).then(emails => {
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

        return P.all([
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
          .then(result => {
            accountResetToken = result;
            return P.all([
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
              return P.resolve();
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
