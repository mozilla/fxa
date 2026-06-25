/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { base64urlToBytes, bytesToBase64url } from '../base64url';

export type Base64URLString = string;

export interface PublicKeyCredentialDescriptorJSON {
  id: Base64URLString;
  type: 'public-key';
  // 'smart-card' is valid per spec but absent from the TS DOM lib's union.
  transports?: (AuthenticatorTransport | 'smart-card')[];
}

/**
 * PRF eval input. `first` is a static, server-supplied constant; uniqueness of
 * the PRF output comes from each credential's private key, not the salt.
 */
export interface PrfEvalInput {
  first: Base64URLString;
  second?: Base64URLString;
}

/** Extensions accepted by WebAuthn creation and request options. */
export interface AuthenticationExtensionsJSON {
  /** Requested at registration; at authentication when PRF-wrapped sync keys are involved. */
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

export interface AuthenticatorAttestationResponseJSON {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
  // Optional per spec; browsers may omit transports.
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

/**
 * True when the browser supports WebAuthn Level 2 (PublicKeyCredential +
 * navigator.credentials.create/get). We decode options and serialize responses
 * by hand rather than using the L3 JSON helpers, so this baseline is all we
 * need — covering browsers before those helpers (Safari/iOS < 18.4, Chrome <
 * 129, Firefox < 119).
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential === 'function' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials?.create === 'function' &&
    typeof navigator.credentials?.get === 'function'
  );
}

function toNativeDescriptor(
  descriptor: PublicKeyCredentialDescriptorJSON
): PublicKeyCredentialDescriptor {
  return {
    id: base64urlToBytes(descriptor.id),
    type: descriptor.type,
    ...(descriptor.transports
      ? { transports: descriptor.transports as AuthenticatorTransport[] }
      : {}),
  };
}

function toNativePrfValues(values: PrfEvalInput): {
  first: BufferSource;
  second?: BufferSource;
} {
  return {
    first: base64urlToBytes(values.first),
    ...(values.second !== undefined
      ? { second: base64urlToBytes(values.second) }
      : {}),
  };
}

function toNativeExtensions(
  extensions: AuthenticationExtensionsJSON
): AuthenticationExtensionsClientInputs {
  // Only the PRF extension carries binary (base64url) inputs; the rest pass through.
  const { prf, ...rest } = extensions;
  const native: Record<string, unknown> = { ...rest };
  if (prf) {
    native.prf = {
      ...(prf.eval ? { eval: toNativePrfValues(prf.eval) } : {}),
      ...(prf.evalByCredential
        ? {
            evalByCredential: Object.fromEntries(
              Object.entries(prf.evalByCredential).map(([id, values]) => [
                id,
                toNativePrfValues(values),
              ])
            ),
          }
        : {}),
    };
  }
  // Cast: the bundled DOM lib's AuthenticationExtensionsClientInputs predates PRF.
  return native as AuthenticationExtensionsClientInputs;
}

function toNativeCreationOptions(
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
  return {
    rp: options.rp,
    user: {
      id: base64urlToBytes(options.user.id),
      name: options.user.name,
      displayName: options.user.displayName,
    },
    challenge: base64urlToBytes(options.challenge),
    pubKeyCredParams: options.pubKeyCredParams,
    ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
    ...(options.excludeCredentials
      ? {
          excludeCredentials:
            options.excludeCredentials.map(toNativeDescriptor),
        }
      : {}),
    ...(options.authenticatorSelection
      ? { authenticatorSelection: options.authenticatorSelection }
      : {}),
    ...(options.attestation ? { attestation: options.attestation } : {}),
    ...(options.extensions
      ? { extensions: toNativeExtensions(options.extensions) }
      : {}),
  };
}

function toNativeRequestOptions(
  options: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
  return {
    challenge: base64urlToBytes(options.challenge),
    ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
    ...(options.rpId ? { rpId: options.rpId } : {}),
    ...(options.allowCredentials
      ? { allowCredentials: options.allowCredentials.map(toNativeDescriptor) }
      : {}),
    ...(options.userVerification
      ? { userVerification: options.userVerification }
      : {}),
    ...(options.extensions
      ? { extensions: toNativeExtensions(options.extensions) }
      : {}),
  };
}

function serializeResponse(
  response: AuthenticatorResponse,
  operation: string
): AuthenticatorResponseJSON {
  if ('attestationObject' in response) {
    const attestation = response as AuthenticatorAttestationResponse;
    return {
      clientDataJSON: bytesToBase64url(attestation.clientDataJSON),
      attestationObject: bytesToBase64url(attestation.attestationObject),
      // getTransports() is optional per spec; some authenticators omit it.
      ...(typeof attestation.getTransports === 'function'
        ? { transports: attestation.getTransports() }
        : {}),
    };
  }
  if ('signature' in response) {
    const assertion = response as AuthenticatorAssertionResponse;
    return {
      clientDataJSON: bytesToBase64url(assertion.clientDataJSON),
      authenticatorData: bytesToBase64url(assertion.authenticatorData),
      signature: bytesToBase64url(assertion.signature),
      ...(assertion.userHandle
        ? { userHandle: bytesToBase64url(assertion.userHandle) }
        : {}),
    };
  }
  throw new DOMException(
    `${operation} returned an unrecognized authenticator response`,
    'UnknownError'
  );
}

/**
 * Builds PublicKeyCredentialJSON from a browser credential by hand, via the
 * Level 2 getters (rawId, response.*, getClientExtensionResults) instead of
 * native PublicKeyCredential.toJSON().
 *
 * Why not toJSON(): WebKit before 26.5.1 crashes the renderer inside its native
 * extension-output serializer when a `prf` output is present — an uncatchable
 * process trap, not a catchable exception. The L2 getters predate that path.
 *
 * Duck-typed (no instanceof) so password managers returning a plain object with
 * the same fields serialize too; the server validates shape strictly.
 */
function toCredentialJSON(
  rawCredential: Credential | null,
  operation: string
): PublicKeyCredentialJSON {
  if (!rawCredential) {
    throw new DOMException(`${operation} returned null`, 'UnknownError');
  }
  // Categorisable failure instead of a bare TypeError from the field reads below.
  const shape = rawCredential as {
    type?: unknown;
    rawId?: unknown;
    response?: unknown;
  };
  if (
    shape.type !== 'public-key' ||
    shape.rawId == null ||
    typeof shape.response !== 'object' ||
    shape.response === null
  ) {
    throw new DOMException(
      `${operation} returned a credential of unexpected shape`,
      'UnknownError'
    );
  }

  const credential = rawCredential as PublicKeyCredential;
  return {
    id: credential.id,
    rawId: bytesToBase64url(credential.rawId),
    type: 'public-key',
    ...(credential.authenticatorAttachment
      ? { authenticatorAttachment: credential.authenticatorAttachment }
      : {}),
    response: serializeResponse(credential.response, operation),
    // Binary extension outputs (e.g. PRF) stay ArrayBuffers and drop out when
    // the credential is JSON-stringified for the server — intentional: kB stays
    // client-side and server-blind.
    clientExtensionResults:
      typeof credential.getClientExtensionResults === 'function'
        ? (credential.getClientExtensionResults() as Record<string, unknown>)
        : {},
  };
}

// Matches the server challenge TTL (PASSKEYS__CHALLENGE_TIMEOUT, 5 min). On
// Safari/WebKit, which ignores options.timeout, this wrapper is the only timeout.
const DEFAULT_TIMEOUT_MS = 300_000;

/**
 * Wraps navigator.credentials.create() for passkey registration: decodes JSON
 * options to native, runs the ceremony, returns the credential as JSON.
 *
 * `externalSignal` cancels from outside (e.g. a Cancel button) and surfaces as
 * AbortError, distinct from the internal TimeoutError.
 *
 * Throws DOMException: NotSupportedError (APIs absent), TimeoutError (exceeded
 * timeoutMs), AbortError (externalSignal), or any error the browser raises.
 */
export async function createCredential(
  options: PublicKeyCredentialCreationOptionsJSON,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  externalSignal?: AbortSignal
): Promise<PublicKeyCredentialJSON> {
  if (!isWebAuthnSupported()) {
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
    const nativeOptions = toNativeCreationOptions(options);
    const rawCredential = await navigator.credentials.create({
      publicKey: nativeOptions,
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
 * Wraps navigator.credentials.get() for passkey authentication: decodes JSON
 * options to native, runs the ceremony, returns the credential as JSON.
 *
 * Throws DOMException: NotSupportedError (APIs absent), TimeoutError (exceeded
 * timeoutMs), or any error the browser raises.
 */
export async function getCredential(
  options: PublicKeyCredentialRequestOptionsJSON,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PublicKeyCredentialJSON> {
  if (!isWebAuthnSupported()) {
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
    const nativeOptions = toNativeRequestOptions(options);
    const rawCredential = await navigator.credentials.get({
      publicKey: nativeOptions,
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
