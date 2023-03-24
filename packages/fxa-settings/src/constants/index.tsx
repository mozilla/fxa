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
export const SHOW_BALLOON_TIMEOUT = 500;
export const HIDE_BALLOON_TIMEOUT = 400;
export const CLEAR_MESSAGES_TIMEOUT = 750;
export const RESEND_CODE_TIMEOUT = 5000;
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
