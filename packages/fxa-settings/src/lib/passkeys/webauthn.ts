/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// ─── JSON wire-format types ──────────────────────────────────────────────────
// Explicit types for the JSON-serializable WebAuthn data exchanged with the
// backend. These must not reference ArrayBuffer, PublicKeyCredential, or other
// WebAuthn DOM interfaces so they can be used in any context.

export type Base64URLString = string;

export interface PublicKeyCredentialDescriptorJSON {
  id: Base64URLString;
  type: 'public-key';
  // Superset of the DOM AuthenticatorTransport union — includes 'smart-card'
  // which is valid per the WebAuthn spec but absent from TypeScript 5.5 DOM lib.
  transports?: (AuthenticatorTransport | 'smart-card')[];
}

/**
 * PRF extension eval input. The `first` salt is a fully static,
 * application-level constant supplied by the server. Uniqueness of the PRF
 * output is guaranteed by each credential's own private key — the same salt
 * on a different passkey produces a different output, so no per-user or
 * per-credential variation of the salt is needed.
 */
export interface PrfEvalInput {
  first: Base64URLString;
  second?: Base64URLString;
}

/** Extensions accepted by WebAuthn creation and request options. */
export interface AuthenticationExtensionsJSON {
  /** PRF extension — always requested during registration; requested during
   *  authentication when PRF-wrapped sync keys are involved. */
  prf?: {
    eval?: PrfEvalInput;
    evalByCredential?: Record<string, PrfEvalInput>;
  };
  [key: string]: unknown;
}

/** JSON shape sent by the backend for credential creation (registration). */
export interface PublicKeyCredentialCreationOptionsJSON {
  rp: { id?: string; name: string };
  user: {
    id: Base64URLString;
    name: string;
    displayName: string;
  };
  challenge: Base64URLString;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment;
    requireResidentKey?: boolean;
    residentKey?: ResidentKeyRequirement;
    userVerification?: UserVerificationRequirement;
  };
  attestation?: AttestationConveyancePreference;
  extensions?: AuthenticationExtensionsJSON;
}

/** JSON shape sent by the backend for credential assertion (authentication). */
export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: Base64URLString;
  timeout?: number;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  userVerification?: UserVerificationRequirement;
  extensions?: AuthenticationExtensionsJSON;
}

// ─── Credential response types ───────────────────────────────────────────────
// Shapes produced by PublicKeyCredential.toJSON(), sent to the backend.

export interface AuthenticatorAttestationResponseJSON {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
  // Optional per the WebAuthn spec — browsers may omit transports.
  // The backend must normalize absent transports to [] before DB storage.
  transports?: string[];
}

export interface AuthenticatorAssertionResponseJSON {
  clientDataJSON: Base64URLString;
  authenticatorData: Base64URLString;
  signature: Base64URLString;
  userHandle?: Base64URLString;
}

export type AuthenticatorResponseJSON =
  | AuthenticatorAttestationResponseJSON
  | AuthenticatorAssertionResponseJSON;

export interface PublicKeyCredentialJSON {
  id: Base64URLString;
  rawId: Base64URLString;
  type: 'public-key';
  authenticatorAttachment?: string;
  response: AuthenticatorResponseJSON;
  clientExtensionResults: Record<string, unknown>;
}

// ─── WebAuthn Level 3 type extensions ────────────────────────────────────────
// TypeScript 5.5 DOM lib does not yet include these WebAuthn Level 3 helpers. Remove when
// microsoft/TypeScript#60641 ships — the instanceof guards below will also be
// redundant at that point.

type PublicKeyCredentialLevel3 = typeof PublicKeyCredential & {
  parseCreationOptionsFromJSON(
    options: PublicKeyCredentialCreationOptionsJSON
  ): PublicKeyCredentialCreationOptions;
  parseRequestOptionsFromJSON(
    options: PublicKeyCredentialRequestOptionsJSON
  ): PublicKeyCredentialRequestOptions;
};

declare global {
  interface PublicKeyCredential {
    toJSON(): PublicKeyCredentialJSON;
  }
}

// ─── Feature detection ───────────────────────────────────────────────────────

/**
 * Returns true when the browser exposes the WebAuthn Level 3 JSON helpers
 * (parseCreationOptionsFromJSON, parseRequestOptionsFromJSON) on the
 * PublicKeyCredential constructor.
 *
 * We require Level 3 rather than falling back to Level 2 as a deliberate
 * scope decision. The JSON helpers eliminate all manual base64url ↔
 * ArrayBuffer conversion; supporting Level 2 would add ~30–50 lines of
 * encoding code for no functional gain on modern browsers. PRF (used for
 * passwordless Sync key derivation) is also a Level 3 extension, though PRF
 * is optional — non-PRF passkeys work for basic authentication regardless,
 * so the Level 3 gate is purely about code simplicity, not a hard PRF
 * dependency. Windows Hello, for example, passes this check on Chrome/Edge
 * but does not support PRF; registration and authentication succeed normally,
 * only passwordless Sync key derivation (Phase 2) would be unavailable for
 * those passkeys.
 *
 * Browsers excluded by this check (support WebAuthn but not Level 3):
 *   - Safari / iOS < 17.4 (shipped March 2024) — the main real-world gap;
 *     iOS 16 users cannot upgrade and will always fail this check.
 *   - Chrome < 129 (Sep 2024), Firefox < 128 (Jul 2024) — negligible in
 *     practice given auto-update behaviour.
 *
 * No authenticator (YubiKey, Face ID, Windows Hello, etc.) is excluded —
 * Level 3 is a browser API concern, not an authenticator capability.
 *
 * If product decides to support older Safari / iOS 16, the wrappers below
 * need a Level 2 fallback that manually encodes/decodes binary fields. At
 * that point, adopting a library such as @simplewebauthn/browser is worth
 * considering — it handles both Level 2 and Level 3 paths, the 1Password
 * plain-object fallback, and conditional UI, avoiding further bespoke
 * encoding code.
 *
 * toJSON() on the credential instance is not explicitly checked; it always
 * ships alongside the static parse helpers in practice.
 */
