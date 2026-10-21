/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type Device = {
  id: string;
  uid: string;
  sessionTokenId: string;
  name?: string;
  type?: string;
  createdAt?: number;
  pushCallback?: string;
  pushPublicKey?: string;
  pushAuthKey?: string;
  callbackIsExpired: boolean;
  refreshTokenId?: string;
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  uaFormFactor?: string;
  lastAccessTime?: string;
  availableCommands: {
    [key: string]: string;
  };
};
