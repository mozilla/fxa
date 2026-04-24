/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseLayout } from './layout';
import { PasskeyPolyfill } from '../lib/passkeyPolyfill';

/**
 * Abstract base class for page objects that need a virtual WebAuthn
 * authenticator. Uses a browser polyfill (injected via page.addInitScript)
 * backed by the Node-side VirtualAuthenticator from @fxa/accounts/passkey, so
 * tests work on both Firefox and Chromium.
 */
export abstract class PasskeyPage extends BaseLayout {
  protected passkeyPolyfill?: PasskeyPolyfill;

  /**
   * Install the passkey polyfill on the given page. Idempotent — safe to
   * call more than once. Applies to the current page and all subsequent
   * navigations.
   */
  async initPasskeys(page: Page) {
    if (this.passkeyPolyfill) return;
    this.passkeyPolyfill = new PasskeyPolyfill();
    await this.passkeyPolyfill.install(page);
  }

  /**
   * Clear minted credentials and release the polyfill. Safe to call even if
   * passkeys were never initialised.
   */
  async cleanupPasskeys() {
    if (this.passkeyPolyfill) {
      await this.passkeyPolyfill.cleanup();
      this.passkeyPolyfill = undefined;
    }
  }

  get hasPasskeysInitialized(): boolean {
    return !!this.passkeyPolyfill;
  }

  /**
   * The polyfill, for orchestrating success/fail/credential checks. Must
   * call initPasskeys() first.
   */
  get passkeyAuth() {
    if (!this.passkeyPolyfill) {
      throw new Error(
        'Passkey polyfill not initialized. Call initPasskeys() first.'
      );
    }
    return this.passkeyPolyfill;
  }
}

/**
 * Example page object retained for compatibility with the skipped
 * `tests/passkeys/passkeys.spec.ts` suite. The polyfill replaces the browser
 * WebAuthn API, so third-party demo sites no longer round-trip — the demo
 * test remains skipped until it is replaced by in-repo flows.
 */
export class PasskeyExamplePage extends PasskeyPage {
  get path(): string {
    return 'https://passkeys.eu';
  }
}
