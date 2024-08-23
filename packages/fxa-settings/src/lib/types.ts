/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type GleanClickEventDataAttrs = {
  id: string;
  label?: string;
  type?: string;
};

export enum LinkType {
  'reset-password',
  'signin',
}

export enum LinkStatus {
  damaged = 'damaged',
  expired = 'expired',
  valid = 'valid',
  used = 'used',
}

export enum MozServices {
  Default = 'account settings',
  Monitor = 'Mozilla Monitor',
  FirefoxSync = 'Firefox Sync',
  MozillaVPN = 'Mozilla VPN',
  Pocket = 'Pocket',
  TestService = '123Done',
  MonitorPlus = 'Mozilla Monitor Plus',
}

// Information about a device
export type RemoteMetadata = {
  deviceName?: string;
  deviceFamily: string;
  deviceOS: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
};

export enum ResendStatus {
  'none',
  'sent',
  'error',
}

export enum LinkedAccountProviderIds {
  Google = 1,
  Apple = 2,
}
export type UnlinkAccountLocationState = {
  wantsUnlinkProviderId?: LinkedAccountProviderIds;
};
