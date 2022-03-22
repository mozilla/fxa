/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const isA = require('joi');
const validators = require('./validators');

const RECOVERY_CODE_SANE_MAX_LENGTH = 20;

module.exports = (log, db, config, customs, mailer) => {
  const codeConfig = config.recoveryCodes;
  const RECOVERY_CODE_COUNT = (codeConfig && codeConfig.count) || 8;

  // Validate recovery codes
  const recoveryCodesSchema = validators.recoveryCodes(
    RECOVERY_CODE_COUNT,
    RECOVERY_CODE_SANE_MAX_LENGTH
  );

  return [
    {
      method: 'GET',
      path: '/recoveryCodes',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: recoveryCodesSchema,
        },
      },
      async handler(request) {
        log.begin('replaceRecoveryCodes', request);

        const { authenticatorAssuranceLevel, uid } = request.auth.credentials;

        // Since TOTP and recovery codes go hand in hand, you should only be
        // able to replace recovery codes in a TOTP verified session.
        if (!authenticatorAssuranceLevel || authenticatorAssuranceLevel <= 1) {
          throw errors.unverifiedSession();
        }

        const recoveryCodes = await db.replaceRecoveryCodes(
          uid,
          RECOVERY_CODE_COUNT
        );

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;

        await mailer.sendPostNewRecoveryCodesEmail(account.emails, account, {
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
        });

        log.info('account.recoveryCode.replaced', { uid });
        await request.emitMetricsEvent('recoveryCode.replaced', { uid });

        return { recoveryCodes };
      },
    },
    {
      method: 'PUT',
      path: '/recoveryCodes',

      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: recoveryCodesSchema,
        },
        response: {
          schema: {
            success: isA.boolean(),
          },
        },
      },
      async handler(request) {
        log.begin('updateRecoveryCodes', request);

        const { authenticatorAssuranceLevel, uid } = request.auth.credentials;

        // Since TOTP and recovery codes go hand in hand, you should only be
        // able to replace recovery codes in a TOTP verified session.
        if (!authenticatorAssuranceLevel || authenticatorAssuranceLevel <= 1) {
          throw errors.unverifiedSession();
        }

        const { recoveryCodes } = request.payload;
        await db.updateRecoveryCodes(uid, recoveryCodes);

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;

        await mailer.sendPostNewRecoveryCodesEmail(account.emails, account, {
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
        });

        log.info('account.recoveryCode.replaced', { uid });

        await request.emitMetricsEvent('recoveryCode.replaced', { uid });

        return { success: true };
      },
    },
    {
      method: 'POST',
      path: '/session/verify/recoveryCode',
      options: {
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: {
            // Validation here is done with BASE_36 superset to be backwards compatible...
            // Ideally all recovery codes are Crockford Base32.
            code: validators.recoveryCode(
              RECOVERY_CODE_SANE_MAX_LENGTH,
              validators.BASE_36
            ),
          },
        },
        response: {
          schema: {
            remaining: isA.number(),
          },
        },
      },
      async handler(request) {
        log.begin('session.verify.recoveryCode', request);

        const {
          email,
          id: tokenId,
          tokenVerificationId,
          uid,
        } = request.auth.credentials;

        await customs.check(request, email, 'verifyRecoveryCode');

        const { code } = request.payload;
        const { remaining } = await db.consumeRecoveryCode(uid, code);
        if (remaining === 0) {
          log.info('account.recoveryCode.consumedAllCodes', { uid });
        }

        if (tokenVerificationId) {
          await db.verifyTokensWithMethod(tokenId, 'recovery-code');
        }

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;

        const mailerPromises = [
          mailer.sendPostConsumeRecoveryCodeEmail(account.emails, account, {
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
          }),
        ];

        if (remaining <= codeConfig.notifyLowCount) {
          log.info('account.recoveryCode.notifyLowCount', { uid, remaining });

          mailerPromises.push(
            mailer.sendLowRecoveryCodesEmail(account.emails, account, {
              acceptLanguage,
              numberRemaining: remaining,
              uid,
            })
          );
        }

        await Promise.all(mailerPromises);

        log.info('account.recoveryCode.verified', { uid });

        await request.emitMetricsEvent('recoveryCode.verified', { uid });

        return { remaining };
      },
    },
  ];
};
