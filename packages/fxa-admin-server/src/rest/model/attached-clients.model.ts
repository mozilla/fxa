/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Location } from './location.model';

export class AttachedClient {
  clientId?: string;

  deviceId?: string;

  sessionTokenId?: string;

  refreshTokenId?: string;

  isCurrentSession!: boolean;

  deviceType?: string;

  name?: string;

  scope?: string[];

  location!: Location;

  userAgent!: string;

  os?: string;

  createdTime?: number;

  createdTimeFormatted?: string;

  lastAccessTime?: number;

  lastAccessTimeFormatted?: string;

  approximateLastAccessTime?: number;

  approximateLastAccessTimeFormatted?: string;
}
