/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

export class RecoveryKey extends BaseModel {
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
  hint!: string | null;
}
