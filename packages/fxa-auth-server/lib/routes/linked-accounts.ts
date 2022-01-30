/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthLogger, AuthRequest } from '../types';
import { ConfigType } from '../../config';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as uuid from 'uuid';
import * as random from '../crypto/random';

const error = require('../error');
const isA = require('@hapi/joi');

const MS_ONE_HOUR = 1000 * 60 * 60;

export class LinkedAccountHandler {
  private googleAuthClient: any;
  private tokenCodeLifetime: number;

  constructor(
    private log: AuthLogger,
    private db: any,
    private config: ConfigType
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
    const userid = payload['sub'];

    let accountRecord;
    let googleRecord = await this.db.getGoogleId(userid);

    if (!googleRecord) {
      const email = payload.email;
      try {
        // This is a new Google account linking an existing FxA account
        accountRecord = await this.db.accountRecord(payload.email);
        await this.db.createLinkedGoogleAccount(accountRecord.uid, userid);
      } catch (err) {
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
}

export const linkedAccountRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType
) => {
  const handler = new LinkedAccountHandler(log, db, config);

  return [
    {
      method: 'POST',
      path: '/linked_account/login',
      options: {
        validate: {
          payload: {
            idToken: isA.string().optional(),
            provider: isA.string().optional(),
            code: isA.string().optional(),
          },
        },
      },
      handler: async (request: AuthRequest) =>
        handler.loginOrCreateAccount(request),
    },
  ];
};

module.exports = {
  linkedAccountRoutes,
  LinkedAccountHandler,
};
