/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setupDatabase } from 'fxa-shared/db';
import { MySQLConfig } from 'fxa-shared/db/config';
import { ILogger } from 'fxa-shared/log';
import { StatsD } from 'hot-shots';

import Record from './record';

export class PushboxDB {
  constructor(options: { config: MySQLConfig; log: ILogger; statsd: StatsD }) {
    const knex = setupDatabase(options.config, options.log, options.statsd);
    Record.knex(knex);
  }

  async store(x: { uid: string; deviceId: string; data: string; ttl: number }) {
    const res = await Record.query().insertAndFetch({
      user_id: x.uid,
      device_id: x.deviceId,
      data: x.data,
      ttl: x.ttl,
    });
    return res;
  }
}

export default PushboxDB;
