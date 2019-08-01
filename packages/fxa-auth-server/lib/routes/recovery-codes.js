/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const isA = require('joi');
const BASE_36 = require('./validators').BASE_36;
const RECOVERY_CODE_SANE_MAX_LENGTH = 20;

module.exports = (log, db, config, customs, mailer) => {
  const codeConfig = config.recoveryCodes;
  const RECOVERY_CODE_COUNT = (codeConfig && codeConfig.count) || 8;

  return [
    {
      method: 'GET',
      path: '/recoveryCodes',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: {
            recoveryCodes: isA.array().items(isA.string()),
          },
        },
      },
      handler: async function(request) {
        log.begin('replaceRecoveryCodes', request);

        const uid = request.auth.credentials.uid;
        const sessionToken = request.auth.credentials;
        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        let codes;

        return replaceRecoveryCodes()
          .then(sendEmailNotification)
          .then(emitMetrics)
          .then(() => {
            return {
              recoveryCodes: codes,
            };
          });

        function replaceRecoveryCodes() {
          // Since TOTP and recovery codes go hand in hand, you should only be
          // able to replace recovery codes in a TOTP verified session.
          if (
            !sessionToken.authenticatorAssuranceLevel ||
            sessionToken.authenticatorAssuranceLevel <= 1
          ) {
            throw errors.unverifiedSession();
          }

          return db
            .replaceRecoveryCodes(uid, RECOVERY_CODE_COUNT)
            .then(result => {
              codes = result;
            });
        }

        function sendEmailNotification() {
          return db.account(sessionToken.uid).then(account => {
            return mailer.sendPostNewRecoveryCodesNotification(
              account.emails,
              account,
              {
                acceptLanguage: request.app.acceptLanguage,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: request.app.ua.browser,
                uaBrowserVersion: request.app.ua.browserVersion,
                uaOS: request.app.ua.os,
                uaOSVersion: request.app.ua.osVersion,
                uaDeviceType: request.app.ua.deviceType,
                uid: sessionToken.uid,
              }
            );
          });
        }

        function emitMetrics() {
          log.info('account.recoveryCode.replaced', {
            uid: uid,
          });

          return request
            .emitMetricsEvent('recoveryCode.replaced', { uid: uid })
            .then(() => ({}));
        }
      },
    },
    {
      method: 'POST',
      path: '/session/verify/recoveryCode',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            code: isA
              .string()
              .max(RECOVERY_CODE_SANE_MAX_LENGTH)
              .regex(BASE_36)
              .required(),
          },
        },
        response: {
          schema: {
            remaining: isA.number(),
          },
        },
      },
      handler: async function(request) {
        log.begin('session.verify.recoveryCode', request);

        const code = request.payload.code;
        const uid = request.auth.credentials.uid;
        const sessionToken = request.auth.credentials;
        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        let remainingRecoveryCodes;

        return customs
          .check(request, sessionToken.email, 'verifyRecoveryCode')
          .then(consumeRecoveryCode)
          .then(verifySession)
          .then(sendEmailNotification)
          .then(emitMetrics)
          .then(() => {
            return {
              remaining: remainingRecoveryCodes,
            };
          });

        function consumeRecoveryCode() {
          return db.consumeRecoveryCode(uid, code).then(result => {
            remainingRecoveryCodes = result.remaining;
            if (remainingRecoveryCodes === 0) {
              log.info('account.recoveryCode.consumedAllCodes', {
                uid,
              });
            }
          });
        }

        function verifySession() {
          if (sessionToken.tokenVerificationId) {
            return db.verifyTokensWithMethod(sessionToken.id, 'recovery-code');
          }
        }

        function sendEmailNotification() {
          return db.account(sessionToken.uid).then(account => {
            const defers = [];

            const sendConsumeEmail = mailer.sendPostConsumeRecoveryCodeNotification(
              account.emails,
              account,
              {
                acceptLanguage: request.app.acceptLanguage,
                ip: ip,
                location: geoData.location,
                timeZone: geoData.timeZone,
                uaBrowser: request.app.ua.browser,
                uaBrowserVersion: request.app.ua.browserVersion,
                uaOS: request.app.ua.os,
                uaOSVersion: request.app.ua.osVersion,
                uaDeviceType: request.app.ua.deviceType,
                uid: sessionToken.uid,
              }
            );
            defers.push(sendConsumeEmail);

            if (remainingRecoveryCodes <= codeConfig.notifyLowCount) {
              log.info('account.recoveryCode.notifyLowCount', {
                uid,
                remaining: remainingRecoveryCodes,
              });
              const sendLowCodesEmail = mailer.sendLowRecoveryCodeNotification(
                account.emails,
                account,
                {
                  acceptLanguage: request.app.acceptLanguage,
                  numberRemaining: remainingRecoveryCodes,
                  uid: sessionToken.uid,
                }
              );
              defers.push(sendLowCodesEmail);
            }

            return Promise.all(defers);
          });
        }

        function emitMetrics() {
          log.info('account.recoveryCode.verified', {
            uid: uid,
          });

          return request
            .emitMetricsEvent('recoveryCode.verified', { uid: uid })
            .then(() => ({}));
        }
      },
    },
  ];
};
