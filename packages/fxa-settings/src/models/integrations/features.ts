/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface IntegrationFeatures {
  /**
   * If the provided UID no longer exists on the auth server, can the
   * user sign up/in with the same email address but a different uid?
   */
  allowUidChange: boolean;
  /**
   * Should the user agent be queried for FxA data?
   */
  fxaStatus: boolean;
  /**
   * Should the view handle signed-in notifications from other tabs?
   */
  handleSignedInNotification: boolean;
  /**
   * If the user has an existing sessionToken, can we safely re-use it on
   * subsequent signin attempts rather than generating a new token each time?
   */
  reuseExistingSession: boolean;
  /**
   * Does this environment support pairing?
   */
  supportsPairing: boolean;
}
