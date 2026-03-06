/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BlockStatus } from 'fxa-admin-server/src/types';

export const mockBlockStatusData1: BlockStatus = {
  retryAfter: 30 * 60 * 1000,
  reason: 'Too many requests',
  action: 'login',
  blockingOn: 'ip_email',
  startTime: 1760454159000,
  duration: 60 * 60,
  attempt: 5,
  policy: 'block',
};

export const mockBlockStatusData2: BlockStatus = {
  retryAfter: 10 * 60 * 1000,
  reason: 'Suspicious activity detected',
  action: 'passwordChange',
  blockingOn: 'uid',
  startTime: 1760457759000,
  duration: 2 * 60 * 60,
  attempt: 3,
  policy: 'block',
};

export const mockBanStatusData: BlockStatus = {
  retryAfter: 24 * 60 * 60 * 1000,
  reason: 'Ban reason',
  action: 'accountLoginFailed',
  blockingOn: 'email',
  startTime: 1760450000000,
  duration: 24 * 60 * 60,
  attempt: 10,
  policy: 'ban',
};
