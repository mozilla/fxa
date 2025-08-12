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
const {
  RecoveryPhoneService,
  RecoveryNumberNotExistsError,
} = require('@fxa/accounts/recovery-phone');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');
const { recordSecurityEvent } = require('./utils/security-event');

const RECOVERY_CODE_SANE_MAX_LENGTH = 20;

const TOTP_SECRET_REDIS_TTL = 3600; // 1 hour in seconds

/**
 * Generates a Redis key for storing TOTP secrets from a uid.
 */
function toRedisTotpSecretKey(uid) {
  return `totp:new:secret:${uid}`;
}

module.exports = (
  log,
  db,
  mailer,
  customs,
  config,
  glean,
  profileClient,
  environment,
  authServerCacheRedis,
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
            skipRecoveryCodes: isA.boolean().optional(),
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
        const skipRecoveryCodes = request.payload.skipRecoveryCodes;

        await customs.checkAuthenticated(
          request,
          uid,
          sessionToken.email,
          'totpCreate'
        );

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        const hasEnabledToken = await otpUtils.hasTotpToken({ uid });
        if (hasEnabledToken) {
          throw errors.totpTokenAlreadyExists();
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
        await authServerCacheRedis.set(
          toRedisTotpSecretKey(uid),
          secret,
          'EX',
          TOTP_SECRET_REDIS_TTL
        );

        log.info('totpToken.created', { uid });
        await request.emitMetricsEvent('totpToken.created', { uid });

        const otpauth = authenticator.keyuri(
          sessionToken.email,
          service,
          secret
        );

        const qrCodeUrl = await qrcode.toDataURL(otpauth, qrCodeOptions);

        const recoveryCodes =
          skipRecoveryCodes !== true
            ? await db.replaceRecoveryCodes(uid, RECOVERY_CODE_COUNT)
            : [];

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

        await customs.checkAuthenticated(
          request,
          sessionToken.uid,
          sessionToken.email,
          'totpDestroy'
        );

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
            location: geoData.location,
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

        recordSecurityEvent('account.two_factor_removed', {
          db,
          request,
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
            log.error('totp.destroy.remove_phone_number.error');
          }
        } catch (error) {
          if (error instanceof RecoveryNumberNotExistsError) {
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
          passwordForgotToken.email,
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

          const { valid: isValidCode } = otpUtils.verifyOtpCode(
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

        await customs.checkAuthenticated(
          request,
          uid,
          email,
          'verifyRecoveryCode'
        );

        const account = await db.account(uid);
        const { acceptLanguage, clientAddress: ip, geo, ua } = request.app;

        const { remaining } = await db.consumeRecoveryCode(uid, code);

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
            metricsContext: METRICS_CONTEXT_SCHEMA,
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

        await customs.checkAuthenticated(request, uid, email, 'verifyTotpCode');

        let sharedSecret, tokenVerified;
        try {
          ({ sharedSecret, verified: tokenVerified } = await db.totpToken(uid));
        } catch (err) {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            sharedSecret = await authServerCacheRedis.get(
              toRedisTotpSecretKey(uid)
            );
            tokenVerified = false;
            if (sharedSecret == null) {
              throw errors.totpTokenNotFound();
            }
          } else {
            throw err;
          }
        }

        // Default options for TOTP
        const otpOptions = {
          encoding: 'hex',
          step: config.step,
          window: config.window,
        };

        const { valid: isValidCode, delta } = otpUtils.verifyOtpCode(
          code,
          sharedSecret,
          otpOptions,
          'session.verify'
        );

        const isSetup = !tokenVerified;

        if (isSetup) {
          // We currently check for code validity client-side, and then check again
          // server-side at the end of the flow with this request. This guards against
          // an edgecase where the client may accept a code that the server rejects.
          if (!isValidCode) {
            glean.twoFactorAuth.setupInvalidCodeError(request, { uid });
            // Lots of data to help determine the cause of FXA-12145
            log.error('totp.setup.invalidCode', {
              uid,
              code,
              step: config.step,
              window: config.window,
              delta,
            });

            throw errors.invalidTokenVerficationCode();
          } else {
            // Once a valid TOTP code has been detected, the token becomes verified
            // and enabled for the user.
            await db.replaceTotpToken({
              uid,
              sharedSecret,
              verified: true,
              enabled: true,
              epoch: 0,
            });
            await authServerCacheRedis.del(toRedisTotpSecretKey(uid));

            recordSecurityEvent('account.two_factor_added', {
              db,
              request,
            });

            glean.twoFactorAuth.codeComplete(request, { uid });

            await profileClient.deleteCache(uid);
            await log.notifyAttachedServices('profileDataChange', request, {
              uid,
            });
          }
        }

        // If a valid code was sent, this verifies the session using the `totp-2fa` method.
        if (isValidCode && sessionToken.authenticatorAssuranceLevel <= 1) {
          await db.verifyTokensWithMethod(sessionToken.id, 'totp-2fa');
        }

        if (isValidCode) {
          log.info('totp.verified', { uid });

          // This route is called to setup and login with TOTP. We only want
          // to emit the login success event if this is login flow.
          if (!isSetup) {
            // Emit a login success event
            glean.login.totpSuccess(request, { uid });

            // this signals the end of the login flow
            await request.emitMetricsEvent('account.confirmed', { uid });
          }

          await request.emitMetricsEvent('totpToken.verified', { uid });

          recordSecurityEvent('account.two_factor_challenge_success', {
            db,
            request,
          });
        } else {
          log.info('totp.unverified', { uid });

          if (!isSetup) {
            glean.login.totpFailure(request, { uid });
          }

          await customs.flag(request.app.clientAddress, {
            email,
            errno: errors.ERRNO.INVALID_EXPIRED_OTP_CODE,
          });
          await request.emitMetricsEvent('totpToken.unverified', { uid });

          recordSecurityEvent('account.two_factor_challenge_failure', {
            db,
            request,
          });

          if (customs.v2Enabled()) {
            await customs.check(request, email, 'verifyTotpCodeFailed');
          }
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
          // the user has just enabled two-step authentication, otherwise send new device
          // login email.
          if (isValidCode) {
            if (!tokenVerified) {
              // check and retrieve recovery phone number if configured
              const result = await recoveryPhoneService.hasConfirmed(uid);
              const maskedPhoneNumber = result?.phoneNumber
                ? recoveryPhoneService.maskPhoneNumber(result.phoneNumber)
                : undefined;
              return mailer.sendPostAddTwoStepAuthenticationEmail(
                account.emails,
                account,
                {
                  ...emailOptions,
                  // this will be used to include information in the email
                  // about the recovery method configured during 2FA setup
                  // if no phone number configured, defaults to recovery codes
                  maskedPhoneNumber,
                }
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
    {
      /**
       * This endpoint explicitly does not modify the recoveryCodes
       * in the same way that `/totp/create` does. We want to allow
       * changing the recovery method without changing the backup codes.
       */
      method: 'POST',
      path: '/totp/replace/start',
      options: {
        ...TOTP_DOCS.TOTP_REPLACE_START_POST,
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
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.replace.create', request);

        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        await customs.checkAuthenticated(
          request,
          uid,
          sessionToken.email,
          'totpCreate'
        );

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        // the opposite of `/totp/create` this requires that the user already has
        // a verified TOTP token to be replaced.
        const hasEnabledToken = await otpUtils.hasTotpToken({ uid });
        if (!hasEnabledToken) {
          throw errors.totpTokenDoesNotExist();
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
        await authServerCacheRedis.set(
          toRedisTotpSecretKey(uid),
          secret,
          'EX',
          TOTP_SECRET_REDIS_TTL
        );

        log.info('totpToken.replace.created', { uid });
        await request.emitMetricsEvent('totpToken.replace.created', { uid });

        const otpauth = authenticator.keyuri(
          sessionToken.email,
          service,
          secret
        );

        const qrCodeUrl = await qrcode.toDataURL(otpauth, qrCodeOptions);

        return {
          qrCodeUrl,
          secret,
        };
      },
    },
    {
      method: 'POST',
      path: '/totp/replace/confirm',
      options: {
        ...TOTP_DOCS.TOTP_REPLACE_CONFIRM_POST,
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
          }),
        },
        response: {
          schema: isA.object({
            success: isA.boolean(),
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.replace.confirm', request);

        const code = request.payload.code;
        const sessionToken = request.auth.credentials;
        const uid = sessionToken.uid;

        await customs.checkAuthenticated(
          request,
          uid,
          sessionToken.email,
          'totpReplace'
        );

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }
        // check the redis cache for the NEW secret. Since the existing code
        // is verified and stored in the db we must use the redis cache
        const newSharedSecret = await authServerCacheRedis.get(
          toRedisTotpSecretKey(uid)
        );

        if (!newSharedSecret) {
          throw errors.totpTokenNotFound();
        }

        // Default options for TOTP
        const otpOptions = {
          encoding: 'hex',
          step: config.step,
          window: config.window,
        };

        // validate the incoming code
        const { valid: isValidCode } = otpUtils.verifyOtpCode(
          code,
          newSharedSecret,
          otpOptions,
          'totp.verify'
        );

        if (!isValidCode) {
          glean.twoFactorAuth.setupInvalidCodeError(request, { uid });
          throw errors.invalidTokenVerficationCode();
        }

        try {
          // new code is valid so we can replace the
          // existing TOTP token with the new one
          await db.replaceTotpToken({
            uid,
            sharedSecret: newSharedSecret,
            verified: true,
            enabled: true,
            epoch: 0,
          });

          await authServerCacheRedis.del(toRedisTotpSecretKey(uid));

          recordSecurityEvent('account.two_factor_replace_success', {
            db,
            request,
          });
          glean.twoFactorAuth.replaceSuccess(request, { uid });

          // Email notifications are part of a separate ticket:
          // https://mozilla-hub.atlassian.net/browse/FXA-12140

          await profileClient.deleteCache(uid);
          await log.notifyAttachedServices('profileDataChange', request, {
            uid,
          });

          return {
            success: true,
          };
        } catch (error) {
          recordSecurityEvent('account.two_factor_replace_failure', {
            db,
            request,
          });
          glean.twoFactorAuth.replaceFailure(request, { uid });
          return {
            success: false,
          };
        }
      },
    },
  ];
};
