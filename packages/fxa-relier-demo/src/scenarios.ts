/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CLIENTS } from './config';
import { SCOPED_KEY_SCOPE } from './scopes';

export type AuthorizeRequest = {
  client_id: string;
  scopes: string[];
  keys: boolean;
  // every other authorize parameter, passed through verbatim
  params: Record<string, string>;
};

export type Scenario = {
  id: string;
  title: string;
  blurb: string;
  group: 'Sign in' | 'Session' | 'Data';
  recommended?: boolean;
  request: AuthorizeRequest;
};

const trusted = CLIENTS[0].id;
const untrusted = CLIENTS[1].id;
const base = (
  client_id: string,
  scopes: string[],
  params: Record<string, string> = {}
): AuthorizeRequest => ({
  client_id,
  scopes,
  keys: false,
  params,
});

export const SCENARIOS: Scenario[] = [
  {
    id: 'email-first',
    title: 'Email first',
    blurb:
      'FxA asks for the email, then routes to sign-in or sign-up itself. The default every Mozilla app uses.',
    group: 'Sign in',
    recommended: true,
    request: base(trusted, ['openid', 'profile'], { action: 'email' }),
  },
  {
    id: 'signup',
    title: 'Sign up with a known email',
    blurb:
      'Skip the email page and land on account creation. Needs the email parameter; bounces to sign-in if the account exists.',
    group: 'Sign in',
    request: base(trusted, ['openid', 'profile'], {
      action: 'signup',
      email: '',
    }),
  },
  {
    id: 'signin',
    title: 'Sign in with a known email',
    blurb:
      'Skip the email page and land on the password form. Needs the email parameter; bounces to sign-up if there is no account.',
    group: 'Sign in',
    request: base(trusted, ['openid', 'profile'], {
      action: 'signin',
      email: '',
    }),
  },
  {
    id: 'mozilla-app',
    title: 'Mozilla app',
    blurb:
      'A trusted client: no consent screen, and the profile scope returns every claim. Every live relying party works this way.',
    group: 'Data',
    request: base(trusted, ['openid', 'profile']),
  },
  {
    id: 'third-party',
    title: 'Third-party app',
    blurb:
      'An untrusted client: consent screen, and only the exact claims requested. Supported by FxA, not used by any live relying party yet.',
    group: 'Data',
    request: base(untrusted, [
      'openid',
      'profile:uid',
      'profile:email',
      'profile:display_name',
    ]),
  },
  {
    id: 'scoped-keys',
    title: 'Scoped keys',
    blurb:
      'Get an app-specific encryption key derived from the account, for end-to-end encrypted data. Mozilla apps only.',
    group: 'Data',
    request: {
      ...base(trusted, ['openid', 'profile', SCOPED_KEY_SCOPE]),
      keys: true,
    },
  },
  {
    id: 'prompt-none',
    title: 'Silent sign-in',
    blurb:
      'prompt=none: succeeds only when the browser already has an FxA session, otherwise returns login_required.',
    group: 'Session',
    request: base(trusted, ['openid', 'profile'], { prompt: 'none' }),
  },
  {
    id: 'prompt-login',
    title: 'Re-authenticate',
    blurb:
      'prompt=login: ask for the password even when a session exists. Use before sensitive actions.',
    group: 'Session',
    request: base(trusted, ['openid', 'profile'], {
      prompt: 'login',
      max_age: '0',
    }),
  },
  {
    id: 'aal2',
    title: 'Require two-step auth',
    blurb:
      'acr_values=AAL2: the session must have a second factor. Check acr in the introspection result afterwards.',
    group: 'Session',
    request: base(trusted, ['openid', 'profile', 'profile:amr'], {
      acr_values: 'AAL2',
    }),
  },
  {
    id: 'custom',
    title: 'Custom',
    blurb: 'Start from a blank request and build your own.',
    group: 'Data',
    request: base(trusted, ['openid']),
  },
];
