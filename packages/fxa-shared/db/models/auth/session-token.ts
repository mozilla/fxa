/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseAuthModel, Proc } from './base-auth';
import { BaseToken } from './base-token';
import {
  aggregateNameValuePairs,
  uuidTransformer,
  intBoolTransformer,
} from '../../transformers';
import { convertError, notFound } from '../../mysql';

//TODO FIXME unhardcode the 28 day expiry
function notExpired(token: SessionToken) {
  return !!(token.deviceId || token.createdAt > Date.now() - 2419200000);
}

const VERIFICATION_METHOD = {
  email: 0,
  'email-2fa': 1,
  'totp-2fa': 2,
  'recovery-code': 3,
} as const;

export type VerificationMethod = keyof typeof VERIFICATION_METHOD;
export type SessionVerifiedState = 'verified' | 'unverified';

export function verificationMethodToNumber(
  method: VerificationMethod | number
) {
  return typeof method === 'number' ? method : VERIFICATION_METHOD[method];
}

export function verificationMethodToString(
  method: VerificationMethod | number
): string {
  if (typeof method === 'number') {
    return (
      (Object.keys(VERIFICATION_METHOD) as VerificationMethod[]).find(
        (key) => VERIFICATION_METHOD[key] === method
      ) || 'unknown'
    );
  }
  return method;
}

/** Session Token
 *
 * Note that this class does not currently implement all the functionality of the
 * `session_token.js` version from `fxa-auth-server`.
 */
export class SessionToken extends BaseToken {
  public static tableName = 'sessionTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = [
    'tokenId',
    'uid',
    'tokenData',
    'deviceId',
    'tokenVerificationId',
    'emailCode',
  ];
  protected $intBoolFields = [
    'emailVerified',
    'mustVerify',
    'deviceCallbackIsExpired',
  ];

  // table fields
  tokenId!: string;
  tokenData!: string;
  uid!: string;
  createdAt!: number;
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  lastAccessTime!: number;
  uaFormFactor?: string;
  authAt!: number;
  verificationMethod?: number;
  verifiedAt?: number;
  mustVerify!: boolean;
  providerId?: number;

  // joined fields (from sessionWithDevice_# stored proc)
  emailVerified!: boolean;
  email!: string;
  emailCode!: string;
  verifierSetAt!: number;
  locale!: string;
  profileChangedAt!: number;
  keysChangedAt!: number;
  accountCreatedAt!: number;
  deviceId!: string;
  deviceName?: string;
  deviceType?: string;
  deviceCreatedAt!: number;
  deviceCallbackUrl?: string;
  deviceCallbackPublicKey?: string;
  deviceCallbackAuthKey?: string;
  deviceCallbackIsExpired!: boolean;
  deviceCommandName?: string;
  deviceCommandData?: string;
  tokenVerificationId?: string;
  metricsOptOutAt?: number;

  // generated
  deviceAvailableCommands!: {
    [key: string]: string;
  };

  get tokenVerified() {
    return !this.tokenVerificationId;
  }

  get state() {
    return this.tokenVerified ? 'verified' : 'unverified';
  }

  static async create({
    id,
    data,
    uid,
    createdAt,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    uaFormFactor,
    tokenVerificationId,
    mustVerify,
    providerId,
  }: Pick<
    SessionToken,
    | 'uid'
    | 'createdAt'
    | 'uaBrowser'
    | 'uaBrowserVersion'
    | 'uaOS'
    | 'uaOSVersion'
    | 'uaDeviceType'
    | 'uaFormFactor'
    | 'tokenVerificationId'
    | 'mustVerify'
    | 'providerId'
  > & {
    id: string;
    data: string;
  }) {
    return this.callProcedure(
      Proc.CreateSessionToken,
      uuidTransformer.to(id),
      uuidTransformer.to(data),
      uuidTransformer.to(uid),
      createdAt,
      uaBrowser ?? null,
      uaBrowserVersion ?? null,
      uaOS ?? null,
      uaOSVersion ?? null,
      uaDeviceType ?? null,
      uaFormFactor ?? null,
      uuidTransformer.to(tokenVerificationId),
      !!mustVerify,
      providerId ?? null
    );
  }

  static async update({
    id,
    uaBrowser,
    uaBrowserVersion,
    uaOS,
    uaOSVersion,
    uaDeviceType,
    uaFormFactor,
    lastAccessTime,
    authAt,
    mustVerify,
  }: Pick<
    SessionToken,
    | 'uaBrowser'
    | 'uaBrowserVersion'
    | 'uaOS'
    | 'uaOSVersion'
    | 'uaDeviceType'
    | 'uaFormFactor'
    | 'lastAccessTime'
    | 'authAt'
    | 'mustVerify'
  > & {
    id: string;
  }) {
    try {
      await this.callProcedure(
        Proc.UpdateSessionToken,
        uuidTransformer.to(id),
        uaBrowser ?? null,
        uaBrowserVersion ?? null,
        uaOS ?? null,
        uaOSVersion ?? null,
        uaDeviceType ?? null,
        uaFormFactor ?? null,
        lastAccessTime ?? Date.now(),
        authAt ?? null,
        intBoolTransformer.to(mustVerify)
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async verify(id: string, method: VerificationMethod | number) {
    try {
      await this.transaction(async (txn) => {
        const { status } = await this.callProcedure(
          Proc.VerifyTokenWithMethod,
          txn,
          uuidTransformer.to(id),
          verificationMethodToNumber(method),
          Date.now()
        );
        if (status.affectedRows < 1) {
          throw notFound();
        }
        const token = await this.query(txn)
          .select(
            'sessionTokens.uid as uid',
            'unverifiedTokens.tokenVerificationId as tokenVerificationId'
          )
          .join(
            'unverifiedTokens',
            'sessionTokens.tokenId',
            'unverifiedTokens.tokenId'
          )
          .where('sessionTokens.tokenId', uuidTransformer.to(id))
          .first();
        if (token) {
          await this.callProcedure(
            Proc.VerifyToken,
            txn,
            uuidTransformer.to(token.tokenVerificationId),
            uuidTransformer.to(token.uid)
          );
        }
      });
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async delete(id: string) {
    return this.callProcedure(Proc.DeleteSessionToken, uuidTransformer.to(id));
  }

  static async findByTokenId(id: string) {
    const { rows } = await this.callProcedure(
      Proc.SessionWithDevice,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    const token = this.fromDatabaseJson(
      aggregateNameValuePairs(
        rows,
        'deviceId',
        'deviceCommandName',
        'deviceCommandData',
        'deviceAvailableCommands'
      )[0]
    );
    return notExpired(token) ? token : null;
  }

  static async findByUid(uid: string, limit = 500): Promise<SessionToken[]> {
    const { rows } = await this.callProcedure(
      Proc.Sessions,
      uuidTransformer.to(uid),
      limit
    );
    if (!rows.length) {
      return [];
    }
    return aggregateNameValuePairs(
      rows,
      'deviceId',
      'deviceCommandName',
      'deviceCommandData',
      'deviceAvailableCommands'
    )
      .map((row) => {
        return this.fromDatabaseJson(row);
      })
      .filter(notExpired);
  }
}
