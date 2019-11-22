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

module.exports = (log, db, mailer, customs, config) => {
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);

  // Currently, QR codes are rendered with the highest possible
  // error correction, which should in theory allow clients to
  // scan the image better.
  // Ref: https://github.com/soldair/node-qrcode#error-correction-level
  const qrCodeOptions = { errorCorrectionLevel: 'H' };

  const RECOVERY_CODE_COUNT =
    (config.recoveryCodes && config.recoveryCodes.count) || 8;

  promisify(qrcode.toDataURL);

  return [
    {
      method: 'POST',
      path: '/totp/create',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            metricsContext: METRICS_CONTEXT_SCHEMA,
          },
        },
        response: {
          schema: isA.object({
            qrCodeUrl: isA.string().required(),
            secret: isA.string().required(),
          }),
        },
      },
      handler: async function(request) {
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
        await db.createTotpToken(uid, secret, 0);

        log.info('totpToken.created', { uid });
        await request.emitMetricsEvent('totpToken.created', { uid });

        const otpauth = authenticator.keyuri(
          sessionToken.email,
          config.serviceName,
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
      path: '/totp/destroy',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {},
      },
      handler: async function(request) {
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

        await log.notifyAttachedServices('profileDataChanged', request, {
          uid,
        });

        if (hasEnabledToken) {
          const account = await db.account(uid);
          const geoData = request.app.geo;
          const ip = request.app.clientAddress;
          const emailOptions = {
            acceptLanguage: request.app.acceptLanguage,
            ip,
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

        return {};
      },
    },
    {
      method: 'GET',
      path: '/totp/exists',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA.object({
            exists: isA.boolean(),
          }),
        },
      },
      handler: async function(request) {
        log.begin('totp.exists', request);

        const sessionToken = request.auth.credentials;
        let exists = false;

        if (sessionToken.tokenVerificationId) {
          throw errors.unverifiedSession();
        }

        try {
          const token = await db.totpToken(sessionToken.uid);

          // If the token is not verified, lets delete it and report that
          // it doesn't exist. This will help prevent some edge
          // cases where the user started creating a token but never completed.
          if (!token.verified) {
            await db.deleteTotpToken(sessionToken.uid);
          } else {
            exists = true;
          }
        } catch (err) {
          if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            exists = false;
          } else {
            throw err;
          }
        }

        return { exists };
      },
    },
    {
      method: 'POST',
      path: '/session/verify/totp',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            code: isA
              .string()
              .max(32)
              .regex(validators.DIGITS)
              .required(),
            service: validators.service,
          },
        },
        response: {
          schema: {
            success: isA.boolean().required(),
            recoveryCodes: isA
              .array()
              .items(isA.string())
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('session.verify.totp', request);

        const code = request.payload.code;
        const sessionToken = request.auth.credentials;
        const { uid, email } = sessionToken;
        let recoveryCodes;

        await customs.check(request, email, 'verifyTotpCode');

        const token = await db.totpToken(sessionToken.uid);
        const sharedSecret = token.sharedSecret;
        const tokenVerified = token.verified;

        const authenticator = new otplib.authenticator.Authenticator();
        authenticator.options = Object.assign(
          {},
          otplib.authenticator.options,
          { secret: sharedSecret }
        );
        const isValidCode = authenticator.check(code, sharedSecret);

        // Once a valid TOTP code has been detected, the token becomes verified
        // and enabled for the user.
        if (isValidCode && !tokenVerified) {
          await db.updateTotpToken(sessionToken.uid, {
            verified: true,
            enabled: true,
          });

          await log.notifyAttachedServices('profileDataChanged', request, {
            uid: sessionToken.uid,
          });
        }

        // If this is a new registration, replace and generate recovery codes
        if (isValidCode && !tokenVerified) {
          recoveryCodes = await db.replaceRecoveryCodes(
            uid,
            RECOVERY_CODE_COUNT
          );
        }

        // If a valid code was sent, this verifies the session using the `totp-2fa` method.
        if (isValidCode && sessionToken.authenticatorAssuranceLevel <= 1) {
          await db.verifyTokensWithMethod(sessionToken.id, 'totp-2fa');
        }

        if (isValidCode) {
          log.info('totp.verified', { uid });
          await request.emitMetricsEvent('totpToken.verified', { uid });
        } else {
          log.info('totp.unverified', { uid });
          await request.emitMetricsEvent('totpToken.unverified', { uid });
        }

        await sendEmailNotification();

        const response = {
          success: isValidCode,
        };

        if (recoveryCodes) {
          response.recoveryCodes = recoveryCodes;
        }

        return response;

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
          // the user has enabled two step authentication, otherwise send new device
          // login email.
          if (isValidCode && !tokenVerified) {
            return mailer.sendPostAddTwoStepAuthenticationEmail(
              account.emails,
              account,
              emailOptions
            );
          }

          // All accounts that have a TOTP token, force the session to be verified, therefore
          // we can not check `session.mustVerify=true` to determine sending the new device
          // login email. Instead, lets perform a basic check that the service is `sync`, otherwise
          // don't send.
          if (isValidCode && service === 'sync') {
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
