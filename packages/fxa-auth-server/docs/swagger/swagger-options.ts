/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

export const swaggerOptions = {
  info: {
    title: 'Firefox Accounts Authentication Server API',
    description: dedent`
      [**WARNING**]: This information may not be up-to-date, use it at your own risk. It may be worth verifying information in the source code before acting on anything you read here.

      This document provides protocol-level details of the Firefox Accounts auth server API. For a prose description of the client/server protocol and details on how each parameter is derived, see the [**API design document**](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol). For a reference client implementation, see [**fxa-auth-client**](https://github.com/mozilla/fxa/tree/main/packages/fxa-auth-client).

      * [Overview](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#overview)
        * [URL structure](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#url-structure)
        * [Request format](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#request-format)
        * [Response format](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#response-format)
          * [Defined errors](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#defined-errors)
          * [Responses from intermediary servers](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#responses-from-intermediary-servers)
        * [Validation](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#validation)
      * [Back-off protocol](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#back-off-protocol)
    `,
  },
  basePath: '/v1',
  schemes: ['https'],
  tags: [
    {
      name: TAGS.ACCOUNT[1],
    },
    {
      name: TAGS.DEVICES_AND_SESSIONS[1],
    },
    {
      name: TAGS.EMAILS[1],
    },
    {
      name: TAGS.MISCELLANEOUS[1],
    },
    {
      name: TAGS.OAUTH[1],
    },
    {
      name: TAGS.PASSWORD[1],
    },
    {
      name: TAGS.RECOVERY_CODES[1],
    },
    {
      name: TAGS.RECOVERY_KEY[1],
    },
    {
      name: TAGS.SECURITY_EVENTS[1],
    },
    {
      name: TAGS.SESSION[1],
    },
    {
      name: TAGS.SIGN[1],
    },
    {
      name: TAGS.SUBSCRIPTIONS[1],
    },
    {
      name: TAGS.THIRD_PARTY_AUTH[1],
    },
    {
      name: TAGS.TOTP[1],
    },
    {
      name: TAGS.UNBLOCK_CODES[1],
    },
    {
      name: TAGS.UTIL[1],
    },
  ],
  grouping: 'tags',
};
