/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('joi');
const requestHelper = require('../routes/utils/request_helper');
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

const validators = require('./validators');
const HEX_STRING = validators.HEX_STRING;

module.exports = function(
  log,
  db,
  Password,
  config,
  signinUtils,
  signupUtils,
  mailer
) {
  const otpUtils = require('../../lib/routes/utils/otp')(log, config, db);

  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    config.oauth.disableNewConnectionsForClients || []
  );

  const otpOptions = config.otp;

  const routes = [
    {
      method: 'POST',
      path: '/session/destroy',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA
            .object({
              customSessionToken: isA
                .string()
                .min(64)
                .max(64)
                .regex(HEX_STRING)
                .optional(),
            })
            .allow(null),
        },
      },
      handler: async function(request) {
        log.begin('Session.destroy', request);

        let sessionToken = request.auth.credentials;
        const { uid } = sessionToken;

        if (request.payload && request.payload.customSessionToken) {
          const customSessionToken = request.payload.customSessionToken;

          const tokenData = await db.sessionToken(customSessionToken);
          // NOTE: validate that the token belongs to the same user
          if (tokenData && uid === tokenData.uid) {
            sessionToken = {
              id: customSessionToken,
              uid,
            };
          } else {
            throw error.invalidToken('Invalid session token');
          }
        }

        await db.deleteSessionToken(sessionToken);

        return {};
      },
    },
    {
      method: 'POST',
      path: '/session/reauth',
      apidoc: {
        errors: [
          error.unknownAccount,
          error.requestBlocked,
          error.incorrectPassword,
          error.cannotLoginWithSecondaryEmail,
          error.invalidUnblockCode,
          error.cannotLoginWithEmail,
        ],
      },
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            keys: isA.boolean().optional(),
            service: validators.service,
            verificationMethod: validators.verificationMethod.optional(),
          },
          payload: {
            email: validators.email().required(),
            authPW: validators.authPW,
            service: validators.service,
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA.string().optional(),
            reason: isA
              .string()
              .max(16)
              .optional(),
            unblockCode: signinUtils.validators.UNBLOCK_CODE,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: validators.verificationMethod.optional(),
          },
        },
        response: {
          schema: {
            uid: isA
              .string()
              .regex(HEX_STRING)
              .required(),
            keyFetchToken: isA
              .string()
              .regex(HEX_STRING)
              .optional(),
            verificationMethod: isA.string().optional(),
            verificationReason: isA.string().optional(),
            verified: isA.boolean().required(),
            authAt: isA.number().integer(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Session.reauth', request);

        const sessionToken = request.auth.credentials;
        const { authPW, email, originalLoginEmail } = request.payload;
        const service = request.payload.service || request.query.service;

        let { verificationMethod } = request.payload;

        request.validateMetricsContext();
        if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
          throw error.disabledClientId(service);
        }

        const { accountRecord } = await signinUtils.checkCustomsAndLoadAccount(
          request,
          email
        );

        await signinUtils.checkEmailAddress(
          accountRecord,
          email,
          originalLoginEmail
        );

        const password = new Password(
          authPW,
          accountRecord.authSalt,
          accountRecord.verifierVersion
        );
        const match = await signinUtils.checkPassword(
          accountRecord,
          password,
          request.app.clientAddress
        );
        if (!match) {
          throw error.incorrectPassword(accountRecord.email, email);
        }

        // Check to see if the user has a TOTP token and it is verified and
        // enabled, if so then the verification method is automatically forced so that
        // they have to verify the token.
        const hasTotpToken = await otpUtils.hasTotpToken(accountRecord);
        if (hasTotpToken) {
          // User has enabled TOTP, no way around it, they must verify TOTP token
          verificationMethod = 'totp-2fa';
        } else if (verificationMethod === 'totp-2fa') {
          // Error if requesting TOTP verification with TOTP not setup
          throw error.totpRequired();
        }

        sessionToken.authAt = sessionToken.lastAccessTime = Date.now();
        const { ua } = request.app;
        sessionToken.setUserAgentInfo({
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uaFormFactor: ua.formFactor,
        });

        if (
          !sessionToken.mustVerify &&
          (requestHelper.wantsKeys(request) || verificationMethod)
        ) {
          sessionToken.mustVerify = true;
        }

        await db.updateSessionToken(sessionToken);

        await signinUtils.sendSigninNotifications(
          request,
          accountRecord,
          sessionToken,
          verificationMethod
        );

        const response = {
          uid: sessionToken.uid,
          authAt: sessionToken.lastAuthAt(),
        };

        if (requestHelper.wantsKeys(request)) {
          const keyFetchToken = await signinUtils.createKeyFetchToken(
            request,
            accountRecord,
            password,
            sessionToken
          );
          response.keyFetchToken = keyFetchToken.data;
        }

        Object.assign(
          response,
          signinUtils.getSessionVerificationStatus(
            sessionToken,
            verificationMethod
          )
        );

        return response;
      },
    },
    {
      method: 'GET',
      path: '/session/status',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: {
            state: isA.string().required(),
            uid: isA
              .string()
              .regex(HEX_STRING)
              .required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Session.status', request);
        const sessionToken = request.auth.credentials;
        return {
          state: sessionToken.state,
          uid: sessionToken.uid,
        };
      },
    },
    {
      method: 'POST',
      path: '/session/duplicate',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            reason: isA
              .string()
              .max(16)
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('Session.duplicate', request);

        const origSessionToken = request.auth.credentials;
        const newTokenState = await origSessionToken.copyTokenState();

        // Update UA info based on the requesting device.
        const { ua } = request.app;
        const newUAInfo = {
          uaBrowser: ua.browser,
          uaBrowserVersion: ua.browserVersion,
          uaOS: ua.os,
          uaOSVersion: ua.osVersion,
          uaDeviceType: ua.deviceType,
          uaFormFactor: ua.formFactor,
        };

        // Copy all other details from the original sessionToken.
        // We have to lie a little here and copy the creation time
        // of the original sessionToken. If we set createdAt to the
        // current time, we would falsely report the new session's
        // `lastAuthAt` value as the current timestamp.
        const sessionTokenOptions = {
          ...newTokenState,
          ...newUAInfo,
        };
        const newSessionToken = await db.createSessionToken(
          sessionTokenOptions
        );

        const response = {
          uid: newSessionToken.uid,
          sessionToken: newSessionToken.data,
          authAt: newSessionToken.lastAuthAt(),
        };

        if (!newSessionToken.emailVerified) {
          response.verified = false;
          response.verificationMethod = 'email';
          response.verificationReason = 'signup';
        } else if (!newSessionToken.tokenVerified) {
          response.verified = false;
          response.verificationMethod = 'email';
          response.verificationReason = 'login';
        } else {
          response.verified = true;
        }

        return response;
      },
    },
    {
      method: 'POST',
      path: '/session/verify_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            code: validators.DIGITS,
            service: validators.service,
            style: validators.style,
            marketingOptIn: isA.boolean().optional(),
            newsletters: validators.newsletters,
          },
        },
      },
      handler: async function(request) {
        log.begin('Session.verify_code', request);
        const options = request.payload;
        const sessionToken = request.auth.credentials;
        const { code } = options;

        request.emitMetricsEvent('session.verify_code');

        // Check to see if the otp code passed matches the expected value from
        // using the account's' `emailCode` as the secret in the otp code generation.
        const account = await db.account(sessionToken.uid);
        const secret = account.primaryEmail.emailCode;

        const expectedCode = otpUtils.generateOtpCode(secret, otpOptions);

        if (expectedCode !== code) {
          throw error.invalidOrExpiredOtpCode();
        }

        // We have a matching code! Let's verify the account, session and send the
        // corresponding email and emit metrics.
        if (!account.primaryEmail.isVerified) {
          await signupUtils.verifyAccount(request, account, options);
        }

        // If a valid code was sent, this verifies the session using the `email-2fa` method.
        // The assurance level will be ["pwd", "emai"] or level 1.
        await db.verifyTokensWithMethod(sessionToken.id, 'email-2fa');

        return {};
      },
    },
    {
      method: 'POST',
      path: '/session/resend_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: async function(request) {
        log.begin('Session.resend_code', request);
        const sessionToken = request.auth.credentials;
        const ip = request.app.clientAddress;

        request.emitMetricsEvent('session.resend_code');

        // Generate the current otp code for the account based on the account's
        // `emailCode` as the secret.
        const account = await db.account(sessionToken.uid);
        const secret = account.primaryEmail.emailCode;

        const code = otpUtils.generateOtpCode(secret, otpOptions);

        await mailer.sendVerifyShortCode([], account, {
          code,
          acceptLanguage: account.locale,
          ip,
          location: request.app.geo.location,
          uaBrowser: sessionToken.uaBrowser,
          uaBrowserVersion: sessionToken.uaBrowserVersion,
          uaOS: sessionToken.uaOS,
          uaOSVersion: sessionToken.uaOSVersion,
          uaDeviceType: sessionToken.uaDeviceType,
          uid: sessionToken.uid,
        });

        return {};
      },
    },
  ];

  return routes;
};
