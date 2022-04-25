/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_PASSWORD = {
  tags: TAGS.PASSWORD,
};

const PASSWORD_CHANGE_START_POST = {
  ...TAGS_PASSWORD,
  notes: [
    'Begin the "change password" process. Returns a single-use `passwordChangeToken`, to be sent to `POST /password/change/finish`. Also returns a single-use `keyFetchToken`.',
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 103\` - Incorrect password
          `,
        },
      },
    },
  },
};

const PASSWORD_CHANGE_FINISH_POST = {
  ...TAGS_PASSWORD,
  description: '🔒 passwordChangeToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with password change token

      Change the password and update \`wrapKb\`. Optionally returns \`sessionToken\` and \`keyFetchToken\`.
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

const PASSWORD_FORGOT_SEND_CODE_POST = {
  ...TAGS_PASSWORD,
  notes: [
    dedent`
      Requests a 'reset password' code to be sent to the user's recovery email. The user should type this code into the agent, which will then submit it to \`POST /password/forgot/verify_code\`.

      The code will be either 8 or 16 digits long, with the length indicated in the response. The email will either contain the code itself or the URL for a web page that displays the code.

      The response includes \`passwordForgotToken\`, which must be submitted with the code to \`POST /password/forgot/verify_code\`.

      The response also specifies the TTL of \`passwordForgotToken\` and an upper limit on the number of times the token may be submitted. By limiting the number of submission attempts, we also limit an attacker's ability to guess the code. After the token expires, or the maximum number of submissions has been made, the agent must call this endpoint again to generate a new code and token pair.

      Each account can have at most one \`passwordForgotToken\` valid at a time. Calling this endpoint causes existing tokens to be invalidated and a new one created. Each token is associated with a specific code, so by extension the codes are invalidated with their tokens.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description:
            'Failing requests may be caused by the following errors (this is not an exhaustive list): \n `errno: 145` - Reset password with this email type is not currently supported',
        },
      },
    },
  },
};

const PASSWORD_FORGOT_RESEND_CODE_POST = {
  ...TAGS_PASSWORD,
  description: '🔒 passwordForgotToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with password forgot token

      Resends the email from \`POST /password/forgot/send_code\`, for use when the original email has been lost or accidentally deleted.

      This endpoint requires the \`passwordForgotToken\` returned in the original response, so only the original client which started the process may request a resent message. The response will match that from \`POST /password/forgot/send_code\`, except \`ttl\` will be lower to indicate the shorter validity period. \`tries\` will also be lower if \`POST /password/forgot/verify_code\` has been called.
    `,
  ],
};

const PASSWORD_FORGOT_VERIFY_CODE_POST = {
  ...TAGS_PASSWORD,
  description: '🔒 passwordForgotToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with password forgot token

      The code returned by \`POST /v1/password/forgot/send_code\` should be submitted to this endpoint with the \`passwordForgotToken\`. For successful requests, the server will return \`accountResetToken\`, to be submitted in requests to \`POST /account/reset\` to reset the account password and \`wrapKb\`.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        400: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 105\` - Invalid verification code
          `,
        },
      },
    },
  },
};

const PASSWORD_FORGOT_STATUS_GET = {
  ...TAGS_PASSWORD,
  description: '🔒 passwordForgotToken',
  notes: [
    dedent`
      🔒 HAWK-authenticated with password forgot token

      Returns the status of a \`passwordForgotToken\`. Success responses indicate the token has not yet been consumed. For consumed or expired tokens, an HTTP \`401\` response with \`errno: 110\` will be returned.
    `,
  ],
};

const API_DOCS = {
  PASSWORD_CHANGE_FINISH_POST,
  PASSWORD_CHANGE_START_POST,
  PASSWORD_FORGOT_RESEND_CODE_POST,
  PASSWORD_FORGOT_SEND_CODE_POST,
  PASSWORD_FORGOT_STATUS_GET,
  PASSWORD_FORGOT_VERIFY_CODE_POST,
};

export default API_DOCS;
