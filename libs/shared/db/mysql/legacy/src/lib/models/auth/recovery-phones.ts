/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel } from './base-auth';

export class RecoveryPhones extends BaseAuthModel {
  public static tableName = 'recoveryPhones';
  public static idColumn = 'uid'; // Primary key is the uid

  protected $uuidFields = ['uid'];

  // Table fields
  uid!: string;
  phoneNumber!: string; // in E.164 format, up to 15 chars
  createdAt!: number; // BIGINT UNSIGNED timestamp
  lastConfirmed!: number; // BIGINT UNSIGNED timestamp
  lookupData!: any; // JSON data from phone lookup (e.g., Twilio)
}
