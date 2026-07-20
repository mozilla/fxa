/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NextAuth, { customFetch } from 'next-auth';
import { authConfig } from './auth.config';
import { AuthError } from './auth.error';
import { getSafeRedirectUrl } from './getSafeRedirectUrl';
import { singleton } from './singleton';
import { getApp } from '@fxa/payments/ui/server';

export interface UiAuthOptions {
  issuerUrl: string;
  wellKnownUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  clientId: string;
  clientSecret: string;
  contentServerUrl: string;
  paymentsNextHostedUrl: string;
}

class AuthSingleton {
  instance: ReturnType<typeof NextAuth> | null = null;
}

const SINGLETON_NAME = 'uiAuth';

export function setupAuth(opts: UiAuthOptions) {
  const store = singleton(SINGLETON_NAME, new AuthSingleton()) as AuthSingleton;
  if (store.instance) {
    return store.instance;
  }

  store.instance = NextAuth({
    ...authConfig,
    pages: {
      error: '/auth/error',
    },
    providers: [
      {
        id: 'fxa',
        name: 'Firefox Accounts',
        type: 'oauth',
        issuer: opts.issuerUrl,
        wellKnown: opts.wellKnownUrl,
        checks: ['state'],
        authorization: { params: { scope: 'email profile' } },
        clientId: opts.clientId,
        clientSecret: opts.clientSecret,
        token: opts.tokenUrl,
        // Inject WAF bypass header on server-side requests to the auth
        // server so CI traffic is not blocked by Fastly's bot detection.
        // No-op when WAF_BYPASS_TOKEN is not set (local dev / production).
        ...(() => {
          const wafToken = process.env.WAF_BYPASS_TOKEN;
          if (!process.env.CI || !wafToken) return {};
          return {
            [customFetch]: async (
              input: RequestInfo | URL,
              init?: RequestInit
            ): Promise<Response> => {
              const headers = new Headers(init?.headers);
              headers.set('fxa-ci', wafToken);
              return fetch(input, { ...init, headers });
            },
          };
        })(),
        profile: (profile) => {
          return {
            id: profile.uid,
            name: profile.displayName,
            email: profile.email,
            image: profile.avatar,
            metricsEnabled: profile.metricsEnabled ?? true,
          };
        },
        userinfo: {
          url: opts.userinfoUrl,
          request: (context: { tokens: { access_token?: string } }) =>
            getApp()
              .getActionsService()
              .getUserinfo({
                userinfoUrl: opts.userinfoUrl,
                accessToken: context.tokens.access_token ?? '',
              }),
        },
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
            metricsEnabled: profile.metricsEnabled ?? true,
          };
        }
        return {
          ...token,
        };
      },
      async redirect({ url, baseUrl }) {
        return getSafeRedirectUrl(url, baseUrl, [
          opts.contentServerUrl,
          opts.paymentsNextHostedUrl,
        ]);
      },
    },
    events: {
      async signIn() {
        getApp().getEmitterService().emit('auth', { type: 'signin' });
      },
      async signOut() {
        getApp().getEmitterService().emit('auth', { type: 'signout' });
      },
    },
    logger: {
      error(error: Error) {
        getApp()
          .getLogger()
          .error(error.message, {
            error: new AuthError(error.message, { cause: error }),
          });
      },
    },
  });

  return store.instance;
}

export function getAuthInstance() {
  const { instance } = singleton(
    SINGLETON_NAME,
    new AuthSingleton()
  ) as AuthSingleton;
  if (!instance) {
    throw new AuthError('setupAuth() must be called before using auth helpers');
  }
  return instance;
}
