/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TAGS from './swagger-tags';

const TAGS_THIRD_PARTY_AUTH = {
  tags: TAGS.THIRD_PARTY_AUTH,
};

const LINKED_ACCOUNT_LOGIN_POST = {
  ...TAGS_THIRD_PARTY_AUTH,
};

const LINKED_ACCOUNT_UNLINK_POST = {
  description: '🔒 sessionToken',
  ...TAGS_THIRD_PARTY_AUTH,
};

const API_DOCS = {
  LINKED_ACCOUNT_LOGIN_POST,
  LINKED_ACCOUNT_UNLINK_POST,
};

export default API_DOCS;
