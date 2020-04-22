/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Model } from 'objection';

import { intBoolTransformer, uuidTransformer } from '../transformers';

export class Account extends Model {
  public static tableName = 'accounts';
  public static idColumn = 'uid';

  public uid!: string;
  public createdAt!: number;

  public $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    if (json.uid) {
      json.uid = uuidTransformer.from(json.uid);
    }
    if (json.emailVerified) {
      json.emailVerified = intBoolTransformer.from(json.emailVerified);
    }
    return json;
  }

  public $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json);

    if (json.uid) {
      json.uid = uuidTransformer.to(json.uid);
    }
    if (json.emailVerified) {
      json.emailVerified = intBoolTransformer.to(json.emailVerified);
    }
    return json;
  }
}
