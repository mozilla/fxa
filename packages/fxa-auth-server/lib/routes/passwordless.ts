/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';
import * as isA from 'joi';
import { StatsD } from 'hot-shots';
import * as uuid from 'uuid';
import Container from 'typedi';

import { OtpManager, OtpStorage } from '@fxa/shared/otp';
import { AppError as error } from '@fxa/accounts/errors';
import {
  constructLocalTimeAndDateStrings,
  splitEmails,
} from '@fxa/accounts/email-renderer';

import { ConfigType } from '../../config';
import PASSWORDLESS_DOCS from '../../docs/swagger/passwordless-api';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import * as random from '../crypto/random';
import { schema as METRICS_CONTEXT_SCHEMA } from '../metrics/context';
import { gleanMetrics } from '../metrics/glean';
import { AuthLogger, AuthRequest } from '../types';
import { recordSecurityEvent } from './utils/security-event';
import * as validators from './validators';
import { FxaMailer } from '../senders/fxa-mailer';
import { formatUserAgentInfo } from 'fxa-shared/lib/user-agent';
import { formatGeoData } from 'fxa-shared/lib/geo-data';

/**
 * Redis adapter for OTP storage
 */
class OtpRedisAdapter implements OtpStorage {
  constructor(
    private redis: Redis,
    private ttl: number
  ) {}

  async set(key: string, value: string) {
    await this.redis.set(key, value, 'EX', this.ttl);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}

/**
 * Handler class for passwordless authentication endpoints
 */
class PasswordlessHandler {
  private otpManager: OtpManager;
  private fxaMailer: FxaMailer;
  private otpUtils: any;

  constructor(
    private log: AuthLogger,
    private db: any,
    private config: ConfigType,
    private customs: any,
    private glean: ReturnType<typeof gleanMetrics>,
    private statsd: StatsD,
    authServerCacheRedis: Redis
  ) {
    const otpRedisAdapter = new OtpRedisAdapter(
      authServerCacheRedis,
      config.passwordlessOtp.ttl
    );
    this.otpManager = new OtpManager(
      { kind: 'passwordless', digits: config.passwordlessOtp.digits },
      otpRedisAdapter
    );
    this.fxaMailer = Container.get(FxaMailer);
    // For checking if account has TOTP enabled
    this.otpUtils = require('./utils/otp').default(db, statsd);
  }

  /**
   * Check if an account is eligible for passwordless authentication
   * An account is eligible if:
   * - It doesn't exist (new registration)
   * - It exists but has no password set (verifierSetAt === 0)
   */
  private isPasswordlessEligible(account: any | null): boolean {
    if (!account) {
      return true; // New account
    }
    // Existing account must not have a password set
    return account.verifierSetAt === 0;
  }

  /**
   * Send OTP code for passwordless authentication
   */
  async sendCode(request: AuthRequest) {
    this.log.begin('Passwordless.sendCode', request);

    const { email } = request.payload as { email: string };

    // Rate limiting
    await this.customs.check(request, email, 'passwordlessSendOtp');

    // Check if account exists and is eligible
    let account: any = null;
    let isNewAccount = true;

    try {
      account = await this.db.accountRecord(email);
      isNewAccount = false;
    } catch (err: any) {
      if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
        throw err;
      }
      // Account doesn't exist - this is a new registration
    }

    // Check eligibility
    if (!this.isPasswordlessEligible(account)) {
      throw error.cannotCreatePassword(); // Account has a password, use standard flow
    }

    // Generate OTP code
    // For new accounts, use email as the key; for existing accounts, use uid
    const otpKey = account ? account.uid : email;
    const code = await this.otpManager.create(otpKey);

    // Send OTP email
    const geoData = request.app.geo;
    const {
      browser: uaBrowser,
      os: uaOS,
      osVersion: uaOSVersion,
    } = request.app.ua;
    const { deviceId, flowId, flowBeginTime } =
      await request.app.metricsContext;

    const { time, date, acceptLanguage, timeZone } =
      constructLocalTimeAndDateStrings(
        request.app.acceptLanguage,
        geoData.timeZone
      );

