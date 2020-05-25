/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const createDBServer = require('../../fxa-auth-db-mysql');

function TestServer(config) {
  this.config = config;
  this.server = null;
}

TestServer.start = function (config, printLogs) {
  return createDBServer().then((db) => {
    db.listen(config.httpdb.url.split(':')[2]);
    db.on('error', () => {});
    const testServer = new TestServer(config);
    testServer.db = db;
    return testServer;
  });
};

TestServer.prototype.stop = function () {
  try {
    this.db.close();
  } catch (e) {}
};

module.exports = TestServer;
