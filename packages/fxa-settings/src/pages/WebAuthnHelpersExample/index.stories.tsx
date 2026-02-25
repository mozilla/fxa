/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { WebAuthnHelpersExample } from '.';

export default {
  title: 'Pages/WebAuthnHelpersExample',
  component: WebAuthnHelpersExample,
} as Meta;

/**
 * Live test harness for the WebAuthn browser utilities
 * (src/lib/passkeys/webauthn.ts).
 *
 * This story calls the real browser Credentials API — passkey prompts will
 * appear when you click the buttons. Storybook runs at localhost which is a
 * valid secure context for WebAuthn.
 *
 * Suggested test sequence:
 *   1. Click "Check" to verify isWebAuthnLevel3Supported()
 *   2. Click "Call createCredential()" — complete the device prompt to register
 *      a passkey for localhost. Inspect the attestation JSON in the result.
 *   3. Click "Call getCredential()" — complete the device prompt to authenticate.
 *      Inspect the assertion JSON in the result.
 *   4. Edit the JSON options and try error cases:
 *      - Cancel the browser prompt → NotAllowedError
 *      - Set an invalid rpId → SecurityError
 *      - Set timeout to 1ms → TimeoutError (from our AbortController)
 */
export const Default = () => <WebAuthnHelpersExample />;
