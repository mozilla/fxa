/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { config } from './config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    {
      id: 'fxa',
      name: 'Firefox Accounts',
      type: 'oidc',
      issuer: config.auth.issuerUrl,
      wellKnown: config.auth.wellKnownUrl,
      checks: ['pkce', 'state'],
      client: {
        token_endpoint_auth_method: 'none',
      },
      authorization: { params: { scope: 'openid email profile' } },
      clientId: config.auth.clientId,
    },
  ],
  callbacks: {
    async session(params: any) {
      params.session.user.id = params.token.sub;
      return params.session;
    },
  },
});
