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
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Return new recovery codes while removing old ones.
    `,
  ],
};

const RECOVERY_CODES_PUT = {
  ...TAGS_RECOVERY_CODE,
  description: '🔒 sessionToken',
  tags: TAGS.RECOVERY_CODES,
};

const SESSION_VERIFY_RECOVERYCODE_POST = {
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Verify a session using a recovery code.
    `,
  ],
};

const API_DOCS = {
  RECOVERYCODES_GET,
  RECOVERY_CODES_PUT,
  SESSION_VERIFY_RECOVERYCODE_POST,
};

export default API_DOCS;
