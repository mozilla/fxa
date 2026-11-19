/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Location } from './Location';

export type AttachedClient = {
  clientId: string | null;
  deviceId: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
  isCurrentSession: boolean;
  /**
   * True when the device registered the send-tab command, which Firefox only
   * does while it holds the Sync key. Means "can sync", not "is syncing".
   */
  isSyncCapable: boolean;
  deviceType?: string | null;
  name?: string | null;
  scope: Array<string> | null;
  location: Partial<Location> | null;
  userAgent: string;
  os: string | null;
  createdTime?: number | null;
  createdTimeFormatted?: string;
  lastAccessTime?: number | null;
  lastAccessTimeFormatted?: string;
  approximateLastAccessTime?: number;
  approximateLastAccessTimeFormatted?: string;
};

export const attachedClientsDefaults: AttachedClient = {
  clientId: null,
  deviceId: null,
  sessionTokenId: null,
  refreshTokenId: null,
  isCurrentSession: false,
  isSyncCapable: false,
  deviceType: null,
  name: null,
  createdTime: Infinity,
  lastAccessTime: 0,
  scope: null,
  location: null,
  userAgent: '',
  os: null,
  createdTimeFormatted: '',
  lastAccessTimeFormatted: '',
};
