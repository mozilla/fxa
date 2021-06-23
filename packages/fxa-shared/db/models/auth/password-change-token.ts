/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer } from '../../transformers';

export class PasswordChangeToken extends BaseAuthModel {
  public static tableName = 'passwordChangeTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = ['tokenData', 'uid'];

  // table fields
  tokenData!: string;
  uid!: string;
  createdAt!: number;

  // joined fields (from passwordChangeToken_# stored proc)
  email!: string;
  verifierSetAt!: number;

  static async create({
    id,
    data,
    uid,
    createdAt,
  }: Pick<PasswordChangeToken, 'uid' | 'createdAt'> & {
    id: string;
    data: string;
  }) {
    return PasswordChangeToken.callProcedure(
      Proc.CreatePasswordChangeToken,
      uuidTransformer.to(id),
      uuidTransformer.to(data),
      uuidTransformer.to(uid),
      createdAt
    );
  }

  static async delete(id: string) {
    return PasswordChangeToken.callProcedure(
      Proc.DeletePasswordChangeToken,
      uuidTransformer.to(id)
    );
  }

  static async findByTokenId(id: string) {
    const { rows } = await PasswordChangeToken.callProcedure(
      Proc.PasswordChangeToken,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    return PasswordChangeToken.fromDatabaseJson(rows[0]);
  }
}
