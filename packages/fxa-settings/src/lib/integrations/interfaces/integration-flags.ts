/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RawData } from '../../model-data';

/**
 * Creation flags interface, controls the type of integration that is ultimately produced.
 */
export interface IntegrationFlags {
  isDevicePairingAsAuthority(): boolean;
  isDevicePairingAsV2Authority(): boolean;
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
  searchParam(key: string): RawData;
}
