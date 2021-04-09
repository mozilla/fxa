/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthBaseModel, Proc } from './auth-base';
import { uuidTransformer } from '../../transformers';

export class KeyFetchToken extends AuthBaseModel {
  public static tableName = 'keyFetchTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = ['authKey', 'uid', 'keyBundle'];
  protected $intBoolFields = ['emailVerified'];

  // table fields
  authKey!: string;
  uid!: string;
  keyBundle!: string;
  createdAt!: number;

  // joined fields (from keyFetchTokenWithVerificationStatus_# stored proc)
  emailVerified!: boolean;
  verifierSetAt!: number;
  tokenVerificationId?: string;

  static async findByTokenId(
    id: string,
    withVerificationStatus: boolean = false
  ) {
    const proc = withVerificationStatus
      ? Proc.KeyFetchTokenWithVerificationStatus
      : Proc.KeyFetchToken;
    const rows = await KeyFetchToken.callProcedure(
      proc,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    return KeyFetchToken.fromDatabaseJson(rows[0]);
  }
}
