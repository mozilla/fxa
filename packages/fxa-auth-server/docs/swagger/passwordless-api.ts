/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_PASSWORDLESS = {
  tags: TAGS.PASSWORDLESS,
};

const PASSWORDLESS_SEND_CODE_POST = {
  ...TAGS_PASSWORDLESS,
  description: '/account/passwordless/send_code',
  notes: [
    dedent`
      Send a one-time password (OTP) code to the user's email for passwordless authentication.

      This endpoint can be used for both:
      - New user registration (account doesn't exist)
      - Login for existing passwordless accounts (accounts without a password)

      Accounts with passwords set cannot use this endpoint.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - \`errno: 148\` - Account has a password set, use standard login flow
          `,
        },
        429: {
          description: 'Rate limit exceeded',
        },
      },
    },
  },
};

const PASSWORDLESS_CONFIRM_CODE_POST = {
  ...TAGS_PASSWORDLESS,
  description: '/account/passwordless/confirm_code',
  notes: [
    dedent`
      Confirm the OTP code sent via \`/account/passwordless/send_code\`.

      On success:
      - For new users: Creates a new account and returns a session token
      - For existing users: Returns a session token for the existing account

      The \`isNewAccount\` field in the response indicates whether a new account was created.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - \`errno: 183\` - Invalid OTP code
            - \`errno: 148\` - Account has a password set
          `,
        },
        429: {
          description: 'Rate limit exceeded',
        },
      },
    },
  },
};

const PASSWORDLESS_RESEND_CODE_POST = {
  ...TAGS_PASSWORDLESS,
  description: '/account/passwordless/resend_code',
  notes: [
    dedent`
      Resend the OTP code for passwordless authentication.

      This invalidates any previously sent code and sends a new one.
      Subject to the same rate limits as \`/account/passwordless/send_code\`.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors:
            - \`errno: 148\` - Account has a password set
          `,
        },
        429: {
          description: 'Rate limit exceeded',
        },
      },
    },
  },
};

export default {
  PASSWORDLESS_SEND_CODE_POST,
  PASSWORDLESS_CONFIRM_CODE_POST,
  PASSWORDLESS_RESEND_CODE_POST,
};
