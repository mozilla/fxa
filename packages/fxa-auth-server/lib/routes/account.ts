/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import isA from '@hapi/joi';
import crypto from 'crypto';
import {
  deleteAllPayPalBAs,
  getAllPayPalBAByUid,
} from 'fxa-shared/db/models/auth';
import ScopeSet from 'fxa-shared/oauth/scopes';
import {
  GooglePlaySubscription,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import { Container } from 'typedi';
import * as uuid from 'uuid';

import { ConfigType } from '../../config';
import { reportSentryError } from '../../lib/sentry';
import authMethods from '../authMethods';
import random from '../crypto/random';
import error from '../error';
import { getClientById } from '../oauth/client';
import { generateAccessToken } from '../oauth/grant';
import jwt from '../oauth/jwt';
import { CapabilityService } from '../payments/capability';
import { PlaySubscriptions } from '../payments/iap/google-play/subscriptions';
import { PayPalHelper } from '../payments/paypal/helper';
import { StripeHelper } from '../payments/stripe';
import { AuthLogger, AuthRequest } from '../types';
import emailUtils from './utils/email';
import requestHelper from './utils/request_helper';
import validators from './validators';

const ACCOUNT_DOCS = require('../../docs/swagger/account-api').default;
const MISC_DOCS = require('../../docs/swagger/misc-api').default;
const DESCRIPTION = require('../../docs/swagger/shared/descriptions').default;

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

const HEX_STRING = validators.HEX_STRING;

const MS_ONE_HOUR = 1000 * 60 * 60;
const MS_ONE_DAY = MS_ONE_HOUR * 24;
const MS_ONE_WEEK = MS_ONE_DAY * 7;
const MS_ONE_MONTH = MS_ONE_DAY * 30;

export class AccountHandler {
  private OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS: Set<string>;

  private paypalHelper?: PayPalHelper;
  private TokenCode: () => Promise<string>;
  private otpUtils: any;
  private tokenCodeLifetime: number;
  private otpOptions: ConfigType['otp'];
  private skipConfirmationForEmailAddresses: string[];
  private capabilityService: CapabilityService;

  constructor(
    private log: AuthLogger,
    private db: any,
    private mailer: any,
    private Password: any,
    private config: ConfigType,
    private customs: any,
    private signinUtils: any,
    private signupUtils: any,
    private push: any,
    private verificationReminders: any,
    private subscriptionAccountReminders: any,
    private oauth: any,
    private stripeHelper: StripeHelper
  ) {
    const tokenCodeConfig = config.signinConfirmation.tokenVerificationCode;
    this.tokenCodeLifetime =
      (tokenCodeConfig?.codeLifetime as unknown as number) ?? MS_ONE_HOUR;
    const tokenCodeLength = tokenCodeConfig?.codeLength || 8;
    this.TokenCode = random.base10(tokenCodeLength);
    this.otpUtils = require('./utils/otp')(log, config, db);
    this.skipConfirmationForEmailAddresses = config.signinConfirmation
      .skipForEmailAddresses as string[];

    this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
      (config.oauth.disableNewConnectionsForClients as string[]) || []
    );

    this.otpOptions = config.otp;

    if (
      stripeHelper &&
      config.subscriptions?.paypalNvpSigCredentials?.enabled
    ) {
      this.paypalHelper = Container.get(PayPalHelper);
    }
    this.capabilityService = Container.get(CapabilityService);
  }

  private async deleteAccountIfUnverified(request: AuthRequest, email: string) {
    try {
      const secondaryEmailRecord = await this.db.getSecondaryEmail(email);
      // Currently, users cannot create an account from a verified
      // secondary email address
      if (secondaryEmailRecord.isPrimary) {
        if (
          secondaryEmailRecord.isVerified ||
          (await this.stripeHelper.hasActiveSubscription(
            secondaryEmailRecord.uid
          ))
        ) {
          throw error.accountExists(secondaryEmailRecord.email);
        }
        request.app.accountRecreated = true;

        // If an unverified (stub) account has a Stripe customer without any
        // subscriptions, delete the customer.
        try {
          await this.stripeHelper.removeCustomer(
            secondaryEmailRecord.uid,
            secondaryEmailRecord.email
          );
        } catch (err) {
          // It's not an error where we'd want to stop the deletion of the
          // account.
          reportSentryError(err, request);
        }

        const deleted = await this.db.deleteAccount(secondaryEmailRecord);
        this.log.info('accountDeleted.unverifiedSecondaryEmail', {
          ...secondaryEmailRecord,
        });
        return deleted;
      } else {
        if (secondaryEmailRecord.isVerified) {
          throw error.verifiedSecondaryEmailAlreadyExists();
        }

        return await this.db.deleteEmail(
          secondaryEmailRecord.uid,
          secondaryEmailRecord.email
        );
      }
    } catch (err) {
      if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
        throw err;
      }
    }
  }

  private async generateRandomValues() {
    const hex16 = await random.hex(16);
    const hex32 = await random.hex(32);
    const tokenCode = await this.TokenCode();
    return { hex16, hex32, tokenCode };
  }

  private async createPassword(authPW: any, authSalt: any) {
    const password = new this.Password(
      authPW,
      authSalt,
      this.config.verifierVersion
    );
    const verifyHash = await password.verifyHash();
    return { password, verifyHash };
  }

  private async createAccount(options: {
    authPW: string;
    authSalt: string;
    email: string;
    emailCode: string;
    preVerified: boolean;
    request: AuthRequest;
    service?: string;
    userAgentString: string;
  }) {
    const {
      authPW,
      authSalt,
      email,
      emailCode,
      preVerified,
      request,
      service,
      userAgentString,
    } = options;

    const { password, verifyHash } = await this.createPassword(
      authPW,
      authSalt
    );

    const locale = request.app.acceptLanguage;
    if (!locale) {
      // We're seeing a surprising number of accounts created
      // without a proper locale. Log details to help debug this.
      this.log.info('account.create.emptyLocale', {
        email: email,
        locale: locale,
        agent: userAgentString,
      });
    }

    const hexes = await random.hex(32, 32);
    const account = await this.db.createAccount({
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      createdAt: Date.now(),
      email: email,
      emailCode: emailCode,
      emailVerified: preVerified,
      kA: hexes[0],
      wrapWrapKb: hexes[1],
      accountResetToken: null,
      passwordForgotToken: null,
      authSalt: authSalt,
      verifierVersion: password.version,
      verifyHash: verifyHash,
      verifierSetAt: Date.now(),
      locale,
    });

    await request.emitMetricsEvent('account.created', {
      uid: account.uid,
    });

    const geoData = request.app.geo;
    const country = geoData.location && geoData.location.country;
    const countryCode = geoData.location && geoData.location.countryCode;
    if (account.emailVerified) {
      await this.log.notifyAttachedServices('verified', request, {
        email: account.email,
        locale: account.locale,
        service,
        uid: account.uid,
        userAgent: userAgentString,
        country,
        countryCode,
      });
    }

    await this.log.notifyAttachedServices('login', request, {
      deviceCount: 1,
      country,
      countryCode,
      email: account.email,
      service,
      uid: account.uid,
      userAgent: userAgentString,
    });
    return { password, account };
  }

  private setMetricsFlowCompleteSignal(request: AuthRequest, service?: string) {
    let flowCompleteSignal;
    if (service === 'sync') {
      flowCompleteSignal = 'account.signed';
    } else {
      flowCompleteSignal = 'account.verified';
    }
    request.setMetricsFlowCompleteSignal(flowCompleteSignal, 'registration');
  }

  private async createSessionToken(options: {
    account: any;
    request: AuthRequest;
    tokenVerificationCode: any;
    tokenVerificationId: any;
  }) {
    const { request, account, tokenVerificationId, tokenVerificationCode } =
      options;
    const {
      browser: uaBrowser,
      browserVersion: uaBrowserVersion,
      os: uaOS,
      osVersion: uaOSVersion,
      deviceType: uaDeviceType,
      formFactor: uaFormFactor,
    } = request.app.ua;

    const sessionToken = await this.db.createSessionToken({
      uid: account.uid,
      email: account.email,
      emailCode: account.emailCode,
      emailVerified: account.emailVerified,
      verifierSetAt: account.verifierSetAt,
      mustVerify: requestHelper.wantsKeys(request),
      tokenVerificationCode: tokenVerificationCode,
      tokenVerificationCodeExpiresAt: Date.now() + this.tokenCodeLifetime,
      tokenVerificationId: tokenVerificationId,
      uaBrowser,
      uaBrowserVersion,
      uaOS,
      uaOSVersion,
      uaDeviceType,
      uaFormFactor,
    });

    await request.stashMetricsContext(sessionToken);
    await request.stashMetricsContext({
      uid: account.uid,
      id: account.emailCode,
    });
    return sessionToken;
  }

  private async sendVerifyCode(options: {
    account: any;
    request: AuthRequest;
    sessionToken: any;
    tokenVerificationId: any;
    verificationMethod: string;
  }) {
    const {
      request,
      account,
      sessionToken,
      tokenVerificationId,
      verificationMethod,
    } = options;
    const { deviceId, flowId, flowBeginTime, productId, planId } = await request
      .app.metricsContext;
    const locale = request.app.acceptLanguage;
    const form = request.payload as any;
    const query = request.query;
    const ip = request.app.clientAddress;
    const style = form.style;

    if (account.emailVerified) {
      return;
    }

    try {
      switch (verificationMethod) {
        case 'email-otp': {
          const secret = account.emailCode;
          const code = this.otpUtils.generateOtpCode(secret, this.otpOptions);
          await this.mailer.sendVerifyShortCodeEmail([], account, {
            acceptLanguage: locale,
            code,
            deviceId,
            flowId,
            flowBeginTime,
            productId,
            planId,
            ip,
            location: request.app.geo.location,
            timeZone: request.app.geo.timeZone,
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
            uaDeviceType: sessionToken.uaDeviceType,
            uid: sessionToken.uid,
          });
          break;
        }
        default: {
          await this.mailer.sendVerifyEmail([], account, {
            code: account.emailCode,
            service: form.service || query.service,
            redirectTo: form.redirectTo,
            resume: form.resume,
            acceptLanguage: locale,
            deviceId,
            flowId,
            flowBeginTime,
            productId,
            planId,
            ip,
            location: request.app.geo.location,
            timeZone: request.app.geo.timeZone,
            style,
            uaBrowser: sessionToken.uaBrowser,
            uaBrowserVersion: sessionToken.uaBrowserVersion,
            uaOS: sessionToken.uaOS,
            uaOSVersion: sessionToken.uaOSVersion,
            uaDeviceType: sessionToken.uaDeviceType,
            uid: sessionToken.uid,
          });
        }
      }

      if (tokenVerificationId) {
        // Log server-side metrics for confirming verification rates
        this.log.info('account.create.confirm.start', {
          uid: account.uid,
          tokenVerificationId,
        });
      }

      await this.verificationReminders.create(
        account.uid,
        flowId,
        flowBeginTime
      );
    } catch (err) {
      this.log.error('mailer.sendVerifyCode.1', { err });

      if (tokenVerificationId) {
        // Log possible email bounce, used for confirming verification rates
        this.log.error('account.create.confirm.error', {
          uid: account.uid,
          err,
          tokenVerificationId,
        });
      }

      // show an error to the user, the account is already created.
      // the user can come back later and try again.
      throw emailUtils.sendError(err, true);
    }
  }

  private async createKeyFetchToken(options: {
    account: any;
    password: any;
    request: AuthRequest;
    tokenVerificationId: any;
  }) {
    const { request, account, password, tokenVerificationId } = options;
    if (requestHelper.wantsKeys(request)) {
      const wrapKb = await password.unwrap(account.wrapWrapKb);
      const keyFetchToken = await this.db.createKeyFetchToken({
        uid: account.uid,
        kA: account.kA,
        wrapKb,
        emailVerified: account.emailVerified,
        tokenVerificationId,
      });
      await request.stashMetricsContext(keyFetchToken);
      return keyFetchToken;
    }
    return undefined;
  }

  private accountCreateResponse(options: {
    account: any;
    keyFetchToken: any;
    sessionToken: any;
    verificationMethod: any;
  }) {
    const { account, sessionToken, keyFetchToken, verificationMethod } =
      options;
    const response: Record<string, any> = {
      uid: account.uid,
      sessionToken: sessionToken.data,
      authAt: sessionToken.lastAuthAt(),
    };

    if (keyFetchToken) {
      response.keyFetchToken = keyFetchToken.data;
    }

    if (verificationMethod) {
      response.verificationMethod = verificationMethod;
    }

    return response;
  }

  async accountCreate(request: AuthRequest) {
    this.log.begin('Account.create', request);
    const form = request.payload as any;
    const query = request.query;
    const email = form.email;
    const authPW = form.authPW;
    const userAgentString = request.headers['user-agent'];
    const service = form.service || query.service;
    const preVerified = !!form.preVerified;
    const verificationMethod = form.verificationMethod;

    request.validateMetricsContext();
    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
      throw error.disabledClientId(service);
    }

    await this.customs.check(request, email, 'accountCreate');
    await this.deleteAccountIfUnverified(request, email);

    const {
      hex16: emailCode,
      tokenCode: tokenVerificationCode,
      hex32: authSalt,
    } = await this.generateRandomValues();

    // Verified sessions should only be created for preverified accounts.
    const tokenVerificationId = preVerified ? undefined : emailCode;

    this.setMetricsFlowCompleteSignal(request, service);

    let { account, password } = await this.createAccount({
      authPW,
      authSalt,
      email,
      emailCode,
      preVerified,
      request,
      service,
      userAgentString,
    });

    const sessionToken = await this.createSessionToken({
      account,
      request,
      tokenVerificationCode,
      tokenVerificationId,
    });

    await this.sendVerifyCode({
      account,
      request,
      sessionToken,
      tokenVerificationId,
      verificationMethod,
    });

    const keyFetchToken = await this.createKeyFetchToken({
      account,
      password,
      request,
      tokenVerificationId,
    });

    await this.db.securityEvent({
      ipAddr: request.app.clientAddress,
      name: 'account.create',
      tokenId: sessionToken.id,
      uid: account.uid,
    });

    return this.accountCreateResponse({
      account,
      keyFetchToken,
      sessionToken,
      verificationMethod,
    });
  }

  async accountStub(request: AuthRequest) {
    this.log.begin('Account.stub', request);
    const { email, clientId } = request.payload as any;
    await this.customs.check(request, email, 'accountCreate');

    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw error.disabledClientId(clientId);
    }

    const client = await getClientById(clientId);

    await this.deleteAccountIfUnverified(request, email);

    const { hex16: emailCode, hex32: authSalt } =
      await this.generateRandomValues();
    const [kA, wrapWrapKb] = await random.hex(32, 32);

    const account = await this.db.createAccount({
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      createdAt: Date.now(),
      email,
      emailCode,
      emailVerified: false,
      kA,
      wrapWrapKb,
      authSalt,
      verifierVersion: this.config.verifierVersion,
      verifyHash: Buffer.alloc(32).toString('hex'),
      verifierSetAt: 0,
      locale: request.app.acceptLanguage,
    });

    const access = await generateAccessToken({
      clientId: client.id,
      name: client.name,
      canGrant: client.canGrant,
      publicClient: client.publicClient,
      userId: account.uid,
      scope: ScopeSet.fromString(`profile ${client.allowedScopes}`),
      ttl: 1800,
    });

    this.setMetricsFlowCompleteSignal(request, clientId);
    await request.stashMetricsContext({
      uid: account.uid,
      id: account.uid,
    });

    return {
      uid: account.uid,
      access_token: access.token.toString('hex'),
    };
  }

  async finishSetup(request: AuthRequest) {
    this.log.begin('Account.finishSetup', request);
    const form = request.payload as any;
    const authPW = form.authPW;
    try {
      const payload = (await jwt.verify(form.token, {
        typ: 'fin+JWT',
        ignoreExpiration: true,
      })) as any;
      const uid = payload.uid;
      form.uid = payload.uid;
      const account = await this.db.account(uid);
      // Only proceed if the account is in the stub state.
      // This prevents a token from being used multiple times.
      if (account.verifierSetAt !== 0) {
        throw error.unauthorized('token already used');
      }
      const { authSalt, wrapWrapKb } = account;
      const password = new this.Password(
        authPW,
        authSalt,
        this.config.verifierVersion
      );
      const metricsContext = await request.gatherMetricsContext({});
      await this.signupUtils.verifyAccount(request, account, {});
      const verifyHash = await password.verifyHash();
      await this.db.resetAccount(
        { uid },
        {
          authSalt,
          verifyHash,
          wrapWrapKb,
          verifierVersion: password.version,
          keysHaveChanged: true,
        }
      );
      await this.db.resetAccountTokens(uid);
      const sessionToken = await this.createSessionToken({
        account,
        request,
        // this route counts as verification
        tokenVerificationCode: undefined,
        tokenVerificationId: undefined,
      });

      await this.subscriptionAccountReminders.delete(uid);
      return {
        uid,
        sessionToken: sessionToken.data,
        verified: sessionToken.emailVerified,
      };
    } catch (err) {
      this.log.error('Account.finish_setup.error', {
        err,
      });
      throw err;
    }
  }

  async login(request: AuthRequest) {
    this.log.begin('Account.login', request);

    const form = request.payload as any;
    const email = form.email;
    const authPW = form.authPW;
    const originalLoginEmail = form.originalLoginEmail;
    let verificationMethod = form.verificationMethod;
    const service = form.service || request.query.service;
    const requestNow = Date.now();

    let accountRecord: any,
      password: any,
      passwordChangeRequired: any,
      sessionToken: any,
      keyFetchToken: any,
      didSigninUnblock: any;
    let securityEventRecency = Infinity,
      securityEventVerified = false;

    request.validateMetricsContext();
    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
      throw error.disabledClientId(service);
    }

    const checkCustomsAndLoadAccount = async () => {
      const res = await this.signinUtils.checkCustomsAndLoadAccount(
        request,
        email
      );
      accountRecord = res.accountRecord;
      if (accountRecord.disabledAt) {
        throw error.cannotLoginWithEmail();
      }
      // Remember whether they did a signin-unblock,
      // because we can use it to bypass token verification.
      didSigninUnblock = res.didSigninUnblock;
    };

    const checkEmailAndPassword = async () => {
      await this.signinUtils.checkEmailAddress(
        accountRecord,
        email,
        originalLoginEmail
      );
      password = new this.Password(
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
    };

    const checkSecurityHistory = async () => {
      try {
        const events = await this.db.securityEvents({
          uid: accountRecord.uid,
          ipAddr: request.app.clientAddress,
        });

        if (events.length > 0) {
          let latest = 0;
          events.forEach((ev: any) => {
            if (ev.verified) {
              securityEventVerified = true;
              if (ev.createdAt > latest) {
                latest = ev.createdAt;
              }
            }
          });
          if (securityEventVerified) {
            securityEventRecency = requestNow - latest;
            let coarseRecency;
            if (securityEventRecency < MS_ONE_DAY) {
              coarseRecency = 'day';
            } else if (securityEventRecency < MS_ONE_WEEK) {
              coarseRecency = 'week';
            } else if (securityEventRecency < MS_ONE_MONTH) {
              coarseRecency = 'month';
            } else {
              coarseRecency = 'old';
            }

            this.log.info('Account.history.verified', {
              uid: accountRecord.uid,
              events: events.length,
              recency: coarseRecency,
            });
          } else {
            this.log.info('Account.history.unverified', {
              uid: accountRecord.uid,
              events: events.length,
            });
          }
        }
      } catch (err) {
        // Security event history allows some convenience during login,
        // but errors here shouldn't fail the entire request.
        // so errors shouldn't stop the login attempt
        this.log.error('Account.history.error', {
          err: err,
          uid: accountRecord.uid,
        });
      }
    };

    const checkTotpToken = async () => {
      // Check to see if the user has a TOTP token and it is verified and
      // enabled, if so then the verification method is automatically forced so that
      // they have to verify the token.
      const hasTotpToken = await this.otpUtils.hasTotpToken(accountRecord);
      if (hasTotpToken) {
        // User has enabled TOTP, no way around it, they must verify TOTP token
        verificationMethod = 'totp-2fa';
      } else if (!hasTotpToken && verificationMethod === 'totp-2fa') {
        // Error if requesting TOTP verification with TOTP not setup
        throw error.totpRequired();
      }
    };

    const createSessionToken = async () => {
      // All sessions are considered unverified by default.
      let needsVerificationId = true;

      // However! To help simplify the login flow, we can use some heuristics to
      // decide whether to consider the session pre-verified.  Some accounts
      // get excluded from this process, e.g. testing accounts where we want
      // to know for sure what flow they're going to see.
      const verificationForced = forceTokenVerification(request, accountRecord);
      if (!verificationForced) {
        if (skipTokenVerification(request, accountRecord)) {
          needsVerificationId = false;
        }
      }

      // If they just went through the sigin-unblock flow, they have already verified their email.
      // We don't need to force them to do that again, just make a verified session.
      if (didSigninUnblock) {
        needsVerificationId = false;
      }

      // If the request wants keys , user *must* confirm their login session before they can actually
      // use it. Otherwise, they don't *have* to verify their session. All sessions are created
      // unverified because it prevents them from being used for sync.
      let mustVerifySession =
        needsVerificationId &&
        (verificationForced === 'suspect' ||
          verificationForced === 'global' ||
          requestHelper.wantsKeys(request));

      // For accounts with TOTP, we always force verifying a session.
      if (verificationMethod === 'totp-2fa') {
        mustVerifySession = true;
        needsVerificationId = true;
      }

      if (forcePasswordChange(accountRecord)) {
        passwordChangeRequired = true;
        needsVerificationId = true;
        mustVerifySession = true;

        // Users that are forced to change their passwords, **MUST**
        // also confirm they have access to the inbox and do
        // a confirmation loop.
        verificationMethod = verificationMethod || 'email-otp';
      }

      const [tokenVerificationId, tokenVerificationCode] = needsVerificationId
        ? [await random.hex(16), await this.TokenCode()]
        : [];
      const {
        browser: uaBrowser,
        browserVersion: uaBrowserVersion,
        os: uaOS,
        osVersion: uaOSVersion,
        deviceType: uaDeviceType,
        formFactor: uaFormFactor,
      } = request.app.ua;

      const sessionTokenOptions = {
        uid: accountRecord.uid,
        email: accountRecord.primaryEmail.email,
        emailCode: accountRecord.primaryEmail.emailCode,
        emailVerified: accountRecord.primaryEmail.isVerified,
        verifierSetAt: accountRecord.verifierSetAt,
        mustVerify: mustVerifySession,
        tokenVerificationId: tokenVerificationId,
        tokenVerificationCode: tokenVerificationCode,
        tokenVerificationCodeExpiresAt: Date.now() + this.tokenCodeLifetime,
        uaBrowser,
        uaBrowserVersion,
        uaOS,
        uaOSVersion,
        uaDeviceType,
        uaFormFactor,
      };

      sessionToken = await this.db.createSessionToken(sessionTokenOptions);
    };

    const forcePasswordChange = (account: any) => {
      // If it's an email address used for testing etc,
      // we should force password change.
      if (
        this.config.forcePasswordChange?.forcedEmailAddresses?.test(
          account.primaryEmail.email
        )
      ) {
        return true;
      }

      // otw only force if account lockAt flag set
      return accountRecord.lockedAt > 0;
    };

    const forceTokenVerification = (request: AuthRequest, account: any) => {
      // If there was anything suspicious about the request,
      // we should force token verification.
      if (request.app.isSuspiciousRequest) {
        return 'suspect';
      }
      if (this.config.signinConfirmation?.forceGlobally) {
        return 'global';
      }
      // If it's an email address used for testing etc,
      // we should force token verification.
      if (
        this.config.signinConfirmation?.forcedEmailAddresses?.test(
          account.primaryEmail.email
        )
      ) {
        return 'email';
      }

      return false;
    };

    const skipTokenVerification = (request: AuthRequest, account: any) => {
      // If they're logging in from an IP address on which they recently did
      // another, successfully-verified login, then we can consider this one
      // verified as well without going through the loop again.
      const allowedRecency =
        this.config.securityHistory.ipProfiling.allowedRecency || 0;
      if (securityEventVerified && securityEventRecency < allowedRecency) {
        this.log.info('Account.ipprofiling.seenAddress', {
          uid: account.uid,
        });
        return true;
      }

      // If the account was recently created, don't make the user
      // confirm sign-in for a configurable amount of time. This will reduce
      // the friction of a user adding a second device.
      const skipForNewAccounts =
        this.config.signinConfirmation.skipForNewAccounts;
      if (skipForNewAccounts?.enabled) {
        const accountAge = requestNow - account.createdAt;
        if (accountAge <= (skipForNewAccounts.maxAge as unknown as number)) {
          this.log.info('account.signin.confirm.bypass.age', {
            uid: account.uid,
          });
          return true;
        }
      }

      // Certain accounts have the ability to *always* skip sign-in confirmation
      // regardless of account age or device. This is for internal use where we need
      // to guarantee the login experience.
      const lowerCaseEmail = account.primaryEmail.normalizedEmail.toLowerCase();
      const alwaysSkip =
        this.skipConfirmationForEmailAddresses?.includes(lowerCaseEmail);
      if (alwaysSkip) {
        this.log.info('account.signin.confirm.bypass.always', {
          uid: account.uid,
        });
        return true;
      }

      return false;
    };

    const sendSigninNotifications = async () => {
      await this.signinUtils.sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        verificationMethod
      );

      // For new sync logins that don't send some other sort of email,
      // send an after-the-fact notification email so that the user
      // is aware that something happened on their account.
      if (accountRecord.primaryEmail.isVerified) {
        if (sessionToken.tokenVerified || !sessionToken.mustVerify) {
          if (requestHelper.wantsKeys(request)) {
            const geoData = request.app.geo;
            const service =
              (request.payload as any).service || request.query.service;
            const ip = request.app.clientAddress;
            const { deviceId, flowId, flowBeginTime } = await request.app
              .metricsContext;

            try {
              await this.mailer.sendNewDeviceLoginEmail(
                accountRecord.emails,
                accountRecord,
                {
                  acceptLanguage: request.app.acceptLanguage,
                  deviceId,
                  flowId,
                  flowBeginTime,
                  ip,
                  location: geoData.location,
                  service,
                  timeZone: geoData.timeZone,
                  uaBrowser: request.app.ua.browser,
                  uaBrowserVersion: request.app.ua.browserVersion,
                  uaOS: request.app.ua.os,
                  uaOSVersion: request.app.ua.osVersion,
                  uaDeviceType: request.app.ua.deviceType,
                  uid: sessionToken.uid,
                }
              );
            } catch (err) {
              // If we couldn't email them, no big deal. Log
              // and pretend everything worked.
              this.log.trace(
                'Account.login.sendNewDeviceLoginNotification.error',
                {
                  error: err,
                }
              );
            }
          }
        }
      }
    };

    const createKeyFetchToken = async () => {
      if (requestHelper.wantsKeys(request)) {
        keyFetchToken = await this.signinUtils.createKeyFetchToken(
          request,
          accountRecord,
          password,
          sessionToken
        );
      }
    };

    const createResponse = async () => {
      const response: Record<string, any> = {
        uid: sessionToken.uid,
        sessionToken: sessionToken.data,
        authAt: sessionToken.lastAuthAt(),
        metricsEnabled: !accountRecord.metricsOptOutAt,
      };

      if (keyFetchToken) {
        response.keyFetchToken = keyFetchToken.data;
      }
      if (passwordChangeRequired) {
        response.verified = false;
        response.verificationReason = 'change_password';
        response.verificationMethod = verificationMethod;
      } else {
        Object.assign(
          response,
          this.signinUtils.getSessionVerificationStatus(
            sessionToken,
            verificationMethod
          )
        );
      }

      await this.signinUtils.cleanupReminders(response, accountRecord);

      return response;
    };

    await checkCustomsAndLoadAccount();
    await checkEmailAndPassword();
    await checkSecurityHistory();
    await checkTotpToken();
    await createSessionToken();
    await sendSigninNotifications();
    await createKeyFetchToken();
    return await createResponse();
  }

  async status(request: AuthRequest) {
    const sessionToken = request.auth.credentials;
    if (sessionToken) {
      return { exists: true, locale: sessionToken.locale };
    } else if (request.query.uid) {
      try {
        const uid = request.query.uid;
        await this.db.account(uid);
        return { exists: true };
      } catch (err) {
        if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
          return { exists: false };
        }
        throw err;
      }
    } else {
      throw error.missingRequestParameter('uid');
    }
  }

  async accountStatusCheck(request: AuthRequest) {
    const email = (request.payload as any).email;

    await this.customs.check(request, email, 'accountStatusCheck');

    try {
      const exist = await this.db.accountExists(email);
      return {
        exists: exist,
      };
    } catch (err) {
      if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        return { exists: false };
      }
      throw err;
    }
  }

  async profile(request: AuthRequest) {
    const auth = request.auth;
    let uid, scope;
    if (auth.strategy === 'sessionToken') {
      uid = auth.credentials.uid;
      scope = { contains: () => true };
    } else {
      uid = auth.credentials.user;
      scope = ScopeSet.fromArray(auth.credentials.scope);
    }

    const res: Record<string, any> = {};
    const account = await this.db.account(uid);

    if (scope.contains('profile:email')) {
      res.email = account.primaryEmail.email;
    }
    if (scope.contains('profile:locale') && account.locale) {
      res.locale = account.locale;
    }
    if (scope.contains('profile:amr')) {
      const amrValues = await authMethods.availableAuthenticationMethods(
        this.db,
        account
      );
      res.authenticationMethods = Array.from(amrValues);
      res.authenticatorAssuranceLevel =
        authMethods.maximumAssuranceLevel(amrValues);
    }

    if (
      this.config.subscriptions?.enabled &&
      scope.contains('profile:subscriptions')
    ) {
      const capabilities =
        await this.capabilityService.subscriptionCapabilities(uid as string);
      if (Object.keys(capabilities).length > 0) {
        res.subscriptionsByClientId = capabilities;
      }
    }

    // If no keys set on the response, there was no valid profile scope found. We only
    // want to return `profileChangedAt` if a valid scope was found and set.
    if (Object.keys(res).length !== 0) {
      res.profileChangedAt = account.profileChangedAt;
      res.metricsEnabled = !account.metricsOptOutAt;
    }

    return res;
  }

  async keys(request: AuthRequest) {
    this.log.begin('Account.keys', request);
    const keyFetchToken = request.auth.credentials;

    const verified = keyFetchToken.tokenVerified && keyFetchToken.emailVerified;
    if (!verified) {
      // don't delete the token on use until the account is verified
      throw error.unverifiedAccount();
    }
    await this.db.deleteKeyFetchToken(keyFetchToken);
    await request.emitMetricsEvent('account.keyfetch', {
      uid: keyFetchToken.uid,
    });
    return {
      bundle: keyFetchToken.keyBundle,
    };
  }

  async reset(request: AuthRequest) {
    this.log.begin('Account.reset', request);
    const accountResetToken = request.auth.credentials;
    const {
      authPW,
      sessionToken: hasSessionToken,
      recoveryKeyId,
    } = request.payload as any;
    let wrapKb = (request.payload as any).wrapKb;
    let account: any,
      sessionToken: any,
      keyFetchToken: any,
      verifyHash: any,
      wrapWrapKb: any,
      password: any,
      hasTotpToken = false,
      tokenVerificationId: any;

    const checkRecoveryKey = () => {
      if (recoveryKeyId) {
        return this.db.getRecoveryKey(accountResetToken.uid, recoveryKeyId);
      }

      return Promise.resolve();
    };

    const checkTotpToken = async () => {
      hasTotpToken = await this.otpUtils.hasTotpToken({
        uid: accountResetToken.uid,
      });
    };

    const resetAccountData = async () => {
      const authSalt = await random.hex(32);
      let keysHaveChanged;
      password = new this.Password(
        authPW,
        authSalt,
        this.config.verifierVersion
      );
      verifyHash = await password.verifyHash();
      if (recoveryKeyId) {
        // We have the previous kB, just re-wrap it with the new password.
        wrapWrapKb = await password.wrap(wrapKb);
        keysHaveChanged = false;
      } else {
        // We need to regenerate kB and wrap it with the new password.
        wrapWrapKb = await random.hex(32);
        wrapKb = await password.unwrap(wrapWrapKb);
        keysHaveChanged = true;
      }
      // db.resetAccount() deletes all the devices saved in the account,
      // so grab the list to notify before we call it.
      const devicesToNotify = await request.app.devices;
      // Reset the account, and delete any other outstanding account-related tokens.
      await this.db.resetAccount(accountResetToken, {
        authSalt,
        verifyHash,
        wrapWrapKb,
        verifierVersion: password.version,
        keysHaveChanged,
      });
      await this.db.resetAccountTokens(accountResetToken.uid);
      // Notify various interested parties about this password reset.
      // These can all safely happen in parallel.
      account = await this.db.account(accountResetToken.uid);
      await Promise.all([
        this.push.notifyPasswordReset(account.uid, devicesToNotify),
        request.emitMetricsEvent('account.reset', {
          uid: account.uid,
        }),
        this.log.notifyAttachedServices('reset', request, {
          uid: account.uid,
          generation: account.verifierSetAt,
        }),
        this.oauth.removePublicAndCanGrantTokens(account.uid),
        this.customs.reset(account.email),
      ]);
    };

    const recoveryKeyDeleteAndEmailNotification = async () => {
      // If the password was reset with a recovery key, then we explicitly delete the
      // recovery key and send an email that the account was reset with it.
      if (recoveryKeyId) {
        await this.db.deleteRecoveryKey(account.uid);

        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        const emailOptions = {
          acceptLanguage: request.app.acceptLanguage,
          ip: ip,
          location: geoData.location,
          timeZone: geoData.timeZone,
          uaBrowser: request.app.ua.browser,
          uaBrowserVersion: request.app.ua.browserVersion,
          uaOS: request.app.ua.os,
          uaOSVersion: request.app.ua.osVersion,
          uaDeviceType: request.app.ua.deviceType,
          uid: account.uid,
        };

        return await this.mailer.sendPasswordResetAccountRecoveryEmail(
          account.emails,
          account,
          emailOptions
        );
      }
    };

    const createSessionToken = async () => {
      if (hasSessionToken) {
        const {
          browser: uaBrowser,
          browserVersion: uaBrowserVersion,
          os: uaOS,
          osVersion: uaOSVersion,
          deviceType: uaDeviceType,
          formFactor: uaFormFactor,
        } = request.app.ua;

        // Since the only way to reach this point is clicking a
        // link from the user's email, we create a verified sessionToken
        // **unless** the user has a TOTP token.
        tokenVerificationId = hasTotpToken ? await random.hex(16) : null;

        const sessionTokenOptions = {
          uid: account.uid,
          email: account.primaryEmail.email,
          emailCode: account.primaryEmail.emailCode,
          emailVerified: account.primaryEmail.isVerified,
          verifierSetAt: account.verifierSetAt,
          mustVerify: !!tokenVerificationId,
          tokenVerificationId,
          uaBrowser,
          uaBrowserVersion,
          uaOS,
          uaOSVersion,
          uaDeviceType,
          uaFormFactor,
        };

        sessionToken = await this.db.createSessionToken(sessionTokenOptions);
        return await request.propagateMetricsContext(
          accountResetToken,
          sessionToken
        );
      }
    };

    const createKeyFetchToken = async () => {
      if (requestHelper.wantsKeys(request)) {
        if (!hasSessionToken) {
          // Sanity-check: any client requesting keys,
          // should also be requesting a sessionToken.
          throw error.missingRequestParameter('sessionToken');
        }
        keyFetchToken = await this.db.createKeyFetchToken({
          uid: account.uid,
          kA: account.kA,
          wrapKb: wrapKb,
          emailVerified: account.primaryEmail.isVerified,
          tokenVerificationId,
        });
        return await request.propagateMetricsContext(
          accountResetToken,
          keyFetchToken
        );
      }
    };

    const recordSecurityEvent = () => {
      this.db.securityEvent({
        name: 'account.reset',
        uid: account.uid,
        ipAddr: request.app.clientAddress,
        tokenId: sessionToken && sessionToken.id,
      });
    };

    const createResponse = () => {
      // If no sessionToken, this could be a legacy client
      // attempting to reset an account password, return legacy response.
      if (!hasSessionToken) {
        return {};
      }

      const response: Record<string, any> = {
        uid: sessionToken.uid,
        sessionToken: sessionToken.data,
        verified: sessionToken.emailVerified,
        authAt: sessionToken.lastAuthAt(),
      };

      if (requestHelper.wantsKeys(request)) {
        response.keyFetchToken = keyFetchToken.data;
      }

      const verificationMethod = hasTotpToken ? 'totp-2fa' : undefined;
      Object.assign(
        response,
        this.signinUtils.getSessionVerificationStatus(
          sessionToken,
          verificationMethod
        )
      );

      return response;
    };

    await checkRecoveryKey();
    await checkTotpToken();
    await resetAccountData();
    await recoveryKeyDeleteAndEmailNotification();
    await createSessionToken();
    await createKeyFetchToken();
    await recordSecurityEvent();
    return createResponse();
  }

  async destroy(request: AuthRequest) {
    this.log.begin('Account.destroy', request);

    const { authPW, email: emailAddress } = request.payload as any;

    await this.customs.check(request, emailAddress, 'accountDestroy');

    let emailRecord;
    try {
      emailRecord = await this.db.accountRecord(emailAddress);
    } catch (err) {
      if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        await this.customs.flag(request.app.clientAddress, {
          email: emailAddress,
          errno: err.errno,
        });
      }

      throw err;
    }

    const sessionToken = request.auth && request.auth.credentials;
    const hasTotpToken = await this.otpUtils.hasTotpToken(emailRecord);

    // Someone tried to delete an account with TOTP but did not specify a session.
    // This shouldn't happen in practice, but just in case we throw unverified session.
    if (!sessionToken && hasTotpToken) {
      throw error.unverifiedSession();
    }

    // If TOTP is enabled, ensure that the session has the correct assurance level before
    // deleting account.
    if (
      sessionToken &&
      hasTotpToken &&
      (sessionToken.tokenVerificationId ||
        (sessionToken.authenticatorAssuranceLevel as number) <= 1)
    ) {
      throw error.unverifiedSession();
    }

    // In other scenarios, fall back to the default behavior and let the user
    // delete the account
    const password = new this.Password(
      authPW,
      emailRecord.authSalt,
      emailRecord.verifierVersion
    );

    const isMatchingPassword = await this.signinUtils.checkPassword(
      emailRecord,
      password,
      request.app.clientAddress
    );
    if (!isMatchingPassword) {
      throw error.incorrectPassword(emailRecord.email, emailAddress);
    }

    const { uid } = emailRecord;

    if (this.config.subscriptions?.enabled && this.stripeHelper) {
      try {
        await this.stripeHelper.removeCustomer(uid, emailRecord.email);
      } catch (err) {
        if (err.message === 'Customer not available') {
          // if Stripe didn't know about the customer, no problem.
          // This should not stop the user from deleting their account.
          // See https://github.com/mozilla/fxa/issues/2900
          // https://github.com/mozilla/fxa/issues/2896
        } else {
          throw err;
        }
      }
      if (this.paypalHelper) {
        const agreementIds = await getAllPayPalBAByUid(uid);
        // Only cancelled and expired are terminal states, any others
        // should be canceled to ensure they can't be used again.
        const activeIds = agreementIds.filter((ba: any) =>
          ['active', 'pending', 'suspended'].includes(ba.status.toLowerCase())
        );
        await Promise.all(
          activeIds.map((ba) =>
            (this.paypalHelper as PayPalHelper).cancelBillingAgreement(
              ba.billingAgreementId
            )
          )
        );
        await deleteAllPayPalBAs(uid);
      }
    }

    // We fetch the devices to notify before deleteAccount()
    // because obviously we can't retrieve the devices list after!
    const devices = await this.db.devices(uid);

    await this.db.deleteAccount(emailRecord);
    this.log.info('accountDeleted.byRequest', { ...emailRecord });

    await this.oauth.removeUser(uid);

    try {
      await this.push.notifyAccountDestroyed(uid, devices);
    } catch (err) {
      // Ignore notification errors since this account no longer exists
    }

    await Promise.all([
      this.log.notifyAttachedServices('delete', request, { uid }),
      request.emitMetricsEvent('account.deleted', { uid }),
    ]);

    return {};
  }

  async getAccount(request: AuthRequest) {
    this.log.begin('Account.get', request);

    const { uid } = request.auth.credentials;

    let webSubscriptions: Awaited<WebSubscription[]> = [];
    let iapGooglePlaySubscriptions: Awaited<GooglePlaySubscription[]> = [];

    if (this.config.subscriptions?.enabled && this.stripeHelper) {
      try {
        const customer = await this.stripeHelper.fetchCustomer(uid as string, [
          'subscriptions',
        ]);
        if (customer && customer.subscriptions) {
          webSubscriptions = await this.stripeHelper.subscriptionsToResponse(
            customer.subscriptions
          );
        }

        if (this.config.subscriptions?.playApiServiceAccount?.enabled) {
          const playSubscriptions = Container.get(PlaySubscriptions);
          iapGooglePlaySubscriptions = await playSubscriptions.getSubscriptions(
            uid as string
          );
        }
      } catch (err) {
        if (err.errno !== error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER) {
          throw err;
        }
      }
    }

    return {
      subscriptions: [...iapGooglePlaySubscriptions, ...webSubscriptions],
    };
  }
}

