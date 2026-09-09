/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { ConfigType } from '../../../config';

/**
 * Signs an MFA access token for one scope, bound to one session.
 *
 * @param uid - Hex-encoded uid; becomes `sub`.
 * @param scope - Bare action name; signed as `mfa:<scope>`.
 * @param sessionTokenId - Becomes `stid`.
 * @param credentialId - Stored `passkeys.credentialId`; becomes `cid`, and is
 *   left out of the claims when not given.
 * @returns The signed JWT.
 */
export function signMfaToken(
  config: ConfigType,
  {
    uid,
    scope,
    sessionTokenId,
    credentialId,
  }: {
    uid: string;
    scope: string;
    sessionTokenId: string;
    credentialId?: string;
  }
): string {
  const claims = {
    sub: uid,
    scope: [`mfa:${scope}`],
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(),
    stid: sessionTokenId,
    ...(credentialId && { cid: credentialId }),
  };

  return jwt.sign(claims, config.mfa.jwt.secretKey, {
    algorithm: 'HS256' as jwt.Algorithm,
    expiresIn: config.mfa.jwt.expiresInSec,
    audience: config.mfa.jwt.audience,
    issuer: config.mfa.jwt.issuer,
  } as jwt.SignOptions);
}