export function isWebAuthnLevel3Supported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const pkc = (window as Window & { PublicKeyCredential?: unknown })
    .PublicKeyCredential as Record<string, unknown> | undefined;
  return (
    pkc !== undefined &&
    typeof pkc['parseCreationOptionsFromJSON'] === 'function' &&
    typeof pkc['parseRequestOptionsFromJSON'] === 'function'
  );
}

// ─── Wrapper functions ────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * Wraps navigator.credentials.create() for passkey registration.
 *
 * Accepts JSON-serializable creation options (backend wire format), converts
 * them via PublicKeyCredential.parseCreationOptionsFromJSON(), invokes the
 * browser prompt, and returns the serialized credential via toJSON().
 *
 * Throws:
 * - DOMException('NotSupportedError') when required WebAuthn APIs are absent
 * - DOMException('TimeoutError') when the operation exceeds timeoutMs
 * - Any DOMException thrown by the browser (propagated as-is)
 */
export async function createCredential(
  options: PublicKeyCredentialCreationOptionsJSON,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PublicKeyCredentialJSON> {
  if (!isWebAuthnLevel3Supported()) {
    throw new DOMException(
      'WebAuthn is not supported in this browser',
      'NotSupportedError'
    );
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const parsedOptions = (
      PublicKeyCredential as PublicKeyCredentialLevel3
    ).parseCreationOptionsFromJSON(options);
    const rawCredential = await navigator.credentials.create({
      publicKey: parsedOptions,
      signal: controller.signal,
    });

    if (!rawCredential) {
      throw new DOMException(
        'navigator.credentials.create returned null',
        'UnknownError'
      );
    }
    if (rawCredential instanceof PublicKeyCredential) {
      return rawCredential.toJSON();
    }
    const actualType =
      (rawCredential as Credential).constructor?.name ?? typeof rawCredential;
    const keyInfo = Object.entries(rawCredential as object)
      .map(
        ([k, v]) =>
          `${k}: ${v instanceof ArrayBuffer ? 'ArrayBuffer' : typeof v}`
      )
      .join(', ');
    throw new DOMException(
      `navigator.credentials.create returned unexpected credential type: ${actualType} — fields: {${keyInfo}}`,
      'UnknownError'
    );
  } catch (e) {
    if (timedOut) {
      throw new DOMException('WebAuthn operation timed out', 'TimeoutError');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wraps navigator.credentials.get() for passkey authentication.
 *
 * Accepts JSON-serializable request options (backend wire format), converts
 * them via PublicKeyCredential.parseRequestOptionsFromJSON(), invokes the
 * browser prompt, and returns the serialized credential via toJSON().
 *
 * Throws:
 * - DOMException('NotSupportedError') when required WebAuthn APIs are absent
 * - DOMException('TimeoutError') when the operation exceeds timeoutMs
 * - Any DOMException thrown by the browser (propagated as-is)
 */
export async function getCredential(
  options: PublicKeyCredentialRequestOptionsJSON,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PublicKeyCredentialJSON> {
  if (!isWebAuthnLevel3Supported()) {
    throw new DOMException(
      'WebAuthn is not supported in this browser',
      'NotSupportedError'
    );
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const parsedOptions = (
      PublicKeyCredential as PublicKeyCredentialLevel3
    ).parseRequestOptionsFromJSON(options);
    const rawCredential = await navigator.credentials.get({
      publicKey: parsedOptions,
      signal: controller.signal,
    });

    if (!rawCredential) {
      throw new DOMException(
        'navigator.credentials.get returned null',
        'UnknownError'
      );
    }
    if (rawCredential instanceof PublicKeyCredential) {
      return rawCredential.toJSON();
    }
    const actualType =
      (rawCredential as Credential).constructor?.name ?? typeof rawCredential;
    const keyInfo = Object.entries(rawCredential as object)
      .map(
        ([k, v]) =>
          `${k}: ${v instanceof ArrayBuffer ? 'ArrayBuffer' : typeof v}`
      )
      .join(', ');
    throw new DOMException(
      `navigator.credentials.get returned unexpected credential type: ${actualType} — fields: {${keyInfo}}`,
      'UnknownError'
    );
  } catch (e) {
    if (timedOut) {
      throw new DOMException('WebAuthn operation timed out', 'TimeoutError');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
