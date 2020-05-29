/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const log = require('../lib/log');
const DB = require('../../lib/db/mysql')(
  log,
  require('../../db-server').errors
);
const config = require('../../config');
const P = require('../../lib/promise');
const crypto = require('crypto');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { normalizeEmail } = require('fxa-shared').email.helpers;

const zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex');
const zeroBuffer32 = Buffer.from(
  '0000000000000000000000000000000000000000000000000000000000000000',
  'hex'
);

describe('DB metrics', () => {
  let db;
  before(() => {
    return DB.connect(config).then((d) => {
      db = d;
    });
  });

  it('queries, with no mocking', () => {
    const metrics = require('../../bin/metrics');
    var lastResults;
    var uid;
    var times = [Date.now()];

    assert.isFunction(metrics.run);
    assert.isString(metrics.countAccounts);
    assert.isString(metrics.countVerifiedAccounts);
    assert.isString(metrics.countAccountsWithTwoOrMoreDevices);
    assert.isString(metrics.countAccountsWithThreeOrMoreDevices);
    assert.isString(metrics.countAccountsWithMobileDevice);

    return P.all([
      db.readAllResults(metrics.countAccounts, times[0]),
      db.readAllResults(metrics.countVerifiedAccounts, times[0]),
      db.readAllResults(metrics.countAccountsWithTwoOrMoreDevices, times[0]),
      db.readAllResults(metrics.countAccountsWithThreeOrMoreDevices, times[0]),
      db.readAllResults(metrics.countAccountsWithMobileDevice, times[0]),
    ])
      .then(function (results) {
        results.forEach(function (result, index) {
          assert.isAtLeast(result.count, 0);
        });
        lastResults = results;
        uid = crypto.randomBytes(16);
        times[1] = Date.now();
        return createAccount(uid, times[1], false);
      })
      .then(function () {
        return db.readMultiple([
          { sql: metrics.countAccounts, params: times[1] + 1 },
          { sql: metrics.countVerifiedAccounts, params: times[1] + 1 },
          {
            sql: metrics.countAccountsWithTwoOrMoreDevices,
            params: times[1] + 1,
          },
          {
            sql: metrics.countAccountsWithThreeOrMoreDevices,
            params: times[1] + 1,
          },
          { sql: metrics.countAccountsWithMobileDevice, params: times[1] + 1 },
        ]);
      })
      .then(function (results) {
        assert(
          results[0][0].count === lastResults[0].count + 1,
          'account count was incremented by one'
        );
        assert(
          results[1][0].count === lastResults[1].count,
          'verified account count was not incremented'
        );
        assert(
          results[2][0].count === lastResults[2].count,
          '2+ device account count was not incremented'
        );
        assert(
          results[3][0].count === lastResults[3].count,
          '3+ device account count was not incremented'
        );
        assert(
          results[4][0].count === lastResults[4].count,
          'mobile device account count was not incremented'
        );
        lastResults = results;
        return deleteAccount(uid);
      })
      .then(function () {
        times[2] = Date.now();
        return createAccount(uid, times[2], true);
      })
      .then(function () {
        return db.readMultiple(
          [
            { sql: 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED' },
            { sql: 'START TRANSACTION' },
            { sql: metrics.countAccounts, params: times[2] + 1 },
            { sql: metrics.countVerifiedAccounts, params: times[2] + 1 },
            {
              sql: metrics.countAccountsWithTwoOrMoreDevices,
              params: times[2] + 1,
            },
            {
              sql: metrics.countAccountsWithThreeOrMoreDevices,
              params: times[2] + 1,
            },
            {
              sql: metrics.countAccountsWithMobileDevice,
              params: times[2] + 1,
            },
          ],
          { sql: 'COMMIT' }
        );
      })
      .then(function (results) {
        assert(
          results[2][0].count === lastResults[0][0].count,
          'account count was not incremented'
        );
        assert(
          results[3][0].count === lastResults[1][0].count + 1,
          'verified account count was incremented by one'
        );
        assert(
          results[4][0].count === lastResults[2][0].count,
          '2+ device account count was not incremented'
        );
        assert(
          results[5][0].count === lastResults[3][0].count,
          '3+ device account count was not incremented'
        );
        assert(
          results[6][0].count === lastResults[4][0].count,
          'mobile device account count was not incremented'
        );
        lastResults = results;
        return P.all([createSessionToken(uid), createSessionToken(uid)]);
      })
      .then(function () {
        return P.all([
          db.readAllResults(metrics.countAccounts, times[2]),
          db.readAllResults(metrics.countVerifiedAccounts, times[2]),
          db.readAllResults(
            metrics.countAccountsWithTwoOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithThreeOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithMobileDevice,
            times[2] + 1
          ),
        ]);
      })
      .then(function (results) {
        assert(
          results[0].count === lastResults[2][0].count - 1,
          'account count was decremented by one'
        );
        assert(
          results[1].count === lastResults[3][0].count - 1,
          'verified account count was decremented by one'
        );
        assert(
          results[2].count === lastResults[4][0].count + 1,
          '2+ device account count was incremented by one'
        );
        assert(
          results[3].count === lastResults[5][0].count,
          '3+ device account count was not incremented'
        );
        assert(
          results[4].count === lastResults[6][0].count,
          'mobile device account count was not incremented'
        );
        lastResults = results;
        return createSessionToken(uid);
      })
      .then(function () {
        return P.all([
          db.readAllResults(
            metrics.countAccountsWithTwoOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithThreeOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithMobileDevice,
            times[2] + 1
          ),
        ]);
      })
      .then(function (results) {
        assert(
          results[0].count === lastResults[2].count,
          '2+ device account count was not incremented'
        );
        assert(
          results[1].count === lastResults[3].count + 1,
          '3+ device account count was incremented by one'
        );
        assert(
          results[2].count === lastResults[4].count,
          'mobile device account count was not incremented'
        );
        lastResults = results;
        return P.all([
          createSessionToken(uid, 'mobile'),
          createSessionToken(uid, 'mobile'),
        ]);
      })
      .then(function () {
        return P.all([
          db.readAllResults(
            metrics.countAccountsWithTwoOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithThreeOrMoreDevices,
            times[2] + 1
          ),
          db.readAllResults(
            metrics.countAccountsWithMobileDevice,
            times[2] + 1
          ),
        ]);
      })
      .then(function (results) {
        assert(
          results[0].count === lastResults[0].count,
          '2+ device account count was not incremented'
        );
        assert(
          results[1].count === lastResults[1].count,
          '3+ device account count was not incremented'
        );
        assert(
          results[2].count === lastResults[2].count + 1,
          'mobile device account count was incremented by one'
        );
        lastResults = results;
      })
      .then(function () {
        return P.all([
          db.readAllResults(
            metrics.countAccountsWithTwoOrMoreDevices,
            times[2]
          ),
          db.readAllResults(
            metrics.countAccountsWithThreeOrMoreDevices,
            times[2]
          ),
          db.readAllResults(metrics.countAccountsWithMobileDevice, times[2]),
        ]);
      })
      .then(function (results) {
        assert(
          results[0].count === lastResults[0].count - 1,
          '2+ device account count was decremented by one'
        );
        assert(
          results[1].count === lastResults[1].count - 1,
          '3+ device account count was decremented by one'
        );
        assert(
          results[2].count === lastResults[2].count - 1,
          'mobile device account count was decremented by one'
        );
        return deleteAccount(uid);
      })
      .then(function () {
        assert('account was deleted');
      });
  });

  it('run, with mocked queries', () => {
    var readMultiple = sinon.spy(function () {
      return P.resolve([
        null,
        null,
        [{ count: 1 }],
        [{ count: 2 }],
        [{ count: 3 }],
        [{ count: 4 }],
        [{ count: 5 }],
      ]);
    });
    var close = sinon.spy();
    var connect = sinon.spy(function () {
      return P.resolve({
        readMultiple: readMultiple,
        close: close,
      });
    });
    var mocks = {
      os: {
        hostname: sinon.spy(function () {
          return 'fake hostname';
        }),
      },
      fs: {
        appendFileSync: sinon.spy(),
      },
      '../lib/logging': function () {
        return {
          error: sinon.spy(),
        };
      },
      '../db-server': {
        errors: 'fake errors',
      },
      '../lib/db/mysql': function () {
        return {
          connect: connect,
        };
      },
    };

    var metrics = proxyquire('../../bin/metrics', mocks);
    return metrics
      .run(
        {
          General: {
            db_dnsname: 'foo',
            db_username: 'bar',
            db_password: 'baz',
            db_name: 'fxa',
          },
        },
        new Date(1977, 5, 10, 10, 30)
      )
      .then(function () {
        assert.equal(connect.callCount, 1, 'mysql.connect was called once');
        assert.lengthOf(connect.getCall(0).args, 1);
        var options = connect.getCall(0).args[0];
        assert.lengthOf(Object.keys(options), 3);
        assert.isObject(options.master);
        assert.lengthOf(Object.keys(options.master), 4);
        assert.equal(
          options.master.host,
          'foo',
          'mysql.connect master.host option was correct'
        );
        assert.equal(
          options.master.user,
          'bar',
          'mysql.connect master.user option was correct'
        );
        assert.equal(
          options.master.password,
          'baz',
          'mysql.connect master.password option was correct'
        );
        assert.equal(
          options.master.database,
          'fxa',
          'mysql.connect master.database option was correct'
        );
        assert.isObject(options.slave);
        assert.lengthOf(Object.keys(options.slave), 4);
        assert.equal(
          options.slave.host,
          'foo',
          'mysql.connect slave.host option was correct'
        );
        assert.equal(
          options.slave.user,
          'bar',
          'mysql.connect slave.user option was correct'
        );
        assert.equal(
          options.slave.password,
          'baz',
          'mysql.connect slave.password option was correct'
        );
        assert.equal(
          options.slave.database,
          'fxa',
          'mysql.connect slave.database option was correct'
        );
        assert.equal(
          options.patchKey,
          'schema-patch-level',
          'mysql.connect patchKey option was correct'
        );

        assert.equal(readMultiple.callCount, 1, 'readMultiple was called once');
        assert.lengthOf(readMultiple.getCall(0).args, 2);
        var queries = readMultiple.getCall(0).args[0];
        assert.isArray(queries);
        assert.lengthOf(queries, 7);

        queries.forEach(function (query, index) {
          assert.isObject(query);
          if (index <= 1) {
            assert.lengthOf(Object.keys(query), 1);
          } else {
            assert.lengthOf(Object.keys(query), 2);
            assert.isArray(query.params);
            assert.lengthOf(query.params, 1);
            assert.equal(
              query.params[0],
              Date.UTC(1977, 5, 10, 0, 0, 0, 0),
              'query item had correct param [' + index + ']'
            );
          }
        });
        assert.equal(
          queries[0].sql,
          'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED',
          'first query had correct SQL'
        );
        assert.equal(
          queries[1].sql,
          'START TRANSACTION',
          'second query had correct SQL'
        );
        assert.equal(
          queries[2].sql,
          metrics.countAccounts,
          'third query had correct SQL'
        );
        assert.equal(
          queries[3].sql,
          metrics.countVerifiedAccounts,
          'fourth query had correct SQL'
        );
        assert.equal(
          queries[4].sql,
          metrics.countAccountsWithTwoOrMoreDevices,
          'fifth query had correct SQL'
        );
        assert.equal(
          queries[5].sql,
          metrics.countAccountsWithThreeOrMoreDevices,
          'sixth query had correct SQL'
        );
        assert.equal(
          queries[6].sql,
          metrics.countAccountsWithMobileDevice,
          'seventh query had correct SQL'
        );
        var finalQuery = readMultiple.getCall(0).args[1];
        assert.lengthOf(Object.keys(finalQuery), 1);
        assert.equal(finalQuery.sql, 'COMMIT', 'final query had correct SQL');

        assert.equal(
          mocks.fs.appendFileSync.callCount,
          1,
          'fs.appendFileSync was called once'
        );
        var args = mocks.fs.appendFileSync.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.equal(
          args[0],
          '/media/ephemeral0/fxa-admin/basic_metrics.log',
          'log file path was correct'
        );
        assert.isString(args[1]);
        var delimiterIndex = args[1].length - 1;
        assert.equal(
          args[1][delimiterIndex],
          '\n',
          'log file data was correctly delimited'
        );
        var data = JSON.parse(args[1].substr(0, delimiterIndex));
        assert.lengthOf(Object.keys(data), 10);
        assert.equal(
          data.hostname,
          'fake hostname',
          'log file hostname property was correct'
        );
        assert.equal(
          data.pid,
          process.pid,
          'log file pid property was correct'
        );
        assert.equal(
          data.op,
          'account_totals',
          'log file op property was correct'
        );
        assert.equal(
          data.total_accounts,
          1,
          'log file total_accounts property was correct'
        );
        assert.equal(
          data.total_verified_accounts,
          2,
          'log file total_verified_accounts property was correct'
        );
        assert.equal(
          data.total_accounts_with_two_or_more_devices,
          3,
          'log file total_accounts_with_two_or_more_devices property was correct'
        );
        assert.equal(
          data.total_accounts_with_three_or_more_devices,
          4,
          'log file total_accounts_with_three_or_more_devices property was correct'
        );
        assert.equal(
          data.total_accounts_with_mobile_device,
          5,
          'log file total_accounts_with_mobile_device property was correct'
        );
        assert.isString(data.time);
        var time = new Date(data.time);
        assert.equal(
          time.getUTCFullYear(),
          1977,
          'log file time property had correct year'
        );
        assert.equal(
          time.getUTCMonth(),
          5,
          'log file time property had correct month'
        );
        assert.equal(
          time.getUTCDate(),
          10,
          'log file time property had correct date'
        );
        assert.equal(
          time.getUTCHours(),
          0,
          'log file time property had correct hour'
        );
        assert.equal(
          time.getUTCMinutes(),
          0,
          'log file time property had correct minute'
        );
        assert.equal(
          time.getUTCSeconds(),
          0,
          'log file time property had correct second'
        );
        assert.equal(
          time.getUTCMilliseconds(),
          0,
          'log file time property had correct millisecond'
        );
        assert.equal(data.v, 0, 'log file v property was correct');

        assert.equal(close.callCount, 1, 'connection.close was called once');
        assert.lengthOf(close.getCall(0).args, 0);
      });
  });

  after(() => db.close());

  function createAccount(uid, time, emailVerified) {
    var email = ('' + Math.random()).substr(2) + '@foo.com';
    return db.createAccount(uid, {
      email: email,
      normalizedEmail: normalizeEmail(email),
      emailCode: zeroBuffer16,
      emailVerified: emailVerified,
      verifierVersion: 1,
      verifyHash: zeroBuffer32,
      authSalt: zeroBuffer32,
      kA: zeroBuffer32,
      wrapWrapKb: zeroBuffer32,
      verifierSetAt: time,
      createdAt: time,
      locale: 'en_US',
    });
  }

  function deleteAccount(uid) {
    return db.deleteAccount(uid);
  }

  function createSessionToken(uid, uaDeviceType) {
    return db.createSessionToken(hex(32), {
      data: hex(32),
      uid: uid,
      createdAt: Date.now(),
      uaBrowser: 'foo',
      uaBrowserVersion: 'bar',
      uaOS: 'baz',
      uaOSVersion: 'qux',
      uaDeviceType: uaDeviceType,
      tokenVerificationId: hex(16),
    });
  }

  function hex(length) {
    return Buffer.from(crypto.randomBytes(length).toString('hex'), 'hex');
  }
});
