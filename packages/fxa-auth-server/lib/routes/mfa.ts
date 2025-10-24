/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as isA from 'joi';
import { Container } from 'typedi';
import { StatsD } from 'hot-shots';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import { SecurityEvent } from 'fxa-shared/db/models/auth/security-event';
import { Account, Email } from 'fxa-shared/db/models/auth';
import { AuthRequest, SessionTokenAuthCredential } from '../types';
import { recordSecurityEvent } from './utils/security-event';
import { ConfigType } from '../../config';
import { OtpUtils } from './utils/otp';
import * as AppError from '../error';

/** Customs interface for mfa specific operations. */
interface Customs {
  check: (req: AuthRequest, email: string, action: string) => Promise<void>;
  checkAuthenticated: (
    req: AuthRequest,
    uid: string,
    email: string,
    action: string
  ) => Promise<void>;
}

/** Mailer interface for mfa specific operations  */
interface Mailer {
  sendVerifyAccountChangeEmail(
    emails: Email[] | undefined,
    account: Account,
    emailOptions: {
      uid: string;
      code: string;
      expirationTime: number;
    }
  ): Promise<void>;
}

/** DB interface for MFA specific db operations */
interface DB {
  account(uid): Promise<Account>;
  securityEvent: (arg: SecurityEvent) => Promise<void>;
}

const toPascal = (str) =>
  str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());

class MfaHandler {
  constructor(
    private readonly config: ConfigType,
    private readonly db: DB,
    private readonly otpUtils: OtpUtils,
    private readonly customs: Customs,
    private readonly mailer: Mailer,
    private readonly statsd: StatsD
  ) {}

  async requestOtpCode(request: AuthRequest) {
    const { uid, id: sessionTokenId } = request.auth
      .credentials as SessionTokenAuthCredential;

    const { action } = request.payload as { action: string };

    const account = await this.db.account(uid);
    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      `mfaOtpCodeRequestFor${toPascal(action)}` // turns mfaOtpCodeRequest_recovery_key into mfaOtpCodeRequestRecoveryKey
    );

    let success = false;
    try {
      const secret = `${account.uid}-${account.emailCode}-${sessionTokenId}-${action}`;
      const options = this.config.mfa.otp;
      const code = await this.otpUtils.generateOtpCode(secret, options);

      // Convert seconds to minutes. The step is a time interval in seconds, and
      // the window is the the number of intervals the code is valid for.
      // For example if the step is 1 second, and the interval is 30, the code
      // is valid for 30s.
      // For specifics see: https://www.npmjs.com/package/otplib
      const expirationTime = (options.step * options.window) / 60;

      await this.mailer.sendVerifyAccountChangeEmail(account.emails, account, {
        code,
        uid,
        expirationTime,
      });

      success = true;
    } catch (error) {
      throw AppError.backendServiceFailure(
        'mfa',
        'otpCodeRequest',
        { uid, action },
        error
      );
    }

    if (success) {
      this.statsd.increment('account.mfa.otp.sendCode.success');

      // TODO Create equivalent glean event
      // await this.glean.mfaOtpCode.sent(request);

      await recordSecurityEvent('account.mfa_send_otp_code', {
        db: this.db,
        request,
      });

      return { status: 'success' };
    }

    // TODO: Create glean event
    // await this.glean.mfaOtpCode.sendError(request);

