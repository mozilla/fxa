/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_SESSION = {
  tags: TAGS.SESSION,
};

const SESSION_DESTROY_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Destroys the current session and invalidates \`sessionToken\`, to be called when a user signs out. To sign back in, a call must be made to \`POST /account/login\` to obtain a new \`sessionToken\`.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 110\` - Invalid authentication token in request signature
          `,
        },
      },
    },
  },
};

const SESSION_REAUTH_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Re-authenticate an existing session token. This is equivalent to calling \`/account/login\`, but it re-uses an existing session token rather than generating a new one, allowing the caller to maintain session state such as verification and device registration.
    `,
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
            \`errno: 160\` - This request requires two-step authentication enabled on your account
          `,
        },
      },
    },
  },
};

const SESSION_STATUS_GET = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Returns a success response if the session token is valid.
    `,
  ],
};

const SESSION_DUPLICATE_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Create a new \`sessionToken\` that duplicates the current session. It will have the same verification status as the current session, but will have a distinct verification code.
    `,
  ],
};

const SESSION_VERIFY_CODE_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
};

const SESSION_RESEND_CODE_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
};

const SESSION_VERIFY_SEND_PUSH_POST = {
  ...TAGS_SESSION,
  description: '🔒 sessionToken',
};

const API_DOCS = {
  SESSION_DESTROY_POST,
  SESSION_DUPLICATE_POST,
  SESSION_REAUTH_POST,
  SESSION_STATUS_GET,
  SESSION_RESEND_CODE_POST,
  SESSION_VERIFY_CODE_POST,
  SESSION_VERIFY_SEND_PUSH_POST,
};

export default API_DOCS;
