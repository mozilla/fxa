/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthLogger, AuthRequest, ProfileClient } from '../types';
import { ConfigType } from '../../config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as uuid from 'uuid';
import * as random from '../crypto/random';
import * as jose from 'jose';
import validators from './validators';
import {
  Provider,
  PROVIDER,
  PROVIDER_NAME,
} from 'fxa-shared/db/models/auth/linked-account';
import THIRD_PARTY_AUTH_DOCS from '../../docs/swagger/third-party-auth-api';
import isA from 'joi';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import error from '../error';
import { schema as METRICS_CONTEXT_SCHEMA } from '../metrics/context';
import {
  getGooglePublicKey,
  getApplePublicKey,
  isValidClientId,
  validateSecurityToken,
  googleEventHandlers,
  handleGoogleOtherEventType,
  GoogleJWTSETPayload,
  AppleJWTSETPayload,
  appleEventHandlers,
  AppleSETEvent,
} from './utils/third-party-events';
import { gleanMetrics } from '../metrics/glean';

const HEX_STRING = validators.HEX_STRING;

const APPLE_AUD = 'https://appleid.apple.com';

export class LinkedAccountHandler {
  private googleAuthClient?: OAuth2Client;
  private otpUtils: any;
  private goooglePublicKey: any;
  private applePublicKey: any;

  constructor(
    private log: AuthLogger,
    private db: any,
    private config: ConfigType,
    private mailer: any,
    private profile: ProfileClient,
    private statsd: { increment: (value: string) => void },
    private glean: ReturnType<typeof gleanMetrics>
  ) {
    if (config.googleAuthConfig && config.googleAuthConfig.clientId) {
      this.googleAuthClient = new OAuth2Client(
        config.googleAuthConfig.clientId
      );
    }
    this.otpUtils = require('./utils/otp')(log, config, db);
  }

