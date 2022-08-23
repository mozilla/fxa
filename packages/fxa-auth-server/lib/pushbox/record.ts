/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Model } from 'objection';

export class Record extends Model {
  static tableName = 'pushboxv1';
  static idColumn = 'idx';

  idx!: number;
  user_id!: string;
  device_id!: string;
  data!: string;
  ttl!: number;
}

export default Record;
