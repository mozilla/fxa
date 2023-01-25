/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_MISC = {
  tags: TAGS.MISCELLANEOUS,
};

const ACCOUNT_GET = {
  ...TAGS_MISC,
  description: '/account',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Returns account data including subscriptions.
    `,
  ],
};

const ACCOUNT_LOCK_POST = {
  ...TAGS_MISC,
  description: '/account/lock',
};

const ACCOUNT_SESSIONS_LOCATIONS_GET = {
  ...TAGS_MISC,
  description: '/account/sessions/locations',
  notes: ['🔒 Authenticated with support panel secret'],
};

const NEWSLETTERS_POST = {
  ...TAGS_MISC,
  description: '/newsletters',
  notes: [
    '🔒 Authenticated with OAuth bearer token or authenticated with session token',
  ],
};

const SUPPORT_TICKET_POST = {
  ...TAGS_MISC,
  description: '/support/ticket',
  notes: [
    dedent`
      🔒 Authenticated with support secret or authenticated with OAuth bearer token

      Creates a support ticket using the Zendesk client.
    `,
  ],
};

const WELLKNOWN_BROWSERID_GET = {
  ...TAGS_MISC,
  description: '/.well-known/browserid',
  notes: [
    dedent`
      Verifies a user is who they say they are using [BrowserID](https://hacks.mozilla.org/2011/07/introducing-browserid-easier-and-safer-authentication-on-the-web/).

      It has been deprecated in newer version of Firefox desktop, though some clients still use it.
    `,
  ],
};

const WELLKNOWN_PUBLIC_KEYS = {
  ...TAGS_MISC,
  description: '/.well-known/public-keys',
  notes: [
    'Used by clients to generate JSON web tokens, and allows FxA to verify those tokens.',
  ],
};

const OAUTH_ID_TOKEN_VERIFY_POST = {
  ...TAGS_MISC,
  description: '/oauth/id-token-verify',
  notes: [
    "Verifies an OIDC ID Token (FxA returns this token at the end of the OAuth flow). The id token contains the user's identification number (uid) plus [other fields](https://openid.net/specs/openid-connect-core-1_0.html#IDToken).",
  ],
};

const API_DOCS = {
  ACCOUNT_GET,
  ACCOUNT_LOCK_POST,
  ACCOUNT_SESSIONS_LOCATIONS_GET,
  NEWSLETTERS_POST,
  OAUTH_ID_TOKEN_VERIFY_POST,
  SUPPORT_TICKET_POST,
  WELLKNOWN_BROWSERID_GET,
  WELLKNOWN_PUBLIC_KEYS,
};

export default API_DOCS;