  // As generated tokens expire after 6 months (180 days) per Apple documentation,
  // generate JWT for client secret on each request instead
  async generateAppleClientSecret(
    clientId: string,
    keyId: string,
    privateKey: string,
    teamId: string
  ) {
    const ecPrivateKey = await jose.importPKCS8(privateKey, 'ES256');

    const jwt = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId })
      .setIssuedAt()
      .setIssuer(teamId)
      .setAudience(APPLE_AUD)
      .setExpirationTime('1m')
      .setSubject(clientId)
      .sign(ecPrivateKey);

    return jwt;
  }

  async handleAppleSET(request: AuthRequest) {
    this.statsd.increment('handleAppleSET.received');

    // Apple does not set the JWT header, instead they pass it as
    // in a payload object.
    const { payload: token } = request.payload as any;

    if (!this.applePublicKey) {
      this.applePublicKey = await getApplePublicKey(token);
    }

    try {
      const jwtPayload = (await validateSecurityToken(
        token,
        this.config.appleAuthConfig.securityEventsClientIds,
        this.applePublicKey.pem,
        APPLE_AUD
      )) as AppleJWTSETPayload;

      const { events } = jwtPayload;
      const parsedEventData: AppleSETEvent = JSON.parse(events);

      this.statsd.increment('handleAppleSET.decoded');

      const eventType = parsedEventData.type;

      if (appleEventHandlers[eventType as keyof typeof appleEventHandlers]) {
        this.statsd.increment(`handleAppleSET.processing.${eventType}`);
        this.log.debug('handleAppleSET.processing', {
          eventType,
        });
        await appleEventHandlers[eventType as keyof typeof appleEventHandlers](
          parsedEventData,
          this.log,
          this.db
        );
        this.statsd.increment(`handleAppleSET.processed.${eventType}`);
        this.log.debug(`handleAppleSET.processed`, {
          eventType,
        });
      } else {
        this.statsd.increment(`handleAppleSET.unknownEventType.${eventType}`);
      }
    } catch (err) {
      this.statsd.increment('handleAppleSET.validationError');
      throw err;
    }

    return {};
  }

  async handleGoogleSET(request: AuthRequest) {
    this.statsd.increment('handleGoogleSET.received');

    const tokenBuffer = request.payload as ArrayBuffer;
    const token = tokenBuffer.toString();

    if (!this.goooglePublicKey) {
      this.goooglePublicKey = await getGooglePublicKey(token);
    }

    try {
      // We should ignore events from other clients.
      if (!isValidClientId(token, this.config.googleAuthConfig.clientId)) {
        this.statsd.increment('handleGoogleSET.mismatchClientId');
        this.log.debug('handleGoogleSET.mismatchClientId', {
          clientId: this.config.googleAuthConfig.clientId,
        });
        return {};
      }

      const jwtPayload = (await validateSecurityToken(
        token,
        this.config.googleAuthConfig.securityEventsClientIds,
        this.goooglePublicKey.pem,
        this.goooglePublicKey.issuer
      )) as GoogleJWTSETPayload;
      this.statsd.increment('handleGoogleSET.decoded');

      // Process each event type
      for (const eventType in jwtPayload.events) {
        this.statsd.increment(`handleGoogleSET.processing.${eventType}`);
        this.log.debug('handleGoogleSET.processing', {
          eventType,
        });
        if (
          googleEventHandlers[eventType as keyof typeof googleEventHandlers]
        ) {
          await googleEventHandlers[
            eventType as keyof typeof googleEventHandlers
          ](jwtPayload.events[eventType], this.log, this.db);
          this.statsd.increment(`handleGoogleSET.processed.${eventType}`);
          this.log.debug('handleGoogleSET.processed', {
            eventType,
          });
        } else {
          // Log that an unknown event type was received and ignore it
          handleGoogleOtherEventType(eventType, this.log);
          this.statsd.increment(
            `handleGoogleSET.unknownEventType.${eventType}`
          );
        }
      }
    } catch (err) {
      this.statsd.increment('handleGoogleSET.validationError');
      this.log.debug('handleGoogleSET.validationError', {
        err,
      });
      throw err;
    }

    return {};
  }

  async loginOrCreateAccount(request: AuthRequest) {
    const requestPayload = request.payload as any;

    const provider = requestPayload.provider as Provider;
    const providerId = PROVIDER[provider];
    const service = requestPayload.service;

    // Currently, FxA supports creating a linked account via the oauth authorization flow
    // This flow returns an `id_token` which is used create/get FxA account.
    let idToken: any;
    const code = requestPayload.code;

    const { deviceId, flowId, flowBeginTime } = await request.app
      .metricsContext;

    switch (provider) {
      case 'google': {
        if (!this.googleAuthClient) {
          throw error.thirdPartyAccountError();
        }

        const { clientId, clientSecret, redirectUri } =
          this.config.googleAuthConfig;
        let rawIdToken;
        if (code) {
          const data = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          };

          try {
            const res = await axios.post(
              this.config.googleAuthConfig.tokenEndpoint,
              data
            );
            // We currently only use the `id_token` after completing the
            // authorization code exchange. In the future we could store a
            // refresh token to do other things like revoking sessions.
            //
            // See https://developers.google.com/identity/protocols/oauth2/openid-connect#exchangecode
            rawIdToken = res.data['id_token'];

            const verifiedToken = await this.googleAuthClient.verifyIdToken({
              idToken: rawIdToken,
              audience: clientId,
            });

            idToken = verifiedToken.getPayload();
          } catch (err) {
            this.log.error('linked_account.code_exchange_error', err);
            throw error.thirdPartyAccountError();
          }
        }
        break;
      }
      case 'apple': {
        const { clientId, keyId, privateKey, teamId } =
          this.config.appleAuthConfig;

        if (!clientId || !keyId || !privateKey || !teamId) {
          throw error.thirdPartyAccountError();
        }

        let rawIdToken;
        const clientSecret = await this.generateAppleClientSecret(
          clientId,
          keyId,
          privateKey,
          teamId
        );
        const code = requestPayload.code;
        if (code) {
          const data = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
          };

          try {
            const res = await axios.post(
              this.config.appleAuthConfig.tokenEndpoint,
              new URLSearchParams(data).toString()
            );
            rawIdToken = res.data['id_token'];
            idToken = jose.decodeJwt(rawIdToken);
          } catch (err) {
            this.log.error('linked_account.code_exchange_error', err);
            throw error.thirdPartyAccountError();
          }
        }
        break;
      }
    }

    if (!idToken) {
      throw error.thirdPartyAccountError();
    }

    const userid = idToken.sub;
    const email = idToken.email;
    const name = idToken.name;

    let accountRecord;
    const linkedAccountRecord = await this.db.getLinkedAccount(
      userid,
      provider
    );

    if (!linkedAccountRecord) {
      // Something has gone wrong! We shouldn't hit a case where we have an unlinked without
      // an email set in the idToken. Failing hard and fast. Logging more info
      if (!email) {
        this.log.error('linked_account.no_email_in_id_token', {
          provider,
          userid,
          name,
        });
        throw error.thirdPartyAccountError();
      }

      try {
        // This is a new third party account linking an existing FxA account
        accountRecord = await this.db.accountRecord(email);
        await this.db.createLinkedAccount(accountRecord.uid, userid, provider);

        if (name) {
          await this.profile.updateDisplayName(accountRecord.uid, name);
        }

        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        const emailOptions = {
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          providerName: PROVIDER_NAME[provider],
          timeZone: geoData.timeZone,
          uaBrowser: request.app.ua.browser,
          uaBrowserVersion: request.app.ua.browserVersion,
          uaOS: request.app.ua.os,
          uaOSVersion: request.app.ua.osVersion,
          uaDeviceType: request.app.ua.deviceType,
          uid: accountRecord.uid,
        };
        await this.mailer.sendPostAddLinkedAccountEmail(
          accountRecord.emails,
          accountRecord,
          emailOptions
        );
        request.setMetricsFlowCompleteSignal('account.login', 'login');
        switch (provider) {
          case 'google':
            await this.glean.thirdPartyAuth.googleLoginComplete(request, {
              reason: 'linking',
            });
            break;
          case 'apple':
            await this.glean.thirdPartyAuth.appleLoginComplete(request, {
              reason: 'linking',
            });
            break;
        }
        await request.emitMetricsEvent('account.login', {
          uid: accountRecord.uid,
          deviceId,
          flowId,
          flowBeginTime,
          service,
        });
      } catch (err) {
        this.log.trace(
          'Account.login.sendPostAddLinkedAccountNotification.error',
          {
            error: err,
          }
        );

        if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
          throw err;
        }
        // This is a new user creating a new FxA account, we
        // create the FxA account with random password and mark email
        // verified
        const emailCode = await random.hex(16);
        const authSalt = await random.hex(32);
        const [kA, wrapWrapKb, wrapWrapKbVersion2] = await random.hex(
          32,
          32,
          32
        );
        accountRecord = await this.db.createAccount({
          uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
          createdAt: Date.now(),
          email,
          emailCode,
          emailVerified: true,
          kA,
          wrapWrapKb,
          wrapWrapKbVersion2,
          authSalt,
          // This will be set with a real value when the users sets an account password.
          clientSalt: undefined,
          verifierVersion: this.config.verifierVersion,
          verifyHash: Buffer.alloc(32).toString('hex'),
          verifyHashVersion2: Buffer.alloc(32).toString('hex'),
          verifierSetAt: 0,
          locale: request.app.acceptLanguage,
        });
        await this.db.createLinkedAccount(accountRecord.uid, userid, provider);

        if (name) {
          await this.profile.updateDisplayName(accountRecord.uid, name);
        }
        // Currently, we treat accounts created from a linked account as a new
        // registration and emit the correspond event. Note that depending on
        // where might not be a top of funnel for this completion event.
        request.setMetricsFlowCompleteSignal(
          'account.verified',
          'registration'
        );
        await request.emitMetricsEvent('account.verified', {
          uid: accountRecord.uid,
          deviceId,
          flowId,
          flowBeginTime,
          service,
        });
        this.glean.registration.complete(request, { uid: accountRecord.uid });
      }
    } else {
      // This is an existing user and existing FxA user
      accountRecord = await this.db.account(linkedAccountRecord.uid);
      if (service === 'sync') {
        request.setMetricsFlowCompleteSignal('account.signed', 'login');
      } else {
        request.setMetricsFlowCompleteSignal('account.login', 'login');
      }
      await request.emitMetricsEvent('account.login', {
        uid: accountRecord.uid,
        deviceId,
        flowId,
        flowBeginTime,
        service,
      });
      switch (provider) {
        case 'google':
          await this.glean.thirdPartyAuth.googleLoginComplete(request);
          break;
        case 'apple':
          await this.glean.thirdPartyAuth.appleLoginComplete(request);
          break;
      }
    }

    let verificationMethod,
      mustVerifySession = false,
      tokenVerificationId = undefined;
    const hasTotpToken = await this.otpUtils.hasTotpToken(accountRecord);
    if (hasTotpToken) {
      mustVerifySession = true;
      tokenVerificationId = await random.hex(16);
      verificationMethod = 'totp-2fa';
    }

    const sessionTokenOptions = {
      uid: accountRecord.uid,
      email: accountRecord.primaryEmail.email,
      emailCode: accountRecord.primaryEmail.emailCode,
      emailVerified: accountRecord.primaryEmail.isVerified,
      verifierSetAt: accountRecord.verifierSetAt,
      mustVerify: mustVerifySession,
      tokenVerificationId,
      uaBrowser: request.app.ua.browser,
      uaBrowserVersion: request.app.ua.browserVersion,
      uaOS: request.app.ua.os,
      uaOSVersion: request.app.ua.osVersion,
      uaDeviceType: request.app.ua.deviceType,
      uaFormFactor: request.app.ua.formFactor,
      providerId,
    };

    const sessionToken = await this.db.createSessionToken(sessionTokenOptions);

    return {
      uid: sessionToken.uid,
      sessionToken: sessionToken.data,
      providerUid: userid,
      email,
      ...(verificationMethod ? { verificationMethod } : {}),
    };
  }

  async unlinkAccount(request: AuthRequest) {
    if (!this.googleAuthClient) {
      throw error.thirdPartyAccountError();
    }
    const uid = request.auth.credentials.uid;
    const provider = (request.payload as any).provider.toLowerCase();
    // TODO: here we'll also delete any session tokens created via a google login
    await this.db.deleteLinkedAccount(uid, provider);
    return {
      success: true,
    };
  }
}

