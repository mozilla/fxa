/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Collapsible reference tables for the WebAuthnHelpersExample test harness.
 *
 * Exported components:
 *   JsonFieldGuide    — request option descriptions, shown in JSON mode
 *   JsonResponseGuide — response field descriptions, shown in JSON mode after a call
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldSpec = {
  path: string;
  desc: string;
  values?: string;
};

// ─── Request option data ──────────────────────────────────────────────────────

export const CREATION_FIELDS: FieldSpec[] = [
  {
    path: 'rp.id',
    desc: 'Relying party domain. Must match the current origin — omit for localhost, "accounts.firefox.com" in production. A mismatch throws SecurityError.',
  },
  {
    path: 'user.id',
    desc: 'User handle (base64url). Must be unique and stable per user account; not displayed to the user. Platform authenticators store one credential per (rpId, user.id) pair — re-using the same ID replaces the earlier credential rather than creating a second entry. Change this value between registrations to get multiple accounts in the discoverable credential picker. The form auto-generates a new ID on load/reset.',
  },
  {
    path: 'timeout',
    desc: 'Browser UI timeout hint in ms. The browser may clamp or ignore this value; our AbortController cancels the operation after 60 s regardless.',
    values: 'e.g. 60000',
  },
  {
    path: 'authenticatorSelection.residentKey',
    desc: '"required" creates a discoverable credential (passkey) stored on the authenticator — necessary for the passwordless / usernameless flow.',
    values: '"required" | "preferred" | "discouraged"',
  },
  {
    path: 'authenticatorSelection.userVerification',
    desc: 'Whether the authenticator must verify the user via biometric or PIN before signing.',
    values: '"required" | "preferred" | "discouraged"',
  },
  {
    path: 'attestation',
    desc: 'Level of attestation statement requested. "none" is recommended — direct/enterprise may reveal device fingerprints.',
    values: '"none" | "indirect" | "direct" | "enterprise"',
  },
  {
    path: 'excludeCredentials[].id',
    desc: 'Credential IDs the authenticator must not re-register. If the authenticator holds a matching credential it throws InvalidStateError instead of creating a new one. In form mode, registered credentials are available as toggle chips under "Exclude credentials". In JSON mode, paste an id value from a prior registration response.',
  },
  {
    path: 'extensions.prf.eval.first',
    desc: 'PRF salt (base64url). A static application-level constant supplied by the server — not per-user or per-credential.',
  },
  {
    path: 'pubKeyCredParams[].alg',
    desc: 'Preferred signature algorithm. -7 = ES256 (ECDSA P-256), -257 = RS256 (RSA PKCS#1). List multiple in priority order.',
  },
];

export const REQUEST_FIELDS: FieldSpec[] = [
  {
    path: 'rpId',
    desc: 'Relying party domain. Must match the current origin — omit for localhost, "accounts.firefox.com" in production. Set to a mismatched value to trigger SecurityError.',
  },
  {
    path: 'timeout',
    desc: 'Browser UI timeout hint in ms. Our AbortController fires after 60 s regardless.',
    values: 'e.g. 60000',
  },
  {
    path: 'userVerification',
    desc: 'Whether the authenticator must verify the user via biometric or PIN.',
    values: '"required" | "preferred" | "discouraged"',
  },
  {
    path: 'allowCredentials[].id',
    desc: 'Credential IDs to target. Omit or leave as an empty array for discoverable / usernameless flow — the authenticator shows all passkeys for this domain.',
  },
  {
    path: 'extensions.prf.eval.first',
    desc: 'PRF salt (base64url). Must be the same static value sent at registration; the authenticator returns a deterministic output bound to the credential key.',
  },
];

// ─── Response field data ──────────────────────────────────────────────────────

