/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const mocks = require('../../lib/mocks');

const modulePath = '../../../lib/oauth/db/mysql';

var instances = {};
var dependencies = mocks.require(
  [
    { path: 'buf' },
    { path: 'mysql' },
    {
      path: 'mysql-patcher',
      ctor: function() {
        return instances.patcher;
      },
    },
    { path: '../../../../config' },
    { path: '../../encrypt' },
    { path: '../../unique' },
    { path: './patch' },
  ],
  modulePath,
  __dirname
);

function nop() {}

function callback(cb) {
  cb();
}

process.setMaxListeners(0);

describe('db/mysql:', function() {
  var sandbox, mysql;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    sandbox
      .stub(dependencies['../../../../config'], 'get')
      .callsFake(function() {
        return 'mock config.get result';
      });
    instances.logger = {
      info: nop,
      debug: nop,
      warn: nop,
      error: nop,
      verbose: nop,
    };
    Object.keys(instances.logger).forEach(function(methodName) {
      sandbox.spy(instances.logger, methodName);
    });

    mysql = proxyquire(modulePath, dependencies);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('exports a connect function', function() {
    assert.equal(typeof mysql.connect, 'function');
  });

  describe('connect:', function() {
    beforeEach(function() {
      instances.patcher = {
        connect: nop,
        patch: nop,
        readDbPatchLevel: nop,
        end: nop,
        currentPatchLevel: dependencies['./patch'].level,
      };
      sandbox.stub(instances.patcher, 'connect').callsFake(callback);
      sandbox.stub(instances.patcher, 'patch').callsFake(nop);
      sandbox.stub(instances.patcher, 'end').callsFake(callback);
      sandbox.stub(process, 'exit').callsFake(nop);
    });

    describe('readDbPatchLevel succeeds:', function() {
      beforeEach(function() {
        sandbox
          .stub(instances.patcher, 'readDbPatchLevel')
          .callsFake(function(callback) {
            callback();
          });
      });

      describe('db patch level is okay:', function() {
        var result;

        beforeEach(function() {
          return mysql.connect({ logger: instances.logger }).then(function(r) {
            result = r;
          });
        });

        it('called patcher.connect', function() {
          assert.equal(instances.patcher.connect.callCount, 1);
          var args = instances.patcher.connect.getCall(0).args;
          assert.equal(args.length, 1);
          assert.equal(typeof args[0], 'function');
          assert.equal(args[0].length, 2);
        });

        it('did not call patcher.patch', function() {
          assert.equal(instances.patcher.patch.callCount, 0);
        });

        it('called patcher.readDbPatchLevel', function() {
          assert.equal(instances.patcher.readDbPatchLevel.callCount, 1);
          var args = instances.patcher.readDbPatchLevel.getCall(0).args;
          assert.equal(args.length, 1);
          assert.equal(typeof args[0], 'function');
          assert.equal(args[0].length, 1);
        });

        it('called patcher.end', function() {
          assert.equal(instances.patcher.end.callCount, 1);
          var args = instances.patcher.end.getCall(0).args;
          assert.equal(args.length, 1);
          assert.equal(typeof args[0], 'function');
          assert.equal(args[0].length, 2);
        });

        it('did not call logger.error', function() {
          assert.equal(instances.logger.error.callCount, 0);
        });

        it('returned an object', function() {
          assert.equal(typeof result, 'object');
          assert.notEqual(result, null);
        });
      });

      describe('db patch level is bad:', function() {
        var result;

        beforeEach(function() {
          instances.patcher.currentPatchLevel -= 2;
          return mysql
            .connect({ logger: instances.logger })
            .catch(function(err) {
              result = err;
            });
        });

        afterEach(function() {
          instances.patcher.currentPatchLevel += 2;
        });

        it('called patcher.end', function() {
          assert.equal(instances.patcher.end.callCount, 1);
        });

        it('called logger.error', function() {
          assert.equal(instances.logger.error.callCount, 1);
          var args = instances.logger.error.getCall(0).args;
          assert.equal(args.length, 2);
          assert.equal(args[0], 'checkDbPatchLevel');
          assert(args[1] instanceof Error);
          assert.equal(
            args[1].message,
            'unexpected db patch level: ' + (dependencies['./patch'].level - 2)
          );
        });

        it('returned an error', function() {
          assert.ok(result instanceof Error);
        });
      });
    });

    describe('readDbPatchLevel fails:', function() {
      var result;

      beforeEach(function() {
        sandbox
          .stub(instances.patcher, 'readDbPatchLevel')
          .callsFake(function(callback) {
            callback(new Error('foo'));
          });
        return mysql.connect({ logger: instances.logger }).catch(function(err) {
          result = err;
        });
      });

      it('called patcher.end', function() {
        assert.equal(instances.patcher.end.callCount, 1);
      });

      it('called logger.error', function() {
        assert.equal(instances.logger.error.callCount, 1);
        var args = instances.logger.error.getCall(0).args;
        assert.equal(args[0], 'checkDbPatchLevel');
        assert.ok(args[1] instanceof Error);
        assert.equal(args[1].message, 'foo');
      });

      it('returned an error', function() {
        assert.ok(result instanceof Error);
      });
    });
  });

  describe('mysql connection mode', function() {
    var MysqlStore = proxyquire(modulePath, dependencies);
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

    it('should force new connections into strict mode', function() {
      mockResponses.push([null, []]);
      mockResponses.push([null, []]);
      mockResponses.push([
        null,
        [{ mode: 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION' }],
      ]);
      mockResponses.push([null, []]);
      return store
        .ping()
        .then(function() {
          assert.equal(capturedQueries.length, 4);
          // The first query sets the timezone.
          assert.equal(capturedQueries[0], "SET time_zone = '+00:00'");
          // The second sets utf8mb4
          assert.equal(
            capturedQueries[1],
            'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;'
          );
          // The third is checking the sql_mode.
          assert.equal(capturedQueries[2], 'SELECT @@sql_mode AS mode');
          // The fourth query is to set the sql_mode.
          assert.equal(
            capturedQueries[3],
            "SET SESSION sql_mode = 'DUMMY_VALUE,NO_ENGINE_SUBSTITUTION,STRICT_ALL_TABLES'"
          );
        })
        .then(function() {
          // But re-using the connection a second time
          return store.ping();
        })
        .then(function() {
          // Should not re-issue the strict-mode queries.
          assert.equal(capturedQueries.length, 4);
        });
    });

    it('should not mess with connections that already have strict mode', function() {
      mockResponses.push([null, []]);
      mockResponses.push([null, []]);
      mockResponses.push([
        null,
        [{ mode: 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION' }],
      ]);
      return store.ping().then(function() {
        assert.equal(capturedQueries.length, 3);
        assert.equal(capturedQueries[0], "SET time_zone = '+00:00'");
        assert.equal(
          capturedQueries[1],
          'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;'
        );
        assert.equal(capturedQueries[2], 'SELECT @@sql_mode AS mode');
      });
    });

    it('should propagate any errors that happen when setting the mode', function() {
      mockResponses.push([null, []]);
      mockResponses.push([null, []]);
      mockResponses.push([null, [{ mode: 'SOME_NONSENSE_DEFAULT' }]]);
      mockResponses.push([new Error('failed to set mode')]);
      return store
        .ping()
        .then(function() {
          assert.fail('the ping attempt should have failed');
        })
        .catch(function(err) {
          assert.equal(capturedQueries.length, 4);
          assert.equal(err.message, 'failed to set mode');
        });
    });
  });
});
