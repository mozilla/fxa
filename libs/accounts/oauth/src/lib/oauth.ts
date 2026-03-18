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
