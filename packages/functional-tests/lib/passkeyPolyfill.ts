/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Page } from '@playwright/test';
// Import the virtual-authenticator module directly rather than through the
// `@fxa/accounts/passkey` barrel — the barrel re-exports NestJS-decorated
// services whose parameter decorators Playwright's Babel loader cannot parse.
import {
  VirtualAuthenticator,
  type VirtualCredential,
} from '../../../libs/accounts/passkey/src/lib/virtual-authenticator';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';

type Mode = 'pending' | 'success' | 'cancel';
type Trigger = () => Promise<void>;
type PostCheck = () => Promise<void>;

// JSON wire-format shapes passed from the browser to Node (subset of the
// parts the polyfill actually consumes).
type CreationOptions = {
  challenge: string;
  rp?: { id?: string };
  allowCredentials?: Array<{ id: string }>;
};
type RequestOptions = {
  challenge: string;
  rpId?: string;
  allowCredentials?: Array<{ id: string }>;
};

/**
 * Browser polyfill for WebAuthn that works in both Firefox and Chromium.
 *
 * Unlike the previous CDP-based approach (Chromium only), this patches
 * `window.PublicKeyCredential` and `navigator.credentials.{create,get}` via
 * `page.addInitScript`, delegating the cryptographic work to the Node-side
 * VirtualAuthenticator from `@fxa/accounts/passkey`. The resulting attestation
 * and assertion responses are cryptographically valid, so the auth-server
 * `verifyRegistration/AuthenticationResponse` checks pass end-to-end.
 *
 * Modes:
 *   - `pending` (default): the polyfill's promise never resolves. Useful for
 *     asserting mid-ceremony UI (e.g. a Cancel button) without the ceremony
 *     racing to completion.
 *   - `success`: the polyfill resolves with a valid attestation/assertion.
 *   - `cancel`: the polyfill rejects with a `NotAllowedError` DOMException,
 *     mirroring a user-cancelled browser prompt.
 */
export class PasskeyPolyfill {
  private credentials: VirtualCredential[] = [];
  private mode: Mode = 'pending';
  private onCredentialAdded?: () => void;
  private installed = false;

  /**
   * Install the polyfill on the given Playwright page. Exposes the Node-side
   * crypto callbacks and registers the browser init script so the polyfill is
   * active for the current page and all subsequent navigations.
   */
  async install(page: Page) {
    if (this.installed) return;
    this.installed = true;

    await page.exposeFunction(
      '__fxaPasskeyCreate',
      async (options: CreationOptions, origin: string) =>
        this.handleCreate(options, origin)
    );

    await page.exposeFunction(
      '__fxaPasskeyGet',
      async (options: RequestOptions, origin: string) =>
        this.handleGet(options, origin)
    );

    await page.addInitScript(BROWSER_POLYFILL);

    // addInitScript only runs on subsequent navigations; apply to the current
    // page too so callers can install the polyfill at any point.
    try {
      await page.evaluate(BROWSER_POLYFILL);
    } catch {
      // The page may be at about:blank or mid-navigation; safe to ignore
      // since addInitScript will apply on the next load.
    }
  }

  /**
   * Simulate a successful ceremony: switch to `success` mode, run the trigger
   * that initiates the ceremony in the browser, and wait until the
   * VirtualAuthenticator has issued a credential. Restores `pending` mode on
   * exit so subsequent ceremonies hang again by default.
   */
  async success(trigger: Trigger) {
    const credentialAdded = new Promise<void>((resolve) => {
      this.onCredentialAdded = resolve;
    });

    const previous = this.mode;
    this.mode = 'success';
    try {
      await trigger();
      await credentialAdded;
    } finally {
      this.onCredentialAdded = undefined;
      this.mode = previous;
    }
  }

  /**
   * Simulate a user-cancelled browser prompt: switch to `cancel` mode so the
   * polyfill rejects the ceremony with a `NotAllowedError` DOMException, then
   * run the trigger and the caller's postCheck.
   */
  async fail(trigger: Trigger, postCheck: PostCheck) {
    const previous = this.mode;
    this.mode = 'cancel';
    try {
      await trigger();
      await postCheck();
    } finally {
      this.mode = previous;
    }
  }

  /**
   * Number of credentials the VirtualAuthenticator has minted during the
   * lifetime of this polyfill. Tests use this to assert registration happened
   * (or didn't).
   */
  getCredentials() {
    return this.credentials.map((c) => ({
      credentialId: c.id.toString('base64url'),
      signCount: c.signCount,
    }));
  }

  /** Clear all minted credentials and reset to `pending` mode. */
  async cleanup() {
    this.credentials = [];
    this.mode = 'pending';
    this.onCredentialAdded = undefined;
    this.installed = false;
  }

  private async handleCreate(
    options: CreationOptions,
    origin: string
  ): Promise<RegistrationResponseJSON> {
    await this.waitForReleasableMode();

    const cred = VirtualAuthenticator.createCredential();
    this.credentials.push(cred);

    const rpId = options.rp?.id ?? new URL(origin).hostname;
    const response = VirtualAuthenticator.createAttestationResponse(cred, {
      challenge: options.challenge,
      origin,
      rpId,
    });

    this.onCredentialAdded?.();
    return response;
  }

