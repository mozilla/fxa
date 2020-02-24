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
            enabled: isA.boolean().default(true),
          },
        },
      },
      handler: async function(request) {
        log.begin('createRecoveryKey', request);

        const sessionToken = request.auth.credentials;

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        const { uid } = sessionToken;
        const { recoveryKeyId, recoveryData, enabled } = request.payload;

        // Users that already have an enabled recovery key can not
        // create a second recovery key
        try {
          await db.createRecoveryKey(uid, recoveryKeyId, recoveryData, enabled);
        } catch (err) {
          if (err.errno !== errors.ERRNO.RECOVERY_KEY_EXISTS) {
            throw err;
          }

          // `recoveryKeyExists` will return true if and only if there is an enabled recovery
          // key. In other scenarios a user started creating one but never completed the enable
          // process.
          const result = await db.recoveryKeyExists(uid);
          if (result.exists) {
            throw err;
          }

          await db.deleteRecoveryKey(uid);
          await db.createRecoveryKey(uid, recoveryKeyId, recoveryData, enabled);
        }

        log.info('account.recoveryKey.created', { uid });

        if (enabled) {
          await request.emitMetricsEvent('recoveryKey.created', { uid });

          const account = await db.account(uid);

          const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;
          const emailOptions = {
            acceptLanguage,
            ip,
            location: geo.location,
            timeZone: geo.timeZone,
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uid,
          };

          await mailer.sendPostAddAccountRecoveryEmail(
            account.emails,
            account,
            emailOptions
          );
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/recoveryKey/verify',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            recoveryKeyId: validators.recoveryKeyId,
          },
        },
      },
      handler: async function(request) {
        log.begin('verifyRecoveryKey', request);

        const sessionToken = request.auth.credentials;
        const { uid } = sessionToken;

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        // This route can let you check if a key is valid therefore we
        // rate limit it.
        await customs.checkAuthenticated(request, uid, 'getRecoveryKey');

        const { recoveryKeyId } = request.payload;

        // Attempt to retrieve a recovery key, if it exists and is not already enabled,
        // then we enable it.
        const recoveryKeyData = await db.getRecoveryKey(uid, recoveryKeyId);

        if (!recoveryKeyData.enabled) {
          await db.updateRecoveryKey(uid, recoveryKeyId, true);
        }

        return {};
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

        const { uid } = request.auth.credentials;
        const { recoveryKeyId } = request.params;

        await customs.checkAuthenticated(request, uid, 'getRecoveryKey');

        const { recoveryData } = await db.getRecoveryKey(uid, recoveryKeyId);

        return { recoveryData };
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
      async handler(request) {
        log.begin('recoveryKeyExists', request);

        const { email } = request.payload;

        let uid;
        if (request.auth.credentials) {
          uid = request.auth.credentials.uid;
        }

        if (!uid) {
          // If not using a sessionToken, an email is required to check
          // for a recovery key. This occurs when checking from the
          // password reset page and allows us to redirect the user to either
          // the regular password reset or account recovery password reset.
          if (!email) {
            throw errors.missingRequestParameter('email');
          }

          await customs.check(request, email, 'recoveryKeyExists');
          ({ uid } = await db.accountRecord(email));
        }

        // When checking from `/settings` a sessionToken is required and the
        // request is not rate limited.
        return db.recoveryKeyExists(uid);
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
      async handler(request) {
        log.begin('recoveryKeyDelete', request);

        const { tokenVerificationId, uid } = request.auth.credentials;

        if (tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        await db.deleteRecoveryKey(uid);

        const account = await db.account(uid);

        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;
        const emailOptions = {
          acceptLanguage,
          ip,
          location: geo.location,
          timeZone: geo.timeZone,
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uid,
        };

        await mailer.sendPostRemoveAccountRecoveryEmail(
          account.emails,
          account,
          emailOptions
        );

        return {};
      },
    },
  ];
};
