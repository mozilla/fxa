/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

/** Shared tag configuration applied to every passkey endpoint. */
const TAGS_PASSKEYS = {
  tags: TAGS.PASSKEYS,
};

/**
 * Swagger/OpenAPI documentation for `POST /passkey/registration/start`.
 *
 * Initiates the WebAuthn registration (attestation) ceremony.
 */
const PASSKEY_REGISTRATION_START_POST = {
  ...TAGS_PASSKEYS,
  description: '/passkey/registration/start',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:passkey)

      Initiates the WebAuthn registration ceremony by generating a challenge and
      registration options for the authenticator. The returned options should be
      passed to the WebAuthn client-side API (navigator.credentials.create).

      **Request body:** none

      **Response:** PublicKeyCredentialCreationOptionsJSON — pass directly to
      \`navigator.credentials.create({ publicKey: response })\`.
    `,
  ],
};

/**
 * Swagger/OpenAPI documentation for `POST /passkey/registration/finish`.
 *
 * Completes the WebAuthn registration ceremony and persists the new credential.
 */
const PASSKEY_REGISTRATION_FINISH_POST = {
  ...TAGS_PASSKEYS,
  description: '/passkey/registration/finish',
  notes: [
    dedent`
      🔒 Authenticated with MFA JWT (scope: mfa:passkey)

      Completes the WebAuthn registration ceremony by verifying the attestation
      response from the authenticator. On success, stores the new passkey credential
      and returns its metadata.

      **Request body:**
      - \`response\` (object, required) — RegistrationResponseJSON from the browser
      - \`challenge\` (string, required) — The challenge returned by the start endpoint

      **Response:** passkey metadata including \`credentialId\`, \`name\`,
      \`createdAt\`, \`lastUsedAt\`, and \`transports\`.
    `,
  ],
};

const PASSKEYS_API_DOCS = {
  PASSKEY_REGISTRATION_START_POST,
  PASSKEY_REGISTRATION_FINISH_POST,
};

export default PASSKEYS_API_DOCS;
