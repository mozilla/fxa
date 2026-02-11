/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Location } from './Location';

export type AttachedDevice = {
  id: string;
  sessionTokenId: string;
  name?: string | null;
  type?: string | null;
  createdAt?: number;
  refreshTokenId?: string | null;
  pushCallback?: string | null;
  pushPublicKey?: string | null;
  pushAuthKey?: string | null;
  pushEndpointExpired: boolean;
  availableCommands: {
    [key: string]: string;
  };
  uaBrowser?: string | null;
  uaBrowserVersion?: string | null;
  uaOS?: string | null;
  uaOSVersion?: string | null;
  uaDeviceType?: string | null;
  uaFormFactor?: string | null;

  lastAccessTime?: number | null;
  location: Location;
};
