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

  async retrieve(x: {
    uid: string;
    deviceId: string;
    limit: number;
    index?: number | null;
  }) {
    const lastest = await Record.query()
      .select('idx')
      .findOne({ user_id: x.uid, device_id: x.deviceId })
      .orderBy('idx', 'desc');
    const maxIndex = lastest?.idx || 0;
    const query = Record.query()
      .where({
        user_id: x.uid,
        device_id: x.deviceId,
      })
      .where('ttl', '>=', Math.floor(Date.now() / 1000))
      .limit(x.limit)
      .orderBy('idx');
    if (x.index) {
      query.where('idx', '>=', x.index);
    }

    const messages = await query.execute();
    // because there was an ORDER BY idx in the query
    const lastIndex = messages.at(-1)?.idx || 0;
    const last = lastIndex === maxIndex || maxIndex === 0 || !messages.length;

    return {
      last,
      index: lastIndex,
      messages,
    };
  }

  async deleteDevice(x: { uid: string; deviceId: string }) {
    await Record.query()
      .delete()
      .where({ user_id: x.uid, device_id: x.deviceId });
  }
}

export default PushboxDB;
