/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Model } from 'objection';

import { intBoolTransformer, uuidTransformer } from '../transformers';

const binaryFields = ['uid'];
const booleanFields = ['enabled'];

export class RecoveryKey extends Model {
  public static tableName = 'recoveryKey';

  public uid!: string;
  public recoveryData!: string;
  public recoveryKeyIdHash!: string;
  public createdAt!: number;
  public verifiedAt!: number;
  public enabled!: boolean;

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