    return { status: 'failure' };
  }

  async verifyOtpCode(request: AuthRequest): Promise<{ accessToken: string }> {
    const { uid, id: sessionTokenId } = request.auth
      .credentials as SessionTokenAuthCredential;

    const { action, code } = request.payload as {
      action: string;
      code: string;
    };

    const account = await this.db.account(uid);

    await this.customs.checkAuthenticated(
      request,
      uid,
      account.email,
      `mfaOtpCodeVerifyFor${toPascal(action)}` // turns mfaOtpCodeRequest_recovery_key into mfaOtpCodeRequestRecoveryKey
    );

    let success = false;
    try {
      // This is a sign in attempt. This will check the code, and if valid, mark the
      // session token verified. This session will have a security level that allows
      // the user to remove totp devices.

      // TODO: Confirm otp code sent.
      // success = await this.confirmCode(uid, code);
      const secret = `${account.uid}-${account.emailCode}-${sessionTokenId}-${action}`;
      const type = `mfa___${action}`;
      const options = this.config.mfa.otp;
      const { valid, delta } = this.otpUtils.verifyOtpCode(
        code,
        secret,
        options,
        type
      );

      if (valid && delta != null) {
        success = true;
      }
    } catch (error) {
      // TODO: Handle specific OTP verification errors

      throw AppError.backendServiceFailure(
        'OtpService',
        'verifyCode',
        { uid },
        error
      );
    }

    if (success) {
      // TODO: Create glean metric
      // await this.glean.otp.verifyOtpSuccess(request);

      const account = await this.db.account(uid);

      this.statsd.increment('account.otp.verifyOtp.success');

      // TODO: At some point we might want to create a mapping between actions and scopes.
      // this would allow us to let multiple actions to all be sanctioned by a single jwt.
      const scope = action;

      // Issue jwt
      // TODO: Use `/mfa/otp/request` and `/mfa/otp/verify` to issue the jwt
      const now = Math.floor(Date.now() / 1000);
      const claims = {
        sub: account.uid,
        scope: [`mfa:${scope}`],
        iat: now,
        jti: uuid.v4(),
        stid: sessionTokenId,
      };

      const key = this.config.mfa.jwt.secretKey;
      const opts = {
        algorithm: 'HS256' as jwt.Algorithm,
        expiresIn: this.config.mfa.jwt.expiresInSec,
        audience: this.config.mfa.jwt.audience,
        issuer: this.config.mfa.jwt.issuer,
      } as jwt.SignOptions;

      // Create access token
      const accessToken: string = jwt.sign(claims, key, opts);

      await recordSecurityEvent('account.mfa_verify_otp_code_success', {
        db: this.db,
        request,
      });

      return { accessToken };
    }

    await recordSecurityEvent('account.mfa_verify_otp_code_failed', {
      db: this.db,
      request,
    });

    throw AppError.invalidOrExpiredOtpCode();
  }
}

export const mfaRoutes = (
  customs: Customs,
  db: any,
  // TODO: Add glean metrics
  // glean: GleanMetricsType,
  log: any,
  mailer: any,
  statsd: any,
  config: ConfigType
) => {
  const featureEnabledCheck = () => {
    if (!config.mfa.enabled) {
      throw AppError.featureNotEnabled();
    }
    return true;
  };

  const otpUtils = Container.get(OtpUtils);

  const otpHandler = new MfaHandler(
    config,
    db,
    otpUtils,
    customs,
    mailer,
    statsd
  );

  const routes = [
    {
      method: 'POST',
      path: '/mfa/otp/request',
      options: {
        pre: [{ method: featureEnabledCheck }],
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        validate: {
          payload: isA.object({
            action: isA
              .string()
              .valid(...config.mfa.actions)
              .required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('mfa.otp.request', request);
        return otpHandler.requestOtpCode(request);
      },
    },
    {
      method: 'POST',
      path: '/mfa/otp/verify',
      options: {
        auth: {
          strategy: 'verifiedSessionToken',
          payload: false,
        },
        validate: {
          payload: isA.object({
            code: isA
              .string()
              .length(config.mfa.otp.digits)
              .regex(/^[0-9]+$/),
            action: isA
              .string()
              .valid(...config.mfa.actions)
              .required(),
          }),
        },
        response: {
          schema: isA.object({
            accessToken: isA.string().required(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('mfa.otp.verify', request);
        return otpHandler.verifyOtpCode(request);
      },
    },
    {
      method: 'GET',
      path: '/mfa/test',
      options: {
        auth: {
          strategy: 'mfa',
          scope: ['mfa:test'],
          payload: false,
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('mfa.test', request);
        return { status: 'success' };
      },
    },
    {
      method: 'POST',
      path: '/mfa/test',
      options: {
        auth: {
          strategy: 'mfa',
          scope: ['mfa:test'],
          payload: false,
        },
        validate: {
          payload: isA.object({
            message: isA.string(),
          }),
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('mfa.test', request);
        const { message } = request.payload as unknown as { message: string };
        const { uid } = request.auth.credentials;
        return {
          status: 'success',
          uid,
          echo: message,
        };
      },
    },
    {
      method: 'POST',
      path: '/mfa/test2',
      options: {
        auth: {
          strategy: 'mfa',
          scope: ['mfa:test2'],
          payload: false,
        },
      },
      handler: function (request: AuthRequest) {
        log.begin('mfa.test2', request);
        return { status: 'success' };
      },
    },
  ];

  return routes;
};

export default mfaRoutes;
