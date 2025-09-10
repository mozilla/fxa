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
      🔒 Authenticated with session token or password forgot token

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
  description: '/session/verify/totp',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verifies the current session if the passed TOTP code is valid.
    `,
  ],
};

const TOTP_REPLACE_START_POST = {
  ...TAGS_TOTP,
  description: '/totp/replace/start',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Create a new randomly generated TOTP token for a user to replace an existing one. An existing TOTP token must exist for the user to request a replacement.
    `,
  ],
};

const TOTP_REPLACE_CONFIRM_POST = {
  ...TAGS_TOTP,
  description: '/totp/replace/confirm',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verifies the provided code is valid for TOTP and sets the new TOTP token for the user. This is used when a user is replacing their existing TOTP token.
    `,
  ],
};

// MFA-prefixed versions (JWT based)
const MFA_TOTP_REPLACE_START_POST = {
  ...TAGS_TOTP,
  description: '/mfa/totp/replace/start',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:2fa)

      Create a new randomly generated TOTP token for a user to replace an existing one. An existing TOTP token must exist for the user to request a replacement.
    `,
  ],
};

const MFA_TOTP_REPLACE_CONFIRM_POST = {
  ...TAGS_TOTP,
  description: '/mfa/totp/replace/confirm',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:2fa)

      Verifies the provided code is valid for TOTP and sets the new TOTP token for the user. This is used when a user is replacing their existing TOTP token.
    `,
  ],
};

const TOTP_SETUP_VERIFY_POST = {
  ...TAGS_TOTP,
  description: '/totp/setup/verify',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verifies an authenticator app code against the in-progress TOTP secret stored in Redis during setup. On success, marks the setup as verified in Redis and aligns TTLs.
    `,
  ],
};

const TOTP_SETUP_COMPLETE_POST = {
  ...TAGS_TOTP,
  description: '/totp/setup/complete',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Completes TOTP setup by validating the Redis verification flag for the current secret, then persisting the secret to the database as enabled and verified. Cleans up temporary Redis entries.
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
  TOTP_REPLACE_START_POST,
  TOTP_REPLACE_CONFIRM_POST,
  MFA_TOTP_REPLACE_START_POST,
  MFA_TOTP_REPLACE_CONFIRM_POST,
  TOTP_SETUP_VERIFY_POST,
  TOTP_SETUP_COMPLETE_POST,
};

export default API_DOCS;