  private async handleGet(
    options: RequestOptions,
    origin: string
  ): Promise<AuthenticationResponseJSON> {
    await this.waitForReleasableMode();

    const cred = this.pickCredential(options.allowCredentials);
    if (!cred) {
      throw makeDomExceptionLike(
        'NotAllowedError',
        'No matching credentials for assertion'
      );
    }

    const rpId = options.rpId ?? new URL(origin).hostname;
    return VirtualAuthenticator.createAssertionResponse(cred, {
      challenge: options.challenge,
      origin,
      rpId,
    });
  }

  private pickCredential(allow?: Array<{ id: string }>) {
    if (!allow?.length) return this.credentials[0];
    const allowed = new Set(allow.map((c) => c.id));
    return this.credentials.find((c) =>
      allowed.has(c.id.toString('base64url'))
    );
  }

  private async waitForReleasableMode() {
    // If mode is `pending`, wait indefinitely — callers flip to `success` or
    // `cancel` via success()/fail() to release the ceremony. If mode is
    // already `cancel`, reject immediately.
    while (this.mode === 'pending') {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    if (this.mode === 'cancel') {
      throw makeDomExceptionLike(
        'NotAllowedError',
        'The operation either timed out or was not allowed.'
      );
    }
  }
}

/**
 * Playwright serialises thrown Errors, so a plain `new Error()` from Node
 * loses its `name`. Build an Error with `name` set explicitly so the browser
 * shim can re-raise it as a DOMException with the correct type.
 */
function makeDomExceptionLike(name: string, message: string) {
  const err = new Error(message);
  err.name = name;
  return err;
}

/**
 * Injected into the page. Replaces window.PublicKeyCredential with a stub
 * class so (a) `PublicKeyCredential.parseCreationOptionsFromJSON` and the
 * Level 3 feature-detection in fxa-settings pass, and (b) credentials
 * returned from our fake `navigator.credentials.create` pass
 * `instanceof PublicKeyCredential` inside the wrapper. The stub delegates
 * the cryptographic work to Node via the `__fxaPasskey*` functions exposed
 * by {@link PasskeyPolyfill.install}.
 */
const BROWSER_POLYFILL = `(() => {
  try {
    if (window.__fxaPasskeyPolyfillInstalled) return;
    window.__fxaPasskeyPolyfillInstalled = true;

    class FakePublicKeyCredential {
      constructor(json) {
        this._json = json;
        this.id = json.id;
        this.rawId = null;
        this.type = 'public-key';
        this.authenticatorAttachment = json.authenticatorAttachment;
        this.response = null;
      }
      static isUserVerifyingPlatformAuthenticatorAvailable() {
        return Promise.resolve(true);
      }
      static isConditionalMediationAvailable() {
        return Promise.resolve(false);
      }
      static parseCreationOptionsFromJSON(o) { return o; }
      static parseRequestOptionsFromJSON(o) { return o; }
      toJSON() { return this._json; }
    }

    // Best-effort: may throw on some browsers where PublicKeyCredential is a
    // non-configurable accessor. Guarded by the outer try/catch.
    try {
      Object.defineProperty(window, 'PublicKeyCredential', {
        value: FakePublicKeyCredential,
        writable: true,
        configurable: true,
      });
    } catch (_) {
      // Fall back to plain assignment.
      try { window.PublicKeyCredential = FakePublicKeyCredential; } catch (__) {}
    }

    async function invoke(name, options) {
      const fn = window[name];
      if (typeof fn !== 'function') {
        // exposeFunction binding hasn't attached on this frame yet — treat
        // like a missing authenticator so the app can retry or error out
        // cleanly instead of throwing an unhandled rejection into the
        // webpack-dev-server overlay.
        throw new DOMException(
          'Passkey polyfill unavailable on this frame',
          'NotAllowedError'
        );
      }
      try {
        return await fn(options, window.location.origin);
      } catch (err) {
        // exposeFunction serialises Errors; rebuild a DOMException so the
        // fxa-settings webauthn-errors handler categorises correctly.
        const errName = (err && err.name) || 'NotAllowedError';
        const msg = (err && err.message) || 'WebAuthn operation failed';
        throw new DOMException(msg, errName);
      }
    }

    const credentialsApi = {
      create: async (opts) => {
        const publicKey = (opts && opts.publicKey) || {};
        const json = await invoke('__fxaPasskeyCreate', publicKey);
        return new FakePublicKeyCredential(json);
      },
      get: async (opts) => {
        const publicKey = (opts && opts.publicKey) || {};
        const json = await invoke('__fxaPasskeyGet', publicKey);
        return new FakePublicKeyCredential(json);
      },
    };

    try {
      if (!navigator.credentials) {
        Object.defineProperty(navigator, 'credentials', {
          value: credentialsApi,
          writable: true,
          configurable: true,
        });
      } else {
        // navigator.credentials.create/get are non-writable accessor
        // properties in Firefox — defineProperty works where plain
        // assignment silently fails.
        Object.defineProperty(navigator.credentials, 'create', {
          value: credentialsApi.create,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(navigator.credentials, 'get', {
          value: credentialsApi.get,
          writable: true,
          configurable: true,
        });
      }
    } catch (_) {
      // If the browser refuses to let us patch credentials, bail out
      // silently. The feature-detection check will still pass via the fake
      // PublicKeyCredential above, but WebAuthn calls will fall through to
      // the native implementation — tests that rely on the polyfill will
      // fail visibly, which is the right behaviour.
    }
  } catch (_) {
    // Never let the polyfill crash the host page.
  }
})();`;
