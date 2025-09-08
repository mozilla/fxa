/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request, ResponseToolkit } from '@hapi/hapi';
import * as AppError from '../../error';
import { ConfigType } from '../../../config/index';
import * as jwt from 'jsonwebtoken';

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
  tokenVerified?: string | null;
  verificationMethod?: string | null;
  verificationMethodValue?: string | null;
  verifiedAt?: string | null;
  metricsOptOutAt?: string | null;
  providerId?: string | null;
};

export const strategy = (
  config: ConfigType,
  getCredentialsFunc: (sessionTokenId: string) => Credentials
) => {
  return () => ({
    async authenticate(req: Request, h: ResponseToolkit) {
      const auth = req.headers.authorization;

      // Make sure auth header is at least semi valid.
      if (!auth || auth.indexOf('Bearer') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
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
        throw AppError.invalidToken(err.message);
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
        throw AppError.invalidToken('Parent session token not found!');
      }

      // Check the underlying session
      // Finalize auth
      return h.authenticated({
        credentials: {
          ...sessionToken,
          uid: decoded.sub,
          scope: decoded.scope,
        },
      });
    },
  });
};
