/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const sinon = require('sinon');

const MysqlStore = require('../lib/db/mysql');

describe('mysql db backend', function() {
  var store;
  var mockConnection;
  var mockResponses;
  var capturedQueries;

  beforeEach(function() {
    capturedQueries = [];
    mockResponses = [];
    mockConnection = {
      release: sinon.spy(),
      ping: sinon.spy(function(cb) {
        return cb();
      }),
      query: sinon.spy(function(q, cb) {
        capturedQueries.push(q);
        return cb.apply(undefined, mockResponses[capturedQueries.length - 1]);
      }),
    };
    store = new MysqlStore({});
    sinon.stub(store._pool, 'getConnection').callsFake(function(cb) {
      cb(null, mockConnection);
    });
  });

  afterEach(() => {
    return store.disconnect();
  });

  it('should force new connections into strict mode', function() {
    mockResponses.push([
      null,
      [{ mode: 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION' }],
    ]);
    mockResponses.push([null, []]);
    return store
      .ping()
      .then(function() {
        assert.equal(capturedQueries.length, 3);
        // The first query is checking the sql_mode.
        assert.equal(capturedQueries[0], 'SELECT @@sql_mode AS mode');
        // The second query is to set the sql_mode.
        assert.equal(
          capturedQueries[1],
          "SET SESSION sql_mode = 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION,STRICT_ALL_TABLES'"
        );
        // The third sets utf8mb4
        assert.equal(
          capturedQueries[2],
          'SET NAMES utf8mb4 COLLATE utf8mb4_bin;'
        );
      })
      .then(function() {
        // But re-using the connection a second time
        return store.ping();
      })
      .then(function() {
        // Should not re-issue the strict-mode queries.
        assert.equal(capturedQueries.length, 3);
      });
  });

  it('should not mess with connections that already have strict mode', function() {
    mockResponses.push([
      null,
      [{ mode: 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' }],
    ]);
    return store.ping().then(function() {
      assert.equal(capturedQueries.length, 1);
      // The only query is to check the sql_mode.
      assert.equal(capturedQueries[0], 'SELECT @@sql_mode AS mode');
    });
  });

  it('should propagate any errors that happen when setting the mode', function() {
    mockResponses.push([null, [{ mode: 'SOME_NONSENSE_DEFAULT' }]]);
    mockResponses.push([new Error('failed to set mode')]);
    return store
      .ping()
      .then(function() {
        assert.fail('the ping attempt should have failed');
      })
      .catch(function(err) {
        assert.equal(capturedQueries.length, 2);
        assert.equal(err.message, 'failed to set mode');
      });
  });
});
