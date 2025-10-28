/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request, ResponseToolkit } from '@hapi/hapi';
import * as AppError from '../../error';
import { ConfigType } from '../../../config/index';
import * as jwt from 'jsonwebtoken';
import { Account } from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
import * as authMethods from '../../authMethods';

export type Credentials = {
  data?: string | null;
  id?: string | null;
  authKey?: string | null;
  bundleKey?: string | null;
  uid?: string | null;
  lifetime?: string | null;
  createdAt?: string | null;
  uaBrowser?: string | null;
  uaBrowserVersion?: string | null;
  uaOS?: string | null;
  uaOSVersion?: string | null;
  uaDeviceType?: string | null;
  uaFormFactor?: string | null;
  lastAccessTime?: string | null;
  deviceId?: string | null;
  deviceName?: string | null;
  deviceType?: string | null;
  deviceCreatedAt?: string | null;
  callbackURL?: string | null;
  callbackPublicKey?: string | null;
  callbackAuthKey?: string | null;
  callbackIsExpired?: string | null;
  email?: string | null;
  emailCode?: string | null;
  emailVerified?: string | null;
  verifierSetAt?: string | null;
  profileChangedAt?: string | null;
  keysChangedAt?: string | null;
  authAt?: string | null;
  locale?: string | null;
  mustVerify?: string | null;
  tokenVerificationId?: string | null;
  tokenVerified?: boolean | null;
  verificationMethod?: string | null;
  verificationMethodValue?: string | null;
  verifiedAt?: string | null;
  metricsOptOutAt?: string | null;
  providerId?: string | null;
  scope?: string[];
  authenticatorAssuranceLevel: number;
};

export interface VerifiedSessionTokenStrategyDb {
  account(uid: string): Promise<Account>;
  totpToken(uid: string): Promise<{
    verified?: boolean;
    enabled?: boolean;
  }>;
}

export const strategy = (
  config: ConfigType,
  getCredentialsFunc: (sessionTokenId: string) => Credentials,
  db: VerifiedSessionTokenStrategyDb,
  statsd: StatsD
) => {
  // TODO: FXA-12494 - This was copied from verified-session-token.js. We should
  // convert verified-session-token.js to typescript and make the following logic reusable.

  // Extract regular expressions to allow for optional skipping of certain routes for certain checks.
  // We reuse the verified session token configuration here, since it's a single point of config
  // to control which routes deviate from the default set of checks.
  const verifiedSessionTokenConfig =
    config?.authStrategies?.verifiedSessionToken;

  const skipEmailVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipEmailVerifiedCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipEmailVerifiedCheckForRoutes)
      : null;

  const skipTokenVerifiedCheckForRoutes =
    verifiedSessionTokenConfig?.skipTokenVerifiedCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipTokenVerifiedCheckForRoutes)
      : null;

  const skipAalCheckForRoutes =
    verifiedSessionTokenConfig?.skipAalCheckForRoutes
      ? new RegExp(verifiedSessionTokenConfig.skipAalCheckForRoutes)
      : null;

  return () => ({
    async authenticate(req: Request, h: ResponseToolkit) {
      const auth = req.headers.authorization;

      // Make sure auth header is at least semi valid.
      if (!auth || auth.indexOf('Bearer') !== 0) {
        throw AppError.unauthorized('Token not found');
      }

      // Extract jwt value
      const token = auth.split(' ')[1];
      if (!token) {
        throw AppError.invalidToken();
      }

      // Verify and decode the jwt
      const key = config.mfa.jwt.secretKey;
      const opts = {
        algorithm: 'HS256' as jwt.Algorithm,
        expiresIn: config.mfa.jwt.expiresInSec,
        audience: config.mfa.jwt.audience,
        issuer: config.mfa.jwt.issuer,
      };

      let decoded;
      try {
        decoded = jwt.verify(token, key, opts) as {
          sub?: string;
          scope?: string[];
        };
      } catch (err) {
        throw AppError.unauthorized('Token invalid');
      }

      // Ensure required state
      if (
        decoded.sub == null ||
        decoded.scope == null ||
        decoded.stid == null
      ) {
        throw AppError.invalidToken();
      }

      const sessionToken = await getCredentialsFunc(decoded.stid);
      if (!sessionToken) {
        throw AppError.unauthorized('Token not found');
      }

      if (sessionToken.uid == null || sessionToken.uid !== decoded.sub) {
        throw AppError.unauthorized('Token invalid');
      }

      // TODO: FXA-12494 - This was copied from verified-session-token.js. We should
      // convert verified-session-token.js to typescript and make the following logic reusable.
      const account = await db.account(sessionToken.uid);

      // 1) account email is verified
      if (!account?.primaryEmail?.isVerified) {
        if (skipEmailVerifiedCheckForRoutes?.test(req.route.path)) {
          // Important! Using req.route.path which has much lower cardinality than req.path
          statsd?.increment(
            'verified_session_token.primary_email_not_verified.skipped',
            [`path:${req.route.path}`]
          );
        } else {
          statsd?.increment(
            'verified_session_token.primary_email_not_verified.error',
            [`path:${req.route.path}`]
          );
          throw AppError.unverifiedAccount();
        }
      }

      // 2) session token is verified
      if (!sessionToken.tokenVerified) {
        if (skipTokenVerifiedCheckForRoutes?.test(req.route.path)) {
          statsd?.increment('verified_session_token.token_verified.skipped', [
            `path:${req.route.path}`,
          ]);
        } else {
          statsd?.increment('verified_session_token.token_verified.error', [
            `path:${req.route.path}`,
          ]);
          throw AppError.unverifiedSession();
        }
      }

      // 3) account AAL and session AAL match
      const accountAmr = await authMethods.availableAuthenticationMethods(
        db,
        account
      );
      const accountAal = authMethods.maximumAssuranceLevel(accountAmr);
      const sessionAal = sessionToken.authenticatorAssuranceLevel;

      if (sessionAal < accountAal) {
        if (skipAalCheckForRoutes?.test(req.route.path)) {
          statsd?.increment('verified_session_token.aal.skipped', [
            `path:${req.route.path}`,
          ]);
        } else {
          statsd?.increment('verified_session_token.aal.error', [
            `path:${req.route.path}`,
          ]);
          throw AppError.unauthorized('AAL mismatch');
        }
      }

      // Decorate session token with scope
      sessionToken.scope = decoded.scope;

      // Finalize auth
      return h.authenticated({
        // Return actual session token instance!
        credentials: sessionToken,
      });
    },
  });
};
