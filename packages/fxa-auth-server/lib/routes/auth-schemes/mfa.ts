/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request, ResponseToolkit } from '@hapi/hapi';
import * as AppError from '../../error';
import { ConfigType } from '../../../config/index';
import * as jwt from 'jsonwebtoken';

export const strategy = (config: ConfigType) => {
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
      if (decoded.sub == null || decoded.scope == null) {
        throw AppError.invalidToken();
      }

      // Finalize auth
      return h.authenticated({
        credentials: {
          uid: decoded.sub,
          scope: decoded.scope,
        },
      });
    },
  });
};
