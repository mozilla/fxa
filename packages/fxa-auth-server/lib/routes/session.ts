/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import error from '../error';
import isA from '@hapi/joi';
import requestHelper from '../routes/utils/request_helper';
import validators from './validators';

import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
const HEX_STRING = validators.HEX_STRING;
const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

// helper used to ensure strings are extracted
function gettext(txt: string) {
  return txt;
}

interface SessionResponse {
  uid: string;
  authAt: number;
  keyFetchToken?: string;
  sessionToken?: string;
  verified?: boolean;
  verificationMethod?: string;
  verificationReason?: string;
}

export class SessionHandler {
  private OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS: Set<string>;
  private otpUtils: any;
  private otpOptions: ConfigType['otp'];

  constructor(
    private log: AuthLogger,
    private db: any,
    private Password: any,
    private config: ConfigType,
    private signinUtils: any,
    private signupUtils: any,
    private mailer: any,
    private push: any,
    private customs: any
  ) {
    this.otpUtils = require('../../lib/routes/utils/otp')(log, config, db);

    this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
      (config.oauth.disableNewConnectionsForClients as string[]) || []
    );

    this.otpOptions = config.otp;
  }

  async sessionDestroy(request: AuthRequest) {
    this.log.begin('Session.destroy', request);
    let sessionToken = request.auth.credentials;
    const { uid } = sessionToken;
    const { customSessionToken } = request.payload || {};

    if (customSessionToken) {
      const tokenData = await this.db.sessionToken(customSessionToken);
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

    await this.db.deleteSessionToken(sessionToken);

    return {};
  }

  async sessionReauth(request: AuthRequest): Promise<SessionResponse> {
    this.log.begin('Session.reauth', request);

    const sessionToken = request.auth.credentials as any;
    const { authPW, email, originalLoginEmail } = request.payload;
    const service = request.payload.service || (request.query.service as any);

    let { verificationMethod } = request.payload;

    request.validateMetricsContext();
    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
      throw error.disabledClientId(service);
    }

    const { accountRecord } = await this.signinUtils.checkCustomsAndLoadAccount(
      request,
      email
    );

    await this.signinUtils.checkEmailAddress(
      accountRecord,
      email,
      originalLoginEmail
    );

    const password = new this.Password(
      authPW,
      accountRecord.authSalt,
      accountRecord.verifierVersion
    );
    const match = await this.signinUtils.checkPassword(
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
    const hasTotpToken = await this.otpUtils.hasTotpToken(accountRecord);
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

    await this.db.updateSessionToken(sessionToken);

    await this.signinUtils.sendSigninNotifications(
      request,
      accountRecord,
      sessionToken,
      verificationMethod
    );

    const response: SessionResponse = {
      uid: sessionToken.uid,
      authAt: sessionToken.lastAuthAt(),
    };

    if (requestHelper.wantsKeys(request)) {
      const keyFetchToken = await this.signinUtils.createKeyFetchToken(
        request,
        accountRecord,
        password,
        sessionToken
      );
      response.keyFetchToken = keyFetchToken.data;
    }

    Object.assign(
      response,
      this.signinUtils.getSessionVerificationStatus(
        sessionToken,
        verificationMethod
      )
    );

    return response;
  }

  async sessionStatus(request: AuthRequest) {
    this.log.begin('Session.status', request);
    const sessionToken = request.auth.credentials;
    return {
      state: sessionToken.state,
      uid: sessionToken.uid,
    };
  }

  async sessionDuplicate(request: AuthRequest): Promise<SessionResponse> {
    this.log.begin('Session.duplicate', request);

    const origSessionToken = request.auth.credentials as any;
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
    const newSessionToken = await this.db.createSessionToken(
      sessionTokenOptions
    );

    const response: SessionResponse = {
      uid: newSessionToken.uid,
      sessionToken: newSessionToken.data,
      authAt: newSessionToken.lastAuthAt(),
      verified: true,
    };

    if (!newSessionToken.emailVerified) {
      response.verified = false;
      response.verificationMethod = 'email';
      response.verificationReason = 'signup';
    } else if (!newSessionToken.tokenVerified) {
      response.verified = false;
      response.verificationMethod = 'email';
      response.verificationReason = 'login';
    }

    return response;
  }

  async sessionVerifyCode(request: AuthRequest) {
    this.log.begin('Session.verify_code', request);
    const sessionToken = request.auth.credentials;
    const { code } = request.payload;
    const { uid, email } = sessionToken;
    const devices = await request.app.devices;

    await this.customs.check(request, email, 'verifySessionCode');

    request.emitMetricsEvent('session.verify_code');

    // Check to see if the otp code passed matches the expected value from
    // using the account's' `emailCode` as the secret in the otp code generation.
    const account = await this.db.account(uid);
    const secret = account.primaryEmail.emailCode;

    const isValidCode = this.otpUtils.verifyOtpCode(
      code,
      secret,
      this.otpOptions
    );

    if (!isValidCode) {
      throw error.invalidOrExpiredOtpCode();
    }

    // If a valid code was sent, this verifies the session using the `email-2fa` method.
    // The assurance level will be ["pwd", "email"] or level 1.
    // **Note** the order of operations, to avoid any race conditions with push
    // notifications, we perform all DB operations first.
    await this.db.verifyTokensWithMethod(sessionToken.id, 'email-2fa');

    // We have a matching code! Let's verify the account, session and send the
    // corresponding email and emit metrics.
    if (!account.primaryEmail.isVerified) {
      await this.signupUtils.verifyAccount(request, account, request.payload);
    } else {
      request.emitMetricsEvent('account.confirmed', { uid });
      await this.signinUtils.cleanupReminders({ verified: true }, account);
      await this.push.notifyAccountUpdated(uid, devices, 'accountConfirm');
    }

    return {};
  }

  async sessionResendCode(request: AuthRequest) {
    this.log.begin('Session.resend_code', request);
    const sessionToken = request.auth.credentials;
    const ip = request.app.clientAddress;

    request.emitMetricsEvent('session.resend_code');

    // Generate the current otp code for the account based on the account's
    // `emailCode` as the secret.
    const account = await this.db.account(sessionToken.uid);
    const secret = account.primaryEmail.emailCode;

    const code = this.otpUtils.generateOtpCode(secret, this.otpOptions);

    const options = {
      acceptLanguage: account.locale,
      code,
      ip,
      location: request.app.geo.location,
      uaBrowser: sessionToken.uaBrowser,
      uaBrowserVersion: sessionToken.uaBrowserVersion,
      uaOS: sessionToken.uaOS,
      uaOSVersion: sessionToken.uaOSVersion,
      uaDeviceType: sessionToken.uaDeviceType,
      uid: sessionToken.uid,
    };

    if (account.primaryEmail.isVerified) {
      // Unverified emails mean that the user is attempting to resend the code from signup page,
      // therefore they get sent a different email template with the code.
      await this.mailer.sendVerifyLoginCodeEmail(
        account.emails,
        account,
        options
      );
    } else {
      await this.mailer.sendVerifyShortCodeEmail([], account, options);
    }

    return {};
  }

  async sessionVerifySendPush(request: AuthRequest) {
    this.log.begin('Session.verify.send_push', request);

    const sessionToken = request.auth.credentials;
    const { uid, tokenVerificationId } = sessionToken;

    const devices = await this.db.devices(uid);
    const geoData = request.app.geo;

    const { ua } = request.app;
    const uaInfo = {
      uaBrowser: ua.browser,
      uaBrowserVersion: ua.browserVersion,
      uaOS: ua.os,
      uaOSVersion: ua.osVersion,
      uaDeviceType: ua.deviceType,
      uaFormFactor: ua.formFactor,
    };

    const url = `${
      (this.config.smtp as any).verificationUrl
    }?type=push_login_verification&code=${tokenVerificationId}&ua=${encodeURIComponent(
      JSON.stringify(uaInfo)
    )}&location=${encodeURIComponent(
      JSON.stringify(geoData.location)
    )}&ip=${encodeURIComponent(request.app.clientAddress)}`;

    const options = {
      title: gettext('Logging in to Firefox Accounts?'),
      body: gettext("Click here to verify it's you"),
      url,
    };

    try {
      await this.push.notifyVerifyLoginRequest(uid, devices, options);
    } catch (err) {
      this.log.error('Session.verify.send_push', {
        uid,
        error: err,
      });
    }

    return {};
  }
}

