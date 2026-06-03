/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared scope URL constants used across functional tests.

export const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
export const SMARTWINDOW_SCOPE =
  'https://identity.mozilla.com/apps/smartwindow';
export const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
export const PROFILE_SCOPE = 'profile';
export const PROFILE_UID_SCOPE = 'profile:uid';
export const SESSION_TOKEN_SCOPE =
  'https://identity.mozilla.com/tokens/session';

// Combination scope used by Sync OAuth flows: oldsync + the
// session-tokens scope that Sync clients need for cross-device
// handshakes.
export const SYNC_SESSION_TOKEN_SCOPE = `${OLDSYNC_SCOPE} ${SESSION_TOKEN_SCOPE}`;
