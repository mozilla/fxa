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
const crypto = require('crypto');
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

/**
 * Generates a Redis key for tracking setup verification status.
 */
function toRedisTotpVerifiedKey(uid) {
  return `totp:new:verified:${uid}`;
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
  const otpUtils = require('../../lib/routes/utils/otp').default(db, statsd);

  // Currently, QR codes are rendered with the highest possible
  // error correction, which should in theory allow clients to
  // scan the image better.
  // Ref: https://github.com/soldair/node-qrcode#error-correction-level
  const qrCodeOptions = { errorCorrectionLevel: 'H' };

  const codeConfig = config.recoveryCodes;

  promisify(qrcode.toDataURL);

  const recoveryPhoneService = Container.get(RecoveryPhoneService);
  const backupCodeManager = Container.get(BackupCodeManager);

  // This helps us distinguish between testing environments and
  // totp codes per environment.
  const service = !environment?.startsWith('prod')
    ? `${config.serviceName} - ${environment}`
    : `${config.serviceName}`;

  // Shared handlers for TOTP replace flows (used by legacy and /mfa routes)
  async function handleTotpReplaceStart(request) {
    log.begin('totp.replace.create', request);

    const { uid } = request.auth.credentials;
    const account = await db.account(uid);

    const { tokenVerified, tokenVerificationId } =
      request.auth.credentials || {};
    if (tokenVerificationId || tokenVerified === false) {
      throw errors.unverifiedSession();
    }

    await customs.checkAuthenticated(request, uid, account.email, 'totpCreate');

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

    // Reuse existing in-progress secret if present; refresh TTL to give user a full window
    let secret = await authServerCacheRedis.get(toRedisTotpSecretKey(uid));
    if (secret) {
      await authServerCacheRedis.set(
        toRedisTotpSecretKey(uid),
        secret,
        'EX',
        TOTP_SECRET_REDIS_TTL
      );
    } else {
      secret = authenticator.generateSecret();
      await authServerCacheRedis.set(
        toRedisTotpSecretKey(uid),
        secret,
        'EX',
        TOTP_SECRET_REDIS_TTL
      );
    }

    log.info('totpToken.replace.created', { uid });
    await request.emitMetricsEvent('totpToken.replace.created', { uid });

    const otpauth = authenticator.keyuri(account.email, service, secret);

    const qrCodeUrl = await qrcode.toDataURL(otpauth, qrCodeOptions);

    return {
      qrCodeUrl,
      secret,
    };
  }

  async function handleTotpReplaceConfirm(request) {
    log.begin('totp.replace.confirm', request);

    const code = request.payload.code;
    const { uid } = request.auth.credentials;
    const account = await db.account(uid);

    const { tokenVerified, tokenVerificationId } =
      request.auth.credentials || {};
    if (tokenVerificationId || tokenVerified === false) {
      throw errors.unverifiedSession();
    }

    await customs.checkAuthenticated(
      request,
      uid,
      account.email,
      'totpReplace'
    );
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

      await recordSecurityEvent('account.two_factor_replace_success', {
        db,
        request,
      });
      glean.twoFactorAuth.replaceSuccess(request, { uid });

      sendEmailNotification();

      await profileClient.deleteCache(uid);
      await log.notifyAttachedServices('profileDataChange', request, {
        uid,
      });

      return {
        success: true,
      };
    } catch (error) {
      await recordSecurityEvent('account.two_factor_replace_failure', {
        db,
        request,
      });
      glean.twoFactorAuth.replaceFailure(request, { uid });
      return {
        success: false,
      };
    }

    async function sendEmailNotification() {
      const account = await db.account(uid);
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
        uid: uid,
      };
      try {
        await mailer.sendPostChangeTwoStepAuthenticationEmail(
          account.emails,
          account,
          emailOptions
        );
      } catch (error) {
        log.error('mailer.sendPostChangeTwoStepAuthenticationEmail', {
          error,
        });
      }
    }
  }

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
          }),
        },
      },
      handler: async function (request) {
        log.begin('totp.create', request);

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

        // Clear prior verification state on restart; user must re-verify
        await authServerCacheRedis.del(toRedisTotpVerifiedKey(uid));

        // Reuse existing secret if present; refresh TTL to give user a full window.
        // This secret will only be available if the user has previously started
        // but not completed the setup process during the initial TTL window.
        let secret = await authServerCacheRedis.get(toRedisTotpSecretKey(uid));
        if (secret) {
          await authServerCacheRedis.set(
            toRedisTotpSecretKey(uid),
            secret,
            'EX',
            TOTP_SECRET_REDIS_TTL
          );
        } else {
          secret = authenticator.generateSecret();
          await authServerCacheRedis.set(
            toRedisTotpSecretKey(uid),
            secret,
            'EX',
            TOTP_SECRET_REDIS_TTL
          );
        }

        log.info('totpToken.created', { uid });
        await request.emitMetricsEvent('totpToken.created', { uid });

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
      path: '/totp/setup/verify',
      options: {
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
        log.begin('totp.setup.verify', request);

        const { uid, email } = request.auth.credentials;
        const code = request.payload.code;

        await customs.checkAuthenticated(request, uid, email, 'verifyTotpCode');

        // Pull shared secret from Redis only (setup state)
        const sharedSecret = await authServerCacheRedis.get(
          toRedisTotpSecretKey(uid)
        );

        if (sharedSecret == null) {
          throw errors.totpTokenNotFound();
        }

        const otpOptions = {
          encoding: 'hex',
          step: config.step,
          window: config.window,
        };

        const { valid: isValidCode, delta } = otpUtils.verifyOtpCode(
          code,
          sharedSecret,
          otpOptions,
          'totp.setup.verify'
        );

        if (!isValidCode) {
          glean.twoFactorAuth.setupInvalidCodeError(request, { uid });

          // Extra logging to diagnose issues similar to FXA-12145
          log.error('totp.setup.verify.invalidCode', {
            uid,
            code,
            step: config.step,
            window: config.window,
            delta,
          });
          throw errors.invalidTokenVerficationCode();
        }

        // Mark setup as verified in Redis with a digest of the secret,
        // so completion can assert the verified flag matches the current secret value.
        const verifiedDigest = crypto
          .createHash('sha256')
          .update(sharedSecret)
          .digest('hex');
        const secretKey = toRedisTotpSecretKey(uid);
        const verifiedKey = toRedisTotpVerifiedKey(uid);
        // Ensure both keys have the same TTL; refresh both to the standard TTL window
        await authServerCacheRedis.set(
          secretKey,
          sharedSecret,
          'EX',
          TOTP_SECRET_REDIS_TTL
        );
        await authServerCacheRedis.set(
          verifiedKey,
          verifiedDigest,
          'EX',
          TOTP_SECRET_REDIS_TTL
        );

        // Emit success telemetry for setup verification

        await glean.twoFactorAuth.setupVerifySuccess(request, { uid });

        return { success: true };
      },
    },
    {
      method: 'POST',
      path: '/totp/setup/complete',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
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
        log.begin('totp.setup.complete', request);

        const sessionToken = request.auth.credentials;
        const { uid, email } = sessionToken;

        await customs.checkAuthenticated(request, uid, email, 'totpCreate');

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        // Expect a secret in Redis from the setup start step
        const sharedSecret = await authServerCacheRedis.get(
          toRedisTotpSecretKey(uid)
        );

        if (sharedSecret == null) {
          throw errors.totpTokenNotFound();
        }

        // Ensure setup was verified in Redis for THIS secret before allowing completion
        const expectedDigest = crypto
          .createHash('sha256')
          .update(sharedSecret)
          .digest('hex');
        const verifiedFlag = await authServerCacheRedis.get(
          toRedisTotpVerifiedKey(uid)
        );
        if (!verifiedFlag || verifiedFlag !== expectedDigest) {
          throw errors.invalidTokenVerficationCode();
        }

        await db.replaceTotpToken({
          uid,
          sharedSecret,
          verified: true,
          enabled: true,
          epoch: 0,
        });

        // Completing setup after a successful code verification should also
        // elevate the current session to AAL2 for this login flow.
        // This allows OAuth to proceed for RPs that require 2FA.
        try {
          await db.verifyTokensWithMethod(sessionToken.id, 'totp-2fa');
        } catch (err) {
          log.error('totp.setup.complete.verify_session_failed', { uid, err });
          // Do not abort setup completion if session upgrade fails;
          // the user has still enabled TOTP.
        }

        await authServerCacheRedis.del(toRedisTotpSecretKey(uid));
        await authServerCacheRedis.del(toRedisTotpVerifiedKey(uid));

        recordSecurityEvent('account.two_factor_added', {
          db,
          request,
        });

        glean.twoFactorAuth.codeComplete(request, { uid });

        await profileClient.deleteCache(uid);
        await log.notifyAttachedServices('profileDataChange', request, { uid });

        await sendEmailNotification();

        return { success: true };

        async function sendEmailNotification() {
          const account = await db.account(uid);
          const geoData = request.app.geo;
          const ip = request.app.clientAddress;
          const service = request.payload?.service || request.query?.service;
          const emailOptions = {
            acceptLanguage: request.app.acceptLanguage,
            ip,
            location: geoData.location,
            service,
            timeZone: geoData.timeZone,
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uid,
          };

          // include recovery method context if available
          const result = await recoveryPhoneService.hasConfirmed(uid);
          const maskedPhoneNumber = result?.phoneNumber
            ? recoveryPhoneService.maskPhoneNumber(result.phoneNumber)
            : undefined;

          try {
            await mailer.sendPostAddTwoStepAuthenticationEmail(
              account.emails,
              account,
              {
                ...emailOptions,
                maskedPhoneNumber,
              }
            );
          } catch (error) {
            log.error('mailer.sendPostAddTwoStepAuthenticationEmail', {
              error,
            });
          }
        }
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

        await recordSecurityEvent('account.two_factor_removed', {
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

        let sharedSecret;
        try {
          ({ sharedSecret } = await db.totpToken(uid));
        } catch (err) {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            throw errors.totpTokenNotFound();
          }
          throw err;
        }

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
          'session.verify'
        );

        // This endpoint now only handles session/login verification using DB secret

        // If a valid code was sent, this verifies the session using the `totp-2fa` method.
        if (isValidCode && sessionToken.authenticatorAssuranceLevel <= 1) {
          await db.verifyTokensWithMethod(sessionToken.id, 'totp-2fa');
        }

        if (isValidCode) {
          log.info('totp.verified', { uid });

          // Emit a login success event
          glean.login.totpSuccess(request, { uid });

          // this signals the end of the login flow
          await request.emitMetricsEvent('account.confirmed', { uid });

          await request.emitMetricsEvent('totpToken.verified', { uid });

          await recordSecurityEvent('account.two_factor_challenge_success', {
            db,
            request,
          });
        } else {
          log.info('totp.unverified', { uid });

          glean.login.totpFailure(request, { uid });

          await customs.flag(request.app.clientAddress, {
            email,
            errno: errors.ERRNO.INVALID_EXPIRED_OTP_CODE,
          });
          await request.emitMetricsEvent('totpToken.unverified', { uid });

          await recordSecurityEvent('account.two_factor_challenge_failure', {
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
          if (!isValidCode) return;
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

          return mailer.sendNewDeviceLoginEmail(
            account.emails,
            account,
            emailOptions
          );
        }
      },
    },
    {
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
      handler: handleTotpReplaceStart,
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
      handler: handleTotpReplaceConfirm,
    },
    {
      /**
       * MFA-prefixed routes using JWT-based mfa auth
       */
      method: 'POST',
      path: '/mfa/totp/replace/start',
      options: {
        ...TOTP_DOCS.MFA_TOTP_REPLACE_START_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:2fa'],
          payload: false,
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
      handler: handleTotpReplaceStart,
    },
    {
      method: 'POST',
      path: '/mfa/totp/replace/confirm',
      options: {
        ...TOTP_DOCS.MFA_TOTP_REPLACE_CONFIRM_POST,
        auth: {
          strategy: 'mfa',
          scope: ['mfa:2fa'],
          payload: false,
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
      handler: handleTotpReplaceConfirm,
    },
  ];
};
