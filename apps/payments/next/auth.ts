/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { config } from './config';
import { BaseError } from '@fxa/shared/error';

import { getApp } from '@fxa/payments/ui/server';


export class AuthError extends BaseError {
  constructor(...args: ConstructorParameters<typeof BaseError>) {
    super(...args);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  pages: {
    error: '/auth/error',
  },
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
      profile: (profile) => {
        return {
          id: profile.uid,
          name: profile.displayName,
          email: profile.email,
          image: profile.avatar,
        };
      },
      userinfo: config.auth.userinfoUrl,
    },
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = { ...session.user, ...(token.user as any) };
      return session;
    },
    async jwt({ token, profile }) {
      // Note profile is only defined once after user sign in and not on subsequent calls.
      if (profile) {
        token.user = {
          id: profile.uid,
          name: profile.displayName,
          email: profile.email,
          image: profile.avatar,
        };
      }
      return {
        ...token,
      };
    },
  },
  events: {
    async signIn() {
      getApp().getEmitterService().emit('auth', { type: 'signin' });
    },
    async signOut() {
      getApp().getEmitterService().emit('auth', { type: 'signout' });
    }
  },
  logger: {
    error(error: Error) {
      console.error(new AuthError(error.message, { cause: error }))
    }
  }
});
