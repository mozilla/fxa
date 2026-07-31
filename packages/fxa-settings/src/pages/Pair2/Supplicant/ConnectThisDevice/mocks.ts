/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RemoteMetadata } from '../../../../lib/types';

export const MOCK_EMAIL = 'prettylongusername@longerdomain.com';

export const MOCK_AUTH_DEVICE_INFO: RemoteMetadata = {
  deviceName: 'Ultron',
  deviceFamily: 'Firefox',
  deviceOS: 'macOS',
  ipAddress: '71.25.467.347',
  city: 'Portland',
  region: 'Oregon',
  country: 'United States',
};

export const MOCK_AUTH_DEVICE_INFO_UNKNOWN_LOCATION: RemoteMetadata = {
  deviceFamily: 'Firefox',
  deviceOS: 'Windows',
  ipAddress: '71.25.467.347',
};
