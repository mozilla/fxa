/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jwt from 'jsonwebtoken';
import { signMfaToken } from './mfa-token';
import { ConfigType } from '../../../config';

const config = {
  mfa: {
    jwt: {
      secretKey: 'a-test-secret',
      expiresInSec: 600,
      audience: 'accounts.firefox.com',
      issuer: 'accounts.firefox.com',
    },
  },
} as unknown as ConfigType;

const UID = 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6';
const SESSION_TOKEN_ID = 'session-token-id';

describe('signMfaToken', () => {
  it('produces the claim set the mfa strategy verifies', () => {
    const token = signMfaToken(config, {
      uid: UID,
      scope: '2fa',
      sessionTokenId: SESSION_TOKEN_ID,
    });

    const decoded = jwt.verify(token, config.mfa.jwt.secretKey, {
      audience: config.mfa.jwt.audience,
      issuer: config.mfa.jwt.issuer,
    }) as Record<string, unknown>;

    expect(decoded).toMatchObject({
      sub: UID,
      scope: ['mfa:2fa'],
      stid: SESSION_TOKEN_ID,
    });
    expect(decoded.jti).toEqual(expect.any(String));
    expect(decoded.exp).toEqual(expect.any(Number));
  });

  it('binds the token to the given session', () => {
    const token = signMfaToken(config, {
      uid: UID,
      scope: '2fa',
      sessionTokenId: SESSION_TOKEN_ID,
    });

    const decoded = jwt.decode(token) as { stid: string };
    expect(decoded.stid).toBe(SESSION_TOKEN_ID);
  });

  it('binds the token to the asserted credential when one is given', () => {
    const token = signMfaToken(config, {
      uid: UID,
      scope: 'passkey',
      sessionTokenId: SESSION_TOKEN_ID,
      credentialId: 'cred-abc',
    });

    expect(jwt.decode(token)).toMatchObject({ cid: 'cred-abc' });
  });

  it('omits cid when no credential is given', () => {
    const token = signMfaToken(config, {
      uid: UID,
      scope: 'passkey',
      sessionTokenId: SESSION_TOKEN_ID,
    });

    expect(jwt.decode(token)).not.toHaveProperty('cid');
  });

  it('gives each token a distinct jti', () => {
    const first = jwt.decode(
      signMfaToken(config, {
        uid: UID,
        scope: '2fa',
        sessionTokenId: SESSION_TOKEN_ID,
      })
    ) as { jti: string };
    const second = jwt.decode(
      signMfaToken(config, {
        uid: UID,
        scope: '2fa',
        sessionTokenId: SESSION_TOKEN_ID,
      })
    ) as { jti: string };

    expect(first.jti).not.toBe(second.jti);
  });
});
