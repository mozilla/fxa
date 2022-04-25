/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_OAUTH = {
  tags: TAGS.OAUTH,
};

const OAUTH_AUTHORIZATION_POST = {
  ...TAGS_OAUTH,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Authorize a new OAuth client connection to the user's account, returning a short-lived authentication code that the client can exchange for access tokens at the OAuth token endpoint.

      This route behaves like the oauth-server /authorization endpoint except that it is authenticated directly with a sessionToken rather than with a BrowserID assertion.
    `,
  ],
};

const OAUTH_DESTROY_POST = {
  ...TAGS_OAUTH,
  notes: [
    dedent`
      Destroy an OAuth access token or refresh token.

      This is the "token revocation endpoint" as defined in RFC7009 and should be used by clients to explicitly revoke any OAuth tokens that they are no longer using.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 171\` - Incorrect client secret.
          `,
        },
        500: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 162\` - Unknown client id.
          `,
        },
      },
    },
  },
};

const ACCOUNT_SCOPED_KEY_DATA_POST = {
  ...TAGS_OAUTH,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Query for the information required to derive scoped encryption keys requested by the specified OAuth client.
    `,
  ],
};

const OAUTH_TOKEN_POST = {
  ...TAGS_OAUTH,
  description: '🔒🔓 sessionToken',
  notes: [
    dedent`
      🔒🔓 Optionally HAWK-authenticated with session token

      Grant new OAuth tokens for use by a connected client, using one of the following grant types:
        - \`grant_type=authorization_code\`: A single-use code obtained via OAuth redirect flow.
        - \`grant_type=refresh_token\`: A refresh token issued by a previous call to this endpoint.
        - \`grant_type=fxa-credentials\`: Directly grant tokens using an FxA sessionToken.

      This is the "token endpoint" as defined in RFC6749, and behaves like the oauth-server /token endpoint except that the \`fxa-credentials\` grant can be authenticated directly with a sessionToken rather than with a BrowserID assertion.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 110\` - Invalid authentication token in request signature.
          `,
        },
        500: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 998\` - An internal validation check failed.
          `,
        },
      },
    },
  },
};

const API_DOCS = {
  ACCOUNT_SCOPED_KEY_DATA_POST,
  OAUTH_AUTHORIZATION_POST,
  OAUTH_DESTROY_POST,
  OAUTH_TOKEN_POST,
};

export default API_DOCS;
