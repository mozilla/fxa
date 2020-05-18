/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthBaseModel } from './auth-base';

export class Emails extends AuthBaseModel {
  public static tableName = 'emails';

  protected $uuidFields = ['uid', 'emailCode'];
  protected $intBoolFields = ['isVerified', 'isPrimary'];

  public normalizedEmail!: string;
  public email!: string;
  public uid!: string;
  public isVerified!: boolean;
  public isPrimary!: boolean;
  public emailCode!: string;
  public verifiedAt?: number;
  public createdAt!: number;
}