export const sessionRoutes = (
  log: AuthLogger,
  db: any,
  Password: any,
  config: ConfigType,
  signinUtils: any,
  signupUtils: any,
  mailer: any,
  push: any,
  customs: any
) => {
  const sessionHandler = new SessionHandler(
    log,
    db,
    Password,
    config,
    signinUtils,
    signupUtils,
    mailer,
    push,
    customs
  );

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
      handler: (request: AuthRequest) => sessionHandler.sessionDestroy(request),
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
            reason: isA.string().max(16).optional(),
            unblockCode: signinUtils.validators.UNBLOCK_CODE,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            originalLoginEmail: validators.email().optional(),
            verificationMethod: validators.verificationMethod.optional(),
          },
        },
        response: {
          schema: {
            uid: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            verificationMethod: isA.string().optional(),
            verificationReason: isA.string().optional(),
            verified: isA.boolean().required(),
            authAt: isA.number().integer(),
          },
        },
      },
      handler: (request: AuthRequest) => sessionHandler.sessionReauth(request),
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
            uid: isA.string().regex(HEX_STRING).required(),
          },
        },
      },
      handler: (request: AuthRequest) => sessionHandler.sessionStatus(request),
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
            reason: isA.string().max(16).optional(),
          },
        },
      },
      handler: (request: AuthRequest) =>
        sessionHandler.sessionDuplicate(request),
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
            scopes: validators.scopes,
            // The `marketingOptIn` is safe to remove after train-167+
            marketingOptIn: isA.boolean().optional(),
            newsletters: validators.newsletters,
          },
        },
      },
      handler: (request: AuthRequest) =>
        sessionHandler.sessionVerifyCode(request),
    },
    {
      method: 'POST',
      path: '/session/resend_code',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: (request: AuthRequest) =>
        sessionHandler.sessionResendCode(request),
    },
    {
      method: 'POST',
      path: '/session/verify/send_push',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
      },
      handler: (request: AuthRequest) =>
        sessionHandler.sessionVerifySendPush(request),
    },
  ];

  return routes;
};

module.exports = sessionRoutes;
