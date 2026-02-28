/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Shared constants for pairing E2E tests.
 */

/** Fenix — an allowed pairing client */
export const PAIRING_CLIENT_ID = 'a2270f727f45f648';
export const PAIRING_SCOPE =
  'profile https://identity.mozilla.com/apps/oldsync';
export const PAIRING_REDIRECT_URI =
  'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel';

export const TIMEOUTS = {
  ELEMENT_FIND: 15_000,
  ASYNC_SCRIPT: 15_000,
  SIGNED_IN_CHECK: 10_000,
  SUPPLICANT_ALLOW: 30_000,
  AUTHORITY_COMPLETE: 15_000,
  POLL_INTERVAL: 500,
} as const;

export const SELECTORS = {
  EMAIL_INPUT: [
    'input[type="email"]',
    'input[name="email"]',
    'input[type="text"][name="email"]',
  ],
  PASSWORD_INPUT: ['input[type="password"]', 'input[name="password"]'],
  SUBMIT_BUTTON: ['button[type="submit"]'],
  AUTHORITY_APPROVE: ['#auth-approve-btn', 'button[type="submit"]'],
} as const;
