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
  // A v2 handshake step spans a channel-server round trip between two separate
  // browsers, so it needs more headroom than a same-browser navigation.
  PAIR_V2_HANDSHAKE: 45_000,
  POLL_INTERVAL: 500,
  POLL_INTERVAL_MAX: 2_000,
} as const;

// ---- v2 pairing (FXA-12855) ----
// The v2 flow moves the authority into FxA web content. These constants cover
// the v2 routes and QR URL format; v1 constants above are unchanged.
//
// Route source of truth is App/index.tsx (code takes precedence over the ticket
// prose, which uses "/pair2/..." and "approve_sign_in").
export const PAIR_V2_ROUTES = {
  AUTHORITY_SCAN_QR: '/pair/authority/scan_qr',
  AUTHORITY_APPROVE_SIGNIN: '/pair/authority/approve_signin',
  AUTHORITY_CONTINUE_ON_MOBILE: '/pair/authority/continue_on_mobile',
  AUTHORITY_SYNC_SUCCESS: '/pair/authority/sync_success',
  AUTHORITY_TIMEOUT_AND_CANCEL: '/pair/authority/timeout_and_cancel',
  SUPPLICANT_APPROVE_SIGNIN: '/pair/supplicant/approve_signin',
  SUPPLICANT_CONNECT_THIS_DEVICE: '/pair/supplicant/connect_this_device',
  SUPPLICANT_READY_TO_SCAN: '/pair/supplicant/ready_to_scan',
  SUPPLICANT_SYNC_SUCCESS: '/pair/supplicant/sync_success',
  SUPPLICANT_TIMEOUT_AND_CANCEL: '/pair/supplicant/timeout_and_cancel',
} as const;

// v2 QR URL format, confirmed by FXA-13868 AC:
//   https://<host>/pair#channel_id=<id>&channel_key=<key>&v=2
// i.e. the v1 fragment plus the v2 marker.
export const PAIR_V2_URL_MARKER = 'v=2';

/** Browser pref that decides the pairing version Firefox reports and accepts. */
export const PAIRING_VERSION_PREF = 'identity.fxaccounts.pairing.version';

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
