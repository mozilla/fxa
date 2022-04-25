/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TAGS from './swagger-tags';

const TAGS_MISC = {
  tags: TAGS.MISCELLANEOUS,
};

const ACCOUNT_STUB_POST = {
  ...TAGS_MISC,
};

const ACCOUNT_FINISH_SETUP_POST = {
  ...TAGS_MISC,
};

const ACCOUNT_GET = {
  ...TAGS_MISC,
  description: '🔒 sessionToken',
};

const ACCOUNT_LOCK_POST = {
  ...TAGS_MISC,
};

const ACCOUNT_SESSIONS_LOCATIONS_GET = {
  ...TAGS_MISC,
  description: '🔒 supportPanelSecret',
};

const NEWSLETTERS_POST = {
  ...TAGS_MISC,
  description: '🔒 sessionToken, oauthToken',
};

const SUPPORT_TICKET_POST = {
  ...TAGS_MISC,
  description: '🔒 supportSecret, oauthToken',
};

const WELLKNOWN_BROWSERID_GET = {
  ...TAGS_MISC,
};

const WELLKNOWN_PUBLIC_KEYS = {
  ...TAGS_MISC,
};

const AUTHORIZATION_GET = {
  ...TAGS_MISC,
};

const AUTHORIZATION_POST = {
  ...TAGS_MISC,
};

const DESTROY_POST = {
  ...TAGS_MISC,
};

const AUTHORIZED_CLIENTS_DESTROY_POST = {
  ...TAGS_MISC,
};

const AUTHORIZED_CLIENTS_POST = {
  ...TAGS_MISC,
};

const CLIENT_CLIENTID_GET = {
  ...TAGS_MISC,
};

const OAUTH_ID_TOKEN_VERIFY_POST = {
  ...TAGS_MISC,
};

const INTROSPECT_POST = {
  ...TAGS_MISC,
};

const JWKS_GET = {
  ...TAGS_MISC,
};

const KEY_DATA_POST = {
  ...TAGS_MISC,
};

const TOKEN_POST = {
  ...TAGS_MISC,
};

const VERIFY_POST = {
  ...TAGS_MISC,
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
