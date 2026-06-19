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
// JSON shapes sent to the backend, built by manual serialization in
// toCredentialJSON (see the note there on why we avoid the native toJSON()).

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

// ─── Feature detection ───────────────────────────────────────────────────────

/**
 * Returns true when the browser exposes the WebAuthn Level 3 JSON helpers
 * (parseCreationOptionsFromJSON, parseRequestOptionsFromJSON) on the
 * PublicKeyCredential constructor.
 *
 * We gate on the Level 3 parse helpers (request side) as a deliberate scope
 * decision — they eliminate manual base64url → ArrayBuffer decoding of the
 * options. The response side is serialized by hand regardless (see
 * toCredentialJSON), so this gate concerns only the request path. PRF (used for
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
 * To also support browsers that lack the parse helpers (older Safari / iOS),
 * the request side would need a manual parse path too — the response side is
 * already manual. Adopting @simplewebauthn/browser, which handles both
 * directions plus the 1Password plain-object case, is worth considering then.
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

// ─── Credential extraction ──────────────────────────────────────────────────

/**
 * Encodes a binary credential field to unpadded base64url. Chunked so large
 * buffers (e.g. attestationObject) don't overflow String.fromCharCode's
 * argument list.
 */
function bufferToBase64url(buffer: ArrayBuffer | ArrayBufferView): string {
  // ArrayBuffer.isView, not `instanceof ArrayBuffer`: the latter is unreliable
  // across realms (iframes, workers), which would silently read zero bytes.
  const bytes = ArrayBuffer.isView(buffer)
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Serializes an attestation or assertion response, base64url-encoding binary fields. */
function serializeResponse(
  response: AuthenticatorResponse,
  operation: string
): AuthenticatorResponseJSON {
  if ('attestationObject' in response) {
    const attestation = response as AuthenticatorAttestationResponse;
    return {
      clientDataJSON: bufferToBase64url(attestation.clientDataJSON),
      attestationObject: bufferToBase64url(attestation.attestationObject),
      // getTransports() is optional per spec; some authenticators omit it.
      ...(typeof attestation.getTransports === 'function'
        ? { transports: attestation.getTransports() }
        : {}),
    };
  }
  if ('signature' in response) {
    const assertion = response as AuthenticatorAssertionResponse;
    return {
      clientDataJSON: bufferToBase64url(assertion.clientDataJSON),
      authenticatorData: bufferToBase64url(assertion.authenticatorData),
      signature: bufferToBase64url(assertion.signature),
      ...(assertion.userHandle
        ? { userHandle: bufferToBase64url(assertion.userHandle) }
        : {}),
    };
  }
  throw new DOMException(
    `${operation} returned an unrecognized authenticator response`,
    'UnknownError'
  );
}

/**
 * Builds `PublicKeyCredentialJSON` from a browser credential by hand, reading
 * the long-standing Level 2 getters instead of the native
 * `PublicKeyCredential.toJSON()`.
 *
 * Why not toJSON(): WebKit before 26.5.1 crashes the WebContent renderer
 * inside its native extension-output serializer when a `prf` output is present
 * — an uncatchable process trap, not a JS exception, so no try/catch can
 * recover it. The Level 2 getters (rawId, response.*, getClientExtensionResults)
 * predate that serializer and avoid the broken code path entirely.
 *
 * Duck-typed (no `instanceof PublicKeyCredential`) so password managers that
 * return a plain object with the same fields (e.g. 1Password) serialize too.
 * No client-side shape validation — the server (`@simplewebauthn/server`)
 * validates strictly and rejects malformed data.
 */
function toCredentialJSON(
  rawCredential: Credential | null,
  operation: string
): PublicKeyCredentialJSON {
  if (!rawCredential) {
    throw new DOMException(`${operation} returned null`, 'UnknownError');
  }
  const credential = rawCredential as PublicKeyCredential;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: 'public-key',
    ...(credential.authenticatorAttachment
      ? { authenticatorAttachment: credential.authenticatorAttachment }
      : {}),
    response: serializeResponse(credential.response, operation),
    clientExtensionResults:
      typeof credential.getClientExtensionResults === 'function'
        ? (credential.getClientExtensionResults() as Record<string, unknown>)
        : {},
  };
}

// ─── Wrapper functions ────────────────────────────────────────────────────────

// Aligned with the server-side challenge TTL (`PASSKEYS__CHALLENGE_TIMEOUT`,
// 5 min). Keeping the client wrapper at 60s while the server gives the user
// 5 min meant users who stepped away briefly were cut off long before the
// request expired. On Safari/WebKit (which ignores `options.timeout` per spec)
// this wrapper is the only timeout in play.
const DEFAULT_TIMEOUT_MS = 300_000;

/**
 * Wraps navigator.credentials.create() for passkey registration.
 *
 * Accepts JSON-serializable creation options (backend wire format), converts
 * them via PublicKeyCredential.parseCreationOptionsFromJSON(), invokes the
 * browser prompt, and returns the serialized credential via toJSON().
 *
 * Pass `externalSignal` to actively cancel the ceremony from outside (e.g.
 * a Cancel button); aborting it propagates as the underlying AbortError so
 * callers can distinguish it from the internal timeout (TimeoutError).
 *
 * Throws:
 * - DOMException('NotSupportedError') when required WebAuthn APIs are absent
 * - DOMException('TimeoutError') when the operation exceeds timeoutMs
 * - DOMException('AbortError') when externalSignal aborts before completion
 * - Any DOMException thrown by the browser (propagated as-is)
 */
export async function createCredential(
  options: PublicKeyCredentialCreationOptionsJSON,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  externalSignal?: AbortSignal
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

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  try {
    const parsedOptions = (
      PublicKeyCredential as PublicKeyCredentialLevel3
    ).parseCreationOptionsFromJSON(options);
    const rawCredential = await navigator.credentials.create({
      publicKey: parsedOptions,
      signal: controller.signal,
    });

    return toCredentialJSON(rawCredential, 'navigator.credentials.create');
  } catch (e) {
    if (timedOut) {
      throw new DOMException('WebAuthn operation timed out', 'TimeoutError');
    }
    throw e;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
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

    return toCredentialJSON(rawCredential, 'navigator.credentials.get');
  } catch (e) {
    if (timedOut) {
      throw new DOMException('WebAuthn operation timed out', 'TimeoutError');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
