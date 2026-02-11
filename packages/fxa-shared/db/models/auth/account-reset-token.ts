/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer } from '../../transformers';
import {
  VerificationMethod,
  verificationMethodToNumber,
} from './session-token';

export class AccountResetToken extends BaseAuthModel {
  public static tableName = 'accountResetTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = ['tokenData', 'uid'];

  // table fields
  tokenData!: string;
  uid!: string;
  createdAt!: number;
  verificationMethod!: number;

  // joined fields (from accountResetToken_# stored proc)
  verifierSetAt!: number;

  static async delete(id: string) {
    return AccountResetToken.callProcedure(
      Proc.DeleteAccountResetToken,
      uuidTransformer.to(id)
    );
  }

  static async findByTokenId(id: string) {
    const { rows } = await AccountResetToken.callProcedure(
      Proc.AccountResetToken,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    return AccountResetToken.fromDatabaseJson(rows[0]);
  }
}
