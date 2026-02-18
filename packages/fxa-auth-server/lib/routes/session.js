/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { AppError: error } = require('@fxa/accounts/errors');
const isA = require('joi');
const requestHelper = require('../routes/utils/request_helper');
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;
const validators = require('./validators');
const Localizer = require('../l10n').default;
const NodeRendererBindings =
  require('../senders/renderer/bindings-node').default;
const SESSION_DOCS = require('../../docs/swagger/session-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;
const HEX_STRING = validators.HEX_STRING;
const { recordSecurityEvent } = require('./utils/security-event');
const { getOptionalCmsEmailConfig } = require('./utils/account');
const { Container } = require('typedi');
const { RelyingPartyConfigurationManager } = require('@fxa/shared/cms');
const authMethods = require('../authMethods');
const { FxaMailer } = require('../senders/fxa-mailer');
const { FxaMailerFormat } = require('../senders/fxa-mailer-format');
const { OAuthClientInfoServiceName } = require('../senders/oauth_client_info');

module.exports = function (
  log,
  db,
  Password,
  config,
  signinUtils,
  signupUtils,
  mailer,
  push,
  customs,
  glean,
  statsd
) {
  const otpUtils = require('./utils/otp').default(db, statsd);

  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    config.oauth.disableNewConnectionsForClients || []
  );

  const otpOptions = config.otp;

  const cmsManager = Container.has(RelyingPartyConfigurationManager)
    ? Container.get(RelyingPartyConfigurationManager)
    : null;

  const fxaMailer = Container.get(FxaMailer);
  const oauthClientInfoService = Container.get(OAuthClientInfoServiceName);

  const routes = [
    {
      method: 'POST',
      path: '/session/destroy',
      options: {
        ...SESSION_DOCS.SESSION_DESTROY_POST,
        auth: {
          strategy: 'sessionToken',
          // since payload is allowed to be empty we do not
          // do hawk payload validation otherwise we may break existing clients
        },
        validate: {
          payload: isA
            .object({
              customSessionToken: isA
                .string()
                .min(64)
                .max(64)
                .regex(HEX_STRING)
                .optional()
                .description(DESCRIPTION.customSessionToken),
            })
            .allow(null),
        },
      },
      handler: async function (request) {
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
        await recordSecurityEvent('session.destroy', {
          db,
          request,
        });

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
        ...SESSION_DOCS.SESSION_REAUTH_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            keys: isA.boolean().optional(),
            service: validators.service,
            verificationMethod: validators.verificationMethod.optional(),
          }),
          payload: isA.object({
            email: validators.email().required(),
            authPW: validators.authPW,
            service: validators.service,
            redirectTo: validators
              .redirectTo(config.smtp.redirectDomain)
              .optional(),
            resume: isA.string().optional(),
            reason: isA.string().max(16).optional(),
            unblockCode: signinUtils.validators.UNBLOCK_CODE,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: validators.verificationMethod.optional(),
          }),
        },
        response: {
          schema: isA.object({
            uid: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            verificationMethod: isA.string().optional(),
            verificationReason: isA.string().optional(),
            emailVerified: isA.boolean().required(),
            sessionVerified: isA.boolean().required(),
            authAt: isA.number().integer(),
            metricsEnabled: isA.boolean().required(),
            verified: isA.boolean().required(), // Deprecated!
          }),
        },
      },
      handler: async function (request) {
        log.begin('Session.reauth', request);

        const sessionToken = request.auth.credentials;
        const { authPW, email, originalLoginEmail } = request.payload;
        const service = request.payload.service || request.query.service;

        let { verificationMethod } = request.payload;

        request.validateMetricsContext();
        if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
          throw error.disabledClientId(service);
        }

        const account = await db.accountRecord(email);
        if (account.uid !== sessionToken.uid) {
          throw error.unknownAccount(email);
        }

        const { accountRecord } = await signinUtils.checkCustomsAndLoadAccount(
          request,
          email,
          sessionToken.uid
        );

        // Start temporary metrics section
        if (!account?.primaryEmail?.isVerified) {
          statsd.increment('session_reauth.primary_email_not_verified');
        }
        if (!sessionToken.tokenVerified) {
          statsd.increment('session_reauth.token_not_verified');
        }
        const accountAmr = await authMethods.availableAuthenticationMethods(
          db,
          account
        );
        const accountAal = authMethods.maximumAssuranceLevel(accountAmr);
        const sessionAal = sessionToken.authenticatorAssuranceLevel;
        if (sessionAal < accountAal) {
          statsd.increment('session_reauth.all_not_met');
        }
        // End temporary metrics section

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
          request
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
          metricsEnabled: !accountRecord.metricsOptOut,
          emailVerified: sessionToken.emailVerified,
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

        // Needed to prevent breaking API changes!
        // Legacy implemenation would set verified true when
        // session and email are flagged as verified
        response.verified = response.emailVerified && response.sessionVerified;

        return response;
      },
    },
    {
      method: 'GET',
      path: '/session/status',
      options: {
        ...SESSION_DOCS.SESSION_STATUS_GET,
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA.object({
            state: isA.string().required(),
            uid: isA.string().regex(HEX_STRING).required(),
            details: isA.object({
              accountEmailVerified: isA.boolean(),
              sessionVerificationMethod: isA.string().allow(null),
              sessionVerified: isA.boolean(),
              mustVerify: isA.boolean(),
              sessionVerificationMeetsMinimumAAL: isA.boolean(),
              verified: isA.boolean(), // Deprecated!
            }),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Session.status', request);
        const sessionToken = request.auth.credentials;
        const account = await db.account(sessionToken.uid);

        // Make sure the account still exists
        if (!account) {
          throw error.unknownAccount();
        }

        // Check account assurance level
        const accountAmr = await authMethods.availableAuthenticationMethods(
          db,
          account
        );
        const accountAal = authMethods.maximumAssuranceLevel(accountAmr);
        const sessionAal = sessionToken.authenticatorAssuranceLevel;

        // Build response
        const accountEmailVerified = account.primaryEmail.isVerified;

        const sessionVerificationMethod =
          sessionToken.verificationMethodValue || null;

        // See verified-session-token auth strategy
        const sessionVerified = sessionToken.tokenVerified;

        // Account Assurance Level
        const sessionVerificationMeetsMinimumAAL = sessionAal >= accountAal;

        // Legacy verified flag. Keep for backwards compatibility.
        const verified = accountEmailVerified && sessionVerified;

        const mustVerify = !!sessionToken.mustVerify;

        return {
          state: sessionToken.state,
          uid: sessionToken.uid,
          details: {
            accountEmailVerified,
            sessionVerificationMethod,
            sessionVerified,
            mustVerify,
            sessionVerificationMeetsMinimumAAL,
            verified,
          },
        };
      },
    },
    {
      method: 'POST',
      path: '/session/duplicate',
      options: {
        ...SESSION_DOCS.SESSION_DUPLICATE_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            reason: isA.string().max(16).optional(),
          }),
        },
        response: {
          schema: isA.object({
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            authAt: isA.number().integer(),
            emailVerified: isA.boolean(),
            sessionVerified: isA.boolean(),
            verificationMethod: isA.string().allow(null),
            verificationReason: isA.string().allow(null),
            verified: isA.boolean(), // Deprecated
          }),
        },
      },
      handler: async function (request) {
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
        const newSessionToken =
          await db.createSessionToken(sessionTokenOptions);

        const response = {
          uid: newSessionToken.uid,
          sessionToken: newSessionToken.data,
          authAt: newSessionToken.lastAuthAt(),
          emailVerified: newSessionToken.emailVerified,
        };

        if (!newSessionToken.emailVerified) {
          response.sessionVerified = newSessionToken.tokenVerified;
          response.verificationMethod = 'email';
          response.verificationReason = 'signup';
        } else if (!newSessionToken.tokenVerified) {
          response.sessionVerified = false;
          response.verificationMethod = 'email';
          response.verificationReason = 'login';
        } else {
          response.sessionVerified = true;
        }

        // Prevents breaking API changes!
        response.verified =
          newSessionToken.emailVerified && newSessionToken.tokenVerified;

        return response;
      },
    },
    {
      method: 'POST',
      path: '/session/verify_code',
      options: {
        ...SESSION_DOCS.SESSION_VERIFY_CODE_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            code: validators.DIGITS,
            service: validators.service,
            scopes: validators.scopes,
            // The `marketingOptIn` is safe to remove after train-167+
            marketingOptIn: isA.boolean().optional(),
            newsletters: validators.newsletters,
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
      },
      handler: async function (request) {
        log.begin('Session.verify_code', request);
        const options = request.payload;
        const sessionToken = request.auth.credentials;
        const { code } = options;
        const { uid, email } = sessionToken;
        const devices = await request.app.devices;

        await customs.checkAuthenticated(
          request,
          uid,
          email,
          'verifySessionCode'
        );

        request.emitMetricsEvent('session.verify_code');

        // Check to see if the otp code passed matches the expected value from
        // using the account's' `emailCode` as the secret in the otp code generation.
        const account = await db.account(uid);
        const secret = account.primaryEmail.emailCode;

        const { valid: isValidCode } = otpUtils.verifyOtpCode(
          code,
          secret,
          otpOptions,
          'session.verify_code'
        );

        if (!isValidCode) {
          if (customs.v2Enabled()) {
            await customs.check(request, email, 'verifySessionCodeFailed');
          }
          throw error.invalidOrExpiredOtpCode();
        }

        // If a valid code was sent, this verifies the session using the `email-2fa` method.
        // The assurance level will be ["pwd", "email"] or level 1.
        // **Note** the order of operations, to avoid any race conditions with push
        // notifications, we perform all DB operations first.
        await db.verifyTokensWithMethod(sessionToken.id, 'email-2fa');

        // We have a matching code! Let's verify the account, session and send the
        // corresponding email and emit metrics.
        if (!account.primaryEmail.isVerified) {
          await signupUtils.verifyAccount(request, account, options);
        } else {
          await request.emitMetricsEvent('account.confirmed', { uid });
          glean.login.verifyCodeConfirmed(request, { uid });
          await signinUtils.cleanupReminders({ verified: true }, account);
          await push.notifyAccountUpdated(uid, devices, 'accountConfirm');

          // Send new device login notification email after successful verification
          const geoData = request.app.geo;
          const service = options.service || request.query.service;

          try {
            if (fxaMailer.canSend('newDeviceLogin')) {
              const clientInfo = await oauthClientInfoService.fetch(service);
              await fxaMailer.sendNewDeviceLoginEmail({
                ...FxaMailerFormat.account(account),
                ...FxaMailerFormat.device(request),
                ...FxaMailerFormat.localTime(request),
                ...FxaMailerFormat.location(request),
                ...(await FxaMailerFormat.metricsContext(request)),
                ...FxaMailerFormat.sync(service),
                clientName: clientInfo.name,
                showBannerWarning: false,
              });
            } else {
              const emailOptions = {
                acceptLanguage: request.app.acceptLanguage,
                ip: request.app.clientAddress, // TODO: Double check this... It doesn't seem to be used?
                location: geoData.location,
                service,
                timeZone: geoData.timeZone,
                uaBrowser: sessionToken.uaBrowser,
                uaBrowserVersion: sessionToken.uaBrowserVersion,
                uaOS: sessionToken.uaOS,
                uaOSVersion: sessionToken.uaOSVersion,
                uaDeviceType: sessionToken.uaDeviceType,
                uid,
              };
              await mailer.sendNewDeviceLoginEmail(
                account.emails,
                account,
                emailOptions
              );
            }
          } catch (err) {
            log.trace('Session.verify_code.sendNewDeviceLoginEmail.error', {
              error: err,
            });
          }
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/session/resend_code',
      options: {
        ...SESSION_DOCS.SESSION_RESEND_CODE_POST,
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: async function (request) {
        log.begin('Session.resend_code', request);
        const sessionToken = request.auth.credentials;

        request.emitMetricsEvent('session.resend_code');
        const metricsContext = await request.app.metricsContext;

        // Check to see if this account has a verified TOTP token. If so, then it should
        // not be allowed to bypass TOTP requirement by sending a sign-in confirmation email.
        try {
          const result = await db.totpToken(sessionToken.uid);

          if (result && result.verified && result.enabled) {
            return {};
          }
        } catch (err) {
          if (err.errno !== error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            throw err;
          }
        }

        // Generate the current otp code for the account based on the account's
        // `emailCode` as the secret.
        const account = await db.account(sessionToken.uid);
        const secret = account.primaryEmail.emailCode;

        await customs.checkAuthenticated(
          request,
          account.uid,
          account.primaryEmail.normalizedEmail,
          'sendVerifyCode'
        );

        const code = otpUtils.generateOtpCode(secret, otpOptions);

        const options = {
          acceptLanguage: account.locale || request.app.locale,
          code,
          location: request.app.geo.location,
          timeZone: request.app.geo.timeZone,
          uaBrowser: sessionToken.uaBrowser,
          uaBrowserVersion: sessionToken.uaBrowserVersion,
          uaOS: sessionToken.uaOS,
          uaOSVersion: sessionToken.uaOSVersion,
          uaDeviceType: sessionToken.uaDeviceType,
          uid: sessionToken.uid,
          flowId: metricsContext.flowId,
          flowBeginTime: metricsContext.flowBeginTime,
          deviceId: metricsContext.deviceId,
        };

        if (account.primaryEmail.isVerified) {
          // Unverified emails mean that the user is attempting to resend the code from signup page,
          // therefore they get sent a different email template with the code.
          if (fxaMailer.canSend('verifyLoginCode')) {
            // This will just short-circuit to Mozilla, but leaving for future proofing.
            const clientInfo = await oauthClientInfoService.fetch(undefined);
            const cmsConfig = await getOptionalCmsEmailConfig(options, {
              request,
              cmsManager,
              log,
              emailTemplate: 'VerifyLoginCodeEmail',
            });
            await fxaMailer.sendVerifyLoginCodeEmail({
              ...FxaMailerFormat.account(account),
              ...(await FxaMailerFormat.metricsContext(request)),
              ...FxaMailerFormat.localTime(request),
              ...FxaMailerFormat.location(request),
              ...FxaMailerFormat.device(request),
              ...FxaMailerFormat.sync(false),
              ...FxaMailerFormat.cmsLogo(cmsConfig),
              ...FxaMailerFormat.cmsEmailSubject(cmsConfig),
              code,
              service: clientInfo.name,
              serviceName: clientInfo.name,
            });
          } else {
            await mailer.sendVerifyLoginCodeEmail(
              account.emails,
              account,
              await getOptionalCmsEmailConfig(options, {
                request,
                cmsManager,
                log,
                emailTemplate: 'VerifyLoginCodeEmail',
              })
            );
          }
        } else {
          if (fxaMailer.canSend('verifyShortCode')) {
            const cmsConfig = await getOptionalCmsEmailConfig(options, {
              request,
              cmsManager,
              log,
              emailTemplate: 'VerifyShortCodeEmail',
            });
            await fxaMailer.sendVerifyShortCodeEmail({
              ...FxaMailerFormat.account(account),
              ...(await FxaMailerFormat.metricsContext(request)),
              ...FxaMailerFormat.localTime(request),
              ...FxaMailerFormat.location(request),
              ...FxaMailerFormat.device(request),
              ...FxaMailerFormat.sync(false),
              ...FxaMailerFormat.cmsLogo(cmsConfig),
              ...FxaMailerFormat.cmsEmailSubject(cmsConfig),
              code,
            });
          } else {
            await mailer.sendVerifyShortCodeEmail(
              [],
              account,
              await getOptionalCmsEmailConfig(options, {
                request,
                cmsManager,
                log,
                emailTemplate: 'VerifyShortCodeEmail',
              })
            );
          }
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/session/verify/send_push',
      options: {
        ...SESSION_DOCS.SESSION_SEND_PUSH_POST,
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: async function (request) {
        log.begin('Session.send_push', request);

        const sessionToken = request.auth.credentials;
        const { uid, email, tokenVerificationId } = sessionToken;

        // Check to see if this account has a verified TOTP token. If so, then it should
        // not be allowed to bypass TOTP requirement by sending a sign-in push notification.
        try {
          const result = await db.totpToken(sessionToken.uid);

          if (result && result.verified && result.enabled) {
            return {};
          }
        } catch (err) {
          if (err.errno !== error.ERRNO.TOTP_TOKEN_NOT_FOUND) {
            throw err;
          }
        }

        const allDevices = await db.devices(uid);

        const account = await db.account(sessionToken.uid);
        const secret = account.primaryEmail.emailCode;

        const code = otpUtils.generateOtpCode(secret, otpOptions);

        // Filter devices that can accept the push notification.
        const filteredDevices = allDevices.filter((d) => {
          // Don't push to the current device
          if (d.sessionTokenId === sessionToken.id) {
            return false;
          }
          // Exclude expired devices
          if (d.pushEndpointExpired === true) {
            return false;
          }
          // Currently, we only support sending push notifications to Firefox Desktop
          return d.type === 'desktop' && d.uaBrowser === 'Firefox';
        });

        const confirmUrl = `${config.contentServer.url}/signin_push_code_confirm`;

        const localizer = new Localizer(new NodeRendererBindings());

        // If/when we use .localizeStrings in other files, probably move where strings are
        // maintained to separate file?
        const titleFtlId = 'session-verify-send-push-title-2';
        const bodyFtlId = 'session-verify-send-push-body-2';

        const ftlIdMsgs = [
          {
            id: titleFtlId,
            message: 'Logging in to your Mozilla account?',
          },
          {
            id: bodyFtlId,
            message: 'Click here to confirm it’s you',
          },
        ];
        const localizedStrings = await localizer.localizeStrings(
          request.app.locale,
          ftlIdMsgs
        );

        const options = {
          title: localizedStrings[titleFtlId],
          body: localizedStrings[bodyFtlId],
        };

        const { region, city, country } = request.app.geo;
        const remoteMetaData = {
          deviceName: sessionToken.deviceName,
          deviceFamily: sessionToken.uaBrowser,
          deviceOS: sessionToken.uaOS,
          ipAddress: request.app.clientAddress,
          city,
          region,
          country,
        };
        const params = new URLSearchParams({
          tokenVerificationId,
          code,
          uid,
          email,
          remoteMetaData: encodeURIComponent(JSON.stringify(remoteMetaData)),
        });
        const url = `${confirmUrl}?${params.toString()}`;
        try {
          await push.notifyVerifyLoginRequest(uid, filteredDevices, {
            ...options,
            url,
          });
        } catch (err) {
          log.error('Session.send_push', {
            uid: uid,
            error: err,
          });
        }

        return {};
      },
    },
    {
      method: 'POST',
      path: '/session/verify/verify_push',
      options: {
        ...SESSION_DOCS.SESSION_VERIFY_CODE_POST,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            code: validators.DIGITS,
            tokenVerificationId: validators.hexString.length(32),
          }),
        },
      },
      handler: async function (request) {
        log.begin('Session.verify_push', request);
        const options = request.payload;
        const sessionToken = request.auth.credentials;
        const { uid, email } = sessionToken;
        const { code, tokenVerificationId } = options;

        await customs.checkAuthenticated(
          request,
          uid,
          email,
          'verifySessionCode'
        );
        request.emitMetricsEvent('session.verify_push');

        const device = await db.deviceFromTokenVerificationId(
          uid,
          tokenVerificationId
        );

        // If device is not found, this means the device has already been verified.
        // Since the user can not take any additional action, it is safe to return
        // a successful response.
        if (!device) {
          return {};
        }

        // Check to see if the otp code passed matches the expected value from
        // using the account's' `emailCode` as the secret in the otp code generation.
        const account = await db.account(uid);
        const secret = account.primaryEmail.emailCode;

        const { valid: isValidCode } = otpUtils.verifyOtpCode(
          code,
          secret,
          otpOptions,
          'session.verify_push'
        );

        if (!isValidCode) {
          if (customs.v2Enabled()) {
            await customs.checkAuthenticated(
              request,
              uid,
              email,
              'verifySessionCodeFailed'
            );
          }
          throw error.invalidOrExpiredOtpCode();
        }

        await db.verifyTokens(tokenVerificationId, account);

        // We have a matching code! Let's verify session and send the
        // corresponding email and emit metrics.
        request.emitMetricsEvent('account.confirmed', { uid });
        glean.login.verifyCodeConfirmed(request, { uid });
        await signinUtils.cleanupReminders({ verified: true }, account);
        const devices = await db.devices(uid);
        await push.notifyAccountUpdated(uid, devices, 'accountConfirm');

        // Send new device login notification email after successful verification
        if (account.primaryEmail.isVerified) {
          const geoData = request.app.geo;
          const service = request.query.service;
          const emailOptions = {
            acceptLanguage: request.app.acceptLanguage,
            ip: request.app.clientAddress,
            location: geoData.location,
            service,
            timeZone: geoData.timeZone,
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
            uaDeviceType: sessionToken.uaDeviceType,
            uid,
          };

          try {
            if (fxaMailer.canSend('newDeviceLogin')) {
              const clientInfo = await oauthClientInfoService.fetch(service);
              await fxaMailer.sendNewDeviceLoginEmail({
                ...FxaMailerFormat.account(account),
                ...FxaMailerFormat.device(request),
                ...FxaMailerFormat.localTime(request),
                ...FxaMailerFormat.location(request),
                ...(await FxaMailerFormat.metricsContext(request)),
                ...FxaMailerFormat.sync(service),
                clientName: clientInfo.name,
                showBannerWarning: false,
              });
            } else {
              await mailer.sendNewDeviceLoginEmail(
                account.emails,
                account,
                emailOptions
              );
            }
          } catch (err) {
            log.trace('Session.verify_push.sendNewDeviceLoginEmail.error', {
              error: err,
            });
          }
        }

        return {};
      },
    },
  ];

  return routes;
};
