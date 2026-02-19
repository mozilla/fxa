/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * WebAuthnHelpersExample — developer test harness for src/lib/passkeys/webauthn.ts
 *
 * PURPOSE
 * -------
 * Provides a live, interactive UI for exercising the WebAuthn browser
 * utilities (createCredential, getCredential, isWebAuthnLevel3Supported) against
 * the real browser Credentials API. It is intended for engineers, QA, and
 * product/UX stakeholders who need to inspect WebAuthn request/response
 * payloads, reproduce error conditions, or validate passkey behaviour across
 * authenticators and platforms.
 *
 * NOT USER-FACING
 * ---------------
 * This page is a developer tool only. It must not appear in production
 * navigation, account settings, or any user-visible flow. It does not
 * implement any real authentication or key-management logic.
 *
 * ENVIRONMENTS
 * ------------
 * Currently served via Storybook (localhost), where WebAuthn works without
 * any additional configuration because localhost is a valid secure context
 * and the rpId defaults to the current hostname.
 *
 * The component can also be mounted as a route in fxa-settings for testing
 * against real backend infrastructure (accounts-stage, accounts-prod) if the
 * following conditions are met:
 *
 *   1. rpId is sourced from config (e.g. CONFIG.authServerConfig.rpId or
 *      similar) rather than being omitted/hardcoded.
 *   2. The route is added to the router (e.g. /passkey-test or similar).
 *   3. The route is gated behind a feature flag so it is never reachable by
 *      regular users and can be toggled off for any release.
 *
 * When mounted this way the harness can be used to validate end-to-end
 * passkey registration and assertion flows — including PRF key derivation —
 * against the live auth server before the production UI is built.
 */

