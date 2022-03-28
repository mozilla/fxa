/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_ACCOUNT = {
  tags: TAGS.ACCOUNT,
};

const ACCOUNT_CREATE_POST = {
  ...TAGS_ACCOUNT,
  notes: [
    dedent`
      Creates a user account. The client provides the email address with which this account will be associated and a stretched password. Stretching is detailed on the [**onepw**](https://github.com/mozilla/fxa-auth-server/wiki/onepw-protocol#creating-the-account) wiki page.

      This endpoint may send a verification email to the user. Callers may optionally provide the \`service\` parameter to indicate which service they are acting on behalf of. This is an opaque alphanumeric token that will be embedded in the verification link as a query parameter.

      Creating an account also logs in. The response contains a \`sessionToken\` and, optionally, a \`keyFetchToken\` if the url has a query parameter of \`keys=true\`.
  `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 101\` - Account already exists
            \`errno: 144\` - Email already exists
          `,
        },
      },
    },
  },
};

const ACCOUNT_LOGIN_POST = {
  ...TAGS_ACCOUNT,
  notes: [
    'Obtain a `sessionToken` and, optionally, a `keyFetchToken` if `keys=true`.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 102\` - Unknown account
            \`errno: 103\` - Incorrect password
            \`errno: 125\` - The request was blocked for security reasons
            \`errno: 127\` - Invalid unblock code
            \`errno: 142\` - Sign in with this email type is not currently supported
            \`errno: 149\` - This email can not currently be used to login
            \`errno: 160\` - This request requires two step authentication enabled on your account.
          `,
        },
        422: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 151\` - Failed to send email
          `,
        },
      },
    },
  },
};

const ACCOUNT_STATUS_GET = {
  ...TAGS_ACCOUNT,
  description: '🔒🔓 sessionToken',
  notes: [
    dedent`
      🔒🔓 Optionally HAWK-authenticated with session token

      Gets the status of an account.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 108\` - Missing parameter in request body
          `,
        },
      },
    },
  },
};

const ACCOUNT_STATUS_POST = {
  ...TAGS_ACCOUNT,
  notes: [
    'Gets the status of an account without exposing user data through query params. This endpoint is rate limited by [**fxa-customs-server**](https://github.com/mozilla/fxa/tree/main/packages/fxa-customs-server).',
  ],
};

const ACCOUNT_PROFILE_GET = {
  ...TAGS_ACCOUNT,
  description: '🔒 sessionToken, oauthToken',
  notes: [
    dedent`
      🔒 authenticated with OAuth bearer token or HAWK-authenticated with session token

      Get the email and locale of a user.

      If an OAuth bearer token is used, the values returned depend on the scopes that the token is authorized for:
        - \`email\` requires \`profile:email\` scope.
        - \`locale\` requires \`profile:locale\` scope.
        - \`authenticationMethods\` and \`authenticatorAssuranceLevel\` require \`profile:amr\` scope.

      The \`profile\` scope includes all the above sub-scopes.
    `,
  ],
};

const ACCOUNT_KEYS_GET = {
  ...TAGS_ACCOUNT,
  description: '🔒 keyFetchToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with key fetch token

      Get the base-16 bundle of encrypted \`kA|wrapKb\`. The return value must be decrypted with a key derived from \`keyFetchToken\`, then \`wrapKb\` must be further decrypted with a key derived from the user's password.

      Since \`keyFetchToken\` is single-use, this can only be done once per session. Note that \`keyFetchToken\` is consumed regardless of whether the request succeeds or fails.

      This request will fail unless the account's email address and current session has been verified.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 104\` - Unverified account
          `,
        },
      },
    },
  },
};

const ACCOUNT_UNLOCK_RESEND_CODE_POST = {
  ...TAGS_ACCOUNT,
  description: 'deprecated',
  notes: ['This endpoint is deprecated.'],
  plugins: {
    'hapi-swagger': {
      deprecated: true,
      responses: {
        410: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 116\` - This endpoint is no longer supported
          `,
        },
      },
    },
  },
};

const ACCOUNT_UNLOCK_VERIFY_CODE_POST = {
  ...TAGS_ACCOUNT,
  description: 'deprecated',
  notes: ['This endpoint is deprecated.'],
  plugins: {
    'hapi-swagger': {
      deprecated: true,
      responses: {
        410: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 116\` - This endpoint is no longer supported
          `,
        },
      },
    },
  },
};

const ACCOUNT_RESET_POST = {
  ...TAGS_ACCOUNT,
  description: '🔒 accountResetToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with account reset token

      This sets the account password and resets \`wrapKb\` to a new random value.

      Account reset tokens are single-use and consumed regardless of whether the request succeeds or fails. They are returned by the \`POST /password/forgot/verify_code\` endpoint.

      The caller can optionally request a new \`sessionToken\` and \`keyFetchToken\`.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 108\` - Missing parameter in request body
          `,
        },
      },
    },
  },
};

const ACCOUNT_DESTROY_POST = {
  ...TAGS_ACCOUNT,
  description: '🔒🔓 sessionToken',
  notes: [
    dedent`
      🔒🔓 Optionally HAWK-authenticated with session token

      Deletes an account. All stored data is erased. The client should seek user confirmation first. The client should erase data stored on any attached services before deleting the user's account data.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 103\` - Incorrect password
            \`errno: 138\` - Unverified session
          `,
        },
      },
    },
  },
};

const API_DOCS = {
  ACCOUNT_CREATE_POST,
  ACCOUNT_DESTROY_POST,
  ACCOUNT_KEYS_GET,
  ACCOUNT_LOGIN_POST,
  ACCOUNT_PROFILE_GET,
  ACCOUNT_RESET_POST,
  ACCOUNT_STATUS_GET,
  ACCOUNT_STATUS_POST,
  ACCOUNT_UNLOCK_RESEND_CODE_POST,
  ACCOUNT_UNLOCK_VERIFY_CODE_POST,
};

export default API_DOCS;
