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
  PASSKEYS_GET: {
    ...TAGS_PASSKEYS,
    description: '/passkeys',
    notes: [
      dedent`
        🔒 Authenticated with session token (verified)

        Returns the list of passkeys registered for the authenticated user.
        The \`publicKey\` and \`signCount\` fields are intentionally excluded
        from the response as they are internal implementation details.

        **Response:** Array of passkey metadata objects, each containing
        \`credentialId\`, \`name\`, \`createdAt\`, \`lastUsedAt\`, \`transports\`, and \`prfEnabled\`.
      `,
    ],
  },
  PASSKEY_CREDENTIAL_DELETE: {
    ...TAGS_PASSKEYS,
    description: '/passkey/{credentialId}',
    notes: [
      dedent`
        🔒 Authenticated with MFA JWT (scope: mfa:passkey)

        Deletes the passkey identified by \`credentialId\` (base64url-encoded).
        The service validates that the passkey exists and belongs to the
        authenticated user. Returns 404 if the passkey is not found or is
        not owned by the user.

        **Params:**
        - \`credentialId\` (string, required) — base64url-encoded credential ID

        **Security event:** \`account.passkey.removed\` is recorded on success.
      `,
    ],
  },
  PASSKEY_CREDENTIAL_PATCH: {
    ...TAGS_PASSKEYS,
    description: '/passkey/{credentialId}',
    notes: [
      dedent`
        🔒 Authenticated with MFA JWT (scope: mfa:passkey)

        Renames the passkey identified by \`credentialId\` (base64url-encoded).
        The new name must be 1–255 characters and non-empty after trimming.
        The service validates that the passkey exists and belongs to the
        authenticated user. Returns 404 if the passkey is not found or is
        not owned by the user.

        **Params:**
        - \`credentialId\` (string, required) — base64url-encoded credential ID

        **Request body:**
        - \`name\` (string, required) — new display name (1–255 chars)

        **Response:** Updated passkey metadata including \`credentialId\`, \`name\`,
        \`createdAt\`, \`lastUsedAt\`, \`transports\`, and \`prfEnabled\`.
      `,
    ],
  },
};

export default PASSKEYS_API_DOCS;
