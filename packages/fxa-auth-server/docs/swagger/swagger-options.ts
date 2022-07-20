/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import { AUTH_SERVER_API_DESCRIPTION } from './auth-server-api';
import OAUTH_SERVER_DOCS from './oauth-server-api';
import TAGS from './swagger-tags';

export const swaggerOptions = {
  info: {
    title: 'Firefox Accounts API Documentation',
    description: dedent`
      [**DISCLAIMER**]: This information may not be up-to-date - it may be worth verifying information in the source code before acting on anything you read here.
    `,
  },
  basePath: '/v1',
  schemes: ['https'],
  tags: [
    {
      name: TAGS.AUTH_SERVER[1],
      ...AUTH_SERVER_API_DESCRIPTION,
    },
    {
      name: TAGS.OAUTH_SERVER[1],
      ...OAUTH_SERVER_DOCS.OAUTH_SERVER_API_DESCRIPTION,
    },
  ],
  'x-tagGroups': [
    {
      name: 'Firefox Accounts Auth Server API',
      tags: [
        TAGS.AUTH_SERVER[1],
        TAGS.ACCOUNT[1],
        TAGS.DEVICES_AND_SESSIONS[1],
        TAGS.EMAILS[1],
        TAGS.MISCELLANEOUS[1],
        TAGS.OAUTH[1],
        TAGS.PASSWORD[1],
        TAGS.RECOVERY_CODES[1],
        TAGS.RECOVERY_KEY[1],
        TAGS.SECURITY_EVENTS[1],
        TAGS.SESSION[1],
        TAGS.SIGN[1],
        TAGS.SUBSCRIPTIONS[1],
        TAGS.THIRD_PARTY_AUTH[1],
        TAGS.TOTP[1],
        TAGS.UNBLOCK_CODES[1],
        TAGS.UTIL[1],
      ],
    },
    {
      name: 'Firefox Accounts OAuth Server API',
      tags: [TAGS.OAUTH_SERVER[1]],
    },
  ],
  grouping: 'tags',
  documentationPage: false,
  swaggerUI: false,
};
