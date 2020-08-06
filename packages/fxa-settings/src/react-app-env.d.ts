/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference types="react-scripts" />

type Hash<T> = { [key: string]: T };

interface QueryParams {
  device_id?: string;
  flow_id?: string;
  flow_begin_time?: number;
}

interface AccountData {
  uid: string;
  displayName: string | null;
  avatarUrl: string | null;
  accountCreated: number;
  passwordCreated: number;
  recoveryKey: boolean;
  emails: {
    email: string;
    isPrimary: boolean;
    verified: boolean;
  }[];
  attachedClients: {
    clientId: string;
    isCurrentSession: boolean;
    userAgent: string;
    deviceType: string;
    deviceId: string;
  }[];
  totp: {
    exists: boolean;
    verified: boolean;
  };
  subscriptions: {
    created: number;
    productName: string;
  }[];
}
