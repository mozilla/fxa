/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

const EVENT_NAMES = {
  'account.create': 1,
  'account.login': 2,
  'account.reset': 3,
  'emails.clearBounces': 4,
  'account.enable': 5,
  'account.disable': 6,
  'account.login.failure': 7, // User attempted to login but failed
  'account.two_factor_added': 8,
  'account.two_factor_requested': 9,
  'account.two_factor_challenge_failure': 10,
  'account.two_factor_challenge_success': 11,
  'account.two_factor_removed': 12,
  'account.password_reset_requested': 13,
  'account.password_reset_success': 14,
  'account.recovery_key_added': 15,
  'account.recovery_key_challenge_failure': 16,
  'account.recovery_key_challenge_success': 17,
  'account.recovery_key_removed': 18,
  'account.password_added': 19,
  'account.password_changed': 20,
  'account.secondary_email_added': 21,
  'account.secondary_email_removed': 22,
  'account.primary_secondary_swapped': 23,
} as const;

export type SecurityEventNames = keyof typeof EVENT_NAMES;

export class SecurityEvent extends BaseModel {
  public static tableName = 'securityEvents';
  public static idColumn = ['uid', 'ipAddrHmac', 'createdAt'];

  protected $uuidFields = ['uid', 'ipAddrHmac', 'tokenVerificationId'];
  protected $intBoolFields = ['verified'];

  // table fields
  uid?: string;
  ipAddrHmac?: string;
  tokenVerificationId?: string;
  name!: SecurityEventNames;
  createdAt!: number;
  verified!: boolean;
}
