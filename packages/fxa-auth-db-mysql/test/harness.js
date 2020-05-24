/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const dbServer = require('../db-server');
const backendTests = require('../db-server/test/backend');
const config = require('../config');
const log = require('./lib/log');
const P = require('bluebird');

const DBS = {
  mysql: require('../lib/db/mysql'),
};

exports.dbTests = function dbTests(backend) {
  const DB = DBS[backend](log, dbServer.errors);

  backendTests.dbTests(config, DB);
};

exports.remote = function remote(backend) {
  const DB = DBS[backend](log, dbServer.errors);

  backendTests.remote(config, () => {
    return DB.connect(config).then(function (newDb) {
      const db = newDb;
      const server = dbServer.createServer(db);
      const d = P.defer();
      const close = server.close;
      server.close = () => {
        close.call(server);
        return db.close();
      };
      server.listen(config.port, config.hostname, function () {
        d.resolve(server);
      });
      return d.promise;
    });
  });
};
