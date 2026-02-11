/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_SECURITY_EVENTS = {
  tags: TAGS.SECURITY_EVENTS,
};

const SECURITYEVENTS_GET = {
  ...TAGS_SECURITY_EVENTS,
  description: '/securityEvents',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Returns a list of all security events for a signed in account having \`account.create\`, \`account.login\`, \`account.reset\` events.
    `,
  ],
};

const API_DOCS = {
  SECURITYEVENTS_GET,
};

export default API_DOCS;
