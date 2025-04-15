/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const validators = require('./validators');
const isA = require('joi');
const otplib = require('otplib');
const qrcode = require('qrcode');
const { promisify } = require('util');
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;
const TOTP_DOCS = require('../../docs/swagger/totp-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;
const { Container } = require('typedi');
const { AccountEventsManager } = require('../account-events');
const {
  RecoveryPhoneService,
  RecoveryNumberNotExistsError,
  RecoveryNumberRemoveMissingBackupCodes,
} = require('@fxa/accounts/recovery-phone');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');

const RECOVERY_CODE_SANE_MAX_LENGTH = 20;

module.exports = (
  log,
  db,
  mailer,
  customs,
  config,
  glean,
  profileClient,
  environment,
  statsd
) => {
  const otpUtils = require('../../lib/routes/utils/otp')(
    log,
    config,
    db,
    statsd
  );

  // Currently, QR codes are rendered with the highest possible
  // error correction, which should in theory allow clients to
  // scan the image better.
  // Ref: https://github.com/soldair/node-qrcode#error-correction-level
  const qrCodeOptions = { errorCorrectionLevel: 'H' };

  const RECOVERY_CODE_COUNT =
    (config.recoveryCodes && config.recoveryCodes.count) || 8;

  const codeConfig = config.recoveryCodes;

  promisify(qrcode.toDataURL);

  const accountEventsManager = Container.get(AccountEventsManager);
  const recoveryPhoneService = Container.get(RecoveryPhoneService);
  const backupCodeManager = Container.get(BackupCodeManager);

  // This helps us distinguish between testing environments and
  // totp codes per environment.
  const service = !environment?.startsWith('prod')
    ? `${config.serviceName} - ${environment}`
    : `${config.serviceName}`;

  return [
    {
      method: 'POST',
      path: '/totp/create',
      options: {
        ...TOTP_DOCS.TOTP_CREATE_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({
            qrCodeUrl: isA.string().required(),
            secret: isA.string().required(),
            recoveryCodes: isA.array().items(isA.string()).required(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.create', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        await customs.check(request, sessionToken.email, 'totpCreate');

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        // Default options for TOTP
        const otpOptions = {
          encoding: 'hex',
          step: config.step,
          window: config.window,
        };

        const authenticator = new otplib.authenticator.Authenticator();
        authenticator.options = Object.assign(
          {},
          otplib.authenticator.options,
          otpOptions
        );

        const secret = authenticator.generateSecret();
        try {
          await db.createTotpToken(uid, secret, 0);
        } catch (e) {
          if (e.errno === errors.ERRNO.TOTP_TOKEN_EXISTS) {
            const hasEnabledToken = await otpUtils.hasTotpToken({ uid });
            if (hasEnabledToken) {
              throw e;
            }
            await db.deleteTotpToken(uid);
            await db.createTotpToken(uid, secret, 0);
          }
        }

        log.info('totpToken.created', { uid });
        await request.emitMetricsEvent('totpToken.created', { uid });

        const otpauth = authenticator.keyuri(
          sessionToken.email,
          service,
          secret
        );

        const qrCodeUrl = await qrcode.toDataURL(otpauth, qrCodeOptions);

        const recoveryCodes = await db.replaceRecoveryCodes(
          uid,
          RECOVERY_CODE_COUNT
        );

        return {
          qrCodeUrl,
          secret,
          recoveryCodes,
        };
      },
    },
    {
      method: 'POST',
      path: '/totp/destroy',
      options: {
        ...TOTP_DOCS.TOTP_DESTROY_POST,
        auth: {
          strategy: 'sessionToken',
        },
        response: {},
      },
      handler: async function (request) {
        log.begin('totp.destroy', request);

        const sessionToken = request.auth.credentials;
        const { uid } = sessionToken;

        await customs.check(request, sessionToken.email, 'totpDestroy');

        // If a TOTP token is not verified, we should be able to safely delete regardless of session
        // verification state.
        const hasEnabledToken = await otpUtils.hasTotpToken({ uid });

        // To help prevent users from getting locked out of their account, sessions created and verified
        // before TOTP was enabled, can remove TOTP. Any new sessions after TOTP is enabled, are only considered
        // verified *if and only if* they have verified a TOTP code.
        if (!sessionToken.tokenVerified) {
          throw errors.unverifiedSession();
        }

        await db.deleteTotpToken(uid);

        // Downgrade the session to email-based verification when TOTP is
        // removed. Because we know the session is already verified, there's
        // no security risk in setting it as verified using a different method.
        // See #5154.
        await db.verifyTokensWithMethod(sessionToken.id, 'email-2fa');

        await profileClient.deleteCache(uid);
        await log.notifyAttachedServices(
          'profileDataChange',
          {},
          {
            uid,
          }
        );

        if (hasEnabledToken) {
          const account = await db.account(uid);
          const geoData = request.app.geo;
          const emailOptions = {
            acceptLanguage: request.app.acceptLanguage,
            timeZone: geoData.timeZone,
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uid,
          };

          try {
            await mailer.sendPostRemoveTwoStepAuthenticationEmail(
              account.emails,
              account,
              emailOptions
            );
          } catch (err) {
            // If email fails, log the error without aborting the operation.
            log.error('mailer.sendPostRemoveTwoStepAuthenticationEmail', {
              err,
            });
          }
        }

        accountEventsManager.recordSecurityEvent(db, {
          name: 'account.two_factor_removed',
          uid,
          ipAddr: request.app.clientAddress,
          tokenId: sessionToken && sessionToken.id,
        });

        // Clean up the recovery phone if it was registered.
        // Don't fail if this doesn't work, but monitor success rate with stats.
        try {
          const success = await recoveryPhoneService.removePhoneNumber(uid);
          if (success) {
            statsd.increment('totp.destroy.remove_phone_number.success');
            await glean.twoStepAuthPhoneRemove.success(request);
          } else {
            statsd.increment('totp.destroy.remove_phone_number.fail');
          }
        } catch (error) {
          if (
            error instanceof RecoveryNumberNotExistsError ||
            error instanceof RecoveryNumberRemoveMissingBackupCodes
          ) {
            statsd.increment('totp.destroy.remove_phone_number.fail');
          } else {
            statsd.increment('totp.destroy.remove_phone_number.error');
            log.error('totp.destroy.remove_phone_number.error', error);
          }
        }

        // Clean up any associated backup codes.
        // Again, don't fail if errors out, but monitor with stats.
        try {
          const success = await backupCodeManager.deleteRecoveryCodes(uid);
          if (success) {
            statsd.increment('totp.destroy.delete_recovery_codes.success');
          } else {
            statsd.increment('totp.destroy.delete_recovery_codes.fail');
          }
        } catch (error) {
          statsd.increment('totp.destroy.delete_recovery_codes.error');
          log.error('totp.destroy.delete_recovery_codes.error', error);
        }

        // Record that the 2fa was successfully removed
        glean.twoStepAuthRemove.success(request, { uid });

        return {};
      },
    },
    {
      method: 'GET',
      path: '/totp/exists',
      options: {
        ...TOTP_DOCS.TOTP_EXISTS_GET,
        auth: {
          strategies: [
            'multiStrategySessionToken',
            'multiStrategyPasswordForgotToken',
          ],
        },
        response: {
          schema: isA.object({
            exists: isA.boolean(),
            verified: isA.boolean(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.exists', request);

        const sessionToken = request.auth.credentials;

        try {
          const token = await db.totpToken(sessionToken.uid);
          return {
            exists: true,
            verified: !!token.verified,
          };
        } catch (err) {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            return {
              exists: false,
              verified: false,
            };
          } else {
            throw err;
          }
        }
      },
    },
    {
      method: 'POST',
      path: '/totp/verify',
      options: {
        ...TOTP_DOCS.TOTP_VERIFY_POST,
        auth: {
          strategy: 'passwordForgotToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            code: isA
              .string()
              .max(32)
              .regex(validators.DIGITS)
              .required()
              .description(DESCRIPTION.codeTotp),
          }),
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.verify', request);

        const code = request.payload.code;
        const passwordForgotToken = request.auth.credentials;

        await customs.checkAuthenticated(
          request,
          passwordForgotToken.uid,
          'verifyTotpCode'
        );

        try {
          const totpRecord = await db.totpToken(passwordForgotToken.uid);
          const sharedSecret = totpRecord.sharedSecret;

          // Default options for TOTP
          const otpOptions = {
            encoding: 'hex',
            step: config.step,
            window: config.window,
          };

          const isValidCode = otpUtils.verifyOtpCode(
            code,
            sharedSecret,
            otpOptions,
            'totp.verify'
          );

          if (isValidCode) {
            glean.resetPassword.twoFactorSuccess(request, {
              uid: passwordForgotToken.uid,
            });

            await db.verifyPasswordForgotTokenWithMethod(
              passwordForgotToken.id,
              'totp-2fa'
            );
          }

          return {
            success: isValidCode,
          };
        } catch (err) {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            return { success: false };
          } else {
            throw err;
          }
        }
      },
    },
    // this endpoint is used in the password reset flow only
    {
      method: 'POST',
      path: '/totp/verify/recoveryCode',
      options: {
        ...TOTP_DOCS.TOTP_VERIFY_RECOVERY_CODE_POST,
        auth: {
          strategy: 'passwordForgotToken',
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
      handler: async function (request) {
        log.begin('totp.verify.recoveryCode', request);

        const code = request.payload.code;
        const { uid, email } = request.auth.credentials;
        const passwordForgotToken = request.auth.credentials;

        await customs.check(request, email, 'verifyRecoveryCode');

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;

        const { remaining } = await db.consumeRecoveryCode(uid, code);

        const mailerPromises = [
          mailer.sendPostConsumeRecoveryCodeEmail(account.emails, account, {
            acceptLanguage,
            ip,
            location: geo.location,
            numberRemaining: remaining,
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

        glean.resetPassword.twoFactorRecoveryCodeSuccess(request, {
          uid,
        });

        await db.verifyPasswordForgotTokenWithMethod(
          passwordForgotToken.id,
          'recovery-code'
        );

        return {
          remaining,
        };
      },
    },
    {
      method: 'POST',
      path: '/session/verify/totp',
      options: {
        ...TOTP_DOCS.SESSION_VERIFY_TOTP_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            code: isA
              .string()
              .max(32)
              .regex(validators.DIGITS)
              .required()
              .description(DESCRIPTION.codeTotp),
            service: validators.service,
          }),
        },
        response: {
          schema: isA.object({
            success: isA.boolean().required(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('session.verify.totp', request);

        const code = request.payload.code;
        const sessionToken = request.auth.credentials;
        const { uid, email } = sessionToken;

        await customs.checkAuthenticated(request, uid, 'verifyTotpCode');

        const token = await db.totpToken(sessionToken.uid);
        const sharedSecret = token.sharedSecret;
        const tokenVerified = token.verified;

        // Default options for TOTP
        const otpOptions = {
          encoding: 'hex',
          step: config.step,
          window: config.window,
        };

        const isValidCode = otpUtils.verifyOtpCode(
          code,
          sharedSecret,
          otpOptions,
          'session.verify'
        );

        // Once a valid TOTP code has been detected, the token becomes verified
        // and enabled for the user.
        if (isValidCode && !tokenVerified) {
          await db.updateTotpToken(sessionToken.uid, {
            verified: true,
            enabled: true,
          });

          accountEventsManager.recordSecurityEvent(db, {
            name: 'account.two_factor_added',
            uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id,
          });

          glean.twoFactorAuth.codeComplete(request, { uid });

          await profileClient.deleteCache(uid);
          await log.notifyAttachedServices('profileDataChange', request, {
            uid,
          });
        }

        // If a valid code was sent, this verifies the session using the `totp-2fa` method.
        if (isValidCode && sessionToken.authenticatorAssuranceLevel <= 1) {
          await db.verifyTokensWithMethod(sessionToken.id, 'totp-2fa');
        }

        if (isValidCode) {
          log.info('totp.verified', { uid });
          await request.emitMetricsEvent('totpToken.verified', { uid });
          // this signals the end of the login flow
          await request.emitMetricsEvent('account.confirmed', { uid });
          glean.login.totpSuccess(request, { uid });

          accountEventsManager.recordSecurityEvent(db, {
            name: 'account.two_factor_challenge_success',
            uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id,
          });
        } else {
          log.info('totp.unverified', { uid });
          glean.login.totpFailure(request, { uid });

          await customs.flag(request.app.clientAddress, {
            email,
            errno: errors.ERRNO.INVALID_EXPIRED_OTP_CODE,
          });
          await request.emitMetricsEvent('totpToken.unverified', { uid });

          accountEventsManager.recordSecurityEvent(db, {
            name: 'account.two_factor_challenge_failure',
            uid,
            ipAddr: request.app.clientAddress,
            tokenId: sessionToken && sessionToken.id,
          });
        }

        await sendEmailNotification();

        return {
          success: isValidCode,
        };

        async function sendEmailNotification() {
          const account = await db.account(sessionToken.uid);
          const geoData = request.app.geo;
          const ip = request.app.clientAddress;
          const service = request.payload.service || request.query.service;
          const emailOptions = {
            acceptLanguage: request.app.acceptLanguage,
            ip: ip,
            location: geoData.location,
            service: service,
            timeZone: geoData.timeZone,
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uid: sessionToken.uid,
          };

          // Check to see if this token was just verified, if it is, then this means
          // the user has enabled two-step authentication, otherwise send new device
          // login email.
          if (isValidCode) {
            if (!tokenVerified) {
              return mailer.sendPostAddTwoStepAuthenticationEmail(
                account.emails,
                account,
                emailOptions
              );
            }

            return mailer.sendNewDeviceLoginEmail(
              account.emails,
              account,
              emailOptions
            );
          }
        }
      },
    },
  ];
};
