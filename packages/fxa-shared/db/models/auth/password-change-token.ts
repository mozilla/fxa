/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthBaseModel, Proc } from './auth-base';
import { uuidTransformer } from '../../transformers';

export class PasswordChangeToken extends AuthBaseModel {
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

  static async findByTokenId(id: string) {
    const rows = await PasswordChangeToken.callProcedure(
      Proc.PasswordChangeToken,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    return PasswordChangeToken.fromDatabaseJson(rows[0]);
  }
}
