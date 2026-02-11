/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Creation flags interface, controls the type of integration that is ultimately produced.
 */
export interface IntegrationFlags {
  isDevicePairingAsAuthority(): boolean;
  isDevicePairingAsSupplicant(): boolean;
  isOAuth(): boolean;
  isOAuthWebChannelContext(): boolean;
  isV3DesktopContext(): boolean;
  isOAuthSuccessFlow(): { status: boolean; clientId: string };
  isOAuthVerificationFlow(): boolean;
  isThirdPartyAuthCallback(): boolean;

  isServiceOAuth(): boolean;
  isServiceSync(): boolean;
  isVerification(): boolean;
  // TODO: fix return type
  searchParam(key: string): unknown;
}
