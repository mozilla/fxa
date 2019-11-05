#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var fs = require('fs');

module.exports = {
  run: run,
  countAccounts: [
    'SELECT COUNT(*) AS count',
    'FROM accounts',
    'WHERE createdAt < ?;',
  ].join('\n'),
  countVerifiedAccounts: [
    'SELECT COUNT(*) AS count',
    'FROM accounts',
    'WHERE createdAt < ?',
    'AND emailVerified = true;',
  ].join('\n'),
  countAccountsWithTwoOrMoreDevices: [
    'SELECT COUNT(*) AS count',
    'FROM (',
    '    SELECT a.uid',
    '    FROM accounts AS a',
    '    INNER JOIN sessionTokens AS s',
    '    ON a.uid = s.uid',
    '    WHERE a.createdAt < ?',
    '    GROUP BY (a.uid)',
    '    HAVING COUNT(s.tokenId) > 1',
    ') AS sub;',
  ].join('\n'),
  countAccountsWithThreeOrMoreDevices: [
    'SELECT COUNT(*) AS count',
    'FROM (',
    '    SELECT a.uid',
    '    FROM accounts AS a',
    '    INNER JOIN sessionTokens AS s',
    '    ON a.uid = s.uid',
    '    WHERE a.createdAt < ?',
    '    GROUP BY (a.uid)',
    '    HAVING COUNT(s.tokenId) > 2',
    ') AS sub;',
  ].join('\n'),
  countAccountsWithMobileDevice: [
    'SELECT COUNT(DISTINCT a.uid) AS count',
    'FROM accounts AS a',
    'INNER JOIN sessionTokens AS s',
    'ON a.uid = s.uid',
    'WHERE a.createdAt < ?',
    "AND s.uaDeviceType = 'mobile';",
  ].join('\n'),
};

if (require.main === module) {
  module.exports.run(
    parseConfigFile(process.argv[2] || '/etc/gather_basic_metrics.conf')
  );
}

function run(config, now) {
  now = now || new Date();
  var lastMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0,
    0,
    0,
    0
  );
  var os = require('os');
  var log = require('../lib/logging')('bin.metrics');
  var mysql = require('../lib/db/mysql')(log, require('../db-server').errors);
  var self = this;
  var db;

  return mysql
    .connect({
      master: {
        host: config.General.db_dnsname,
        user: config.General.db_username,
        password: config.General.db_password,
        database: config.General.db_name,
      },
      slave: {
        host: config.General.db_dnsname,
        user: config.General.db_username,
        password: config.General.db_password,
        database: config.General.db_name,
      },
      patchKey: 'schema-patch-level',
    })
    .then(function(result) {
      db = result;
      return db.readMultiple(
        [
          { sql: 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED' },
          { sql: 'START TRANSACTION' },
          metricsQuery('countAccounts'),
          metricsQuery('countVerifiedAccounts'),
          metricsQuery('countAccountsWithTwoOrMoreDevices'),
          metricsQuery('countAccountsWithThreeOrMoreDevices'),
          metricsQuery('countAccountsWithMobileDevice'),
        ],
        { sql: 'COMMIT' }
      );
    })
    .then(function(results) {
      assertResults(results, 2, 6);
      fs.appendFileSync(
        '/media/ephemeral0/fxa-admin/basic_metrics.log',
        JSON.stringify({
          hostname: os.hostname(),
          pid: process.pid,
          op: 'account_totals',
          total_accounts: results[2][0].count,
          total_verified_accounts: results[3][0].count,
          total_accounts_with_two_or_more_devices: results[4][0].count,
          total_accounts_with_three_or_more_devices: results[5][0].count,
          total_accounts_with_mobile_device: results[6][0].count,
          time: new Date(lastMidnight).toISOString(),
          v: 0,
        }) + '\n'
      );
      db.close();
    })
    .catch(function(error) {
      log.error('metrics.run', error);
      db.close();
    });

  function metricsQuery(queryName) {
    return { sql: self[queryName], params: [lastMidnight] };
  }
}

function assertResults(results, firstIndex, lastIndex) {
  results
    .filter(function(result, index) {
      return index >= firstIndex && index <= lastIndex;
    })
    .forEach(assertResult);
}

function assertResult(result) {
  if (Array.isArray(result) && result.length === 1 && result[0].count >= 0) {
    return;
  }

  throw new Error(
    'unexpected metrics query result format, should be [ { count: n } ]'
  );
}

// Very rudimentary parser for the following config file format:
// [General]
// db_dnsname: foo
// db_username: bar
// db_password: baz
// db_name: qux
function parseConfigFile(path) {
  var currentSection;

  return fs
    .readFileSync(path, { encoding: 'utf8' })
    .split('\n')
    .map(trim)
    .filter(filterConfig)
    .reduce(reduceConfig, {});

  function reduceConfig(parsed, line) {
    var isSectionName = line.match(/^\[(.+)\]$/);

    if (isSectionName) {
      currentSection = isSectionName[1];

      if (! parsed[currentSection]) {
        parsed[currentSection] = {};
      }
    } else {
      var setting = line.split(':').map(trim);

      if (! currentSection || setting.length === 0 || setting.length > 2) {
        throw new Error('unexpected config file format');
      }

      parsed[currentSection][setting[0]] = setting[1];
    }

    return parsed;
  }
}

function trim(string) {
  return string.trim();
}

function filterConfig(line) {
  return line && line[0] !== '#' && line[0] !== ';';
}
