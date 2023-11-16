/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Fields available in each engine:
 * - `checked` whether the item should be checked when CWTS opens.
 * - `id` of the engine, must be the name the browser uses.
 * - `text` to display when CWTS opens
 * - `test` if defined, function used to test whether CWTS is available
 *    for the given `userAgent`. Should return `true` or `false`
 * - `ftlId` is the id for localization
 */
export type Engine = {
  defaultChecked: boolean;
  id: string;
  text: string;
  test?: () => boolean;
  ftlId: string;
};

export const engines: Engine[] = [
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
  {
    defaultChecked: true,
    id: 'addresses',
    // addresses will only be available via capabilities.
    test: () => false,
    text: 'Addresses',
    ftlId: 'choose-what-to-sync-option-addresses',
  },
  {
    defaultChecked: true,
    id: 'creditcards',
    // credit cards will only be available via capabilities.
    test: () => false,
    text: 'Credit Cards',
    ftlId: 'choose-what-to-sync-option-creditcards',
  },
];
