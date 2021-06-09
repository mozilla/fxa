/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { AuthBaseModel, Proc } from './auth-base';
import { uuidTransformer } from '../../transformers';
import { convertError } from '../../mysql';

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

  static async create({
    uid,
    recoveryKeyId,
    recoveryData,
    enabled,
  }: Pick<RecoveryKey, 'uid' | 'recoveryData' | 'enabled'> & {
    recoveryKeyId: string;
  }) {
    try {
      await RecoveryKey.callProcedure(
        Proc.CreateRecoveryKey,
        uuidTransformer.to(uid),
        crypto
          .createHash('sha256')
          .update(Buffer.from(recoveryKeyId, 'hex'))
          .digest(),
        recoveryData,
        Date.now(),
        !!enabled
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  static async delete(uid: string) {
    return RecoveryKey.callProcedure(
      Proc.DeleteRecoveryKey,
      uuidTransformer.to(uid)
    );
  }

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