export const accountRoutes = (
  log: AuthLogger,
  db: any,
  mailer: any,
  Password: any,
  config: ConfigType,
  customs: any,
  signinUtils: any,
  signupUtils: any,
  push: any,
  verificationReminders: any,
  subscriptionAccountReminders: any,
  oauth: any,
  stripeHelper: StripeHelper
) => {
  const accountHandler = new AccountHandler(
    log,
    db,
    mailer,
    Password,
    config,
    customs,
    signinUtils,
    signupUtils,
    push,
    verificationReminders,
    subscriptionAccountReminders,
    oauth,
    stripeHelper
  );
  const routes = [
    {
      method: 'POST',
      path: '/account/create',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_CREATE_POST,
        validate: {
          query: isA.object({
            keys: isA.boolean().optional().description(DESCRIPTION.keys),
            service: validators.service.description(DESCRIPTION.service),
          }),
          payload: isA
            .object({
              email: validators
                .email()
                .required()
                .description(DESCRIPTION.email),
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              service: validators.service.description(DESCRIPTION.service),
              redirectTo: validators
                .redirectTo(config.smtp.redirectDomain)
                .optional()
                .description(DESCRIPTION.redirectTo),
              resume: isA
                .string()
                .max(2048)
                .optional()
                .description(DESCRIPTION.resume),
              metricsContext: METRICS_CONTEXT_SCHEMA,
              style: isA.string().allow(['trailhead']).optional(),
              verificationMethod: validators.verificationMethod.optional(),
              // preVerified is not available in production mode.
              ...(!(config as any).isProduction && {
                preVerified: isA.boolean(),
              }),
            })
            .label('Account.create_payload'),
        },
        response: {
          schema: isA
            .object({
              uid: isA.string().regex(HEX_STRING).required(),
              sessionToken: isA.string().regex(HEX_STRING).required(),
              keyFetchToken: isA.string().regex(HEX_STRING).optional(),
              authAt: isA.number().integer().description(DESCRIPTION.authAt),
              verificationMethod: validators.verificationMethod.optional(),
            })
            .label('Account.create_response'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.accountCreate(request),
    },
    {
      method: 'POST',
      path: '/account/stub',
      options: {
        ...MISC_DOCS.ACCOUNT_STUB_POST,
        validate: {
          payload: isA
            .object({
              email: validators.email().required(),
              clientId: validators.clientId.required(),
              metricsContext: METRICS_CONTEXT_SCHEMA,
            })
            .label('Account.stub_payload'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.accountStub(request),
    },
    {
      method: 'POST',
      path: '/account/finish_setup',
      options: {
        ...MISC_DOCS.ACCOUNT_FINISH_SETUP_POST,
        validate: {
          payload: isA
            .object({
              token: validators.jwt,
              authPW: validators.authPW,
            })
            .label('Account.finishSetup_payload'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.finishSetup(request),
    },
    {
      method: 'POST',
      path: '/account/login',
      apidoc: {
        errors: [
          error.unknownAccount,
          error.requestBlocked,
          error.incorrectPassword,
          error.cannotLoginWithSecondaryEmail,
          error.invalidUnblockCode,
          error.cannotLoginWithEmail,
          error.cannotSendEmail,
        ],
      },
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_LOGIN_POST,
        validate: {
          query: isA.object({
            keys: isA.boolean().optional().description(DESCRIPTION.keys),
            service: validators.service.description(DESCRIPTION.service),
            verificationMethod: validators.verificationMethod
              .optional()
              .description(DESCRIPTION.verificationMethod),
          }),
          payload: isA
            .object({
              email: validators
                .email()
                .required()
                .description(DESCRIPTION.email),
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              service: validators.service.description(DESCRIPTION.service),
              redirectTo: validators
                .redirectTo(config.smtp.redirectDomain)
                .optional(),
              resume: isA.string().optional().description(DESCRIPTION.resume),
              reason: isA
                .string()
                .max(16)
                .optional()
                .description(DESCRIPTION.reason),
              unblockCode: signinUtils.validators.UNBLOCK_CODE.description(
                DESCRIPTION.unblockCode
              ),
              metricsContext: METRICS_CONTEXT_SCHEMA,
              originalLoginEmail: validators
                .email()
                .optional()
                .description(DESCRIPTION.originalLoginEmail),
              verificationMethod: validators.verificationMethod
                .optional()
                .description(DESCRIPTION.verificationMethod),
            })
            .label('Account.login_payload'),
        },
        response: {
          schema: isA
            .object({
              uid: isA.string().regex(HEX_STRING).required(),
              sessionToken: isA.string().regex(HEX_STRING).required(),
              keyFetchToken: isA.string().regex(HEX_STRING).optional(),
              verificationMethod: isA
                .string()
                .optional()
                .description(DESCRIPTION.verificationMethod),
              verificationReason: isA
                .string()
                .optional()
                .description(DESCRIPTION.verificationReason),
              verified: isA.boolean().required(),
              authAt: isA.number().integer().description(DESCRIPTION.authAt),
              metricsEnabled: isA.boolean().required(),
            })
            .label('Account.login_response'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.login(request),
    },
    {
      method: 'GET',
      path: '/account/status',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_STATUS_GET,
        auth: {
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            uid: isA.string().min(32).max(32).regex(HEX_STRING),
          },
        },
      },
      handler: (request: AuthRequest) => accountHandler.status(request),
    },
    {
      method: 'POST',
      path: '/account/status',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_STATUS_POST,
        validate: {
          payload: isA
            .object({
              email: validators.email().required(),
            })
            .label('AccountStatusCheck_payload'),
        },
        response: {
          schema: isA
            .object({
              exists: isA.boolean().required(),
            })
            .label('AccountStausCheck_response'),
        },
      },
      handler: (request: AuthRequest) =>
        accountHandler.accountStatusCheck(request),
    },
    {
      method: 'GET',
      path: '/account/profile',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_PROFILE_GET,
        auth: {
          strategies: ['sessionToken', 'oauthToken'],
        },
        response: {
          schema: isA
            .object({
              email: isA.string().optional(),
              locale: isA.string().optional().allow(null),
              authenticationMethods: isA
                .array()
                .items(isA.string().required())
                .optional(),
              authenticatorAssuranceLevel: isA.number().min(0),
              subscriptionsByClientId: isA.object().unknown(true).optional(),
              profileChangedAt: isA.number().min(0),
              metricsEnabled: isA.boolean().optional(),
            })
            .label('Account.profile_response'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.profile(request),
    },
    {
      method: 'GET',
      path: '/account/keys',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_KEYS_GET,
        auth: {
          strategy: 'keyFetchTokenWithVerificationStatus',
        },
        response: {
          schema: isA
            .object({
              bundle: isA
                .string()
                .regex(HEX_STRING)
                .description(DESCRIPTION.bundle),
            })
            .label('Account.keys_response'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.keys(request),
    },
    {
      method: 'POST',
      path: '/account/unlock/resend_code',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_UNLOCK_RESEND_CODE_POST,
        validate: {
          payload: true,
        },
      },
      handler: async function (request: AuthRequest) {
        log.error('Account.UnlockCodeResend', { request: request });
        throw error.gone();
      },
    },
    {
      method: 'POST',
      path: '/account/unlock/verify_code',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_UNLOCK_VERIFY_CODE_POST,
        validate: {
          payload: true,
        },
      },
      handler: async function (request: AuthRequest) {
        log.error('Account.UnlockCodeVerify', { request: request });
        throw error.gone();
      },
    },
    {
      method: 'POST',
      path: '/account/reset',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_RESET_POST,
        auth: {
          strategy: 'accountResetToken',
          payload: 'required',
        },
        validate: {
          query: isA.object({
            keys: isA.boolean().optional().description(DESCRIPTION.queryKeys),
          }),
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              wrapKb: validators.wrapKb.optional(),
              recoveryKeyId: validators.recoveryKeyId.optional(),
              sessionToken: isA
                .boolean()
                .optional()
                .description(DESCRIPTION.sessionToken),
            })
            .and('wrapKb', 'recoveryKeyId')
            .label('Account.reset_payload'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.reset(request),
    },
    {
      method: 'POST',
      path: '/account/destroy',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_DESTROY_POST,
        auth: {
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA
            .object({
              email: validators
                .email()
                .required()
                .description(DESCRIPTION.email),
              authPW: validators.authPW.description(DESCRIPTION.authPW),
            })
            .label('Account.destroy_payload'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.destroy(request),
    },
    {
      method: 'GET',
      path: '/account',
      options: {
        ...MISC_DOCS.ACCOUNT_GET,
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: isA
            .object({
              // This endpoint is evolving, it's not just for subscriptions.
              // Ultimately we want it to become a one-stop shop for all of
              // the account data needed by the settings screen, so that we
              // can drastically reduce how many requests are made to the
              // backend. Discussion in:
              //
              // https://github.com/mozilla/fxa/issues/1808
              subscriptions: isA
                .array()
                .items(
                  validators.subscriptionsSubscriptionValidator,
                  validators.subscriptionsGooglePlaySubscriptionValidator
                ),
            })
            .label('Account.subscriptions'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.getAccount(request),
    },
  ];

  if (!(config as any).isProduction) {
    // programmatic account lockout was only available in
    // non-production mode.
    routes.push({
      method: 'POST',
      path: '/account/lock',
      options: {
        ...MISC_DOCS.ACCOUNT_LOCK_POST,
        validate: {
          payload: true,
        },
      } as any,
      handler: async function (request) {
        log.error('Account.lock', { request: request });
        throw error.gone();
      },
    });
  }

  return routes;
};

module.exports = {
  accountRoutes,
  AccountHandler,
};
