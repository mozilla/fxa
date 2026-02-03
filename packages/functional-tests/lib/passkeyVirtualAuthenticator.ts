/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as pwCore from 'playwright-core/types/protocol';
import { CDPSession } from '@playwright/test';

const DEFAULT_OPTS: pwCore.Protocol.WebAuthn.VirtualAuthenticatorOptions = {
  protocol: 'ctap2',
  transport: 'internal',
  hasResidentKey: true,
  hasUserVerification: true,
  isUserVerified: true,
  automaticPresenceSimulation: false,
};

type Trigger = () => Promise<void>;
type PostCheck = () => Promise<void>;

export class PasskeyVirtualAuthenticator {
  private authenticatorId = '';

  constructor(
    private readonly client: CDPSession,
    private readonly opts: pwCore.Protocol.WebAuthn.VirtualAuthenticatorOptions = DEFAULT_OPTS
  ) {}

  /**
   * Creates the virtual authenticator in the browser via CDP.
   *
   * Be sure to call this before using any other methods.
   * @param overrides
   * @returns
   */
  async create(
    overrides?: Partial<pwCore.Protocol.WebAuthn.VirtualAuthenticatorOptions>
  ) {
    await this.client.send('WebAuthn.enable');

    const { authenticatorId } = await this.client.send(
      'WebAuthn.addVirtualAuthenticator',
      {
        options: {
          ...this.opts,
          ...overrides,
          automaticPresenceSimulation: false,
        },
      }
    );

    this.authenticatorId = authenticatorId;
    return authenticatorId;
  }

  /**
   * Removes the virtual authenticator from the browser via CDP.
   * @returns
   */
  async dispose() {
    if (!this.authenticatorId) return;
    await this.client.send('WebAuthn.removeVirtualAuthenticator', {
      authenticatorId: this.authenticatorId,
    });
    this.authenticatorId = '';
  }

  /**
   * Cleanup the virtual authenticator and detach the CDP session.
   * Safe to call even if not initialized - will silently skip.
   */
  async cleanup() {
    await this.dispose();
    try {
      await this.client.send('WebAuthn.disable');
    } catch {
      // Ignore errors if already disabled
    }
    await this.client.detach();
  }

  /**
   * Check how many credentials are stored in the virtual authenticator.
   *
   * Useful for verifying that a credential was created during registration,
   * or testing multiple registered credential flows.
   * @returns
   */
  async getCredentials() {
    this.assertInit();
    const result = await this.client.send('WebAuthn.getCredentials', {
      authenticatorId: this.authenticatorId,
    });
    return result.credentials;
  }

  /**
   * Simulate a *successful* passkey operation.
   *
   * Example:
   * ```ts
   * await passkeyAuth.success(async () => {
   *   // Action that would show the Passkey prompt - this should return a promise
   *   return signInPage.signinWithPasskey();
   *   // event listener will resolve when operation completes
   *   }
   * });
   * // then test asserts we're signed in or other success condition
   * ```
   * @param trigger
   */
  async success(trigger: Trigger) {
    this.assertInit();

    // Enable presence simulation FIRST, before anything else
    // This gives the browser maximum time to activate it
    await this.client.send('WebAuthn.setAutomaticPresenceSimulation', {
      authenticatorId: this.authenticatorId,
      enabled: true,
    });

    const operationCompleted = this.waitForOneOf([
      'WebAuthn.credentialAdded',
      'WebAuthn.credentialAsserted',
    ]);

    await this.client.send('WebAuthn.setUserVerified', {
      authenticatorId: this.authenticatorId,
      isUserVerified: true,
    });

    // Wait to ensure presence simulation is fully active
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await trigger();
      await operationCompleted;
    } finally {
      await this.client.send('WebAuthn.setAutomaticPresenceSimulation', {
        authenticatorId: this.authenticatorId,
        enabled: false,
      });
    }
  }

  /**
   * Simulate a *failed/cancelled* passkey operation.
   * There’s no CDP event for failure, so you must provide a post-check or use a small timeout.
   *
   * Example:
   * ```ts
   * await passkeyAuth.fail(async () => {
   *   // Same as `success`, trigger an action that
   *   // would show the Passkey prompt - this should return a promise
   *   return signInPage.signinWithPasskey();
   * }, async () => {
   *   // Return a promise that will resolve after the 'cancellation' is processed.
   *   // This could be a small timeout, or an assertion that an error message is shown.
   *   return expect(page.locator('#error-message')).toBeVisible();
   * });
   * // then test asserts we're still signed out or other failure condition
   * // or check the `getCredentials()` to verify no new credentials were created
   * ```
   */
  async fail(trigger: Trigger, postCheck: PostCheck) {
    this.assertInit();

    // Enable presence simulation FIRST, before anything else
    await this.client.send('WebAuthn.setAutomaticPresenceSimulation', {
      authenticatorId: this.authenticatorId,
      enabled: true,
    });

    await this.client.send('WebAuthn.setUserVerified', {
      authenticatorId: this.authenticatorId,
      isUserVerified: false,
    });

    // Wait to ensure presence simulation is fully active
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await trigger();
      await postCheck();
    } finally {
      await this.client.send('WebAuthn.setAutomaticPresenceSimulation', {
        authenticatorId: this.authenticatorId,
        enabled: false,
      });
    }
  }

  private waitForOneOf(
    events: Array<'WebAuthn.credentialAdded' | 'WebAuthn.credentialAsserted'>
  ) {
    return new Promise<void>((resolve) => {
      let done = false;

      const handlers = events.map(() => {
        const handler = () => {
          if (done) return;
          done = true;
          // remove all handlers when one fires
          for (let i = 0; i < events.length; i++) {
            this.client.off(events[i], handlers[i]);
          }
          resolve();
        };
        return handler;
      });

      for (let i = 0; i < events.length; i++) {
        this.client.on(events[i], handlers[i]);
      }
    });
  }

  private assertInit() {
    if (!this.authenticatorId) {
      throw new Error(
        'PasskeyVirtualAuthenticator not initialized. Call init() first.'
      );
    }
  }
}
