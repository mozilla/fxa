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

const AUTHORIZATION_GET = {
  ...TAGS_MISC,
  description: '/authorization',
};

const AUTHORIZATION_POST = {
  ...TAGS_MISC,
  description: '/authorization',
};

const DESTROY_POST = {
  ...TAGS_MISC,
  description: '/destroy',
};

const AUTHORIZED_CLIENTS_DESTROY_POST = {
  ...TAGS_MISC,
  description: '/authorized-clients/destroy',
};

const AUTHORIZED_CLIENTS_POST = {
  ...TAGS_MISC,
  description: '/authorized_clients',
};

const CLIENT_CLIENTID_GET = {
  ...TAGS_MISC,
  description: '/oauth/client/{client_id}',
};

const OAUTH_ID_TOKEN_VERIFY_POST = {
  ...TAGS_MISC,
  description: '/oauth/id-token-verify',
};

const INTROSPECT_POST = {
  ...TAGS_MISC,
  description: '/introspect',
};

const JWKS_GET = {
  ...TAGS_MISC,
  description: '/jwks',
};

const KEY_DATA_POST = {
  ...TAGS_MISC,
  description: '/key-data',
};

const TOKEN_POST = {
  ...TAGS_MISC,
  description: '/token',
};

const VERIFY_POST = {
  ...TAGS_MISC,
  description: '/verify',
};

const API_DOCS = {
  ACCOUNT_GET,
  ACCOUNT_FINISH_SETUP_POST,
  ACCOUNT_LOCK_POST,
  ACCOUNT_SESSIONS_LOCATIONS_GET,
  ACCOUNT_STUB_POST,
  AUTHORIZATION_GET,
  AUTHORIZATION_POST,
  AUTHORIZED_CLIENTS_DESTROY_POST,
  AUTHORIZED_CLIENTS_POST,
  CLIENT_CLIENTID_GET,
  DESTROY_POST,
  INTROSPECT_POST,
  JWKS_GET,
  KEY_DATA_POST,
  NEWSLETTERS_POST,
  OAUTH_ID_TOKEN_VERIFY_POST,
  SUPPORT_TICKET_POST,
  TOKEN_POST,
  VERIFY_POST,
  WELLKNOWN_BROWSERID_GET,
  WELLKNOWN_PUBLIC_KEYS,
};

export default API_DOCS;
