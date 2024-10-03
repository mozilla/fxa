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
  description: '/totp/create',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Create a new randomly generated TOTP token for a user if they do not currently have one.
    `,
  ],
};

const TOTP_DESTROY_POST = {
  ...TAGS_TOTP,
  description: '/totp/destroy',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Deletes the current TOTP token for the user.
    `,
  ],
};

const TOTP_EXISTS_GET = {
  ...TAGS_TOTP,
  description: '/totp/exists',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Checks to see if the user has a TOTP token.
    `,
  ],
};

const TOTP_VERIFY_POST = {
  ...TAGS_TOTP,
  description: '/totp/verify',
  notes: [
    dedent`
      🔒 Authenticated with password forgot token

      Checks to see if a TOTP code is valid. This is used when a user is resetting their password.
    `,
  ],
};

const TOTP_VERIFY_RECOVERY_CODE_POST = {
  ...TAGS_TOTP,
  description: '/totp/verify/recoveryCode',
  notes: [
    dedent`
      🔒 Authenticated with password forgot token

      Checks to see if a Recovery code is valid. If the code is valid, it will be consumed and deleted. This is used when a user is resetting their password.
    `,
  ],
};

const SESSION_VERIFY_TOTP_POST = {
  ...TAGS_TOTP,
  description: '/session/verifiy/totp',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verifies the current session if the passed TOTP code is valid.
    `,
  ],
};

const API_DOCS = {
  SESSION_VERIFY_TOTP_POST,
  TOTP_CREATE_POST,
  TOTP_DESTROY_POST,
  TOTP_EXISTS_GET,
  TOTP_VERIFY_POST,
  TOTP_VERIFY_RECOVERY_CODE_POST,
};

export default API_DOCS;
