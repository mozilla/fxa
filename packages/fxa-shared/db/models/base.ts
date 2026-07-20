/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { Model } from 'objection';

import { intBoolTransformer, uuidTransformer } from '../transformers';

/**
 * Base Model for helpers that should be present on all models.
 */
export abstract class BaseModel extends Model {
  // Shared StatsD client for stored-procedure timing (BaseAuthModel). Set once
  // by setupDatabase when a client is provided and query timing is enabled;
  // left undefined otherwise so emits are no-ops. Direct-query timing is
  // handled centrally by the knex query-lifecycle listener in setupDatabase,
  // not here, so it also covers raw knex.raw() calls that bypass objection.
  static metrics?: StatsD;

  protected $uuidFields: string[] = [];
  protected $intBoolFields: string[] = [];

  public $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    for (const field of this.$uuidFields) {
      if (json[field]) {
        json[field] = uuidTransformer.from(json[field]);
      }
    }
    for (const field of this.$intBoolFields) {
      if (json[field]) {
        json[field] = intBoolTransformer.from(json[field]);
      }
    }
    return json;
  }

  public $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json);
    for (const field of this.$uuidFields) {
      if (json[field]) {
        json[field] = uuidTransformer.to(json[field]);
      }
    }
    for (const field of this.$intBoolFields) {
      if (json[field]) {
        json[field] = intBoolTransformer.to(json[field]);
      }
    }
    return json;
  }
}
