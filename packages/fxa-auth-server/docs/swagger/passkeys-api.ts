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

/**
 * Swagger/OpenAPI documentation for `POST /passkey/authentication/start`.
 *
 * Initiates the WebAuthn authentication (assertion) ceremony.
 */
const PASSKEY_AUTHENTICATION_START_POST = {
  ...TAGS_PASSKEYS,
  description: '/passkey/authentication/start',
  notes: [
    dedent`
      🔓 Unauthenticated

      Initiates the WebAuthn authentication ceremony. Returns
      \`PublicKeyCredentialRequestOptionsJSON\` to pass to
      \`navigator.credentials.get\`. \`allowCredentials\` is always empty
      \`allowCredentials\` is omitted when the allow-list is empty (discoverable flow).

      **Request body:**
      - \`keysRequired\` (boolean, optional) — hint for the keys-required PRF scope
      - \`scope\` (string, optional) — an MFA action from \`config.mfa.actions\`. Stored
        on the challenge, so \`/finish\` returns an \`mfa:<scope>\` token for it.
    `,
  ],
};

/**
 * Swagger/OpenAPI documentation for `POST /passkey/authentication/finish`.
 *
 * Completes the WebAuthn authentication ceremony and creates an AAL2 session.
 */
const PASSKEY_AUTHENTICATION_FINISH_POST = {
  ...TAGS_PASSKEYS,
  description: '/passkey/authentication/finish',
  notes: [
    dedent`
      🔓 Unauthenticated

      Completes the WebAuthn authentication ceremony. On success, returns an
      AAL2 session token.

      **Request body:**
      - \`response\` (object, required) — AuthenticationResponseJSON from the browser
      - \`challenge\` (string, required) — challenge from the start endpoint
      - \`service\` (string, optional) — OAuth service identifier (e.g. \`"sync"\`)
      - \`keysRequired\` (boolean, required) — when \`true\`, this login still needs
        Sync-scoped keys obtained via a follow-up step (a password step today), so
        the server defers its login notifications/metrics until keys are available.

      **Response:** \`uid\`, \`sessionToken\`, \`verified\`, \`hasPassword\`, and
      \`mfaToken\` when \`/start\` was given a \`scope\`. The token carries that scope
      and the credential that signed the assertion.

      **Security event:** \`account.passkey.authentication_success\` recorded on success.
    `,
  ],
};

const PASSKEYS_API_DOCS = {
  PASSKEY_REGISTRATION_START_POST,
  PASSKEY_REGISTRATION_FINISH_POST,
  PASSKEY_AUTHENTICATION_START_POST,
  PASSKEY_AUTHENTICATION_FINISH_POST,
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

  /**
   * Swagger/OpenAPI documentation for `POST /passkey/wraps`.
   *
   * Stores the wrap envelope that lets a passkey unlock `kB` without a password.
   */
  PASSKEY_WRAPS_POST: {
    ...TAGS_PASSKEYS,
    description: '/passkey/wraps',
    notes: [
      dedent`
        🔒 Authenticated with MFA JWT (scope: mfa:passkey)

        Stores the wrap envelope for one passkey. The envelope is produced entirely
        on the client: \`kB\` is sealed with HPKE to a per-wrap recipient key, whose
        private half is encrypted under a key derived from the credential's WebAuthn
        PRF output. The server stores all five fields uninterpreted and never sees
        \`kB\`, the private key, or the PRF output.

        The token must be bound to \`credentialId\`, which \`/passkey/authentication/finish\`
        does when \`/start\` asks for the \`passkey\` scope. A token minted any other way
        carries no binding and is rejected.

        **Request body:**
        - \`credentialId\` (string, required) — base64url credential ID
        - \`pkR\` (string, required) — base64url, 133 bytes
        - \`prfWrappedSkR\` (string, required) — base64url, 82 bytes
        - \`keyWrapIv\` (string, required) — base64url, 12 bytes
        - \`hpkeEncapsulatedSecret\` (string, required) — base64url, 133 bytes
        - \`hpkeSealedKb\` (string, required) — base64url, 48 bytes

        **Response:** \`{ created: boolean }\` — false when an identical wrap was
        already stored.

        **Errors:**
        - \`401\` errno 223 — the token is invalid, or is not bound to \`credentialId\`
        - \`404\` errno 224 — the passkey was deleted after the assertion
        - \`409\` errno 235 — a different wrap already exists for this credential

        **Security events:** \`account.passkey.wrap_created\` on a new wrap;
        \`account.passkey.wrap_creation_failure\` on any failure to store one.
      `,
    ],
  },

  PASSKEY_WRAPS_GET: {
    ...TAGS_PASSKEYS,
    description: '/passkey/wraps/{credentialId}',
    notes: [
      dedent`
        🔒 Authenticated with MFA JWT (scope: mfa:passkey)

        Returns the wrap envelope for one passkey, as stored. Unsealing happens
        entirely on the client and needs the credential's WebAuthn PRF output, so
        the envelope is inert to anyone who cannot complete an assertion with that
        credential. The server never sees \`kB\`, the recipient private key, or the
        PRF output.

        The token must be bound to \`credentialId\`, as it is for the write. A wrap
        is only ever fetched to complete a sign-in with that same credential.

        A wrap stored before the account's \`keysChangedAt\` seals a \`kB\` the
        account no longer uses, and is withheld rather than returned — the client
        falls back to a password sign-in and re-enrols.

        **Path parameters:**
        - \`credentialId\` (string, required) — base64url credential ID

        **Response:** the five base64url envelope fields (\`pkR\`,
        \`prfWrappedSkR\`, \`keyWrapIv\`, \`hpkeEncapsulatedSecret\`,
        \`hpkeSealedKb\`) plus \`createdAt\`.

        **Errors:**
        - \`401\` errno 223 — the token is invalid, or is not bound to \`credentialId\`
        - \`404\` errno 224 — no such passkey for this account
        - \`404\` errno 234 — the passkey has no wrap
        - \`404\` errno 236 — the wrap predates the account's \`keysChangedAt\`

        **Security events:** none. This runs on every passwordless sign-in, so an
        event here would bury the history it is meant to make legible.
      `,
    ],
  },
};

export default PASSKEYS_API_DOCS;