    // For MVP, we'll use the password forgot OTP email
    // TODO: Create a dedicated passwordless OTP email template
    const emailAddresses = account
      ? splitEmails(account.emails)
      : { to: email, cc: [] as string[] };

    await this.fxaMailer.sendPasswordForgotOtpEmail({
      code,
      to: emailAddresses.to,
      cc: emailAddresses.cc,
      deviceId,
      flowId,
      flowBeginTime,
      time,
      date,
      acceptLanguage,
      timeZone,
      sync: false,
      device: formatUserAgentInfo(uaBrowser, uaOS, uaOSVersion),
      location: formatGeoData(geoData.location),
    });

    this.statsd.increment('passwordless.sendCode.success');

    // Record security event
    await recordSecurityEvent('account.passwordless_login_otp_sent', {
      db: this.db,
      request,
      account: account ? { uid: account.uid } : undefined,
    });

    return {};
  }

  /**
   * Confirm OTP code and create session
   */
  async confirmCode(request: AuthRequest) {
    this.log.begin('Passwordless.confirmCode', request);

    const { email, code } = request.payload as { email: string; code: string };

    // Rate limiting
    await this.customs.check(request, email, 'passwordlessVerifyOtp');

    // Daily limit
    if (this.customs.v2Enabled()) {
      await this.customs.check(request, email, 'passwordlessVerifyOtpPerDay');
    }

    // Check if account exists
    let account: any = null;
    let isNewAccount = true;

    try {
      account = await this.db.accountRecord(email);
      isNewAccount = false;
    } catch (err: any) {
      if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
        throw err;
      }
    }

    // Check eligibility
    if (account && !this.isPasswordlessEligible(account)) {
      throw error.cannotCreatePassword();
    }

    // Check if account has 2FA (TOTP) enabled
    // Accounts with 2FA must use the password + TOTP flow for security
    if (account) {
      const hasTotpToken = await this.otpUtils.hasTotpToken(account);
      if (hasTotpToken) {
        this.log.info('passwordless.confirmCode.totpRequired', {
          uid: account.uid,
        });
        throw error.totpRequired();
      }
    }

    // Verify OTP
    const otpKey = account ? account.uid : email;
    const isValidCode = await this.otpManager.isValid(otpKey, code);

    if (!isValidCode) {
      this.statsd.increment('passwordless.confirmCode.invalid');
      await recordSecurityEvent('account.passwordless_login_otp_failed', {
        db: this.db,
        request,
        account: account ? { uid: account.uid } : undefined,
      });
      throw error.invalidVerificationCode();
    }

    // Delete OTP (single use)
    await this.otpManager.delete(otpKey);

    // Create account if new
    if (isNewAccount) {
      account = await this.createPasswordlessAccount(email, request);
      this.statsd.increment('passwordless.registration.success');

      await recordSecurityEvent('account.passwordless_registration_complete', {
        db: this.db,
        request,
        account: { uid: account.uid },
      });
    }

    // Create session token
    const sessionToken = await this.createSessionToken(account, request);

    this.statsd.increment('passwordless.confirmCode.success');

    await recordSecurityEvent('account.passwordless_login_otp_verified', {
      db: this.db,
      request,
      account: { uid: account.uid },
    });

