/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_EMAILS = {
  tags: TAGS.EMAILS,
};

const EMAILS_REMINDERS_CAD_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
};

const RECOVERY_EMAIL_STATUS_GET = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Returns the 'verified' status for the account's recovery email address.

      Currently, each account is associated with exactly one email address. This address must be verified before the account can be used (specifically, \`POST /certificate/sign\` and \`GET /account/keys\` will return errors until the address is verified). In the future, this may be expanded to include multiple addresses, and/or alternate types of recovery methods (e.g. SMS). A new API will be provided for this extra functionality.

      This call is used to determine the current state (verified or unverified) of the account. During account creation, until the address is verified, the agent can poll this method to discover when it should proceed with \`POST /certificate/sign\` and \`GET /account/keys\`.
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

const RECOVERY_EMAIL_RESEND_CODE_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Re-sends a verification code to the account's recovery email address. The code is first sent when the account is created, but if the user thinks the message was lost or accidentally deleted, they can request a new message to be sent via this endpoint. The new message will contain the same code as the original message. When this code is provided to \`/v1/recovery_email/verify_code\`, the email will be marked as 'verified'.

      This endpoint may send a verification email to the user. Callers may optionally provide the \`service\` parameter to indicate what identity-attached service they're acting on behalf of. This is an opaque alphanumeric token that will be embedded in the verification link as a query parameter.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 150\` - Can not resend email code to an email that does not belong to this account
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAIL_VERIFY_CODE_POST = {
  ...TAGS_EMAILS,
  notes: [
    dedent`
      Verify tokens and/or recovery emails for an account. If a valid token code is detected, the account email and tokens will be set to verified. If a valid email code is detected, the email will be marked as verified.

      The verification code will be a random token, delivered in the fragment identifier of a URL sent to the user's email address. Navigating to the URL opens a page that extracts the code from the fragment identifier and performs a POST to \`/recovery_email/verify_code\`. The link can be clicked from any browser, not just the one being attached to the Firefox account.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 105\` - Invalid verification code'
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAILS_GET = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Returns an array of objects containing details of the email addresses associated with the logged-in user. Currently, the primary email address is always the one from the \`accounts\` table.
    `,
  ],
};

const RECOVERY_EMAIL_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token
      Add a secondary email address to the logged-in account. The created address will be unverified and will not replace the primary email address.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 104\` - Unverified account
            \`errno: 138\` - Unverified session
            \`errno: 139\` - Can not add secondary email that is same as your primary
            \`errno: 140\` - Email already exists
            \`errno: 141\` - Email already exists
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAIL_DESTROY_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      Delete an email address associated with the logged-in user.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 138\` - Unverified session
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAIL_SET_PRIMARY_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      This endpoint changes a user's primary email address. This email address must belong to the user and be verified.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 138\` - Unverified session
            \`errno: 147\` - Can not change primary email to an unverified email
            \`errno: 148\` - Can not change primary email to an email that does not belong to this account
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAIL_SECONDARY_RESEND_CODE_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      This endpoint resend the otp verification to verify the secondary email.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 138\` - Unverified session
            \`errno: 150\` - Can not resend code for email that does not belong to the account
          `,
        },
      },
    },
  },
};

const RECOVERY_EMAIL_SECONDARY_VERIFY_CODE_POST = {
  ...TAGS_EMAILS,
  description: '🔒 sessionToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with session token

      This endpoint verifies a secondary email using a time based (otp) code.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 138\` - Unverified session
            \`errno: 105\` - Invalid verification code
          `,
        },
      },
    },
  },
};

const API_DOCS = {
  EMAILS_REMINDERS_CAD_POST,
  RECOVERY_EMAIL_DESTROY_POST,
  RECOVERY_EMAIL_POST,
  RECOVERY_EMAIL_RESEND_CODE_POST,
  RECOVERY_EMAIL_SECONDARY_RESEND_CODE_POST,
  RECOVERY_EMAIL_SECONDARY_VERIFY_CODE_POST,
  RECOVERY_EMAIL_SET_PRIMARY_POST,
  RECOVERY_EMAIL_STATUS_GET,
  RECOVERY_EMAIL_VERIFY_CODE_POST,
  RECOVERY_EMAILS_GET,
};

export default API_DOCS;
