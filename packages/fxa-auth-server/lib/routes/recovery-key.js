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

        const sessionToken = request.auth.credentials;

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        const { uid } = sessionToken;
        const { recoveryKeyId, recoveryData } = request.payload;

        await db.createRecoveryKey(uid, recoveryKeyId, recoveryData);

        log.info('account.recoveryKey.created', { uid });

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