    return {
      uid: account.uid,
      sessionToken: sessionToken.data,
      verified: sessionToken.emailVerified && sessionToken.tokenVerified,
      authAt: sessionToken.lastAuthAt(),
      isNewAccount,
    };
  }

  /**
   * Resend OTP code
   */
  async resendCode(request: AuthRequest) {
    this.log.begin('Passwordless.resendCode', request);

    const { email } = request.payload as { email: string };

    // Delete existing code first
    let account: any = null;
    try {
      account = await this.db.accountRecord(email);
    } catch (err: any) {
      if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
        throw err;
      }
    }

    const otpKey = account ? account.uid : email;
    await this.otpManager.delete(otpKey);

    // Send new code (uses same logic as sendCode)
    return this.sendCode(request);
  }

  /**
   * Create a new passwordless account
   */
  private async createPasswordlessAccount(
    email: string,
    request: AuthRequest
  ): Promise<any> {
    const emailCode = await random.hex(16);
    const authSalt = await random.hex(32);
    const [kA, wrapWrapKb, wrapWrapKbVersion2] = await random.hex(32, 32, 32);

    const account = await this.db.createAccount({
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      createdAt: Date.now(),
      email,
      emailCode,
      emailVerified: true, // Verified via OTP
      kA,
      wrapWrapKb,
      wrapWrapKbVersion2,
      authSalt,
      clientSalt: undefined,
      verifierVersion: this.config.verifierVersion,
      verifyHash: Buffer.alloc(32).toString('hex'),
      verifyHashVersion2: Buffer.alloc(32).toString('hex'),
      verifierSetAt: 0, // No password set
      locale: request.app.acceptLanguage,
    });

    return account;
  }

  /**
   * Create a session token for the account
   */
  private async createSessionToken(
    account: any,
    request: AuthRequest
  ): Promise<any> {
    const sessionTokenOptions = {
      uid: account.uid,
      email: account.email,
      emailCode: account.emailCode,
      emailVerified: true,
      verifierSetAt: account.verifierSetAt,
      mustVerify: false,
      tokenVerificationId: null, // Already verified via OTP
      uaBrowser: request.app.ua.browser,
      uaBrowserVersion: request.app.ua.browserVersion,
      uaOS: request.app.ua.os,
      uaOSVersion: request.app.ua.osVersion,
      uaDeviceType: request.app.ua.deviceType,
      uaFormFactor: request.app.ua.formFactor,
    };

    return this.db.createSessionToken(sessionTokenOptions);
  }
}

/**
 * Export routes factory function
 */
export function passwordlessRoutes(
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  glean: ReturnType<typeof gleanMetrics>,
  statsd: StatsD,
  authServerCacheRedis: Redis
) {
  // Feature flag check
  // Routes are available if either:
  // 1. The feature is globally enabled, OR
  // 2. A forcedEmailAddresses regex is configured (for testing)
  const hasForceEmailConfig =
    config.passwordlessOtp.forcedEmailAddresses &&
    config.passwordlessOtp.forcedEmailAddresses.source !== '(?:)';
  if (!config.passwordlessOtp.enabled && !hasForceEmailConfig) {
    return [];
  }

  const handler = new PasswordlessHandler(
    log,
    db,
    config,
    customs,
    glean,
    statsd,
    authServerCacheRedis
  );

  return [
    {
      method: 'POST',
      path: '/account/passwordless/send_code',
      options: {
        ...PASSWORDLESS_DOCS.PASSWORDLESS_SEND_CODE_POST,
        auth: false,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            service: validators.service.optional().description(DESCRIPTION.serviceRP),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({}),
        },
      },
      handler: (request: AuthRequest) => handler.sendCode(request),
    },
    {
      method: 'POST',
      path: '/account/passwordless/confirm_code',
      options: {
        ...PASSWORDLESS_DOCS.PASSWORDLESS_CONFIRM_CODE_POST,
        auth: false,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            code: isA
              .string()
              .length(config.passwordlessOtp.digits)
              .regex(validators.DIGITS)
              .required()
              .description('The OTP code sent to the user email'),
            service: validators.service.optional().description(DESCRIPTION.serviceRP),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({
            uid: isA.string().required(),
            sessionToken: isA.string().required(),
            verified: isA.boolean().required(),
            authAt: isA.number().required(),
            isNewAccount: isA.boolean().required(),
          }),
        },
      },
      handler: (request: AuthRequest) => handler.confirmCode(request),
    },
    {
      method: 'POST',
      path: '/account/passwordless/resend_code',
      options: {
        ...PASSWORDLESS_DOCS.PASSWORDLESS_RESEND_CODE_POST,
        auth: false,
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            service: validators.service.optional().description(DESCRIPTION.serviceRP),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          }),
        },
        response: {
          schema: isA.object({}),
        },
      },
      handler: (request: AuthRequest) => handler.resendCode(request),
    },
  ];
}
