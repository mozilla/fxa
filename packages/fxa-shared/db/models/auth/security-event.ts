/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import ip from 'ip';
import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer } from '../../transformers';
import { convertError } from '../../mysql';

// These are the values of the `securityEventNames` table in the fxa DB.  The
// numeric id is a MySQL auto_increment'd value.  It's best to run the
// migrations and then add the id values here when adding more event types.
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
  'account.password_reset_otp_sent': 24,
  'account.password_reset_otp_verified': 25,
} as const;

export type SecurityEventNames = keyof typeof EVENT_NAMES;

function ipHmac(key: Buffer, uid: Buffer, addr: string) {
  if (ip.isV4Format(addr)) {
    addr = '::' + addr;
  }

  const hmac = crypto.createHmac('sha256', key);
  hmac.update(uid);
  hmac.update(ip.toBuffer(addr));

  return hmac.digest();
}

export class SecurityEvent extends BaseAuthModel {
  public static tableName = 'securityEvents';
  public static idColumn = ['uid', 'ipAddrHmac', 'createdAt'];

  protected $uuidFields = ['uid', 'ipAddrHmac', 'tokenVerificationId'];
  protected $intBoolFields = ['verified'];

  // table fields
  uid?: string;
  ipAddrHmac?: string;
  ipAddr?: string;
  tokenVerificationId?: string;
  name!: SecurityEventNames;
  createdAt!: number;
  verified!: boolean;

  static async create({
    uid,
    name,
    ipAddr,
    ipHmacKey,
    tokenId,
  }: {
    uid: string;
    name: SecurityEventNames;
    ipAddr: string;
    ipHmacKey: string;
    tokenId?: string;
  }) {
    const id = uuidTransformer.to(uid);
    const ipAddrHmac = ipHmac(Buffer.from(ipHmacKey), id, ipAddr);
    let result;

    try {
      result = await this.callProcedure(
        Proc.CreateSecurityEvent,
        id,
        tokenId ? uuidTransformer.to(tokenId) : null,
        EVENT_NAMES[name],
        ipAddrHmac,
        Date.now(),
        ipAddr
      );
    } catch (e) {
      console.error(e);
      throw convertError(e);
    }

    return !!result;
  }

  static async findByUid(uid: string) {
    const id = uuidTransformer.to(uid);
    return this.query()
      .select(
        'securityEventNames.name as name',
        'securityEvents.verified as verified',
        'securityEvents.createdAt as createdAt',
        'securityEvents.ipAddr as ipAddr'
      )
      .leftJoin(
        'securityEventNames',
        'securityEvents.nameId',
        'securityEventNames.id'
      )
      .where('securityEvents.uid', id)
      .orderBy('securityEvents.createdAt', 'DESC')
      .limit(20);
  }

  static async findByUidAndIP(uid: string, ipAddr: string, ipHmacKey: string) {
    const id = uuidTransformer.to(uid);
    const ipAddrHmac = ipHmac(Buffer.from(ipHmacKey), id, ipAddr);
    return SecurityEvent.query()
      .select(
        'securityEventNames.name as name',
        'securityEvents.verified as verified',
        'securityEvents.createdAt as createdAt',
        'securityEvents.ipAddr as ipAddr'
      )
      .leftJoin(
        'securityEventNames',
        'securityEvents.nameId',
        'securityEventNames.id'
      )
      .where('securityEvents.uid', id)
      .andWhere('securityEvents.ipAddrHmac', ipAddrHmac)
      .orderBy('securityEvents.createdAt', 'DESC')
      .limit(20);
  }
}
