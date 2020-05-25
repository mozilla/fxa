/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const dbServer = require('../../db-server');
const P = require('../../lib/promise');
const config = require('../../config');

config.logLevel = 'info';
config.statInterval = 100;

const log = Object.assign({}, require('../lib/log'));

// monkeypatch log.info to hook into db/mysql.js:statInterval
const dfd = P.defer();
log.info = function (msg, stats) {
  if (msg !== 'stats') {
    return;
  }
  dfd.resolve(stats);
};

const DB = require('../../lib/db/mysql')(log, dbServer.errors);

describe('DB statInterval', () => {
  let db;
  before(() => {
    return DB.connect(config).then((db_) => {
      db = db_;
    });
  });

  it('should log stats periodically', () => {
    return dfd.promise.then((stats) => {
      assert.isObject(stats);
      assert.equal(stats.stat, 'mysql');
      assert.equal(stats.errors, 0);
      assert.equal(stats.connections, 1);
    });
  });

  after(() => db.close());
});
