/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Subset of fields exposedon DTO in db/models/auth/session-token.ts
 */
export interface SessionToken {
  id?: string;
  uid?: string;
  tokenId?: string;

  // device
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  deviceCreatedAt: number;

  // user agent
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  uaFormFactor?: string;

  verificationMethod?: number;
  mustVerify: boolean;
  metricsOptOutAt?: number;

  // Timestamps
  authAt: number;
  createdAt: number;
  lastAccessTime: number | null;
  verifiedAt?: number;
}
