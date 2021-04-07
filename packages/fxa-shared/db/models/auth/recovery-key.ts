/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthBaseModel, Proc } from './auth-base';
import { uuidTransformer } from '../../transformers';

export class RecoveryKey extends AuthBaseModel {
  public static tableName = 'recoveryKeys';
  public static idColumn = 'uid';

  protected $uuidFields = ['uid', 'recoveryKeyIdHash'];
  protected $intBoolFields = ['enabled'];

  // table fields
  uid!: string;
  recoveryKeyIdHash!: string;
  recoveryData!: string;
  createdAt!: number;
  verifiedAt!: number;
  enabled!: boolean;

  static async findByUid(uid: string) {
    const rows = await RecoveryKey.callProcedure(
      Proc.RecoveryKey,
      uuidTransformer.to(uid)
    );
    if (!rows.length) {
      return null;
    }
    return RecoveryKey.fromDatabaseJson(rows[0]);
  }

  static async exists(uid: string) {
    const count = await RecoveryKey.query()
      .select('uid')
      .where('uid', uuidTransformer.to(uid))
      .andWhereRaw('enabled = 1')
      .resultSize();
    return count === 1;
  }
}
