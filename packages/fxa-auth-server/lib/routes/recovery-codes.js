/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const isA = require('joi');
const validators = require('./validators');
const { Container } = require('typedi');
const RECOVERY_CODES_DOCS =
  require('../../docs/swagger/recovery-codes-api').default;
const { BackupCodeManager } = require('@fxa/accounts/two-factor');
const { recordSecurityEvent } = require('./utils/security-event');

const RECOVERY_CODE_SANE_MAX_LENGTH = 20;

module.exports = (log, db, config, customs, mailer, glean, statsd) => {
  const otpUtils = require('./utils/otp').default(db, statsd);
  const codeConfig = config.recoveryCodes;
  const RECOVERY_CODE_COUNT = (codeConfig && codeConfig.count) || 8;
  const backupCodeManager = Container.get(BackupCodeManager);

  // Validate backup authentication codes
  const recoveryCodesSchema = validators.recoveryCodes(
    RECOVERY_CODE_COUNT,
    RECOVERY_CODE_SANE_MAX_LENGTH
  );

  const routes = [
    {
      method: 'GET',
      path: '/recoveryCodes',
      options: {
        ...RECOVERY_CODES_DOCS.RECOVERYCODES_GET,
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        response: {
          schema: recoveryCodesSchema,
        },
      },
      async handler(request) {
        log.begin('replaceRecoveryCodes', request);

        const { authenticatorAssuranceLevel, uid } = request.auth.credentials;

        // Since TOTP and backup authentication codes go hand in hand, you should only be
        // able to replace backup authentication codes in a TOTP verified session.
        if (!authenticatorAssuranceLevel || authenticatorAssuranceLevel <= 1) {
          throw errors.unverifiedSession();
        }

        const recoveryCodes = await db.replaceRecoveryCodes(
          uid,
          RECOVERY_CODE_COUNT
        );

        await recordSecurityEvent('account.recovery_codes_replaced', {
          db,
          request,
        });

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: geo, ua } = request.app;

        await mailer.sendPostNewRecoveryCodesEmail(account.emails, account, {
          acceptLanguage,
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
      method: 'POST',
      path: '/recoveryCodes',
      options: {
        ...RECOVERY_CODES_DOCS.RECOVERY_CODES_POST,
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        validate: {
          payload: recoveryCodesSchema,
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      async handler(request) {
        log.begin('setRecoveryCodes', request);

        const { uid } = request.auth.credentials;

        // this endpoint should only be used prior to verifying 2FA
        // no previous backup codes should be in the database
        // the session should not yet have a higher assurance level
        const account = await db.account(uid);
        const hasTotpToken = await otpUtils.hasTotpToken({ uid });
        // for initial setup, only fail if totp is already enabled
        // if totp is not enabled/verified, it is safe to replace the recovery codes
        if (hasTotpToken) {
          throw errors.totpTokenAlreadyExists();
        }

        const { recoveryCodes } = request.payload;

        await db.updateRecoveryCodes(uid, recoveryCodes);
        glean.twoFactorAuth.setCodesComplete(request, { uid });

        // no email notification, notice about codes will be included in postAddTwoStepAuthentication email

        await recordSecurityEvent('account.recovery_codes_set', {
          db,
          request,
          account,
        });

        log.info('account.recoveryCode.set', { uid });

        await request.emitMetricsEvent('recoveryCode.set', { uid });

        return { success: true };
      },
    },
    {
      method: 'POST',
      path: '/mfa/recoveryCodes',
      options: {
        ...RECOVERY_CODES_DOCS.MFA_RECOVERY_CODES_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:2fa'],
          payload: false,
        },
        validate: {
          payload: recoveryCodesSchema,
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      handler: async function (request) {
        return routes
          .find(
            (route) =>
              route.path === '/v1/recoveryCodes' && route.method === 'POST'
          )
          .handler(request);
      },
    },

    {
      method: 'PUT',
      path: '/recoveryCodes',
      options: {
        ...RECOVERY_CODES_DOCS.RECOVERY_CODES_PUT,
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        validate: {
          payload: recoveryCodesSchema,
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      async handler(request) {
        log.begin('updateRecoveryCodes', request);

        const { authenticatorAssuranceLevel, uid } = request.auth.credentials;

        // Since TOTP and backup authentication codes go hand in hand, you should only be
        // able to replace backup authentication codes in a TOTP verified session.
        if (!authenticatorAssuranceLevel || authenticatorAssuranceLevel <= 1) {
          throw errors.unverifiedSession();
        }

        const { recoveryCodes } = request.payload;
        await db.updateRecoveryCodes(uid, recoveryCodes);
        glean.twoFactorAuth.replaceCodeComplete(request, { uid });

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: geo, ua } = request.app;

        await mailer.sendPostNewRecoveryCodesEmail(account.emails, account, {
          acceptLanguage,
          location: geo.location,
          timeZone: geo.timeZone,
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uid,
        });

        await recordSecurityEvent('account.recovery_codes_created', {
          db,
          request,
          account,
        });

        log.info('account.recoveryCode.replaced', { uid });

        await request.emitMetricsEvent('recoveryCode.replaced', { uid });

        return { success: true };
      },
    },
    {
      method: 'PUT',
      path: '/mfa/recoveryCodes',
      options: {
        ...RECOVERY_CODES_DOCS.MFA_RECOVERY_CODES_PUT,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:2fa'],
          payload: false,
        },
        validate: {
          payload: recoveryCodesSchema,
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      handler: async function (request) {
        return routes
          .find(
            (route) =>
              route.path === '/v1/recoveryCodes' && route.method === 'PUT'
          )
          .handler(request);
      },
    },
    {
      method: 'GET',
      path: '/recoveryCodes/exists',
      options: {
        auth: {
          strategies: [
            'multiStrategySessionToken',
            'multiStrategyPasswordForgotToken',
          ],
          payload: 'required',
        },
        response: {
          schema: isA.object({
            hasBackupCodes: isA.boolean().optional(),
            count: isA.number().optional(),
          }),
        },
      },
      async handler(request) {
        log.begin('checkRecoveryCodesExist', request);

        const { uid } = request.auth.credentials;

        const { hasBackupCodes, count } =
          await backupCodeManager.getCountForUserId(uid);
        log.info('account.recoveryCode.existsChecked', {
          uid,
          hasBackupCodes,
          count,
        });
        return { hasBackupCodes, count };
      },
    },
    {
      method: 'POST',
      path: '/session/verify/recoveryCode',
      options: {
        ...RECOVERY_CODES_DOCS.SESSION_VERIFY_RECOVERYCODE_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            // Validation here is done with BASE_36 superset to be backwards compatible...
            // Ideally all backup authentication codes are Crockford Base32.
            code: validators.recoveryCode(
              RECOVERY_CODE_SANE_MAX_LENGTH,
              validators.BASE_36
            ),
          }),
        },
        response: {
          schema: isA.object({
            remaining: isA.number(),
          }),
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

        await customs.checkAuthenticated(
          request,
          uid,
          email,
          'verifyRecoveryCode'
        );

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
          mailer.sendPostSigninRecoveryCodeEmail(account.emails, account, {
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

        await Promise.allSettled(mailerPromises);

        log.info('account.recoveryCode.verified', { uid });

        await request.emitMetricsEvent('recoveryCode.verified', { uid });
        // this signals the end of the login flow
        await request.emitMetricsEvent('account.confirmed', { uid });
        glean.login.recoveryCodeSuccess(request, { uid });

        await recordSecurityEvent('account.recovery_codes_signin_complete', {
          db,
          request,
          account,
        });

        return { remaining };
      },
    },
  ];

  return routes;
};
