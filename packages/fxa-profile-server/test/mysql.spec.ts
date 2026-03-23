/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import MysqlStore from '../lib/db/mysql';

describe('mysql db backend', () => {
  let store: any;
  let mockConnection: any;
  let mockResponses: any[];
  let capturedQueries: string[];

  beforeEach(() => {
    capturedQueries = [];
    mockResponses = [];
    mockConnection = {
      release: sinon.spy(),
      ping: sinon.spy(function (cb: Function) {
        return cb();
      }),
      query: sinon.spy(function (q: string, cb: Function) {
        capturedQueries.push(q);
        return cb.apply(undefined, mockResponses[capturedQueries.length - 1]);
      }),
    };
    store = new MysqlStore({});
    sinon.stub(store._pool, 'getConnection').callsFake(function (cb: Function) {
      cb(null, mockConnection);
    });
  });

  afterEach(() => {
    return store.disconnect();
  });

  it('should force new connections into strict mode', async () => {
    mockResponses.push([null, []]);
    mockResponses.push([null, []]);
    mockResponses.push([
      null,
      [{ mode: 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION' }],
    ]);
    mockResponses.push([null, []]);

    await store.ping();
    expect(capturedQueries).toHaveLength(4);
    // The first query sets the timezone.
    expect(capturedQueries[0]).toBe("SET time_zone = '+00:00'");
    // The second sets utf8mb4
    expect(capturedQueries[1]).toBe(
      'SET NAMES utf8mb4 COLLATE utf8mb4_bin;'
    );
    // The third is checking the sql_mode.
    expect(capturedQueries[2]).toBe('SELECT @@sql_mode AS mode');
    // The fourth query is to set the sql_mode.
    expect(capturedQueries[3]).toBe(
      "SET SESSION sql_mode = 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION,STRICT_ALL_TABLES'"
    );

    // But re-using the connection a second time
    await store.ping();
    // Should not re-issue the strict-mode queries.
    expect(capturedQueries).toHaveLength(4);
  });

  it('should not mess with connections that already have strict mode', async () => {
    mockResponses.push([null, []]);
    mockResponses.push([null, []]);
    mockResponses.push([
      null,
      [{ mode: 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' }],
    ]);

    await store.ping();
    expect(capturedQueries).toHaveLength(3);
    // The only queries are to check connection parameters.
    expect(capturedQueries[0]).toBe("SET time_zone = '+00:00'");
    // The second sets utf8mb4
    expect(capturedQueries[1]).toBe(
      'SET NAMES utf8mb4 COLLATE utf8mb4_bin;'
    );
    // The third is checking the sql_mode.
    expect(capturedQueries[2]).toBe('SELECT @@sql_mode AS mode');
  });

  it('should propagate any errors that happen when setting the mode', async () => {
    mockResponses.push([null, []]);
    mockResponses.push([null, []]);
    mockResponses.push([null, [{ mode: 'SOME_NONSENSE_DEFAULT' }]]);
    mockResponses.push([new Error('failed to set mode')]);

    await expect(store.ping()).rejects.toThrow('failed to set mode');
    expect(capturedQueries).toHaveLength(4);
  });
});
