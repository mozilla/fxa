/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { configContainerToken, loggerContainerToken } from '../constants';

const Config = Container.get(configContainerToken);
const logger = Container.get(loggerContainerToken);
const authHeaderKey = Config.get('authHeader').toLowerCase();
const TOKEN_LENGTH = Config.get('oauth.accessToken.hexLength');
const tokenPattern = new RegExp(`^Bearer [0-9a-f]{${TOKEN_LENGTH}}$`);

/**
 *  Check the format of the authorization header value.  Used as Express
 *  middleware.
 */
export function oauthBearerTokenValidator(req: Request, res: Response, next: NextFunction) {
  if (!req.headers[authHeaderKey] || !tokenPattern.test(req.headers[authHeaderKey] as string)) {
    logger.debug('invalidToken', req.headers);
    return res.status(401).send('Invalid Token');
  }
  next();
}

/**
 * Create a SHA-256 hash of the token.
 */
export function getTokenId(token: string) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(Buffer.from(token, 'hex'));
  return sha256.digest('hex');
}
