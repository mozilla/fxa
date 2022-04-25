/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TAGS from './swagger-tags';

const TAGS_UTIL = {
  tags: TAGS.UTIL,
};

const GET_RANDOM_BYTES_POST = {
  ...TAGS_UTIL,
  notes: [
    'Get 32 bytes of random data. This should be combined with locally-sourced entropy when creating salts, etc.',
  ],
};

const VERIFY_EMAIL_GET = {
  ...TAGS_UTIL,
};

const COMPLETE_RESET_PASSWORD_GET = {
  ...TAGS_UTIL,
};

const API_DOCS = {
  COMPLETE_RESET_PASSWORD_GET,
  GET_RANDOM_BYTES_POST,
  VERIFY_EMAIL_GET,
};

export default API_DOCS;
