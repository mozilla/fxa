/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseModel } from './base';

export class Device extends BaseModel {
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
  pushCallback?: string;
  pushPublicKey?: string;
  pushAuthKey?: string;
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
}
