/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_RECOVERY_PHONE = {
  tags: TAGS.RECOVERY_PHONE,
};

const RECOVERY_PHONE_CREATE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/create',
  notes: [
    dedent`
      🔒 Authenticated with verified session token

      Start recovery phone setup by validating and sending a verification code to the provided number.
    `,
  ],
};

const MFA_RECOVERY_PHONE_CREATE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/mfa/recovery_phone/create',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:2fa)

      Start recovery phone setup (MFA JWT variant) by validating and sending a verification code to the provided number.
    `,
  ],
};

const RECOVERY_PHONE_AVAILABLE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/available',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Returns whether the user can set up a recovery phone in their current region and account state.
    `,
  ],
};

const RECOVERY_PHONE_CONFIRM_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/confirm',
  notes: [
    dedent`
      🔒 Authenticated with verified session token

      Confirm recovery phone setup by verifying the code sent via SMS and finalize adding the phone number.
    `,
  ],
};

const MFA_RECOVERY_PHONE_CONFIRM_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/mfa/recovery_phone/confirm',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:2fa)

      Confirm recovery phone setup (MFA JWT variant) by verifying the code sent via SMS and finalize adding the phone number.
    `,
  ],
};

const RECOVERY_PHONE_CHANGE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/change',
  notes: [
    dedent`
      🔒 Authenticated with verified session token

      Replace the existing recovery phone with a new one using a valid setup code for the new number.
    `,
  ],
};

const RECOVERY_PHONE_SIGNIN_SEND_CODE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/signin/send_code',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Send an SMS code to the configured recovery phone to complete sign-in as a 2-step verification method.
    `,
  ],
};

const RECOVERY_PHONE_SIGNIN_CONFIRM_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/signin/confirm',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Verify the SMS code sent to the recovery phone to complete sign-in.
    `,
  ],
};

const RECOVERY_PHONE_RESET_PASSWORD_SEND_CODE_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/reset_password/send_code',
  notes: [
    dedent`
      🔒 Authenticated with password forgot token

      Send an SMS code to the configured recovery phone to confirm a password reset.
    `,
  ],
};

const RECOVERY_PHONE_RESET_PASSWORD_CONFIRM_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/reset_password/confirm',
  notes: [
    dedent`
      🔒 Authenticated with password forgot token

      Verify the SMS code sent to the recovery phone to complete password reset verification.
    `,
  ],
};

const RECOVERY_PHONE_DELETE = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone',
  notes: [
    dedent`
      🔒 Authenticated with verified session token

      Remove the currently configured recovery phone from the account.
    `,
  ],
};

const RECOVERY_PHONE_GET = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone',
  notes: [
    dedent`
      🔒 Authenticated with session token or password forgot token

      Return whether a recovery phone exists and, if permitted, the masked phone number information.
    `,
  ],
};

const RECOVERY_PHONE_MESSAGE_STATUS_POST = {
  ...TAGS_RECOVERY_PHONE,
  description: '/recovery_phone/message_status',
  notes: [
    dedent`
      Public webhook (Twilio)

      Accept message status callbacks from Twilio. The request is validated using either an FxA-generated signature or Twilio's signature.
    `,
  ],
};

const API_DOCS = {
  RECOVERY_PHONE_CREATE_POST,
  MFA_RECOVERY_PHONE_CREATE_POST,
  RECOVERY_PHONE_AVAILABLE_POST,
  RECOVERY_PHONE_CONFIRM_POST,
  MFA_RECOVERY_PHONE_CONFIRM_POST,
  RECOVERY_PHONE_CHANGE_POST,
  RECOVERY_PHONE_SIGNIN_SEND_CODE_POST,
  RECOVERY_PHONE_SIGNIN_CONFIRM_POST,
  RECOVERY_PHONE_RESET_PASSWORD_SEND_CODE_POST,
  RECOVERY_PHONE_RESET_PASSWORD_CONFIRM_POST,
  RECOVERY_PHONE_DELETE,
  RECOVERY_PHONE_GET,
  RECOVERY_PHONE_MESSAGE_STATUS_POST,
};

export default API_DOCS;