import React, { useCallback, useState } from 'react';
import { JsonFieldGuide, JsonResponseGuide } from './fieldGuides';
import {
  createCredential,
  getCredential,
  isWebAuthnLevel3Supported,
  AuthenticatorAttestationResponseJSON,
  AuthenticatorResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '../../lib/passkeys/webauthn';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomBase64url(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// The PRF salt is a fully static, application-level constant supplied by the
// server. Uniqueness of the PRF output is guaranteed by each credential's own
// private key — the same salt on a different passkey produces a different
// output, so no per-user or per-credential variation of the salt is needed.
const PRF_SALT = 'dGVzdC1wcmYtc2FsdA'; // "test-prf-salt" base64url

// ─── Types ────────────────────────────────────────────────────────────────────

type EditMode = 'form' | 'json';
type Operation = 'create' | 'get';

type CreationFormValues = {
  rpName: string;
  email: string;
  userId: string;
  userVerification: UserVerificationRequirement;
  attestation: AttestationConveyancePreference;
  includePrf: boolean;
  excludeCredentialIds: string[];
};

type RequestFormValues = {
  userVerification: UserVerificationRequirement;
  credentialId: string;
  includePrf: boolean;
};

type RecentCredential = { id: string; n: number };

type CallState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; name: string; message: string };

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultCreationForm = (): CreationFormValues => ({
  rpName: 'Mozilla Accounts',
  email: 'test@example.com',
  // Randomised on every load/reset so that successive registrations produce
  // distinct (rpId, user.id) slots in the authenticator. A static user.id
  // causes the platform authenticator to replace the earlier credential,
  // leaving only one entry in the discoverable credential picker.
  userId: randomBase64url(16),
  userVerification: 'required',
  attestation: 'none',
  includePrf: true,
  excludeCredentialIds: [],
});

const defaultRequestForm = (): RequestFormValues => ({
  userVerification: 'required',
  credentialId: '',
  includePrf: false,
});

// ─── Conversion functions ─────────────────────────────────────────────────────

function creationFormToOptions(
  form: CreationFormValues
): PublicKeyCredentialCreationOptionsJSON {
  return {
    // rp.id intentionally omitted — defaults to current domain (localhost in
    // Storybook). Production value: "accounts.firefox.com"
    rp: { name: form.rpName },
    user: { id: form.userId, name: form.email, displayName: form.email },
    challenge: randomBase64url(),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    excludeCredentials: form.excludeCredentialIds.map((id) => ({
      id,
      type: 'public-key' as const,
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: form.userVerification,
    },
    attestation: form.attestation,
    ...(form.includePrf && {
      extensions: { prf: { eval: { first: PRF_SALT } } },
    }),
  };
}

function requestFormToOptions(
  form: RequestFormValues
): PublicKeyCredentialRequestOptionsJSON {
  return {
    // rpId intentionally omitted — defaults to current domain (localhost in
    // Storybook). Production value: "accounts.firefox.com"
    challenge: randomBase64url(),
    userVerification: form.userVerification,
    ...(form.credentialId && {
      allowCredentials: [{ id: form.credentialId, type: 'public-key' }],
    }),
    ...(form.includePrf && {
      extensions: { prf: { eval: { first: PRF_SALT } } },
    }),
  };
}

function optionsToCreationForm(
  opts: PublicKeyCredentialCreationOptionsJSON
): CreationFormValues {
  return {
    rpName: opts.rp.name,
    email: opts.user.name,
    userId: opts.user.id,
    userVerification:
      opts.authenticatorSelection?.userVerification ?? 'required',
    attestation: opts.attestation ?? 'none',
    includePrf: !!opts.extensions?.prf,
    excludeCredentialIds: (opts.excludeCredentials ?? []).map((c) => c.id),
  };
}

function optionsToRequestForm(
  opts: PublicKeyCredentialRequestOptionsJSON
): RequestFormValues {
  return {
    userVerification: opts.userVerification ?? 'required',
    credentialId: opts.allowCredentials?.[0]?.id ?? '',
    includePrf: !!opts.extensions?.prf,
  };
}

const defaultCreationJson = () =>
  JSON.stringify(creationFormToOptions(defaultCreationForm()), null, 2);

const defaultRequestJson = () =>
  JSON.stringify(requestFormToOptions(defaultRequestForm()), null, 2);

// ─── Utilities ────────────────────────────────────────────────────────────────

function parseJson<T>(
  raw: string
): { value: T; error: null } | { value: null; error: string } {
  try {
    return { value: JSON.parse(raw) as T, error: null };
  } catch (e) {
    return { value: null, error: (e as Error).message };
  }
}

function toCatchState(e: unknown): { name: string; message: string } {
  if (e instanceof DOMException) return { name: e.name, message: e.message };
  return { name: 'Error', message: String(e) };
}

// Context shown in form mode alongside the raw DOMException name + message.
const ERROR_CONTEXT: Partial<Record<string, string>> = {
  NotAllowedError:
    'The user dismissed the prompt, the credential is unavailable on this device, or a credential matched excludeCredentials. Some platform authenticators (e.g. Apple Keychain) throw NotAllowedError for excluded credentials rather than InvalidStateError — the two are indistinguishable from the error alone. Check whether excludeCredentials was populated and whether the user actually cancelled.',
  SecurityError:
    'The RP ID does not match this origin. Storybook runs on localhost, so the RP ID must be omitted or set to "localhost".',
  TimeoutError:
    'The 60 s AbortController timeout elapsed — the browser prompt was left open too long.',
  InvalidStateError:
    'A passkey matching an excludeCredentials entry already exists on this authenticator; duplicate registration was rejected.',
  NotSupportedError:
    'The browser does not support the WebAuthn Level 3 JSON helpers (parseCreationOptionsFromJSON / parseRequestOptionsFromJSON).',
  UnknownError:
    'The browser returned null, or a non-native credential type. "Object" with rawId: ArrayBuffer in the field list means a password manager extension (e.g. 1Password) intercepted navigator.credentials and returned a Level 2 form — ArrayBuffer fields, a getClientExtensionResults method, and a broken toJSON that throws "Illegal invocation". This is a known 1Password extension bug. It is not a production concern: accounts.firefox.com does not permit browser extensions. Use the native platform authenticator (Apple Keychain, Windows Hello) for testing.',
};

// How-to rows rendered in the collapsible Error reference section.
const ERROR_REFERENCE: { name: string; how: string }[] = [
  {
    name: 'NotAllowedError',
    how: 'Cancel or dismiss the browser passkey prompt. Also occurs when the credential was registered on a different device, deleted, or (on some platforms e.g. Apple Keychain) when a credential matches excludeCredentials — the platform may throw NotAllowedError rather than InvalidStateError in that case, making the two indistinguishable from the error name alone.',
  },
  {
    name: 'SecurityError',
    how: 'In JSON mode, add "rpId": "accounts.firefox.com" to the options object. Storybook\'s localhost origin will not match, causing the browser to reject the request.',
  },
  {
    name: 'TimeoutError',
    how: 'Leave the browser prompt open without interacting. After 60 seconds, our AbortController fires and the error is rethrown as TimeoutError. (The "timeout" field in the JSON options is a browser hint only and does not affect our internal timer.)',
  },
  {
    name: 'InvalidStateError',
    how: 'In form mode: register a passkey, check the matching credential under "Exclude credentials", then click createCredential() again. In JSON mode: copy a registered credential ID into excludeCredentials[].id. Note: some platforms (e.g. Apple Keychain) throw NotAllowedError instead.',
  },
  {
    name: 'NotSupportedError',
    how: 'Open in a browser that lacks WebAuthn Level 3 support (e.g. older Safari). Clicking any call button will throw immediately before a prompt appears.',
  },
  {
    name: 'UnknownError',
    how: 'Use the 1Password browser extension to handle the passkey prompt. 1Password has a known bug where it returns a Level 2 form (rawId: ArrayBuffer, getClientExtensionResults method, broken toJSON) instead of a native PublicKeyCredential. This is not a production concern — accounts.firefox.com does not permit browser extensions.',
  },
];

// ─── Friendly result utilities ────────────────────────────────────────────────

// PRF extension output shape from credential.clientExtensionResults.prf.
// create → always contains { enabled: boolean } indicating authenticator support.
//          When eval is included in creation options, some authenticators (e.g.
//          Apple Keychain on macOS Sonoma / iOS 17+) additionally return
//          { results: { first: "<base64url>" } } — spec-compliant optional
//          behaviour; the bytes are identical to what a subsequent getCredential()
//          call would produce with the same salt.
// get    → contains { results: { first: "<base64url>" } } when PRF was requested
//          and evaluated; results absent (or results.first absent) otherwise.
// In both cases, a non-empty results.first string is the signal for usable key
// material.
type PrfExtensionResult = { enabled?: boolean; results?: { first?: string } };

function isAttestationResponse(
  response: AuthenticatorResponseJSON
): response is AuthenticatorAttestationResponseJSON {
  return 'attestationObject' in response;
}

function truncateId(id: string): string {
  if (id.length <= 20) return id;
  return `${id.slice(0, 10)}…${id.slice(-10)}`;
}

function friendlyAttachment(attachment?: string): string {
  if (attachment === 'platform') return 'Platform (this device)';
  if (attachment === 'cross-platform') return 'Cross-platform (security key)';
  return attachment ?? 'Not reported';
}

/** base64url → Uint8Array without any external dependencies. */
function base64urlToBytes(s: string): Uint8Array {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

/** 16 raw bytes → "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" UUID string. */
function bytesToUuid(b: Uint8Array): string {
  const h = Array.from(b)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Extract the AAGUID from a base64url-encoded CBOR attestationObject.
 *
 * The attestationObject is a CBOR map containing { fmt, attStmt, authData }.
 * We locate the "authData" key by its fixed CBOR encoding, read the byte
 * string that follows, then extract bytes 37–52 which the WebAuthn spec
 * defines as the 16-byte AAGUID (present when the AT flag is set).
 *
 * Returns null when the authenticator did not include attested credential
 * data (AT flag unset) or when the CBOR cannot be parsed.
 */
function parseAaguid(attestationObject: string): string | null {
  try {
    const buf = base64urlToBytes(attestationObject);

    // CBOR encoding of the text key "authData" (8 chars): 0x68 + UTF-8 bytes
    const KEY = [0x68, 0x61, 0x75, 0x74, 0x68, 0x44, 0x61, 0x74, 0x61];

    let pos = -1;
    outer: for (let i = 0; i <= buf.length - KEY.length; i++) {
      for (let j = 0; j < KEY.length; j++) {
        if (buf[i + j] !== KEY[j]) continue outer;
      }
      pos = i + KEY.length;
      break;
    }
    if (pos === -1) return null;

    // Parse the CBOR byte-string header to find where authData bytes start.
    const fb = buf[pos];
    let dataStart: number;
    if (fb >= 0x40 && fb <= 0x57) {
      dataStart = pos + 1; // length encoded in low 5 bits
    } else if (fb === 0x58) {
      dataStart = pos + 2; // 1-byte length follows
    } else if (fb === 0x59) {
      dataStart = pos + 3; // 2-byte length follows
    } else {
      return null;
    }

    // authData layout (WebAuthn §6.1):
    //   [0-31]  rpIdHash
    //   [32]    flags  (bit 6 = AT: attested credential data included)
    //   [33-36] signCount
    //   [37-52] aaguid (16 bytes) — present only when AT flag is set
    const flags = buf[dataStart + 32];
    if (!(flags & 0x40)) return null; // AT flag not set

    return bytesToUuid(buf.slice(dataStart + 37, dataStart + 53));
  } catch {
    return null;
  }
}

// ─── Friendly result components ───────────────────────────────────────────────

function FriendlyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr className="border-b border-grey-100 last:border-0">
      <th className="text-xs font-normal text-grey-500 text-left py-2 pl-3 pr-4 align-middle whitespace-nowrap w-px">
        {label}
      </th>
      <td className="text-xs font-mono text-grey-900 py-2 pr-3 align-middle break-all">
        {value}
      </td>
    </tr>
  );
}

function FriendlyCredentialResult({
  data,
  operation,
}: {
  data: PublicKeyCredentialJSON;
  operation: Operation;
}) {
  const isCreate = operation === 'create';
  const title = isCreate ? 'Passkey registered' : 'Authentication successful';

  const aaguid =
    isCreate && isAttestationResponse(data.response)
      ? parseAaguid(data.response.attestationObject)
      : null;

  const transports = isAttestationResponse(data.response)
    ? data.response.transports
    : undefined;

  const userHandle = !isAttestationResponse(data.response)
    ? data.response.userHandle
    : undefined;

  const prfResult = data.clientExtensionResults['prf'] as
    | PrfExtensionResult
    | undefined;

  return (
    <div className="rounded-md border border-green-300 bg-green-200 mt-4 p-4">
      <p className="text-sm font-bold text-green-900 mb-3">✓ {title}</p>
      <table className="w-full border-collapse bg-white rounded border border-grey-100">
        <tbody>
          <FriendlyRow label="Credential ID" value={truncateId(data.id)} />
          <FriendlyRow
            label="Attachment"
            value={friendlyAttachment(data.authenticatorAttachment)}
          />
          {aaguid && <FriendlyRow label="AAGUID" value={aaguid} />}
          {isCreate && (
            <FriendlyRow
              label="Transports"
              value={
                transports && transports.length > 0
                  ? transports.join(', ')
                  : 'None reported'
              }
            />
          )}
          {isCreate && (
            <FriendlyRow
              label="PRF supported"
              value={
                prfResult?.enabled === true
                  ? '✓ Supported by this authenticator'
                  : 'Not supported / not returned'
              }
            />
          )}
          {isCreate && prfResult?.enabled === true && (
            <FriendlyRow
              label="PRF output"
              value={
                prfResult.results?.first
                  ? '✓ Received during registration — actual key material, usable immediately for key wrapping without a separate authentication ceremony'
                  : 'Not returned during registration — a getCredential() call will be needed to evaluate PRF before key wrapping'
              }
            />
          )}
          {!isCreate && (
            <FriendlyRow
              label="User handle"
              value={userHandle ? truncateId(userHandle) : 'Not returned'}
            />
          )}
          {!isCreate && prfResult !== undefined && (
            <FriendlyRow
              label="PRF output"
              value={
                prfResult.results?.first
                  ? '✓ Received'
                  : 'Requested but not returned by authenticator'
              }
            />
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Shown in JSON mode above the options textarea. Displays session credentials
 * as chips — click any chip to copy its full credential ID to the clipboard,
 * so it can be pasted into allowCredentials[].id or excludeCredentials[].id.
 */
function SessionCredentialChips({
  credentials,
  label,
  onClear,
}: {
  credentials: RecentCredential[];
  label: string;
  onClear: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (credentials.length === 0) return null;

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div className="mb-3">
      <p className="text-xs text-grey-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2 items-center">
        {credentials.map((cred) => (
          <button
            key={cred.id}
            type="button"
            title={cred.id}
            onClick={() => handleCopy(cred.id)}
            className="text-xs font-mono p-2 rounded border bg-white border-grey-300 text-grey-700 hover:border-blue-400 hover:text-blue-600 transition-standard"
          >
            {copiedId === cred.id
              ? '✓ Copied'
              : `#${cred.n} ${truncateId(cred.id)}`}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-grey-400 hover:text-red-600 transition-standard ml-1"
        >
          × Clear
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-grey-100 shadow-sm p-6 mb-5">
      <h2 className="font-header font-bold text-base font-mono mb-1">
        {title}
      </h2>
      <p className="text-sm text-grey-500 mb-4">{description}</p>
      {children}
    </section>
  );
}

function CredentialResultDisplay({
  state,
  operation,
  editMode,
}: {
  state: CallState<PublicKeyCredentialJSON>;
  operation: Operation;
  editMode: EditMode;
}) {
  if (state.status === 'idle') return null;
  if (state.status === 'loading') {
    return (
      <p className="text-sm text-grey-500 italic mt-4">
        Waiting for browser response…
      </p>
    );
  }
  if (state.status === 'error') {
    const context = editMode === 'form' ? ERROR_CONTEXT[state.name] : undefined;
    return (
      <div
        className="rounded-md bg-red-100 mt-4 px-4 py-3 text-sm"
        role="alert"
        aria-live="assertive"
      >
        <p>
          <span className="font-bold font-mono">{state.name}</span>:{' '}
          {state.message}
        </p>
        {context && <p className="mt-2 text-xs text-red-900">{context}</p>}
      </div>
    );
  }
  if (editMode === 'form') {
    return <FriendlyCredentialResult data={state.data} operation={operation} />;
  }
  return (
    <div className="rounded-md border border-grey-200 bg-grey-50 mt-4 overflow-auto max-h-72">
      <pre className="font-mono text-xs text-grey-900 p-4 whitespace-pre-wrap break-all">
        {JSON.stringify(state.data, null, 2)}
      </pre>
    </div>
  );
}

function JsonTextarea({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="mb-4">
      <textarea
        className={`w-full font-mono text-xs rounded-md p-3 h-52 resize-y border transition-standard focus:outline-none ${
          error
            ? 'border-red-700 shadow-input-red-focus'
            : 'border-grey-200 focus:border-blue-400 focus:shadow-input-blue-focus'
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {error && (
        <p className="text-red-700 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'w-full border border-grey-200 rounded-md px-3 py-2 text-sm font-body focus:border-blue-400 focus:outline-none transition-standard';

function FormField({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold text-grey-900 mb-1"
      >
        {label}
      </label>
      {children}
      {description && (
        <p className="text-xs text-grey-500 mt-1">{description}</p>
      )}
    </div>
  );
}

function CreationFormView({
  form,
  onChange,
  recentCredentials,
}: {
  form: CreationFormValues;
  onChange: (f: CreationFormValues) => void;
  recentCredentials: RecentCredential[];
}) {
  const set = <K extends keyof CreationFormValues>(
    key: K,
    value: CreationFormValues[K]
  ) => onChange({ ...form, [key]: value });

  return (
    <>
      <FormField
        label="Email"
        htmlFor="create-email"
        description="Display name shown in the passkey manager. Sets user.name and user.displayName. Does not affect credential uniqueness — change User ID to register a second passkey."
      >
        <input
          id="create-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="off"
        />
      </FormField>

      <FormField
        label="User ID"
        htmlFor="create-user-id"
        description="Opaque account identifier (user.id, base64url). Platform authenticators store one credential per (rpId, user.id) pair — re-using the same ID replaces the earlier credential rather than adding a new one. Must differ between accounts to get multiple entries in the discoverable credential picker. Auto-generated on load/reset."
      >
        <input
          id="create-user-id"
          type="text"
          className={`${inputClass} font-mono`}
          value={form.userId}
          onChange={(e) => set('userId', e.target.value)}
          spellCheck={false}
        />
      </FormField>

      <FormField
        label="User verification"
        htmlFor="create-uv"
        description="'required' enforces biometric or PIN at the authenticator — recommended."
      >
        <select
          id="create-uv"
          className={inputClass}
          value={form.userVerification}
          onChange={(e) =>
            set(
              'userVerification',
              e.target.value as UserVerificationRequirement
            )
          }
        >
          <option value="required">required</option>
          <option value="preferred">preferred</option>
          <option value="discouraged">discouraged</option>
        </select>
      </FormField>

      <FormField label="PRF extension">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500 shrink-0"
            checked={form.includePrf}
            onChange={(e) => set('includePrf', e.target.checked)}
          />
          <span className="text-sm text-grey-900">Request PRF output</span>
        </label>
        <p className="text-xs text-grey-500 mt-0.5 ml-6">
          Required to set up passwordless sign-in to Sync.
        </p>
      </FormField>

      <FormField
        label="Exclude credentials"
        description="Prevents the authenticator from overwriting an existing credential - if one exists, passkey creation will fail. If exclude list is empty, the authenticator may silently replace an existing credential for the same user (same user.id) and rpId."
      >
        {recentCredentials.length > 0 ? (
          <div className="flex flex-col gap-1.5 mb-1">
            {recentCredentials.map((cred) => {
              const excluded = form.excludeCredentialIds.includes(cred.id);
              return (
                <label
                  key={cred.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500 shrink-0"
                    checked={excluded}
                    onChange={() =>
                      set(
                        'excludeCredentialIds',
                        excluded
                          ? form.excludeCredentialIds.filter(
                              (id) => id !== cred.id
                            )
                          : [...form.excludeCredentialIds, cred.id]
                      )
                    }
                  />
                  <span className="text-xs font-mono text-grey-700">
                    #{cred.n} {truncateId(cred.id)}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-grey-400 italic mb-1">
            No credentials registered this session — register a passkey above
            first, or switch to JSON mode to set IDs manually.
          </p>
        )}
      </FormField>
    </>
  );
}

function RequestFormView({
  form,
  onChange,
  recentCredentials,
  onClearCredentials,
}: {
  form: RequestFormValues;
  onChange: (f: RequestFormValues) => void;
  recentCredentials: RecentCredential[];
  onClearCredentials: () => void;
}) {
  const set = <K extends keyof RequestFormValues>(
    key: K,
    value: RequestFormValues[K]
  ) => onChange({ ...form, [key]: value });

  return (
    <>
      <FormField
        label="User verification"
        htmlFor="get-uv"
        description="'required' enforces biometric or PIN at the authenticator."
      >
        <select
          id="get-uv"
          className={inputClass}
          value={form.userVerification}
          onChange={(e) =>
            set(
              'userVerification',
              e.target.value as UserVerificationRequirement
            )
          }
        >
          <option value="required">required</option>
          <option value="preferred">preferred</option>
          <option value="discouraged">discouraged</option>
        </select>
      </FormField>

      <FormField
        label="Credential ID"
        htmlFor="get-cred-id"
        description="Leave empty for discoverable credential flow — the authenticator shows all passkeys for this domain. Enter a credential ID to target a specific passkey."
      >
        {recentCredentials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            {recentCredentials.map((cred) => (
              <button
                key={cred.id}
                type="button"
                onClick={() => set('credentialId', cred.id)}
                className={`text-xs font-mono p-2 rounded border transition-standard ${
                  form.credentialId === cred.id
                    ? 'bg-blue-50 border-none text-black'
                    : 'bg-white border-grey-300 text-grey-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                #{cred.n} {truncateId(cred.id)}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearCredentials}
              className="text-xs text-grey-400 hover:text-red-600 transition-standard ml-1"
            >
              × Clear
            </button>
          </div>
        )}
        <input
          id="get-cred-id"
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Empty = discoverable / usernameless flow"
          value={form.credentialId}
          onChange={(e) => set('credentialId', e.target.value)}
          spellCheck={false}
        />
      </FormField>

      <FormField label="PRF extension">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-500 shrink-0"
            checked={form.includePrf}
            onChange={(e) => set('includePrf', e.target.checked)}
          />
          <span className="text-sm text-grey-900">Request PRF output</span>
        </label>
        <p className="text-xs text-grey-500 mt-0.5 ml-6">
          Auto-enabled when the registered passkey supports PRF. The server
          sends a static salt; the authenticator returns a deterministic secret
          bound to this credential.
        </p>
      </FormField>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const WebAuthnHelpersExample = () => {
  const [editMode, setEditMode] = useState<EditMode>('form');
  const [switchError, setSwitchError] = useState<string | null>(null);

  // isWebAuthnLevel3Supported
  const [supported, setSupported] = useState<boolean | null>(null);

  // Credentials registered during this session, available for quick-select in
  // the get form.
  const [recentCredentials, setRecentCredentials] = useState<
    RecentCredential[]
  >([]);

  // Form state
  const [createForm, setCreateForm] =
    useState<CreationFormValues>(defaultCreationForm);
  const [requestForm, setRequestForm] =
    useState<RequestFormValues>(defaultRequestForm);

  // JSON state
  const [createOptionsRaw, setCreateOptionsRaw] = useState(defaultCreationJson);
  const [getOptionsRaw, setGetOptionsRaw] = useState(defaultRequestJson);
  const [createJsonError, setCreateJsonError] = useState<string | null>(null);
  const [getJsonError, setGetJsonError] = useState<string | null>(null);

  // Call results
  const [createState, setCreateState] = useState<
    CallState<PublicKeyCredentialJSON>
  >({ status: 'idle' });
  const [getState, setGetState] = useState<CallState<PublicKeyCredentialJSON>>({
    status: 'idle',
  });

  // ── Mode switching ────────────────────────────────────────────────────────

  const handleSwitchToForm = () => {
    const parsedCreate =
      parseJson<PublicKeyCredentialCreationOptionsJSON>(createOptionsRaw);
    const parsedGet =
      parseJson<PublicKeyCredentialRequestOptionsJSON>(getOptionsRaw);
    if (parsedCreate.error || parsedGet.error) {
      setSwitchError('Fix JSON errors before switching to form view.');
      return;
    }
    setSwitchError(null);
    setCreateForm(optionsToCreationForm(parsedCreate.value!));
    setRequestForm(optionsToRequestForm(parsedGet.value!));
    setEditMode('form');
  };

  const handleSwitchToJson = () => {
    setSwitchError(null);
    setCreateOptionsRaw(
      JSON.stringify(creationFormToOptions(createForm), null, 2)
    );
    setGetOptionsRaw(
      JSON.stringify(requestFormToOptions(requestForm), null, 2)
    );
    setCreateJsonError(null);
    setGetJsonError(null);
    setEditMode('json');
  };

  // ── API call handlers ─────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    let options: PublicKeyCredentialCreationOptionsJSON;
    if (editMode === 'form') {
      options = creationFormToOptions(createForm);
    } else {
      const parsed =
        parseJson<PublicKeyCredentialCreationOptionsJSON>(createOptionsRaw);
      if (parsed.error) {
        setCreateJsonError(parsed.error);
        return;
      }
      options = parsed.value!;
    }
    setCreateState({ status: 'loading' });
    try {
      const data = await createCredential(options);
      setCreateState({ status: 'success', data });
      // Record the credential for quick-select in the get form.
      setRecentCredentials((prev) => [
        ...prev,
        { id: data.id, n: prev.length + 1 },
      ]);
      // Pre-fill the get form: target the new credential and request PRF if
      // the authenticator reported it as enabled during registration.
      const prfEnabled =
        (
          data.clientExtensionResults['prf'] as
            | { enabled?: boolean }
            | undefined
        )?.enabled === true;
      setRequestForm((prev) => ({
        ...prev,
        credentialId: data.id,
        includePrf: prfEnabled,
      }));
    } catch (e) {
      setCreateState({ status: 'error', ...toCatchState(e) });
    }
  }, [editMode, createForm, createOptionsRaw]);

  const handleGet = useCallback(async () => {
    let options: PublicKeyCredentialRequestOptionsJSON;
    if (editMode === 'form') {
      options = requestFormToOptions(requestForm);
    } else {
      const parsed =
        parseJson<PublicKeyCredentialRequestOptionsJSON>(getOptionsRaw);
      if (parsed.error) {
        setGetJsonError(parsed.error);
        return;
      }
      options = parsed.value!;
    }
    setGetState({ status: 'loading' });
    try {
      setGetState({ status: 'success', data: await getCredential(options) });
    } catch (e) {
      setGetState({ status: 'error', ...toCatchState(e) });
    }
  }, [editMode, requestForm, getOptionsRaw]);

  const handleResetCreate = () => {
    setCreateForm(defaultCreationForm());
    setCreateOptionsRaw(defaultCreationJson());
    setCreateJsonError(null);
    setCreateState({ status: 'idle' });
  };

  const handleResetGet = () => {
    setRequestForm(defaultRequestForm());
    setGetOptionsRaw(defaultRequestJson());
    setGetJsonError(null);
    setGetState({ status: 'idle' });
  };

  const handleClearCredentials = () => {
    setRecentCredentials([]);
    // Chips are gone from both forms — clear any IDs staged for exclusion too.
    setCreateForm((prev) => ({ ...prev, excludeCredentialIds: [] }));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-grey-10 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="card-header mb-1">WebAuthn Helper Functions</h1>
        <p className="text-sm text-grey-500 mb-1">
          Live test harness for{' '}
          <code className="font-mono text-xs bg-white border border-grey-100 rounded px-1">
            src/lib/passkeys/webauthn.ts
          </code>
          . Calls the real browser Credentials API — your device will prompt for
          a passkey gesture.
        </p>
        <p className="text-sm text-grey-500 mb-8">
          <code className="font-mono text-xs">rp.id</code> defaults to{' '}
          <code className="font-mono text-xs bg-white border border-grey-100 rounded px-1">
            {window.location.hostname}
          </code>
          {'. '}
          Production value:{' '}
          <code className="font-mono text-xs">accounts.firefox.com</code>.
        </p>

        {/* ── Mode toggle ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex rounded-md border border-grey-200 bg-white p-0.5">
            <button
              className={`px-4 py-2 rounded text-sm font-bold transition-standard ${
                editMode === 'form'
                  ? 'bg-blue-500 text-white'
                  : 'text-grey-500 hover:text-grey-900'
              }`}
              onClick={handleSwitchToForm}
            >
              Form
            </button>
            <button
              className={`px-4 py-2 rounded text-sm font-bold transition-standard ${
                editMode === 'json'
                  ? 'bg-blue-500 text-white'
                  : 'text-grey-500 hover:text-grey-900'
              }`}
              onClick={handleSwitchToJson}
            >
              JSON
            </button>
          </div>
          <p className="text-xs text-grey-500">
            {editMode === 'form'
              ? 'Simplified view — good for exploratory testing'
              : 'Full control over request options'}
          </p>
          {switchError && (
            <p className="text-xs text-red-700" role="alert">
              {switchError}
            </p>
          )}
        </div>

        {/* ── isWebAuthnLevel3Supported ── */}
        <SectionCard
          title="isWebAuthnLevel3Supported()"
          description="Checks for PublicKeyCredential and the Level 3 JSON helpers: parseCreationOptionsFromJSON and parseRequestOptionsFromJSON."
        >
          <button
            className="cta-primary p-2"
            onClick={() => setSupported(isWebAuthnLevel3Supported())}
          >
            Check support
          </button>
          {supported !== null && (
            <div
              className={`rounded-md mt-4 px-4 py-3 text-sm font-bold ${
                supported ? 'bg-green-200' : 'bg-red-100'
              }`}
              role="status"
              aria-live="polite"
            >
              {supported
                ? '✓ WebAuthn Level 3 is supported'
                : '✗ Not supported in this browser'}
            </div>
          )}
        </SectionCard>

        {/* ── createCredential ── */}
        <SectionCard
          title="createCredential(options)"
          description={
            editMode === 'form' ? (
              'Register a new passkey. Your device will prompt for biometric verification or PIN. PRF is requested so this passkey can later be used for passwordless Sync sign-in.'
            ) : (
              <>
                Wraps{' '}
                <code className="font-mono text-xs">
                  navigator.credentials.create()
                </code>
                . Edit the options and click the button — your device will
                prompt for a new passkey.
              </>
            )
          }
        >
          {editMode === 'form' ? (
            <CreationFormView
              form={createForm}
              onChange={setCreateForm}
              recentCredentials={recentCredentials}
            />
          ) : (
            <>
              <SessionCredentialChips
                credentials={recentCredentials}
                label="Session credentials — click to copy ID for excludeCredentials[].id"
                onClear={handleClearCredentials}
              />
              <JsonTextarea
                value={createOptionsRaw}
                onChange={(v) => {
                  setCreateOptionsRaw(v);
                  setCreateJsonError(parseJson(v).error);
                }}
                error={createJsonError}
              />
              <JsonFieldGuide operation="create" />
            </>
          )}
          <div className="flex gap-3">
            <button
              className="cta-primary p-2"
              onClick={handleCreate}
              disabled={
                createState.status === 'loading' ||
                (editMode === 'json' && !!createJsonError)
              }
            >
              {createState.status === 'loading'
                ? 'Waiting…'
                : 'Call createCredential()'}
            </button>
            <button className="cta-neutral p-2" onClick={handleResetCreate}>
              Reset
            </button>
          </div>
          <CredentialResultDisplay
            state={createState}
            operation="create"
            editMode={editMode}
          />
          {editMode === 'json' && <JsonResponseGuide operation="create" />}
        </SectionCard>

        {/* ── getCredential ── */}
        <SectionCard
          title="getCredential(options)"
          description={
            editMode === 'form' ? (
              <>
                Authenticate with an existing passkey. Leave credential ID empty
                for discoverable flow — the browser shows all passkeys for{' '}
                <code className="font-mono text-xs">
                  {window.location.hostname}
                </code>
                . You must register one above first.
              </>
            ) : (
              <>
                Wraps{' '}
                <code className="font-mono text-xs">
                  navigator.credentials.get()
                </code>
                . No <code className="font-mono text-xs">allowCredentials</code>{' '}
                → discoverable credential flow. Register a passkey above first.
              </>
            )
          }
        >
          {editMode === 'form' ? (
            <RequestFormView
              form={requestForm}
              onChange={setRequestForm}
              recentCredentials={recentCredentials}
              onClearCredentials={handleClearCredentials}
            />
          ) : (
            <>
              <SessionCredentialChips
                credentials={recentCredentials}
                label="Session credentials — click to copy ID for allowCredentials[].id"
                onClear={handleClearCredentials}
              />
              <JsonTextarea
                value={getOptionsRaw}
                onChange={(v) => {
                  setGetOptionsRaw(v);
                  setGetJsonError(parseJson(v).error);
                }}
                error={getJsonError}
              />
              <JsonFieldGuide operation="get" />
            </>
          )}
          <div className="flex gap-3">
            <button
              className="cta-primary p-2"
              onClick={handleGet}
              disabled={
                getState.status === 'loading' ||
                (editMode === 'json' && !!getJsonError)
              }
            >
              {getState.status === 'loading'
                ? 'Waiting…'
                : 'Call getCredential()'}
            </button>
            <button className="cta-neutral p-2" onClick={handleResetGet}>
              Reset
            </button>
          </div>
          <CredentialResultDisplay
            state={getState}
            operation="get"
            editMode={editMode}
          />
          {editMode === 'json' && <JsonResponseGuide operation="get" />}
        </SectionCard>

        {/* ── Error reference ── */}
        <details className="group bg-white rounded-xl border border-grey-100 shadow-sm mb-5">
          <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between">
            <span className="font-header font-bold text-base font-mono">
              Error reference
            </span>
            <span className="text-grey-400 text-xs group-open:hidden">
              ▶ How to trigger each error type
            </span>
            <span className="text-grey-400 text-xs hidden group-open:inline">
              ▼ collapse
            </span>
          </summary>
          <div className="px-6 pb-6">
            <p className="text-sm text-grey-500 mb-4">
              How to trigger each error type from the sections above:
            </p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-grey-200">
                  <th className="text-left font-bold text-grey-900 pb-2 pr-6 whitespace-nowrap w-px font-mono">
                    Error
                  </th>
                  <th className="text-left font-bold text-grey-900 pb-2">
                    How to trigger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {ERROR_REFERENCE.map(({ name, how }) => (
                  <tr key={name}>
                    <td className="py-2 pr-6 align-top font-mono text-red-700 whitespace-nowrap">
                      {name}
                    </td>
                    <td className="py-2 text-grey-700">{how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
};

export default WebAuthnHelpersExample;
