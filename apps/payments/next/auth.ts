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
      type: 'oauth',
      issuer: config.auth.issuerUrl,
      wellKnown: config.auth.wellKnownUrl,
      checks: ['state'],
      authorization: { params: { scope: 'email profile' } },
      clientId: config.auth.clientId,
      clientSecret: config.auth.clientSecret,
      token: config.auth.tokenUrl,
      userinfo: config.auth.userinfoUrl,
    },
  ],
  callbacks: {
    async session(params: any) {
      params.session.user.id = params.token.fxaUid;
      return params.session;
    },
    async jwt({ token, profile }) {
      // Note profile is only defined once after user sign in.
      const fxaUid = token.fxaUid || profile?.uid;
      return {
        ...token,
        fxaUid,
      };
    },
  },
});
