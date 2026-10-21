/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Location } from './Location';

export type AttachedSession = {
  id: string;
  deviceType?: string;
  deviceName?: string;
  createdAt: number;
  lastAccessTime: number;
  location?: Location | null;
  uaBrowser?: string;
  uaOS?: string;
  uaBrowserVersion?: string;
  uaOSVersion?: string;
  uaFormFactor?: string;
  uaDeviceType?: string;
};
