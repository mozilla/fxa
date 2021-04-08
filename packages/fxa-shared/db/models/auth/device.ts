/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { aggregateNameValuePairs, uuidTransformer } from '../../transformers';
import { AuthBaseModel, Proc } from './auth-base';

export class Device extends AuthBaseModel {
  static tableName = 'devices';
  static idColumn = ['uid', 'id'];

  protected $uuidFields = ['id', 'uid', 'sessionTokenId', 'refreshTokenId'];
  protected $intBoolFields = ['callbackIsExpired'];

  // table fields
  id!: string;
  uid!: string;
  sessionTokenId!: string;
  name?: string;
  type?: string;
  createdAt?: number;
  callbackURL?: string;
  callbackPublicKey?: string;
  callbackAuthKey?: string;
  callbackIsExpired!: boolean;
  refreshTokenId?: string;

  // joined fields (from accountDevices_# stored proc)
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  uaFormFactor?: string;
  lastAccessTime?: string;

  // generated
  availableCommands!: {
    [key: string]: string;
  };

  static fromRows(rows: object[]): Device[] {
    return aggregateNameValuePairs(
      rows,
      'id',
      'commandName',
      'commandData',
      'availableCommands'
    ).map((row) => Device.fromDatabaseJson(row));
  }

  static async findByUid(uid: string) {
    const rows = await Device.callProcedure(
      Proc.AccountDevices,
      uuidTransformer.to(uid)
    );
    return Device.fromRows(rows);
  }

  static async findByPrimaryKey(uid: string, id: string) {
    const rows = await Device.callProcedure(
      Proc.Device,
      uuidTransformer.to(uid),
      uuidTransformer.to(id)
    );
    return Device.fromRows(rows).shift() || null;
  }

  static async findByUidAndTokenVerificationId(
    uid: string,
    tokenVerificationId: string
  ) {
    const rows = await Device.callProcedure(
      Proc.DeviceFromTokenVerificationId,
      uuidTransformer.to(uid),
      uuidTransformer.to(tokenVerificationId)
    );
    return Device.fromRows(rows).shift() || null;
  }
}
