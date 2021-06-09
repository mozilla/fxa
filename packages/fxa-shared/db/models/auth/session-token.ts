/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import crypto from 'crypto';
import { AuthBaseModel, Proc } from './auth-base';
import { aggregateNameValuePairs, uuidTransformer } from '../../transformers';

//TODO FIXME unhardcode the 28 day expiry
function notExpired(token: SessionToken) {
  return !!(token.deviceId || token.createdAt > Date.now() - 2419200000);
}

/** Session Token
 *
 * Note that this class does not currently implement all the functionality of the
 * `session_token.js` version from `fxa-auth-server`.
 */
export class SessionToken extends AuthBaseModel {
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
    tokenVerificationCode,
    tokenVerificationCodeExpiresAt,
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
  > & {
    id: string;
    data: string;
    tokenVerificationCode?: string;
    tokenVerificationCodeExpiresAt: number;
  }) {
    return SessionToken.callProcedure(
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
      tokenVerificationCode
        ? crypto
            .createHash('sha256')
            .update(Buffer.from(tokenVerificationCode, 'hex'))
            .digest()
        : null,
      tokenVerificationCodeExpiresAt ?? null
    );
  }

  static async delete(id: string) {
    return SessionToken.callProcedure(
      Proc.DeleteSessionToken,
      uuidTransformer.to(id)
    );
  }

  static async findByTokenId(id: string) {
    const rows = await SessionToken.callProcedure(
      Proc.SessionWithDevice,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    const token = SessionToken.fromDatabaseJson(
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

  static async findByUid(uid: string) {
    const rows = await SessionToken.callProcedure(
      Proc.Sessions,
      uuidTransformer.to(uid)
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
      .map((row) => SessionToken.fromDatabaseJson(row))
      .filter(notExpired);
  }
}
