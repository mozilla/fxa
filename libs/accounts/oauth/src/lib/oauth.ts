/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum OAuthNativeClients {
  FirefoxIOS = '1b1a3e44c54fbb58',
  FirefoxDesktop = '5882386c6d801776',
  Fenix = 'a2270f727f45f648',
  Fennec = '3332a18d142636cb',
  // For Android testing
  ReferenceBrowser = '3c49430b43dfba77',
  // TODO: handle Thunderbird case better, FXA-10848
  Thunderbird = '8269bacd7bbc7f80',
}

/**
 * These come through via data.service (a query parameter).
 */
export enum OAuthNativeServices {
  Sync = 'sync',
  Relay = 'relay',
  SmartWindow = 'smartwindow',
  Vpn = 'vpn',
}

export const OAUTH_NATIVE_CLIENT_IDS: ReadonlySet<string> = new Set(
  Object.values(OAuthNativeClients)
);

/**
 * The native clients that only ever run on a phone or tablet.
 *
 * Device pairing is the one flow where a desktop browser mints an authorization
 * code for one of these, so the pair of "client_id is in here" and "the request
 * did not come from a mobile UA" identifies a pairing authorization without the
 * browser having to say so.
 *
 * Thunderbird is deliberately absent: it is neither of these, and it does not
 * pair.
 */
export const MOBILE_OAUTH_NATIVE_CLIENT_IDS: ReadonlySet<string> = new Set([
  OAuthNativeClients.FirefoxIOS,
  OAuthNativeClients.Fenix,
  OAuthNativeClients.Fennec,
  OAuthNativeClients.ReferenceBrowser,
]);
