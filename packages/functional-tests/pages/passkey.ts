/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseLayout } from './layout';
import { PasskeyVirtualAuthenticator } from '../lib/passkeyVirtualAuthenticator';

/**
 * Abstract base class for page objects that use PasskeyVirtualAuthenticator.
 * Provides common initialization and cleanup patterns.
 */
export abstract class PasskeyPage extends BaseLayout {
  protected passkeyVirtualAuth?: PasskeyVirtualAuthenticator;

  /**
   * Initialize the PasskeyVirtualAuthenticator with a CDP session.
   * Call this before using passkey functionality.
   */
  async initPasskeys(page: Page) {
    const client = await page.context().newCDPSession(page);
    this.passkeyVirtualAuth = new PasskeyVirtualAuthenticator(client);
    await this.passkeyVirtualAuth.create();
  }

  /**
   * Cleanup the virtual authenticator and CDP session if initialized.
   * Safe to call even if passkeys were never used.
   */
  async cleanupPasskeys() {
    if (this.passkeyVirtualAuth) {
      await this.passkeyVirtualAuth.cleanup();
      this.passkeyVirtualAuth = undefined;
    }
  }

  /**
   * Check if passkeys have been initialized.
   */
  get hasPasskeysInitialized(): boolean {
    return !!this.passkeyVirtualAuth;
  }

  /**
   * Exposes the PasskeyVirtualAuthenticator.
   * Must call initPasskeys() first.
   */
  get passkeyAuth() {
    if (!this.passkeyVirtualAuth) {
      throw new Error(
        'PasskeyVirtualAuthenticator not initialized. Call initPasskeys() first.'
      );
    }
    return this.passkeyVirtualAuth;
  }
}

/**
 * Page object for interacting with Passkeys in tests.
 *
 * Just an example, and will be removed once passkey tests are integrated elsewhere.
 */
export class PasskeyExamplePage extends PasskeyPage {
  get path(): string {
    return 'https://passkeys.eu'; // test page URL for passkeys
  }
}
