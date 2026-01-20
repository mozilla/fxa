/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuthNativeServices } from './oauth-native-integration';

export function isFirefoxService(service?: string) {
  return (
    service === OAuthNativeServices.Sync ||
    service === OAuthNativeServices.Relay ||
    service === OAuthNativeServices.SmartWindow
  );
}

const NO_LONGER_SUPPORTED_CONTEXTS = new Set([
  'fx_ios_v1',
  'fx_desktop_v1',
  'fx_desktop_v2',
  'fx_firstrun_v2',
  'iframe',
]);
export function isUnsupportedContext(context?: string): boolean {
  return !!context && NO_LONGER_SUPPORTED_CONTEXTS.has(context);
}

/**
 * Checks if the browser is probably Firefox based on the user agent string.
 * This may not catch all Firefox browsers, notably iOS devices.
 * See FXA-11520 for alternate approach.
 */
export function isProbablyFirefox(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('firefox') || ua.includes('fxios');
}
