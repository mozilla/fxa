/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Email } from '../../models';
import { AccountTotp } from '../../lib/interfaces';

export interface MetricsData {
  uid: string | null;
  recoveryKey: { exists: boolean; estimatedSyncDeviceCount?: number } | null;
  metricsEnabled: boolean;
  primaryEmail: Email | null;
  emails: Email[];
  totp: AccountTotp | null;
}

export type MetricsDataResult = { account: MetricsData };

export interface SignedInAccountStatus {
  isSignedIn: boolean;
}
