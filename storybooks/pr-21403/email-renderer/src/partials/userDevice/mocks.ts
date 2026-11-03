/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const MOCK_DEVICE_OS = {
  uaOS: 'Mac OSX',
};

export const MOCK_DEVICE_OS_VERSION = {
  ...MOCK_DEVICE_OS,
  uaOSVersion: '10.11',
};

export const MOCK_DEVICE_BROWSER = {
  uaBrowser: 'Firefox Nightly',
};

export const MOCK_DEVICE_BROWSER_OS = {
  ...MOCK_DEVICE_BROWSER,
  ...MOCK_DEVICE_OS,
};

export const MOCK_DEVICE_ALL = {
  ...MOCK_DEVICE_OS_VERSION,
  ...MOCK_DEVICE_BROWSER,
};
