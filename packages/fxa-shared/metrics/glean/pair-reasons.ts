/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Flows that redirect a user to the /pair choice screen, recorded as the
 * `reason` extra on `cad_firefox.choice_view` so the screen's funnel can be
 * split by originating flow (FXA-14133).
 *
 * Single source of truth for both /pair implementations: fxa-settings reads the
 * value from router state, and the Backbone view in fxa-content-server
 * validates it out of a query param. Adding a value here is all that is needed
 * for both to accept it — but remember to update the `reason` description on
 * `cad_firefox.choice_view` in fxa-ui-metrics.yaml too.
 *
 * Flows with no entry here (third-party auth, cached-credential sign-in)
 * deliberately record no reason rather than being folded into a bucket they
 * don't belong to.
 */
export const PAIR_GLEAN_REASONS = [
  'password_login',
  'password_reg',
  'otp_login',
  'passkey_login',
] as const;

export type PairGleanReason = (typeof PAIR_GLEAN_REASONS)[number];

export const isPairGleanReason = (value: unknown): value is PairGleanReason =>
  typeof value === 'string' &&
  (PAIR_GLEAN_REASONS as readonly string[]).includes(value);
