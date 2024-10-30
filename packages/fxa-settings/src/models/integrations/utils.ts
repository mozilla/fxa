/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from './oauth-native-integration';

export function isFirefoxService(service?: string) {
  return (
    service === OAuthNativeServices.Sync ||
    service === OAuthNativeServices.Relay
  );
}
