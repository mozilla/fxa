/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthLogger, AuthRequest } from '../types';
import { ConfigType } from '../../config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as uuid from 'uuid';
import * as random from '../crypto/random';
import validators from './validators';

const error = require('../error');

const MS_ONE_HOUR = 1000 * 60 * 60;

export class LinkedAccountHandler {
  private googleAuthClient?: OAuth2Client;
  private tokenCodeLifetime: number;

  constructor(
    private log: AuthLogger,
    private db: any,
    private config: ConfigType,
    private mailer: any,
  ) {
    const tokenCodeConfig = config.signinConfirmation.tokenVerificationCode;
    this.tokenCodeLifetime =
      (tokenCodeConfig?.codeLifetime as unknown as number) ?? MS_ONE_HOUR;

    if (config.googleAuthConfig && config.googleAuthConfig.clientId) {
      this.googleAuthClient = new OAuth2Client(
        config.googleAuthConfig.clientId
      );
    }
  }

  async loginOrCreateAccount(request: AuthRequest) {
    const requestPayload = request.payload as any;

    if (!this.googleAuthClient) {
      throw error.thirdPartyAccountError();
    }

    const { clientId, clientSecret, redirectUri } =
      this.config.googleAuthConfig;

    // Currently, FxA supports creating an account via Google
    // by providing an oauth code that can be exchanged for an
    // `id_token` or being provided the `id_token` directly.
    let idToken;
    const code = requestPayload.code;
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
        idToken = res.data['id_token'];
      } catch (err) {
        this.log.error('linked_account.code_exchange_error', err);
        throw error.thirdPartyAccountError();
      }
    }

    const verifiedToken = await this.googleAuthClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = verifiedToken.getPayload();
    if (!payload) {
      throw error.thirdPartyAccountError();
    }
    const userid = payload['sub'];

    let accountRecord;
    let googleRecord = await this.db.getGoogleId(userid);

    if (!googleRecord) {
      const email = payload.email;
      try {
        // This is a new Google account linking an existing FxA account
        accountRecord = await this.db.accountRecord(payload.email);
        await this.db.createLinkedGoogleAccount(accountRecord.uid, userid);

        const geoData = request.app.geo;
        const ip = request.app.clientAddress;
        const { deviceId, flowId, flowBeginTime } = await request.app.metricsContext;
        const emailOptions = {
          acceptLanguage: request.app.acceptLanguage,
          deviceId,
          flowId,
          flowBeginTime,
          ip,
          location: geoData.location,
          providerName: 'Google',
          timeZone: geoData.timeZone,
          uaBrowser: request.app.ua.browser,
          uaBrowserVersion: request.app.ua.browserVersion,
          uaOS: request.app.ua.os,
          uaOSVersion: request.app.ua.osVersion,
          uaDeviceType: request.app.ua.deviceType,
          uid: accountRecord.uid,
        }
        await this.mailer.sendPostAddLinkedAccountEmail(
          accountRecord.emails,
          accountRecord,
          emailOptions,
        );
      } catch (err) {
        this.log.trace(
          'Account.login.sendPostAddLinkedAccountNotification.error',
          {
            error: err,
          }
        )

        if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
          throw err;
        }
        // This is a new Google user creating a new FxA account, we
        // create the FxA account with random password and mark email
        // verified
        const emailCode = await random.hex(16);
        const authSalt = await random.hex(32);
        const [kA, wrapWrapKb] = await random.hex(32, 32);
        accountRecord = await this.db.createAccount({
          uid: uuid.v4({}, Buffer.alloc(16)).toString('hex'),
          createdAt: Date.now(),
          email,
          emailCode,
          emailVerified: true,
          kA,
          wrapWrapKb,
          authSalt,
          verifierVersion: this.config.verifierVersion,
          verifyHash: Buffer.alloc(32).toString('hex'),
          verifierSetAt: 0,
          locale: request.app.acceptLanguage,
        });
        await this.db.createLinkedGoogleAccount(accountRecord.uid, userid);
      }
    } else {
      // This is an existing Google user and existing FxA user
      accountRecord = await this.db.account(googleRecord.uid);
    }

    const sessionTokenOptions = {
      uid: accountRecord.uid,
      email: accountRecord.primaryEmail.email,
      emailCode: accountRecord.primaryEmail.emailCode,
      emailVerified: accountRecord.primaryEmail.isVerified,
      verifierSetAt: accountRecord.verifierSetAt,
      mustVerify: false,
      tokenVerificationCodeExpiresAt: Date.now() + this.tokenCodeLifetime,
    };

    const sessionToken = await this.db.createSessionToken(sessionTokenOptions);

    return {
      uid: sessionToken.uid,
      sessionToken: sessionToken.data,
    };
  }

  async unlinkAccount(request: AuthRequest) {
    if (!this.googleAuthClient) {
      throw error.thirdPartyAccountError();
    }
    const uid = request.auth.credentials.uid;
    if ((request.payload as any).provider.toLowerCase() === 'google') {
      // TODO: here we'll also delete any session tokens created via a google login
      await this.db.deleteLinkedGoogleAccount(uid);
    }
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
) => {
  const handler = new LinkedAccountHandler(log, db, config, mailer);

  return [
    {
      method: 'POST',
      path: '/linked_account/login',
      options: {
        validate: {
          payload: {
            idToken: validators.thirdPartyIdToken,
            provider: validators.thirdPartyProvider,
            code: validators.thirdPartyOAuthCode,
          },
        },
      },
      handler: async (request: AuthRequest) =>
        handler.loginOrCreateAccount(request),
    },
    {
      method: 'POST',
      path: '/linked_account/unlink',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            provider: validators.thirdPartyProvider,
          },
        },
      },
      handler: (request: AuthRequest) => handler.unlinkAccount(request),
    },
  ];
};

module.exports = {
  linkedAccountRoutes,
  LinkedAccountHandler,
};
