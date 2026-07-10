/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Page } from '@playwright/test';

export type VirtualAuthenticatorHandle = {
  authenticatorId: string;
  remove: () => Promise<void>;
};

/**
 * Adds a Chromium CDP WebAuthn virtual authenticator to the page (Chromium-only).
 *
 * Unlike {@link ../lib/passkeyPolyfill.PasskeyPolyfill}, this drives Chrome's
 * REAL WebAuthn stack: navigator.credentials.{create,get} run unmodified, so the
 * production webauthn.ts decode/serialize path is exercised against a genuine
 * PublicKeyCredential and real browser-side validation — catching API-shape
 * regressions the polyfill can't (it authors both sides of the credential shape).
 *
 * The authenticator is resident-key + UV with automatic presence, so ceremonies
 * resolve without a prompt and the credential persists across sign-out for a
 * later assertion in the same CDP session.
 */
export async function addVirtualAuthenticator(
  page: Page
): Promise<VirtualAuthenticatorHandle> {
  const client = await page.context().newCDPSession(page);
  await client.send('WebAuthn.enable');
  const { authenticatorId } = (await client.send(
    'WebAuthn.addVirtualAuthenticator',
    {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    }
  )) as { authenticatorId: string };

  return {
    authenticatorId,
    remove: async () => {
      // Best-effort teardown, each step independent so a failed removal still
      // detaches the CDP session rather than leaking it across tests.
      try {
        await client.send('WebAuthn.removeVirtualAuthenticator', {
          authenticatorId,
        });
      } catch {
        // ignore
      }
      try {
        await client.detach();
      } catch {
        // ignore
      }
    },
  };
}
