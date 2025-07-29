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
  description: '/session/destroy',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Destroys the current session and invalidates \`sessionToken\`, to be called when a user signs out. To sign back in, a call must be made to \`POST /account/login\` to obtain a new \`sessionToken\`.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            - \`errno: 110\` - Invalid authentication token in request signature
          `,
        },
      },
    },
  },
};

const SESSION_REAUTH_POST = {
  ...TAGS_SESSION,
  description: '/session/reauth',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Re-authenticate an existing session token. This is equivalent to calling \`/account/login\`, but it re-uses an existing session token rather than generating a new one, allowing the caller to maintain session state such as verification and device registration.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            - \`errno: 102\` - Unknown account
            - \`errno: 103\` - Incorrect password
            - \`errno: 125\` - The request was blocked for security reasons
            - \`errno: 127\` - Invalid unblock code
            - \`errno: 142\` - Sign in with this email type is not currently supported
            - \`errno: 149\` - This email can not currently be used to login
            - \`errno: 160\` - This request requires two-step authentication enabled on your account
          `,
        },
      },
    },
  },
};

const SESSION_STATUS_GET = {
  ...TAGS_SESSION,
  description: '/session/status',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Returns a success response if the session token is valid.
    `,
  ],
};

const SESSION_DUPLICATE_POST = {
  ...TAGS_SESSION,
  description: '/session/duplicate',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Create a new \`sessionToken\` that duplicates the current session. It will have the same verification status as the current session, but will have a distinct verification code.
    `,
  ],
};

const SESSION_VERIFY_CODE_POST = {
  ...TAGS_SESSION,
  description: '/session/verify_code',
  notes: ['🔒 Authenticated with session token'],
};

const SESSION_RESEND_CODE_POST = {
  ...TAGS_SESSION,
  description: '/session/resend_code',
  notes: ['🔒 Authenticated with session token'],
};

const SESSION_VERIFY_TOKEN_GET = {
  ...TAGS_SESSION,
  description: '/session/verify/token',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verifies the session token and checks various verification states including account verification, session verification, and authenticator assurance level (AAL) compliance. The required AAL is determined from the account's available authentication methods.

      This endpoint returns a response indicating the verification status rather than throwing errors for verification needs.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            - \`errno: 110\` - Invalid token
          `,
        },
        200: {
          description: dedent`
            Successful responses include verification status information:
            - \`accountStatus\`: "verified" or "unverified" (never null; if the session token is invalid or the account has been deleted, the endpoint returns an error)
            - \`sessionStatus\`: "verified", "mustVerify", "mustUpgrade", or null
            - \`verificationMethod\`: Required verification method (if verification needed)
          `,
        },
      },
    },
  },
};

const SESSION_SEND_PUSH_POST = {
  ...TAGS_SESSION,
  description: '/session/verify/send_push',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Sends a push notification to all push enabled devices to verify current session.
    `,
  ],
};

const SESSION_VERIFY_PUSH_POST = {
  ...TAGS_SESSION,
  description: '/session/verify/verify_push',
  notes: [
    dedent`
    🔒 Authenticated with session token

    Endpoint that accepts a code and tokenVerificationId to verify a session.
    `,
  ],
};

const API_DOCS = {
  SESSION_DESTROY_POST,
  SESSION_DUPLICATE_POST,
  SESSION_REAUTH_POST,
  SESSION_STATUS_GET,
  SESSION_RESEND_CODE_POST,
  SESSION_VERIFY_CODE_POST,
  SESSION_VERIFY_TOKEN_GET,
  SESSION_SEND_PUSH_POST,
  SESSION_VERIFY_PUSH_POST,
};

export default API_DOCS;
