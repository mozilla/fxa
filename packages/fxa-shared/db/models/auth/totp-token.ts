/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';
import { intBoolTransformer, uuidTransformer } from '../../transformers';
import { convertError, notFound } from '../../mysql';
import { Account } from './account';

export class TotpToken extends BaseAuthModel {
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

  static async update(uid: string, verified: boolean, enabled: boolean) {
    try {
      const { status } = await TotpToken.callProcedure(
        Proc.UpdateTotpToken,
        uuidTransformer.to(uid),
        intBoolTransformer.to(verified),
        intBoolTransformer.to(enabled)
      );
      if (status.affectedRows < 1) {
        throw notFound();
      }
    } catch (e) {
      throw convertError(e);
    }
  }

  static async replace({
    uid,
    sharedSecret,
    verified,
    enabled,
    epoch,
  }: Pick<
    TotpToken,
    'uid' | 'sharedSecret' | 'verified' | 'enabled' | 'epoch'
  >) {
    try {
      await TotpToken.callProcedure(
        Proc.ReplaceTotpToken,
        uuidTransformer.to(uid),
        sharedSecret,
        intBoolTransformer.to(verified),
        intBoolTransformer.to(enabled),
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
    const { rows } = await TotpToken.callProcedure(
      Proc.TotpToken,
      uuidTransformer.to(uid)
    );
    if (!rows.length) {
      return null;
    }
    return TotpToken.fromDatabaseJson(rows[0]);
  }
}
