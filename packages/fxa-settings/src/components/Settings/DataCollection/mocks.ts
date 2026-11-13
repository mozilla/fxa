/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AttachedClient } from '../../../models';
import { SyncDevice } from './ModalDeleteSyncedData';

const baseClient = {
  userAgent: '',
  lastAccessTime: 1794341155000,
  lastAccessTimeFormatted: '2 hours ago',
  approximateLastAccessTime: null,
  approximateLastAccessTimeFormatted: null,
  location: { city: null, country: null, state: null, stateCode: null },
  scope: null,
};

// Shaped like GET /account/attached_clients entries for Firefox devices.
export const MOCK_SYNC_CLIENTS: AttachedClient[] = [
  {
    ...baseClient,
    clientId: '5882386c6d801776',
    deviceId: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    sessionTokenHandle:
      '8ee9174a04f76d5ec5bf0c93bbd91b837796f067da408e58b5bd5d1fd914b45b',
    refreshTokenId: null,
    isCurrentSession: true,
    deviceType: 'desktop',
    name: 'Laurel’s MacBook Pro',
    userAgent: 'Firefox 147',
    os: 'Mac OS X',
  },
  {
    ...baseClient,
    clientId: '1b1a3e44c54fbb58',
    deviceId: 'b2c3d4e5f60718293a4b5c6d7e8f90a1',
    sessionTokenHandle: null,
    refreshTokenId:
      'f0b7dae0043cb07cdb0f1ff160367a0b3214a91f037621e892060d9a146f2d8e',
    isCurrentSession: false,
    deviceType: 'mobile',
    name: 'Laurel’s iPhone',
    os: 'iOS',
  },
  {
    ...baseClient,
    clientId: '5882386c6d801776',
    deviceId: 'c3d4e5f60718293a4b5c6d7e8f90a1b2',
    sessionTokenHandle:
      '1f1f289cc67584d881d546354ee043b47a8f7be3e7a11c7ce7a7eed09c2e20fa',
    refreshTokenId: null,
    isCurrentSession: false,
    deviceType: 'desktop',
    name: 'Work laptop',
    userAgent: 'Firefox 146',
    os: 'Windows',
  },
];

export const toSyncDevices = (clients: AttachedClient[]): SyncDevice[] =>
  clients.flatMap(({ deviceId, name, deviceType, isCurrentSession }) =>
    deviceId ? [{ deviceId, name, deviceType, isCurrentSession }] : []
  );

export const MOCK_SYNC_DEVICES = toSyncDevices(MOCK_SYNC_CLIENTS);

const MANY_DEVICE_NAMES: Array<[string, string]> = [
  ['Laurel’s MacBook Pro', 'desktop'],
  ['Laurel’s iPhone', 'mobile'],
  ['Work laptop', 'desktop'],
  ['Laurel’s iPad', 'tablet'],
  ['Family desktop', 'desktop'],
  ['Pixel 9', 'mobile'],
  ['Old ThinkPad', 'desktop'],
  ['Galaxy Tab S9', 'tablet'],
  ['Laurel’s Firefox on Laurels-Mac-mini.local', 'desktop'],
  ['Work phone', 'mobile'],
  ['Living room Linux box', 'desktop'],
  ['Backup Android', 'mobile'],
];

export const MOCK_MANY_SYNC_DEVICES: SyncDevice[] = MANY_DEVICE_NAMES.map(
  ([name, deviceType], i) => ({
    deviceId: `device-${i}`,
    name,
    deviceType,
    isCurrentSession: i === 0,
  })
);
