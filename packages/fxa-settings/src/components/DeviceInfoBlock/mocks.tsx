/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RemoteMetadata } from '../../lib/types';

export const MOCK_IP_ADDRESS = 'XX.XX.XXX.XXX';
export const MOCK_DEVICE_NAME = 'Ultron';
export const MOCK_DEVICE_FAMILY = 'Firefox';
export const MOCK_DEVICE_OS = 'macOS';
export const MOCK_COUNTRY = 'Canada';
export const MOCK_REGION = 'British Columbia';
export const MOCK_CITY = 'Vancouver';

export const MOCK_METADATA_WITH_LOCATION: RemoteMetadata = {
  deviceFamily: MOCK_DEVICE_FAMILY,
  deviceOS: MOCK_DEVICE_OS,
  ipAddress: MOCK_IP_ADDRESS,
  city: MOCK_CITY,
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
};

export const MOCK_METADATA_WITH_DEVICE_NAME: RemoteMetadata = {
  deviceName: MOCK_DEVICE_NAME,
  deviceFamily: MOCK_DEVICE_FAMILY,
  deviceOS: MOCK_DEVICE_OS,
  ipAddress: MOCK_IP_ADDRESS,
  city: MOCK_CITY,
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
};

export const MOCK_METADATA_UNKNOWN_LOCATION: RemoteMetadata = {
  deviceFamily: MOCK_DEVICE_FAMILY,
  deviceOS: MOCK_DEVICE_OS,
  ipAddress: MOCK_IP_ADDRESS,
};
