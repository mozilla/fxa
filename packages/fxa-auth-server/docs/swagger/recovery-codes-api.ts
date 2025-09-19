/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_RECOVERY_CODE = {
  tags: TAGS.RECOVERY_CODES,
};

const RECOVERYCODES_GET = {
  ...TAGS_RECOVERY_CODE,
  description: '/recoveryCodes',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Return new backup authentication codes while removing old ones.
    `,
  ],
};

const RECOVERY_CODES_POST = {
  ...TAGS_RECOVERY_CODE,
  description: '/recoveryCodes',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Set backup authentication codes (intended for initial set up)
    `,
  ],
};

const RECOVERY_CODES_PUT = {
  ...TAGS_RECOVERY_CODE,
  description: '/recoveryCodes',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Return new backup authentication codes while removing old ones.
    `,
  ],
};

const MFA_RECOVERY_CODES_PUT = {
  ...TAGS_RECOVERY_CODE,
  description: '/mfa/recoveryCodes',
  notes: [
    dedent`
      🔒 Authenticated with MFA jwt

      Return new backup authentication codes while removing old ones.
    `,
  ],
};

const SESSION_VERIFY_RECOVERYCODE_POST = {
  description: '/session/verify/recoveryCode',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verify a session using a backup authentication code.
    `,
  ],
};

const API_DOCS = {
  RECOVERYCODES_GET,
  RECOVERY_CODES_POST,
  RECOVERY_CODES_PUT,
  MFA_RECOVERY_CODES_PUT,
  SESSION_VERIFY_RECOVERYCODE_POST,
};

export default API_DOCS;
