/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TAGS from './swagger-tags';

const TAGS_UNBLOCK_CODES = {
  tags: TAGS.UNBLOCK_CODES,
};

const ACCOUNT_LOGIN_SEND_UNBLOCK_CODE_POST = {
  ...TAGS_UNBLOCK_CODES,
  notes: [
    'Send an unblock code via email to reset rate-limiting for an account.',
  ],
};

const ACCOUNT_LOGIN_REJECT_UNBLOCK_CODE_POST = {
  ...TAGS_UNBLOCK_CODES,
  notes: [
    'Used to reject and report unblock codes that were not requested by the user.',
  ],
};

const API_DOCS = {
  ACCOUNT_LOGIN_REJECT_UNBLOCK_CODE_POST,
  ACCOUNT_LOGIN_SEND_UNBLOCK_CODE_POST,
};

export default API_DOCS;