export const ATTESTATION_RESPONSE_FIELDS: FieldSpec[] = [
  {
    path: 'id / rawId',
    desc: 'Credential identifier (base64url). Store server-side alongside the user account; passed back in allowCredentials on future assertions.',
  },
  {
    path: 'authenticatorAttachment',
    desc: 'How the authenticator is connected to the client. "platform" = device-bound (Touch ID, Windows Hello); "cross-platform" = roaming (YubiKey, phone via hybrid).',
    values: '"platform" | "cross-platform"',
  },
  {
    path: 'response.clientDataJSON',
    desc: 'Base64url JSON containing the challenge, origin, and crossOrigin flag. Server verifies that challenge matches the one it issued and origin matches the RP.',
  },
  {
    path: 'response.attestationObject',
    desc: 'Base64url CBOR blob. Contains: fmt (attestation format), attStmt (attestation statement), and authData. The server decodes authData to extract the AAGUID, credential ID, COSE public key, and sign counter for storage.',
  },
  {
    path: 'response.transports',
    desc: 'Transport methods the authenticator supports. Store server-side and return as allowCredentials[].transports on future assertions — the browser uses this to select the right authenticator without prompting unnecessarily.',
    values: '"internal" | "hybrid" | "usb" | "nfc" | "ble"',
  },
  {
    path: 'clientExtensionResults.prf.enabled',
    desc: 'true if this authenticator supports the PRF extension. Store server-side to know whether to include extensions.prf.eval on future authentication requests.',
  },
];

export const ASSERTION_RESPONSE_FIELDS: FieldSpec[] = [
  {
    path: 'id / rawId',
    desc: 'Credential ID that was used (base64url). Look up the matching stored credential on the server to retrieve the public key for signature verification.',
  },
  {
    path: 'authenticatorAttachment',
    desc: '"platform" (device-bound) or "cross-platform" (roaming). Can inform UX (e.g. "use your device passkey" vs "insert your security key").',
    values: '"platform" | "cross-platform"',
  },
  {
    path: 'response.clientDataJSON',
    desc: 'Base64url JSON: challenge, origin, type ("webauthn.get"). Server verifies the challenge matches the one it issued and origin matches the RP.',
  },
  {
    path: 'response.authenticatorData',
    desc: 'Base64url binary: RP ID hash (32 bytes), flags byte (UP = user present, UV = user verified, BE = backup eligible, BS = backed up), sign counter (4 bytes). Server verifies RP ID hash, UP/UV flags, and that the counter is greater than the stored value to detect cloned authenticators.',
  },
  {
    path: 'response.signature',
    desc: 'Base64url ECDSA/RSA signature over authData ‖ SHA-256(clientDataJSON). Server verifies this against the stored public key to authenticate the user.',
  },
  {
    path: 'response.userHandle',
    desc: 'Base64url user ID set at registration (user.id). Present for discoverable credentials — the server uses this to identify the account without a prior username input.',
  },
  {
    path: 'clientExtensionResults.prf.results.first',
    desc: "Base64url PRF output. Deterministic secret derived from the static PRF salt and the credential key. Use this to decrypt the user's wrapped sync encryption key.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function ReferenceGuide({
  summary,
  colHeader,
  fields,
  className = '',
}: {
  summary: string;
  colHeader: string;
  fields: FieldSpec[];
  className?: string;
}) {
  return (
    <details className={`group ${className}`}>
      <summary className="cursor-pointer list-none flex items-center gap-2 text-xs text-grey-400 hover:text-grey-600 w-fit">
        <span className="group-open:hidden">▶</span>
        <span className="hidden group-open:inline">▼</span>
        {summary}
      </summary>
      <table className="w-full border-collapse mt-2 border border-grey-100 rounded-md overflow-hidden text-xs">
        <thead>
          <tr className="bg-grey-50 border-b border-grey-200">
            <th className="text-left font-bold text-grey-700 px-3 py-2 whitespace-nowrap w-px">
              {colHeader}
            </th>
            <th className="text-left font-bold text-grey-700 px-3 py-2">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-grey-100">
          {fields.map(({ path, desc, values }) => (
            <tr key={path}>
              <td className="font-mono text-blue-600 px-3 py-2 align-top whitespace-nowrap">
                {path}
              </td>
              <td className="text-grey-600 px-3 py-2 align-top">
                {desc}
                {values && (
                  <code className="block mt-0.5 text-grey-400">{values}</code>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function JsonFieldGuide({ operation }: { operation: 'create' | 'get' }) {
  return (
    <ReferenceGuide
      summary="Field reference"
      colHeader="Option"
      fields={operation === 'create' ? CREATION_FIELDS : REQUEST_FIELDS}
      className="mt-3 mb-4"
    />
  );
}

export function JsonResponseGuide({
  operation,
}: {
  operation: 'create' | 'get';
}) {
  return (
    <ReferenceGuide
      summary="Response field reference"
      colHeader="Field"
      fields={
        operation === 'create'
          ? ATTESTATION_RESPONSE_FIELDS
          : ASSERTION_RESPONSE_FIELDS
      }
      className="mt-2"
    />
  );
}
