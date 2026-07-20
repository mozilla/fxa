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
  SIGNED_IN_CHECK: 15_000,
  SUPPLICANT_ALLOW: 30_000,
  AUTHORITY_COMPLETE: 15_000,
  POLL_INTERVAL: 500,
  POLL_INTERVAL_MAX: 2_000,
} as const;

export const SELECTORS = {
  EMAIL_INPUT: [
    'input[type="email"]',
    'input[name="email"]',
    'input[type="text"][name="email"]',
  ],
  PASSWORD_INPUT: ['input[type="password"]', 'input[name="password"]'],
  SUBMIT_BUTTON: ['button[type="submit"]'],
  AUTHORITY_APPROVE: [
    '[data-testid="pair-auth-approve-btn"]',
    '#auth-approve-btn',
    'button[type="submit"]',
  ],
  // Backbone supplicant cancel is an anchor `<a href="#" id="cancel">` that fires
  // a click handler calling replaceCurrentPage('pair/failure'). React uses
  // `<Link to="/pair/failure">` with no stable id — we match it by role/text.
  SUPP_CANCEL_BACKBONE: ['a#cancel'],
  TOTP_INPUT: [
    'input.totp-code',
    'input[name="code"]',
    'input[type="text"][maxlength="6"]',
  ],
  // /pair index choice screen — IDs are identical between Backbone and React,
  // only the React templates add data-testid attributes.
  PAIR_CHOICE_HEADER: ['[data-testid="pair-header"]', '#pair-header'],
  PAIR_RADIO_HAS_MOBILE: ['[data-testid="has-mobile"]', '#has-mobile'],
  PAIR_RADIO_NEEDS_MOBILE: ['[data-testid="needs-mobile"]', '#needs-mobile'],
  PAIR_CONTINUE_BUTTON: [
    '[data-testid="pair-continue-btn"]',
    '#set-needs-mobile',
  ],
} as const;

// Copy shown on the /pair/failure page. Both stacks render the same wording
// now (React was updated to match Backbone). The body uses a U+2019 right
// single quotation mark in "couldn’t"; the `.` in the regex accepts either
// a straight or curly apostrophe without hard-coding the codepoint.
export const FAILURE_COPY = {
  heading: /Device pairing failed/i,
  body: /The setup couldn.t be completed/i,
} as const;
