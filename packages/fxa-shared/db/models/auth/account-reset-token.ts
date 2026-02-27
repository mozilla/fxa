/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer } from '../../transformers';
import {
  VerificationMethod,
  verificationMethodToNumber,
} from './session-token';
import { Account } from './account';

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
  email!: string;
  verifierSetAt!: number;

  static async delete(id: string) {
    return AccountResetToken.callProcedure(
      Proc.DeleteAccountResetToken,
      uuidTransformer.to(id)
    );
  }

  static async findByTokenId(id: string) {
    const a = Account.tableName;
    const t = AccountResetToken.tableName;
    return (
      AccountResetToken.query()
        .join(a, `${a}.uid`, '=', `${t}.uid`)
        .where('tokenId', uuidTransformer.to(id))
        .select(
          `${t}.uid`,
          `${t}.tokenData`,
          `${t}.createdAt`,
          `${a}.verifierSetAt`,
          `${t}.verificationMethod`,
          `${a}.email`
        )
        .first() || null
    );
  }

  static async updateVerificationMethod(
    id: string,
    method: VerificationMethod | number
  ) {
    await AccountResetToken.query()
      .update({ verificationMethod: verificationMethodToNumber(method) })
      .where('tokenId', uuidTransformer.to(id));
  }
}
