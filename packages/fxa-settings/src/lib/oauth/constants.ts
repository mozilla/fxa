/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Default TTL (seconds) for OAuth access tokens minted from a session token
 * to call the profile server. Five minutes is well over any single request's
 * latency budget while keeping the token's blast radius small.
 */
export const PROFILE_OAUTH_TOKEN_TTL_SECONDS = 300;
