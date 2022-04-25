/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_TOTP = {
  tags: TAGS.TOTP,
};

const TOTP_CREATE_POST = {
  ...TAGS_TOTP,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Create a new randomly generated TOTP token for a user if they do not currently have one.
    `,
  ],
};

const TOTP_DESTROY_POST = {
  ...TAGS_TOTP,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Deletes the current TOTP token for the user.
    `,
  ],
};

const TOTP_EXISTS_GET = {
  ...TAGS_TOTP,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Checks to see if the user has a TOTP token.
    `,
  ],
};

const SESSION_VERIFY_TOTP_POST = {
  ...TAGS_TOTP,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Verifies the current session if the passed TOTP code is valid.
    `,
  ],
};

const API_DOCS = {
  SESSION_VERIFY_TOTP_POST,
  TOTP_CREATE_POST,
  TOTP_DESTROY_POST,
  TOTP_EXISTS_GET,
};

export default API_DOCS;
