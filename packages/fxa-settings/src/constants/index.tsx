/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const ROOTPATH = '/';
export const HomePath = '/settings';
export const DeleteAccountPath = '/settings/delete_account';
export const VPNLink = 'https://vpn.mozilla.org/';
export const MonitorLink = 'https://monitor.firefox.com/';
export const SyncLink = 'https://www.mozilla.org/firefox/sync/';
export const RelayLink = 'https://relay.firefox.com/';
export const AddonsLink = 'https://addons.mozilla.org/';
export const MDNLink = 'https://developer.mozilla.org/';
export const HubsLink = 'https://hubs.mozilla.com/';
export const PocketLink = 'https://getpocket.com/';
export const SHOW_BALLOON_TIMEOUT = 500;
export const HIDE_BALLOON_TIMEOUT = 400;
export const POLLING_INTERVAL_MS = 2000;
export const NAVIGATION_TIMEOUT_MS = 2000;
export const REACT_ENTRYPOINT = { entrypoint_variation: 'react' };

export const FIREFOX_NOREPLY_EMAIL = 'accounts@firefox.com';

export enum ENTRYPOINTS {
  FIREFOX_IOS_OAUTH_ENTRYPOINT = 'ios_settings_manage',
  FIREFOX_TOOLBAR_ENTRYPOINT = 'fxa_discoverability_native',
  FIREFOX_MENU_ENTRYPOINT = 'fxa_app_menu',
  FIREFOX_PREFERENCES_ENTRYPOINT = 'preferences',
  FIREFOX_SYNCED_TABS_ENTRYPOINT = 'synced-tabs',
  FIREFOX_TABS_SIDEBAR_ENTRYPOINT = 'tabs-sidebar',
  FIREFOX_FX_VIEW_ENTRYPOINT = 'fx-view',
}

// DISPLAY_SAFE_UNICODE regex matches validation used for auth_server
// Match display-safe unicode characters.
// We're pretty liberal with what's allowed in a unicode string,
// but we exclude the following classes of characters:
//
//   \u0000-\u001F  - C0 (ascii) control characters
//   \u007F         - ascii DEL character
//   \u0080-\u009F  - C1 (ansi escape) control characters
//   \u2028-\u2029  - unicode line/paragraph separator
//   \uD800-\uDFFF  - non-BMP surrogate pairs
//   \uE000-\uF8FF  - BMP private use area
//   \uFFF9-\uFFFC  - unicode specials prior to the replacement character
//   \uFFFE-\uFFFF  - unicode this-is-not-a-character specials
//
// Note that the unicode replacement character \uFFFD is explicitly allowed,
// and clients may use it to replace other disallowed characters.
//
// We might tweak this list in future.

export const DISPLAY_SAFE_UNICODE: RegExp =
  // eslint-disable-next-line no-control-regex
  /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFC\uFFFE-\uFFFF])*$/;
