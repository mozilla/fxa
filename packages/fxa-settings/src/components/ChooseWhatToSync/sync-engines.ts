/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Fields available in each engine:
 * - `checked` whether the item should be checked when CWTS opens.
 * - `id` of the engine, must be the name the browser uses.
 * - `text` to display when CWTS opens
 * - `include` if the engine should be included by default. This can be
 *    updated later to become a function to conditionally include based
 *    on something like user agent if needed.
 * - `ftlId` is the id for localization
 */
export type EngineConfig = (typeof defaultDesktopV3SyncEngineConfigs)[number];

export type WebChannelEngineConfig =
  (typeof webChannelDesktopV3EngineConfigs)[number];

export type SyncEngineId = EngineConfig['id'] | WebChannelEngineConfig['id'];

/* These sync engines are always offered to the user in Sync fx_desktop_v3
 * and other engines can be received and added with a webchannel message.
 *
 * For OAuth Sync (oauth_webchannel_v1) which includes sync mobile and
 * oauth sync desktop, we do not display options by default and instead,
 * we receive the webchannel message and overwrite the options.
 */
export const defaultDesktopV3SyncEngineConfigs = [
  {
    defaultChecked: true,
    id: 'bookmarks',
    text: 'Bookmarks',
    ftlId: 'choose-what-to-sync-option-bookmarks',
  },
  {
    defaultChecked: true,
    id: 'history',
    text: 'History',
    ftlId: 'choose-what-to-sync-option-history',
  },
  {
    defaultChecked: true,
    id: 'passwords',
    text: 'Passwords',
    ftlId: 'choose-what-to-sync-option-passwords',
  },
  {
    defaultChecked: true,
    id: 'addons',
    text: 'Add-ons',
    ftlId: 'choose-what-to-sync-option-addons',
  },
  {
    defaultChecked: true,
    id: 'tabs',
    text: 'Open Tabs',
    ftlId: 'choose-what-to-sync-option-tabs',
  },
  {
    defaultChecked: true,
    id: 'prefs',
    text: 'Preferences',
    ftlId: 'choose-what-to-sync-option-prefs',
  },
] as const;

// These options will only be available through fx_desktop_v3 if we receive a
// webchannel message from the browser including them via `status.capabilities.engines`.
export const webChannelDesktopV3EngineConfigs = [
  {
    defaultChecked: true,
    id: 'addresses',
    text: 'Addresses',
    ftlId: 'choose-what-to-sync-option-addresses',
    include: false,
  },
  {
    defaultChecked: true,
    id: 'creditcards',
    text: 'Payment Methods',
    ftlId: 'choose-what-to-sync-option-paymentmethods',
    include: false,
  },
] as const;

export const getSyncEngineIds = (syncEnginesConfigsToGet = syncEngineConfigs) =>
  syncEnginesConfigsToGet.map((engine) => engine.id);

// All available sync engines, for all versions of FF desktop and mobile.
export const syncEngineConfigs: (EngineConfig | WebChannelEngineConfig)[] = [
  ...defaultDesktopV3SyncEngineConfigs,
  ...webChannelDesktopV3EngineConfigs,
];
