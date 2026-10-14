/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Location } from './Location';

export type DeviceSessionToken = {
  lastAccessTime: number;
  location: Location;
  uaBrowser: string;
  uaBrowserVersion: string;
  uaDeviceType: string;
  uaFormFactor?: string;
  uaOS: string;
  uaOSVersion: string;
  id: string;
  callbackURL: string;
  callbackAuthKey: string;
  callbackPublicKey: string;
};
