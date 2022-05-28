/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TAGS from './swagger-tags';

const TAGS_MISC = {
  tags: TAGS.MISCELLANEOUS,
};

const ACCOUNT_STUB_POST = {
  ...TAGS_MISC,
  description: '/account/stub',
};

const ACCOUNT_FINISH_SETUP_POST = {
  ...TAGS_MISC,
  description: '/account/finish_setup',
};

const ACCOUNT_GET = {
  ...TAGS_MISC,
  description: '/account',
  notes: ['🔒 Authenticated with session token'],
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
    '🔒 Authenticated with support secret or authenticated with OAuth bearer token',
  ],
};

const WELLKNOWN_BROWSERID_GET = {
  ...TAGS_MISC,
  description: '/.well-known/browserid',
};

const WELLKNOWN_PUBLIC_KEYS = {
  ...TAGS_MISC,
  description: '/.well-known/public-keys',
};

const OAUTH_ID_TOKEN_VERIFY_POST = {
  ...TAGS_MISC,
  description: '/oauth/id-token-verify',
};

const API_DOCS = {
  ACCOUNT_GET,
  ACCOUNT_FINISH_SETUP_POST,
  ACCOUNT_LOCK_POST,
  ACCOUNT_SESSIONS_LOCATIONS_GET,
  ACCOUNT_STUB_POST,
  NEWSLETTERS_POST,
  OAUTH_ID_TOKEN_VERIFY_POST,
  SUPPORT_TICKET_POST,
  WELLKNOWN_BROWSERID_GET,
  WELLKNOWN_PUBLIC_KEYS,
};

export default API_DOCS;
