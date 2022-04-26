/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_RECOVERY_KEY = {
  tags: TAGS.RECOVERY_KEY,
};

const RECOVERYKEY_POST = {
  ...TAGS_RECOVERY_KEY,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Creates a new recovery key for a user. Recovery keys are one-time-use tokens that can be used to recover the user's kB if they forget their password. For more details, see the [**recovery keys**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/recovery_keys.md) docs.
    `,
  ],
};

const RECOVERYKEY_RECOVERYKEYID_GET = {
  ...TAGS_RECOVERY_KEY,
  description: '🔒 accountResetToken',
  notes: [
    '🔒 HAWK-authenticated with account reset token',
    'Retrieve the account recovery data associated with the given recovery key.',
  ],
};

const RECOVERYKEY_EXISTS_POST = {
  ...TAGS_RECOVERY_KEY,
  description: '🔒🔓 sessionToken',
  notes: [
    '🔒🔓 Optionally HAWK-authenticated with session token',
    'This route checks to see if given user has setup an account recovery key. When used during the password reset flow, an email can be provided (instead of a sessionToken) to check for the status. However, when using an email, the request is rate limited.',
  ],
};

const RECOVERYKEY_DELETE = {
  ...TAGS_RECOVERY_KEY,
  description: '🔒 sessionToken',
  notes: [
    '🔒 HAWK-authenticated with session token',
    "This route remove an account's recovery key. When the key is removed, it can no longer be used to restore an account's kB.",
  ],
};

const RECOVERYKEY_VERIFY_POST = {
  ...TAGS_RECOVERY_KEY,
  description: '🔒 sessionToken',
};

const API_DOCS = {
  RECOVERYKEY_DELETE,
  RECOVERYKEY_EXISTS_POST,
  RECOVERYKEY_POST,
  RECOVERYKEY_RECOVERYKEYID_GET,
  RECOVERYKEY_VERIFY_POST,
};

export default API_DOCS;
