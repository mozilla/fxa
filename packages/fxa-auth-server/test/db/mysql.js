/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist');
const sinon = require('sinon');
const mocks = require('../lib/mocks');

const modulePath = '../../lib/db/mysql';

var instances = {};
var dependencies = mocks.require([
  { path: 'buf' },
  { path: 'mysql' },
  { path: 'mysql-patcher', ctor: function() { return instances.patcher; } },
  { path: '../../config' },
  { path: '../../encrypt' },
  { path: '../../logging', ctor: function() { return instances.logger; } },
  { path: '../../scope' },
  { path: '../../unique', ctor: function() { return instances.scope; } },
  { path: './patch' }
], modulePath, __dirname);

function nop() {
}

function callback(cb) {
  cb();
}

process.setMaxListeners(0);

describe('db/mysql:', function() {
  var sandbox, mysql;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub(dependencies['../../config'], 'get', function() {
      return 'mock config.get result';
    });
    instances.logger = {
      info: nop,
      debug: nop,
      warn: nop,
      error: nop,
      verbose: nop
    };
    Object.keys(instances.logger).forEach(function(methodName) {
      sandbox.spy(instances.logger, methodName);
    });

    mocks.register(dependencies, modulePath, __dirname);

    mysql = require(modulePath);
  });

  afterEach(function() {
    sandbox.restore();
    mocks.deregister();
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
        currentPatchLevel: dependencies['./patch'].level
      };
      sandbox.stub(instances.patcher, 'connect', callback);
      sandbox.stub(instances.patcher, 'patch', nop);
      sandbox.stub(instances.patcher, 'end', callback);
      sandbox.stub(process, 'exit', nop);
    });

    describe('readDbPatchLevel succeeds:', function() {
      beforeEach(function() {
        sandbox.stub(instances.patcher, 'readDbPatchLevel', function(callback) {
          callback();
        });
      });

      describe('db patch level is okay:', function() {
        var result;

        beforeEach(function() {
          return mysql.connect({}).then(function(r) {
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

        it('did not call process.exit', function() {
          assert.equal(process.exit.callCount, 0);
        });

        it('returned an object', function () {
          assert.equal(typeof result, 'object');
          assert.notEqual(result, null);
        });
      });

      describe('db patch level is bad:', function() {
        beforeEach(function() {
          instances.patcher.currentPatchLevel += 2;
          return mysql.connect({});
        });

        afterEach(function() {
          instances.patcher.currentPatchLevel -= 2;
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
          assert.equal(args[1].message, 'unexpected db patch level: ' + (dependencies['./patch'].level + 2));
        });

        it('called process.exit', function() {
          assert.equal(process.exit.callCount, 1);
          var args = process.exit.getCall(0).args;
          assert.equal(args.length, 1);
          assert.equal(args[0], 1);
        });
      });
    });

    describe('readDbPatchLevel fails:', function() {
      beforeEach(function() {
        sandbox.stub(instances.patcher, 'readDbPatchLevel', function(callback) {
          callback('foo');
        });
        return mysql.connect({});
      });

      it('called patcher.end', function() {
        assert.equal(instances.patcher.end.callCount, 1);
      });

      it('called logger.error', function() {
        assert.equal(instances.logger.error.callCount, 1);
        var args = instances.logger.error.getCall(0).args;
        assert.equal(args[0], 'checkDbPatchLevel');
        assert.equal(args[1], 'foo');
      });

      it('called process.exit', function() {
        assert.equal(process.exit.callCount, 1);
        var args = process.exit.getCall(0).args;
        assert.equal(args.length, 1);
        assert.equal(args[0], 1);
      });
    });
  });
});