export const linkedAccountRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  mailer: any,
  profile: ProfileClient,
  statsd: any,
  glean: ReturnType<typeof gleanMetrics>
) => {
  const handler = new LinkedAccountHandler(
    log,
    db,
    config,
    mailer,
    profile,
    statsd,
    glean
  );

  return [
    {
      method: 'POST',
      path: '/linked_account/login',
      options: {
        ...THIRD_PARTY_AUTH_DOCS.LINKED_ACCOUNT_LOGIN_POST,
        validate: {
          payload: isA.object({
            idToken: validators.thirdPartyIdToken,
            provider: validators.thirdPartyProvider,
            code: validators.thirdPartyOAuthCode,
            metricsContext: METRICS_CONTEXT_SCHEMA,
            service: validators.service.optional(),
          }),
        },
        response: {
          schema: isA.object({
            uid: isA.string().regex(HEX_STRING).required(),
            sessionToken: isA.string().regex(HEX_STRING).required(),
            providerUid: isA
              .string()
              .required()
              .description(DESCRIPTION.providerUid),
            email: isA.string().required().description(DESCRIPTION.email),
            verificationMethod: isA
              .string()
              .optional()
              .description(DESCRIPTION.verificationMethod),
          }),
        },
      },
      handler: async (request: AuthRequest) =>
        handler.loginOrCreateAccount(request),
    },
    {
      method: 'POST',
      path: '/linked_account/unlink',
      options: {
        ...THIRD_PARTY_AUTH_DOCS.LINKED_ACCOUNT_UNLINK_POST,
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: isA.object({
            provider: validators.thirdPartyProvider,
          }),
        },
        response: {
          schema: isA.object({
            success: isA.boolean().required(),
          }),
        },
      },
      handler: (request: AuthRequest) => handler.unlinkAccount(request),
    },
    {
      method: 'POST',
      path: '/linked_account/webhook/google_event_receiver',
      options: {
        payload: {
          // Security events use the content type application/secevent+jwt,
          // It isn't clearly documented, but the payload is a JWT buffer.
          parse: 'gunzip',
          allow: 'application/secevent+jwt',
        },
      },
      handler: async (request: AuthRequest) => handler.handleGoogleSET(request),
    },
    {
      method: 'POST',
      path: '/linked_account/webhook/apple_event_receiver',
      handler: async (request: AuthRequest) => handler.handleAppleSET(request),
    },
  ];
};

export default {
  linkedAccountRoutes,
  LinkedAccountHandler,
};
