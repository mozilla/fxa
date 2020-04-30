/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import Redis from 'ioredis';
import { OAuthUser } from './types';
import { getTokenId } from '../oauth';
import { redisContainerToken, configContainerToken } from '../constants';
import { AppConfig } from '../../config';

const Config = Container.get(configContainerToken);
const redis = Container.get(redisContainerToken);
const allowedClients = Config.get('oauth.allowedClients') as string[];

export default async function fetchUserByToken(
  authorizationHeader: string
): Promise<OAuthUser | null> {
  // The value of the header has already been validated.
  const token: string = authorizationHeader.split(' ', 2)[1];
  const tokenId = getTokenId(token);
  const tokenString = await redis.get(`${tokenId}`);
  if (tokenString) {
    const tokenInfo = JSON.parse(tokenString);

    if (allowedClients.includes(tokenInfo.clientId)) {
      return { userId: tokenInfo.userId, email: tokenInfo.email };
    }
  }

  return null;
}

export type UserLookupFn = typeof fetchUserByToken;
