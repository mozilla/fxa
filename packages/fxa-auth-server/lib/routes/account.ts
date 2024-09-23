/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Account, getAccountCustomerByUid } from 'fxa-shared/db/models/auth';
import {
  AppStoreSubscription,
  PlayStoreSubscription,
} from 'fxa-shared/dto/auth/payments/iap-subscription';
import { WrappedErrorCodes } from 'fxa-shared/email/emailValidatorErrors';
import TopEmailDomains from 'fxa-shared/email/topEmailDomains';
import { tryResolveIpv4, tryResolveMx } from 'fxa-shared/email/validateEmail';
import ScopeSet from 'fxa-shared/oauth/scopes';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import isA from 'joi';
import Stripe from 'stripe';
import { Container } from 'typedi';
import * as uuid from 'uuid';

import { ConfigType } from '../../config';
import ACCOUNT_DOCS from '../../docs/swagger/account-api';
import MISC_DOCS from '../../docs/swagger/misc-api';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import authMethods from '../authMethods';
import random from '../crypto/random';
import error from '../error';
import { getClientById } from '../oauth/client';
import { generateAccessToken } from '../oauth/grant';
import * as jwt from '../oauth/jwt';
import { CapabilityService } from '../payments/capability';
import { AppStoreSubscriptions } from '../payments/iap/apple-app-store/subscriptions';
import { PlaySubscriptions } from '../payments/iap/google-play/subscriptions';
import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from '../payments/iap/iap-formatter';
import { StripeHelper } from '../payments/stripe';
import { AuthLogger, AuthRequest } from '../types';
import { deleteAccountIfUnverified } from './utils/account';
import emailUtils from './utils/email';
import requestHelper from './utils/request_helper';
import * as validators from './validators';
import { AccountEventsManager } from '../account-events';
import { gleanMetrics } from '../metrics/glean';
import { AccountDeleteManager } from '../account-delete';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { AccountTasks, ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { ProfileClient } from '@fxa/profile/client';
import otpUtilsModule from './utils/otp';

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;

const HEX_STRING = validators.HEX_STRING;

const MS_ONE_HOUR = 1000 * 60 * 60;
const MS_ONE_DAY = MS_ONE_HOUR * 24;
const MS_ONE_WEEK = MS_ONE_DAY * 7;
const MS_ONE_MONTH = MS_ONE_DAY * 30;

export class AccountHandler {
  private OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS: Set<string>;

  private otpUtils: any;
  private otpOptions: ConfigType['otp'];
  private skipConfirmationForEmailAddresses: string[];
  private capabilityService: CapabilityService;
  private accountEventsManager: AccountEventsManager;
  private accountDeleteManager: AccountDeleteManager;
  private accountTasks: AccountTasks;
  private profileClient: ProfileClient;

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
    private stripeHelper: StripeHelper,
    private glean: ReturnType<typeof gleanMetrics>
  ) {
    this.otpUtils = otpUtilsModule(log, config, db);
    this.skipConfirmationForEmailAddresses = config.signinConfirmation
      .skipForEmailAddresses as string[];

    this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
      (config.oauth.disableNewConnectionsForClients as string[]) || []
    );

    this.otpOptions = config.otp;

    this.capabilityService = Container.get(CapabilityService);
    this.accountEventsManager = Container.get(AccountEventsManager);
    this.accountDeleteManager = Container.get(AccountDeleteManager);
    this.accountTasks = Container.get(AccountTasks);
    this.profileClient = Container.get(ProfileClient);
  }

  private async generateRandomValues() {
    const hex16 = await random.hex(16);
    const hex32 = await random.hex(32);
    return { hex16, hex32 };
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
    authPWVersion2?: string;
    wrapKb?: string;
    wrapKbVersion2?: string;
    clientSalt?: string;
    authSalt: string;
    email: string;
    emailCode: string;
    preVerified: boolean;
    request: AuthRequest;
    service?: string;
    userAgentString: string;
    atLeast18AtReg: boolean | null;
  }) {
    const {
      authPW,
      authPWVersion2,
      wrapKb,
      wrapKbVersion2,
      clientSalt,
      authSalt,
      email,
      emailCode,
      preVerified,
      request,
      service,
      userAgentString,
      atLeast18AtReg,
    } = options;

    const { password, verifyHash } = await this.createPassword(
      authPW,
      authSalt
    );

    // Handle authPWVersion2 credentials
    let password2 = undefined;
    let verifyHashVersion2 = undefined;
    let wrapWrapKb = await random.hex(32);
    let wrapWrapKbVersion2 = undefined;
    if (authPWVersion2) {
      password2 = new this.Password(
        authPWVersion2,
        authSalt,
        this.config.verifierVersion
      );
      verifyHashVersion2 = await password2.verifyHash();
      wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);

      // When version 2 credentials are supplied, the wrapKb will also be supplied.
      // This is necessary to the same kB values are produced for both passwords.
      wrapWrapKb = await password.wrap(wrapKb);
    }

    const kA = await random.hex(32);

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

    const account = await this.db.createAccount({
      uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
      createdAt: Date.now(),
      email: email,
      emailCode: emailCode,
      emailVerified: preVerified,
      kA,
      wrapWrapKb,
      wrapWrapKbVersion2,
      accountResetToken: null,
      passwordForgotToken: null,
      authSalt: authSalt,
      clientSalt: clientSalt,
      verifierVersion: password.version,
      verifyHash: verifyHash,
      verifyHashVersion2: verifyHashVersion2,
      verifierSetAt: Date.now(),
      locale,
      atLeast18AtReg,
    });

    await request.emitMetricsEvent('account.created', {
      uid: account.uid,
    });

    this.glean.registration.accountCreated(request, {
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

    await this.profileClient.deleteCache(account.uid);
    await this.log.notifyAttachedServices('profileDataChange', request, {
      uid: account.uid,
    });

    return { password, password2, account };
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
    tokenVerificationId: any;
  }) {
    const { request, account, tokenVerificationId } = options;
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
        this.glean.registration.confirmationEmailSent(request, {
          uid: account.uid,
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
    v2?: boolean;
  }) {
    const { request, account, password, tokenVerificationId, v2 } = options;
    if (requestHelper.wantsKeys(request)) {
      const wrapKb = await password.unwrap(
        v2 ? account.wrapWrapKbVersion2 : account.wrapWrapKb
      );
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
    keyFetchTokenVersion2: any;
    sessionToken: any;
    verificationMethod: any;
  }) {
    const {
      account,
      sessionToken,
      keyFetchToken,
      keyFetchTokenVersion2,
      verificationMethod,
    } = options;
    const response: Record<string, any> = {
      uid: account.uid,
      sessionToken: sessionToken.data,
      authAt: sessionToken.lastAuthAt(),
    };

    if (keyFetchToken) {
      response.keyFetchToken = keyFetchToken.data;
    }

    if (keyFetchTokenVersion2) {
      response.keyFetchTokenVersion2 = keyFetchTokenVersion2.data;
    }

    if (verificationMethod) {
      response.verificationMethod = verificationMethod;
    }

    return response;
  }

  private async checkEmailDomainValidity(email: string): Promise<boolean> {
    let invalidDomain = false;
    const domain = email.split('@')[1];
    if (!TopEmailDomains.has(domain)) {
      let mxCheck = false,
        ipv4Check = false;

      try {
        mxCheck = await tryResolveMx(domain);
        ipv4Check = await tryResolveIpv4(domain);
      } catch (error) {
        if (WrappedErrorCodes.includes(error.code)) {
          this.log.error(`DNS query error: ${error.code}`, error);
        } else {
          this.log.error('checkEmailDomainValidity', error);
        }

        // if there are any errors we ignore this domain check
        mxCheck = true;
        ipv4Check = true;
      }

      invalidDomain = !mxCheck && !ipv4Check;
    }

    return invalidDomain;
  }

  async accountCreate(request: AuthRequest) {
    this.log.begin('Account.create', request);
    const form = request.payload as any;
    const query = request.query;
    const email = form.email;
    const authPW = form.authPW;
    const wrapKb = form.wrapKb;
    const authPWVersion2 = form.authPWVersion2;
    const wrapKbVersion2 = form.wrapKbVersion2;
    const clientSalt = form.clientSalt;
    const userAgentString = request.headers['user-agent'];
    const service = form.service || query.service;
    const preVerified = !!form.preVerified;
    const verificationMethod = form.verificationMethod;
    const atLeast18AtReg = form.atLeast18AtReg ? form.atLeast18AtReg : null;

    request.validateMetricsContext();
    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(service)) {
      throw error.disabledClientId(service);
    }

    await this.customs.check(request, email, 'accountCreate');
    await deleteAccountIfUnverified(
      this.db,
      this.stripeHelper,
      this.log,
      request,
      email
    );

    const { hex16: emailCode, hex32: authSalt } =
      await this.generateRandomValues();

    // Verified sessions should only be created for preverified accounts.
    const tokenVerificationId = preVerified ? undefined : emailCode;

    this.setMetricsFlowCompleteSignal(request, service);

    const { account, password, password2 } = await this.createAccount({
      authPW,
      authPWVersion2,
      wrapKb,
      wrapKbVersion2,
      clientSalt,
      authSalt,
      email,
      emailCode,
      preVerified,
      request,
      service,
      userAgentString,
      atLeast18AtReg,
    });

    const sessionToken = await this.createSessionToken({
      account,
      request,
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

    let keyFetchTokenVersion2;
    if (password2) {
      keyFetchTokenVersion2 = await this.createKeyFetchToken({
        account,
        password: password2,
        request,
        tokenVerificationId,
        v2: true,
      });
    }

    await this.db.securityEvent({
      ipAddr: request.app.clientAddress,
      name: 'account.create',
      tokenId: sessionToken.id,
      uid: account.uid,
    });

    return this.accountCreateResponse({
      account,
      keyFetchToken,
      keyFetchTokenVersion2,
      sessionToken,
      verificationMethod,
    });
  }

  async accountStub(request: AuthRequest) {
    this.log.begin('Account.stub', request);
    const { email, clientId, wantsSetupToken } = request.payload as any;
    await this.customs.check(request, email, 'accountCreate');

    if (this.OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw error.disabledClientId(clientId);
    }

    const invalidDomain = await this.checkEmailDomainValidity(email);
    if (invalidDomain) {
      throw error.accountCreationRejected();
    }

    const client = await getClientById(clientId);

    await deleteAccountIfUnverified(
      this.db,
      this.stripeHelper,
      this.log,
      request,
      email
    );

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
      wrapWrapKbVersion2: null,
      authSalt,
      verifierVersion: this.config.verifierVersion,
      verifyHash: Buffer.alloc(32).toString('hex'),
      verifyHashVersion2: null,
      verifierSetAt: 0,
      locale: request.app.acceptLanguage,
      clientSalt: null,
    });

    const access = await generateAccessToken({
      clientId: client.id,
      name: client.name,
      canGrant: client.canGrant,
      publicClient: client.publicClient,
      userId: uuidTransformer.to(account.uid),
      scope: ScopeSet.fromString(`profile ${client.allowedScopes}`),
      ttl: 1800,
    });

    this.setMetricsFlowCompleteSignal(request, clientId);
    await request.stashMetricsContext({
      uid: account.uid,
      id: account.uid,
    });

    // This token is designed to work with the account/finish_setup endpoint
    // and setPasswordOnStubAccount method. In some scenarios, like invocations
    // from subscriptions, the setup token is generated by the calling code,
    // and provided to the user in an email.
    const setupToken = wantsSetupToken
      ? jwt.sign(
          {
            uid: account.uid,
            iat: Date.now(),
          },
          { header: { typ: 'fin+JWT' } }
        )
      : undefined;

    return {
      uid: account.uid,
      access_token: access.token.toString('hex'),
      setup_token: setupToken,
    };
  }

  async setPasswordOnStubAccount({
    account,
    authPW,
    authPWVersion2,
    wrapKb,
    wrapKbVersion2,
    clientSalt,
  }: {
    account: Account;
    authPW: string;
    authPWVersion2: string;
    wrapKb: string;
    wrapKbVersion2: string;
    clientSalt: string;
  }) {
    // Only set a password on an unverified stub account.
    if (account.verifierSetAt !== 0) {
      throw error.unauthorized('token already used');
    }
    const { authSalt, uid, wrapWrapKb } = account;
    const { password, verifyHash } = await this.createPassword(
      authPW,
      authSalt
    );

    const v2Data = await (async () => {
      if (authPWVersion2) {
        const password2 = new this.Password(
          authPWVersion2,
          authSalt,
          this.config.verifierVersion,
          2
        );
        const verifyHashVersion2 = await password2.verifyHash();

        // Important! In the case of V2, the client will determine the
        // the kB value and provide wrapKb & wrapKbVersion2 to us. We
        // do this to ensure that wrapWrapKb and wrapWrapKbVersion2 result
        // in the same kB value. Something only the client would be able
        // to do since kB is private.
        const wrapWrapKb = await password.wrap(wrapKb);
        const wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);

        return {
          clientSalt,
          wrapWrapKb,
          verifyHashVersion2,
          wrapWrapKbVersion2,
        };
      }
      return {};
    })();

    const data = {
      authSalt,
      verifyHash,
      wrapWrapKb,
      verifierVersion: password.version,
      keysHaveChanged: true,
      ...v2Data,
    };

    await this.db.resetAccount({ uid }, data);
  }

  async finishSetup(request: AuthRequest) {
    this.log.begin('Account.finishSetup', request);
    const form = request.payload as any;
    const {
      authPW,
      authPWVersion2,
      wrapKb,
      wrapKbVersion2,
      clientSalt,
      token,
    } = form;
    let uid;
    try {
      const payload = (await jwt.verify(token, {
        typ: 'fin+JWT',
        ignoreExpiration: true,
      })) as any;
      uid = payload.uid;
      form.uid = payload.uid;
      const account = await this.db.account(uid);
      await this.setPasswordOnStubAccount({
        account,
        authPW,
        authPWVersion2,
        wrapKb,
        wrapKbVersion2,
        clientSalt,
      });
      await this.signupUtils.verifyAccount(request, account, {});
      const sessionToken = await this.createSessionToken({
        account,
        request,
        // this route counts as verification
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

      // if it errored out after verifiying the account
      // remove the uid from the list of accounts to send reminders to.
      if (uid) {
        const account = await this.db.account(uid);
        if (account.verifierSetAt > 0) {
          await this.subscriptionAccountReminders.delete(uid);
        }
      }

      throw err;
    }
  }

  async setPassword(request: AuthRequest) {
    this.log.begin('Account.set_password', request);

    const form = request.payload as any;
    const {
      authPW,
      authPWVersion2,
      wrapKb,
      wrapKbVersion2,
      clientSalt,
      metricsContext,
    } = form;
    const { query } = request;
    const auth = request.auth;
    const { user: uid } = auth.credentials;

    const account = await this.db.account(uid);
    const email = account.primaryEmail.email;

    await this.customs.check(request, email, 'setPassword');

    const response: Record<string, any> = {};
    response.uid = uid;

    try {
      await this.setPasswordOnStubAccount({
        account,
        authPW,
        authPWVersion2,
        wrapKb,
        wrapKbVersion2,
        clientSalt,
      });

      const { emailCode: tokenVerificationId } = account;
      const sessionToken = await this.createSessionToken({
        account,
        request,
        tokenVerificationId,
      });
      response.sessionToken = sessionToken.data;

      if (query.sendVerifyEmail) {
        await this.sendVerifyCode({
          account,
          request,
          sessionToken,
          tokenVerificationId,
          verificationMethod: 'email-otp',
        });
      }

      // This is a brand new (unverified) user who just created their first
      // subscription, so we know we will only have one priceId result here.
      const priceId = (
        await this.capabilityService.subscribedPriceIds(uid as string)
      )[0];
      const price = (await this.stripeHelper.allPlans()).find(
        (p) => p.id === priceId
      );
      // Cached prices have products expanded already
      const product = price?.product as Stripe.Product;
      if (product && product?.id && product?.name) {
        await this.subscriptionAccountReminders.create(
          uid,
          metricsContext.flowId,
          metricsContext.flowBeginTime,
          metricsContext.deviceId,
          product.id,
          product.name
        );
      }

      // TODO (FXA-5557): record flow metrics

      return response;
    } catch (err) {
      this.log.error('Account.set_password.error', {
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
      keyFetchTokenVersion2: any,
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
      // Third party accounts might not have set a password and
      // won't be able to login via email/password.
      if (accountRecord.verifierSetAt <= 0) {
        throw error.cannotLoginNoPasswordSet();
      }

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
        this.accountEventsManager.recordSecurityEvent(this.db, {
          name: 'account.login.failure',
          uid: accountRecord.uid,
          ipAddr: request.app.clientAddress,
        });
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

      // Convict type introspection fails to properly identify the number here
      // so we have to cast it to a number.
      const allowedRecency =
        (this.config.securityHistory.ipProfiling
          .allowedRecency as unknown as number) || 0;
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

      const [tokenVerificationId] = needsVerificationId
        ? [await random.hex(16)]
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
        uaBrowser,
        uaBrowserVersion,
        uaOS,
        uaOSVersion,
        uaDeviceType,
        uaFormFactor,
      };

      sessionToken = await this.db.createSessionToken(sessionTokenOptions);
    };

    const sendSigninNotifications = async () => {
      await this.signinUtils.sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        verificationMethod
      );

      // For new logins that don't send some other sort of email,
      // send an after-the-fact notification email so that the user
      // is aware that something happened on their account.
      if (accountRecord.primaryEmail.isVerified) {
        if (sessionToken.tokenVerified || !sessionToken.mustVerify) {
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
    };

    const createKeyFetchToken = async () => {
      if (requestHelper.wantsKeys(request)) {
        if (password.clientVersion === 2) {
          keyFetchTokenVersion2 = await this.signinUtils.createKeyFetchToken(
            request,
            accountRecord,
            password,
            sessionToken
          );
        } else {
          keyFetchToken = await this.signinUtils.createKeyFetchToken(
            request,
            accountRecord,
            password,
            sessionToken
          );
        }
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

      if (keyFetchTokenVersion2) {
        response.keyFetchTokenVersion2 = keyFetchTokenVersion2.data;
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

      if (response.verified) {
        this.glean.login.success(request, { uid: sessionToken.uid });
      }

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
    const checkDomain = !!(request.payload as any).checkDomain;
    const thirdPartyAuthStatus = !!(request.payload as any)
      .thirdPartyAuthStatus;
    let invalidDomain = false;

    if (checkDomain) {
      invalidDomain = await this.checkEmailDomainValidity(email);
    }

    await this.customs.check(request, email, 'accountStatusCheck');

    const result: {
      exists: boolean;
      invalidDomain?: boolean;
      hasLinkedAccount?: boolean;
      hasPassword?: boolean;
    } = {
      exists: false,
      invalidDomain: undefined,
      hasLinkedAccount: undefined,
      hasPassword: undefined,
    };

    try {
      if (thirdPartyAuthStatus) {
        const account = await this.db.accountRecord(email, {
          linkedAccounts: true,
        });
        // account must exist or unknown account error is thrown
        result.exists = true;
        result.hasLinkedAccount = account.linkedAccounts.length > 0;
        result.hasPassword = account.verifierSetAt > 0;
      } else {
        const exist = await this.db.accountExists(email);
        result.exists = exist;
      }

      if (checkDomain) {
        result.invalidDomain = invalidDomain;
      }

      return result;
    } catch (err) {
      if (err.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
        result.exists = false;
        if (checkDomain) {
          result.invalidDomain = invalidDomain;
        }
        return result;
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
    if (scope.contains('profile:age_check')) {
      res.atLeast18AtReg = account.atLeast18AtReg
        ? account.atLeast18AtReg
        : null;
    }

    if (scope.contains('profile:account_disabled_at')) {
      res.accountDisabledAt = account.disabledAt;
    }
    if (scope.contains('profile:account_locked_at')) {
      res.accountLockedAt = account.lockedAt;
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
      authPWVersion2,
      clientSalt,
      sessionToken: hasSessionToken,
      recoveryKeyId,
      wrapKbVersion2,
    } = request.payload as any;
    let wrapKb = (request.payload as any).wrapKb;
    let account: any,
      sessionToken: any,
      keyFetchToken: any,
      keyFetchTokenVersion2: any,
      verifyHash: any,
      verifyHashVersion2: any,
      wrapWrapKb: any,
      wrapWrapKbVersion2: any,
      password: any,
      password2: any,
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

      if (authPWVersion2) {
        password2 = new this.Password(
          authPWVersion2,
          authSalt,
          this.config.verifierVersion,
          2
        );
        verifyHashVersion2 = await password2.verifyHash();
      }

      if (recoveryKeyId) {
        // We have the previous kB, just re-wrap it with the new password.
        if (authPWVersion2) {
          wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
        }
        wrapWrapKb = await password.wrap(wrapKb);
        keysHaveChanged = false;
      } else {
        if (authPWVersion2) {
          // For v2 credentials, the client will supply a new wrapKbs. This is to ensure
          // that both wrapKb and wrapKbVersion2 can derive the same kB. It is up to the client
          // to ensure this!
          wrapWrapKb = await password.wrap(wrapKb);
          wrapWrapKbVersion2 = await password2.wrap(wrapKbVersion2);
          keysHaveChanged = true;
        } else {
          // We need to regenerate kB and wrap it with the new password.
          wrapWrapKb = await random.hex(32);
          wrapKb = await password.unwrap(wrapWrapKb);
          keysHaveChanged = true;
        }
      }
      // db.resetAccount() deletes all the devices saved in the account,
      // so grab the list to notify before we call it.
      const devicesToNotify = await request.app.devices;
      // Reset the account, and delete any other outstanding account-related tokens.
      await this.db.resetAccount(accountResetToken, {
        authSalt,
        clientSalt,
        verifyHash,
        verifyHashVersion2,
        wrapWrapKb,
        wrapWrapKbVersion2,
        verifierVersion: password.version,
        keysHaveChanged,
      });
      // Notify various interested parties about this password reset.
      // These can all safely happen in parallel.
      account = await this.db.account(accountResetToken.uid);
      await Promise.all([
        this.push.notifyPasswordReset(account.uid, devicesToNotify),
        request.emitMetricsEvent('account.reset', {
          uid: account.uid,
        }),
        (() => {
          if (verifyHashVersion2) {
            return request.emitMetricsEvent('account.reset.credentials.v2', {
              uid: account.uid,
            });
          } else {
            return request.emitMetricsEvent('account.reset.credentials.v1', {
              uid: account.uid,
            });
          }
        })(),
        this.glean.resetPassword.accountReset(request, { uid: account.uid }),
        this.glean.resetPassword.createNewSuccess(request, {
          uid: account.uid,
        }),
        recoveryKeyId
          ? this.glean.resetPassword.recoveryKeyCreatePasswordSuccess(request, {
              uid: account.uid,
            })
          : Promise.resolve(),
        this.log.notifyAttachedServices('reset', request, {
          uid: account.uid,
          generation: account.verifierSetAt,
        }),
        (async () => {
          await this.profileClient.deleteCache(account.uid);
          await this.log.notifyAttachedServices('profileDataChange', request, {
            uid: account.uid,
          });
        })(),
        this.oauth.removeTokensAndCodes(account.uid),
        this.customs.reset(request, account.email),
      ]);
    };

    const recoveryKeyDeleteAndEmailNotification = async () => {
      // If the password was reset with an account recovery key, then we explicitly delete the
      // account recovery key and send an email that the account was reset with it.
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

        if (authPWVersion2) {
          keyFetchTokenVersion2 = await this.db.createKeyFetchToken({
            uid: account.uid,
            kA: account.kA,
            wrapKb: wrapKbVersion2,
            emailVerified: account.primaryEmail.isVerified,
            tokenVerificationId,
          });
        }

        return await request.propagateMetricsContext(
          accountResetToken,
          keyFetchToken
        );
      }
    };

    const recordSecurityEvent = () => {
      this.accountEventsManager.recordSecurityEvent(this.db, {
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
        if (keyFetchToken) {
          response.keyFetchToken = keyFetchToken.data;
        }
        if (keyFetchTokenVersion2) {
          response.keyFetchTokenVersion2 = keyFetchToken.data2;
        }
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

  async getCredentialsStatus(request: AuthRequest) {
    this.log.begin('Account.getCredentialsStatus', request);

    const email = (request.payload as any).email;
    await this.customs.check(request, email, 'getCredentialsStatus');

    const accountRecord = await this.db.accountRecord(email);

    if (accountRecord.disabledAt) {
      throw error.cannotLoginWithEmail();
    }

    if (accountRecord.verifierSetAt <= 0) {
      throw error.cannotLoginWithEmail();
    }

    const response = {
      currentVersion: accountRecord.clientSalt ? 'v2' : 'v1',
      clientSalt: accountRecord.clientSalt
        ? accountRecord.clientSalt
        : undefined,
      upgradeNeeded: !accountRecord.wrapWrapKbVersion2,
    };
    return response;
  }

  async destroy(request: AuthRequest) {
    this.log.begin('Account.destroy', request);

    const { authPW, email: emailAddress } = request.payload as any;

    await this.customs.check(request, emailAddress, 'accountDestroy');

    let accountRecord: Account;
    try {
      accountRecord = await this.db.accountRecord(emailAddress);
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
    const hasTotpToken = await this.otpUtils.hasTotpToken(accountRecord);

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
    // delete the account. If they have a password set, we verify it here. Users
    // that don't have a password set will be able to delete their account without
    // this step.
    if (accountRecord.verifierSetAt > 0) {
      const password = new this.Password(
        authPW,
        accountRecord.authSalt,
        accountRecord.verifierVersion
      );

      const isMatchingPassword = await this.signinUtils.checkPassword(
        accountRecord,
        password,
        request.app.clientAddress
      );
      if (!isMatchingPassword) {
        throw error.incorrectPassword(accountRecord.email, emailAddress);
      }
    }

    await this.accountDeleteManager.quickDelete(
      accountRecord.uid,
      ReasonForDeletion.UserRequested
    );

    const result = await getAccountCustomerByUid(accountRecord.uid);
    await this.accountTasks.deleteAccount({
      uid: accountRecord.uid,
      customerId: result?.stripeCustomerId,
      reason: ReasonForDeletion.UserRequested,
    });

    this.glean.account.deleteComplete(request, { uid: accountRecord.uid });

    return {};
  }

  async getAccount(request: AuthRequest) {
    this.log.begin('Account.get', request);

    const { uid } = request.auth.credentials;

    let webSubscriptions: Awaited<WebSubscription[]> = [];
    let iapGooglePlaySubscriptions: Awaited<PlayStoreSubscription[]> = [];
    let iapAppStoreSubscriptions: Awaited<AppStoreSubscription[]> = [];

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
          iapGooglePlaySubscriptions = (
            await playSubscriptions.getSubscriptions(uid as string)
          ).map(playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO);
        }

        if (this.config.subscriptions?.appStore?.enabled) {
          const appStoreSubscriptions = Container.get(AppStoreSubscriptions);
          iapAppStoreSubscriptions = (
            await appStoreSubscriptions.getSubscriptions(uid as string)
          ).map(appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO);
        }
      } catch (err) {
        if (err.errno !== error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER) {
          throw err;
        }
      }
    }

    return {
      subscriptions: [
        ...iapGooglePlaySubscriptions,
        ...iapAppStoreSubscriptions,
        ...webSubscriptions,
      ],
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
  stripeHelper: StripeHelper,
  pushbox: any,
  glean: ReturnType<typeof gleanMetrics>
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
    stripeHelper,
    glean
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
              authPWVersion2: validators.authPWVersion2
                .optional()
                .description(DESCRIPTION.authPWVersion2),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
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
              style: isA.string().allow('trailhead').optional(),
              verificationMethod: validators.verificationMethod
                .optional()
                .description(DESCRIPTION.verificationMethod),
              // preVerified is not available in production mode.
              ...(!(config as any).isProduction && {
                preVerified: isA.boolean(),
              }),
              atLeast18AtReg: isA
                .boolean()
                .allow(null)
                .optional()
                .description(DESCRIPTION.atLeast18AtReg),
            })
            .and('authPWVersion2', 'wrapKb', 'wrapKbVersion2', 'clientSalt'),
        },
        response: {
          schema: isA.object({
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            keyFetchTokenVersion2: isA.string().regex(HEX_STRING).optional(),
            authAt: isA.number().integer().description(DESCRIPTION.authAt),
            verificationMethod: validators.verificationMethod
              .optional()
              .description(DESCRIPTION.verificationMethod),
          }),
        },
      },
      handler: (request: AuthRequest) => accountHandler.accountCreate(request),
    },
    {
      method: 'POST',
      path: '/account/stub',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_STUB_POST,
        validate: {
          payload: isA.object({
            email: validators.email().required(),
            clientId: validators.clientId.required(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
            wantsSetupToken: isA.boolean().optional(),
          }),
        },
      },
      handler: (request: AuthRequest) => accountHandler.accountStub(request),
    },
    {
      method: 'POST',
      path: '/account/finish_setup',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_FINISH_SETUP_POST,
        validate: {
          payload: isA
            .object({
              token: validators.jwt,
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              authPWVersion2: validators.authPWVersion2
                .optional()
                .description(DESCRIPTION.authPWVersion2),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
            })
            .and('authPWVersion2', 'wrapKbVersion2', 'clientSalt'),
        },
      },
      handler: (request: AuthRequest) => accountHandler.finishSetup(request),
    },
    {
      method: 'POST',
      path: '/account/set_password',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_SET_PASSWORD_POST,
        auth: {
          mode: 'required',
          payload: false,
          strategy: 'oauthToken',
        },
        validate: {
          query: isA.object({
            sendVerifyEmail: isA
              .boolean()
              .optional()
              .default(true)
              .description(DESCRIPTION.sendVerifyEmail),
          }),
          payload: isA
            .object({
              authPW: validators.authPW.description(DESCRIPTION.authPW),
              authPWVersion2: validators.authPW
                .optional()
                .description(DESCRIPTION.authPWVersion2),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
              metricsContext: METRICS_CONTEXT_SCHEMA,
              service: validators.service.description(DESCRIPTION.service),
            })
            .and('authPWVersion2', 'wrapKb', 'wrapKbVersion2', 'clientSalt'),
        },
        response: {
          schema: isA.object({
            sessionToken: isA
              .string()
              .regex(HEX_STRING)
              .required()
              .description(DESCRIPTION.sessionToken),
            uid: isA
              .string()
              .regex(HEX_STRING)
              .required()
              .description(DESCRIPTION.uid),
          }),
        },
      },
      handler: (request: AuthRequest) => accountHandler.setPassword(request),
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
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
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
          }),
        },
        response: {
          schema: isA.object({
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            keyFetchToken: isA.string().regex(HEX_STRING).optional(),
            keyFetchTokenVersion2: isA.string().regex(HEX_STRING).optional(),
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
          }),
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
          payload: isA.object({
            email: validators.email().required(),
            thirdPartyAuthStatus: isA.boolean().optional().default(false),
            checkDomain: isA.optional(),
          }),
        },
        response: {
          schema: isA.object({
            exists: isA.boolean().required(),
            hasLinkedAccount: isA.boolean().optional(),
            hasPassword: isA.boolean().optional(),
            invalidDomain: isA.boolean().optional(),
          }),
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
          schema: isA.object({
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
            atLeast18AtReg: isA.boolean().allow(null),
            accountLockedAt: isA.number().optional().allow(null),
            accountDisabledAt: isA.number().optional().allow(null),
          }),
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
          schema: isA.object({
            bundle: isA
              .string()
              .regex(HEX_STRING)
              .description(DESCRIPTION.bundle),
          }),
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
              authPWVersion2: validators.authPW
                .optional()
                .description(DESCRIPTION.authPW),
              wrapKb: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKb),
              wrapKbVersion2: validators.wrapKb
                .optional()
                .description(DESCRIPTION.wrapKbVersion2),
              clientSalt: validators.clientSalt
                .optional()
                .description(DESCRIPTION.clientSalt),
              recoveryKeyId: validators.recoveryKeyId
                .optional()
                .description(DESCRIPTION.recoveryKeyId),
              sessionToken: isA
                .boolean()
                .optional()
                .description(DESCRIPTION.sessionToken),
            })
            .custom((value, helper) => {
              if (value.authPWVersion2 && !value.wrapKb) {
                return helper.error('any.invalid');
              }
              if (value.authPWVersion2 && !value.wrapKbVersion2) {
                return helper.error('any.invalid');
              }
              if (value.authPWVersion2 && !value.clientSalt) {
                return helper.error('any.invalid');
              }
              if (
                !value.authPWVersion2 &&
                value.recoveryKeyId &&
                !value.wrapKb
              ) {
                return helper.error('any.invalid');
              }
              if (
                !value.authPWVersion2 &&
                value.wrapKb &&
                !value.recoveryKeyId
              ) {
                return helper.error('any.invalid');
              }
              return value;
            }),
        },
      },
      handler: async (request: AuthRequest) => accountHandler.reset(request),
    },
    {
      method: 'POST',
      path: '/account/destroy',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_DESTROY_POST,
        auth: {
          strategy: 'sessionToken',
          payload: 'required',
        },
        validate: {
          payload: isA.object({
            email: validators.email().required().description(DESCRIPTION.email),
            authPW: validators.authPW.description(DESCRIPTION.authPW),
          }),
        },
      },
      handler: (request: AuthRequest) => accountHandler.destroy(request),
    },
    {
      method: 'POST',
      path: '/account/credentials/status',
      options: {
        ...ACCOUNT_DOCS.ACCOUNT_CREDENTIALS_STATUS,
        validate: {
          payload: isA.object({
            email: validators.email().description(DESCRIPTION.email),
          }),
        },
        response: {
          schema: isA.object({
            currentVersion: isA.string().allow('v1', 'v2'),
            clientSalt: validators.clientSalt.optional(),
            upgradeNeeded: isA.boolean(),
          }),
        },
      },
      handler: (request: AuthRequest) =>
        accountHandler.getCredentialsStatus(request),
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
          schema: isA.object({
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
                validators.subscriptionsGooglePlaySubscriptionValidator,
                validators.subscriptionsAppStoreSubscriptionValidator
              ),
          }),
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
