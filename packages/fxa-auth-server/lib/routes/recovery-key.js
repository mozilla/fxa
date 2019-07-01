/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const validators = require('./validators');
const isA = require('joi');

module.exports = (log, db, Password, verifierVersion, customs, mailer) => {
  return [
    {
      method: 'POST',
      path: '/recoveryKey',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            recoveryKeyId: validators.recoveryKeyId,
            recoveryData: validators.recoveryData,
          },
        },
      },
      handler: async function(request) {
        log.begin('createRecoveryKey', request);

        const uid = request.auth.credentials.uid;
        const sessionToken = request.auth.credentials;
        const { recoveryKeyId, recoveryData } = request.payload;

        return createRecoveryKey()
          .then(emitMetrics)
          .then(sendNotificationEmails)
          .then(() => {
            return {};
          });

        function createRecoveryKey() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession();
          }

          return db.createRecoveryKey(uid, recoveryKeyId, recoveryData);
        }

        function emitMetrics() {
          log.info('account.recoveryKey.created', {
            uid,
          });

          return request.emitMetricsEvent('recoveryKey.created', { uid });
        }

        function sendNotificationEmails() {
          return db.account(uid).then(account => {
            const geoData = request.app.geo;
            const ip = request.app.clientAddress;
            const emailOptions = {
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
            };

            return mailer.sendPostAddAccountRecoveryNotification(
              account.emails,
              account,
              emailOptions
            );
          });
        }
      },
    },
    {
      method: 'GET',
      path: '/recoveryKey/{recoveryKeyId}',
      options: {
        auth: {
          strategy: 'accountResetToken',
        },
        validate: {
          params: {
            recoveryKeyId: validators.recoveryKeyId,
          },
        },
      },
      handler: async function(request) {
        log.begin('getRecoveryKey', request);

        const uid = request.auth.credentials.uid;
        const recoveryKeyId = request.params.recoveryKeyId;
        let recoveryData;

        return customs
          .checkAuthenticated(request, uid, 'getRecoveryKey')
          .then(getRecoveryKey)
          .then(() => {
            return { recoveryData };
          });

        function getRecoveryKey() {
          return db
            .getRecoveryKey(uid, recoveryKeyId)
            .then(res => (recoveryData = res.recoveryData));
        }
      },
    },
    {
      method: 'POST',
      path: '/recoveryKey/exists',
      options: {
        auth: {
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            email: validators.email().optional(),
          },
        },
        response: {
          schema: {
            exists: isA.boolean().required(),
          },
        },
      },
      handler(request) {
        log.begin('recoveryKeyExists', request);

        const email = request.payload.email;
        let uid;

        if (request.auth.credentials) {
          uid = request.auth.credentials.uid;
        }

        return Promise.resolve()
          .then(() => {
            if (!uid) {
              // If not using a sessionToken, an email is required to check
              // for a recovery key. This occurs when checking from the
              // password reset page and allows us to redirect the user to either
              // the regular password reset or account recovery password reset.
              if (!email) {
                throw errors.missingRequestParameter('email');
              }

              return customs
                .check(request, email, 'recoveryKeyExists')
                .then(() => db.accountRecord(email))
                .then(result => (uid = result.uid));
            }

            // When checking from `/settings` a sessionToken is required and the
            // request is not rate limited.
          })
          .then(() => db.recoveryKeyExists(uid));
      },
    },
    {
      method: 'DELETE',
      path: '/recoveryKey',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler(request) {
        log.begin('recoveryKeyDelete', request);

        const sessionToken = request.auth.credentials;

        return Promise.resolve()
          .then(deleteRecoveryKey)
          .then(sendNotificationEmail)
          .then(() => {
            return {};
          });

        function deleteRecoveryKey() {
          if (sessionToken.tokenVerificationId) {
            throw errors.unverifiedSession();
          }

          return db.deleteRecoveryKey(sessionToken.uid);
        }

        function sendNotificationEmail() {
          const geoData = request.app.geo;
          const ip = request.app.clientAddress;
          const emailOptions = {
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
          };

          return db
            .account(sessionToken.uid)
            .then(account =>
              mailer.sendPostRemoveAccountRecoveryNotification(
                account.emails,
                account,
                emailOptions
              )
            );
        }
      },
    },
  ];
};
