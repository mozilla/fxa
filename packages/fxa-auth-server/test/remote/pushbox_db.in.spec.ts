/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base64url from 'base64url';
import sinon from 'sinon';
import { StatsD } from 'hot-shots';

import PushboxDB from '../../lib/pushbox/db';

const sandbox = sinon.createSandbox();
const config = require('../../config').default.getProperties();
const statsd = {
  increment: sandbox.stub(),
  timing: sandbox.stub(),
} as unknown as StatsD;
const log = {
  info: sandbox.stub(),
  trace: sandbox.stub(),
  warn: sandbox.stub(),
  error: sandbox.stub(),
  debug: sandbox.stub(),
};

const pushboxDb = new PushboxDB({
  config: config.pushbox.database,
  log,
  statsd,
});

const data = base64url.encode(JSON.stringify({ wibble: 'quux' }));
const r = {
  uid: 'xyz',
  deviceId: 'ff9000',
  data,
  ttl: 999999,
};
let insertIdx: number;

describe('#integration - pushbox db', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('store', () => {
    it('returns the inserted record', async () => {
      const record = await pushboxDb.store(r);
      expect(record.user_id).toBe(r.uid);
      expect(record.device_id).toBe(r.deviceId);
      expect(record.data.toString()).toBe(data);
      expect(record.ttl).toBe(999999);

      insertIdx = record.idx;
    });
  });

  describe('retrieve', () => {
    it('found no record', async () => {
      const results = await pushboxDb.retrieve({
        uid: 'nope',
        deviceId: 'pdp-11',
        limit: 10,
      });
      expect(results).toEqual({ last: true, index: 0, messages: [] });
    });

    it('fetches up to max index', async () => {
      sandbox.stub(Date, 'now').returns(111111000);
      const currentClientSideIdx = insertIdx;
      const insertUpTo = insertIdx + 3;
      while (insertIdx < insertUpTo) {
        const record = await pushboxDb.store(r);
        insertIdx = record.idx;
      }
      const result = await pushboxDb.retrieve({
        uid: r.uid,
        deviceId: r.deviceId,
        limit: 10,
        index: currentClientSideIdx,
      });

      expect(result.last).toBe(true);
      expect(result.index).toBe(insertIdx);
      result.messages.forEach((x: any) => {
        expect(x.user_id).toBe(r.uid);
        expect(x.device_id).toBe(r.deviceId);
        expect(x.data.toString()).toBe(data);
        expect(x.ttl).toBe(999999);
      });
    });

    it('fetches up to less than max', async () => {
      sandbox.stub(Date, 'now').returns(111111000);
      const insertUpTo = insertIdx + 3;
      while (insertIdx < insertUpTo) {
        const record = await pushboxDb.store(r);
        insertIdx = record.idx;
      }
      const result = await pushboxDb.retrieve({
        uid: r.uid,
        deviceId: r.deviceId,
        limit: 2,
        index: insertIdx - 3,
      });

      expect(result.last).toBe(false);
      expect(result.index).toBe(insertIdx - 2);
    });
  });

  describe('deleteDevice', () => {
    it('deletes without error', async () => {
      await pushboxDb.deleteDevice({ uid: r.uid, deviceId: r.deviceId });
    });
  });

  describe('deleteAccount', () => {
    it('deletes without error', async () => {
      await pushboxDb.deleteAccount(r.uid);
    });
  });
});
