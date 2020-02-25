/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Model } from 'objection';

import { intBoolTransformer, uuidTransformer } from '../transformers';

const binaryFields = ['uid', 'emailCode'];
const booleanFields = ['isVerified', 'isPrimary'];

export class Emails extends Model {
  public static tableName = 'emails';

  public normalizedEmail!: string;
  public email!: string;
  public uid!: string;
  public isVerified!: boolean;
  public isPrimary!: boolean;
  public emailCode!: string;
  public verifiedAt?: number;
  public createdAt!: number;

  public $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    for (const field of binaryFields) {
      if (json[field]) {
        json[field] = uuidTransformer.from(json[field]);
      }
    }
    for (const field of booleanFields) {
      if (json[field]) {
        json[field] = intBoolTransformer.from(json[field]);
      }
    }
    return json;
  }

  public $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json);
    for (const field of binaryFields) {
      if (json[field]) {
        json[field] = uuidTransformer.to(json[field]);
      }
    }
    for (const field of booleanFields) {
      if (json[field]) {
        json[field] = intBoolTransformer.to(json[field]);
      }
    }
    return json;
  }
}
