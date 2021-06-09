/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthBaseModel, Proc } from './auth-base';
import { uuidTransformer } from '../../transformers';
import { convertError } from '../../mysql';

export class TotpToken extends AuthBaseModel {
  public static tableName = 'totp';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid'];
  protected $intBoolFields = ['verified', 'enabled'];

  // table fields
  uid!: string;
  sharedSecret!: string;
  epoch!: number;
  createdAt!: number;
  verified!: boolean;
  enabled!: boolean;

  static async create({
    uid,
    sharedSecret,
    epoch,
  }: Pick<TotpToken, 'uid' | 'sharedSecret' | 'epoch'>) {
    try {
      await TotpToken.callProcedure(
        Proc.CreateTotpToken,
        uuidTransformer.to(uid),
        sharedSecret,
        epoch,
        Date.now()
      );
    } catch (e) {
      throw convertError(e);
    }
  }
  static async delete(uid: string) {
    return TotpToken.callProcedure(
      Proc.DeleteTotpToken,
      uuidTransformer.to(uid)
    );
  }

  static async findByUid(uid: string) {
    const rows = await TotpToken.callProcedure(
      Proc.TotpToken,
      uuidTransformer.to(uid)
    );
    if (!rows.length) {
      return null;
    }
    return TotpToken.fromDatabaseJson(rows[0]);
  }
}
