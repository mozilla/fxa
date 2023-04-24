/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO: These used to be `private` methods on the relier factory flags.
// We will combine integrations + reliers in FXA-7308
export interface IntegrationFlags {
  isServiceOAuth(): boolean;
  isServiceSync(): boolean;
  isVerification(): boolean;
  // TODO: fix return type
  searchParam(key: string): unknown;
}
