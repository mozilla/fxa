/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var log = require('../lib/log')
var DB = require('../../lib/db/mysql')(log, require('../../fxa-auth-db-server').errors)
var config = require('../../config')
var test = require('tap').test
var P = require('../../lib/promise')
var crypto = require('crypto')
var proxyquire = require('proxyquire')
var sinon = require('sinon')

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

DB.connect(config)
  .then(function (db) {
    test(
      'queries, with no mocking',
      function (t) {
        var metrics = require('../../bin/metrics')
        var lastResults
        var uid
        var times = [
          Date.now()
        ]
        t.plan(36)

        t.equal(typeof metrics.run, 'function', 'run function was exported')
        t.equal(typeof metrics.countAccounts, 'string', 'countAccounts string was exported')
        t.equal(typeof metrics.countVerifiedAccounts, 'string', 'countVerifiedAccounts string was exported')
        t.equal(typeof metrics.countAccountsWithTwoOrMoreDevices, 'string', 'countAccountsWithTwoOrMoreDevices string was exported')
        t.equal(typeof metrics.countAccountsWithThreeOrMoreDevices, 'string', 'countAccountsWithThreeOrMoreDevices string was exported')
        t.equal(typeof metrics.countAccountsWithMobileDevice, 'string', 'countAccountsWithMobileDevice string was exported')

        return P.all([
          db.readOneFromFirstResult(metrics.countAccounts, times[0]),
          db.readOneFromFirstResult(metrics.countVerifiedAccounts, times[0]),
          db.readOneFromFirstResult(metrics.countAccountsWithTwoOrMoreDevices, times[0]),
          db.readOneFromFirstResult(metrics.countAccountsWithThreeOrMoreDevices, times[0]),
          db.readOneFromFirstResult(metrics.countAccountsWithMobileDevice, times[0])
        ])
        .then(function (results) {
          results.forEach(function (result, index) {
            t.ok(result.count >= 0, 'returned non-negative count [' + index + ']')
          })
          lastResults = results
          uid = crypto.randomBytes(16)
          times[1] = Date.now()
          return createAccount(uid, times[1], false)
        })
        .then(function () {
          return db.readMultiple([
            { sql: metrics.countAccounts, params: times[1] + 1 },
            { sql: metrics.countVerifiedAccounts, params: times[1] + 1 },
            { sql: metrics.countAccountsWithTwoOrMoreDevices, params: times[1] + 1 },
            { sql: metrics.countAccountsWithThreeOrMoreDevices, params: times[1] + 1 },
            { sql: metrics.countAccountsWithMobileDevice, params: times[1] + 1 }
          ])
        })
        .then(function (results) {
          t.ok(results[0][0].count === lastResults[0].count + 1, 'account count was incremented by one')
          t.ok(results[1][0].count === lastResults[1].count, 'verified account count was not incremented')
          t.ok(results[2][0].count === lastResults[2].count, '2+ device account count was not incremented')
          t.ok(results[3][0].count === lastResults[3].count, '3+ device account count was not incremented')
          t.ok(results[4][0].count === lastResults[4].count, 'mobile device account count was not incremented')
          lastResults = results
          return deleteAccount(uid)
        })
        .then(function () {
          times[2] = Date.now()
          return createAccount(uid, times[2], true)
        })
        .then(function () {
          return db.readMultiple([
            { sql: 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED' },
            { sql: 'START TRANSACTION' },
            { sql: metrics.countAccounts, params: times[2] + 1 },
            { sql: metrics.countVerifiedAccounts, params: times[2] + 1 },
            { sql: metrics.countAccountsWithTwoOrMoreDevices, params: times[2] + 1 },
            { sql: metrics.countAccountsWithThreeOrMoreDevices, params: times[2] + 1 },
            { sql: metrics.countAccountsWithMobileDevice, params: times[2] + 1 }
          ], { sql: 'COMMIT' })
        })
        .then(function (results) {
          t.ok(results[2][0].count === lastResults[0][0].count, 'account count was not incremented')
          t.ok(results[3][0].count === lastResults[1][0].count + 1, 'verified account count was incremented by one')
          t.ok(results[4][0].count === lastResults[2][0].count, '2+ device account count was not incremented')
          t.ok(results[5][0].count === lastResults[3][0].count, '3+ device account count was not incremented')
          t.ok(results[6][0].count === lastResults[4][0].count, 'mobile device account count was not incremented')
          lastResults = results
          return P.all([
            createSessionToken(uid),
            createSessionToken(uid)
          ])
        })
        .then(function () {
          return P.all([
            db.readOneFromFirstResult(metrics.countAccounts, times[2]),
            db.readOneFromFirstResult(metrics.countVerifiedAccounts, times[2]),
            db.readOneFromFirstResult(metrics.countAccountsWithTwoOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithThreeOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithMobileDevice, times[2] + 1)
          ])
        })
        .then(function (results) {
          t.ok(results[0].count === lastResults[2][0].count - 1, 'account count was decremented by one')
          t.ok(results[1].count === lastResults[3][0].count - 1, 'verified account count was decremented by one')
          t.ok(results[2].count === lastResults[4][0].count + 1, '2+ device account count was incremented by one')
          t.ok(results[3].count === lastResults[5][0].count, '3+ device account count was not incremented')
          t.ok(results[4].count === lastResults[6][0].count, 'mobile device account count was not incremented')
          lastResults = results
          return createSessionToken(uid)
        })
        .then(function () {
          return P.all([
            db.readOneFromFirstResult(metrics.countAccountsWithTwoOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithThreeOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithMobileDevice, times[2] + 1)
          ])
        })
        .then(function (results) {
          t.ok(results[0].count === lastResults[2].count, '2+ device account count was not incremented')
          t.ok(results[1].count === lastResults[3].count + 1, '3+ device account count was incremented by one')
          t.ok(results[2].count === lastResults[4].count, 'mobile device account count was not incremented')
          lastResults = results
          return P.all([
            createSessionToken(uid, 'mobile'),
            createSessionToken(uid, 'mobile')
          ])
        })
        .then(function () {
          return P.all([
            db.readOneFromFirstResult(metrics.countAccountsWithTwoOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithThreeOrMoreDevices, times[2] + 1),
            db.readOneFromFirstResult(metrics.countAccountsWithMobileDevice, times[2] + 1)
          ])
        })
        .then(function (results) {
          t.ok(results[0].count === lastResults[0].count, '2+ device account count was not incremented')
          t.ok(results[1].count === lastResults[1].count, '3+ device account count was not incremented')
          t.ok(results[2].count === lastResults[2].count + 1, 'mobile device account count was incremented by one')
          lastResults = results
        })
        .then(function () {
          return P.all([
            db.readOneFromFirstResult(metrics.countAccountsWithTwoOrMoreDevices, times[2]),
            db.readOneFromFirstResult(metrics.countAccountsWithThreeOrMoreDevices, times[2]),
            db.readOneFromFirstResult(metrics.countAccountsWithMobileDevice, times[2])
          ])
        })
        .then(function (results) {
          t.ok(results[0].count === lastResults[0].count - 1, '2+ device account count was decremented by one')
          t.ok(results[1].count === lastResults[1].count - 1, '3+ device account count was decremented by one')
          t.ok(results[2].count === lastResults[2].count - 1, 'mobile device account count was decremented by one')
          return deleteAccount(uid)
        })
        .then(function () {
          t.ok('account was deleted')
        })
      }
    )

    test(
      'run, with mocked queries',
      function (t) {
        var readMultiple = sinon.spy(function () {
          return P.resolve([
            null,
            null,
            [ { count: 1 } ],
            [ { count: 2 } ],
            [ { count: 3 } ],
            [ { count: 4 } ],
            [ { count: 5 } ]
          ])
        })
        var close = sinon.spy()
        var connect = sinon.spy(function () {
          return P.resolve({
            readMultiple: readMultiple,
            close: close
          })
        })
        var mocks = {
          os: {
            hostname: sinon.spy(function () {
              return 'fake hostname'
            })
          },
          fs: {
            appendFileSync: sinon.spy()
          },
          '../lib/logging': function () {
            return {
              error: sinon.spy()
            }
          },
          '../fxa-auth-db-server': {
            errors: 'fake errors'
          },
          '../lib/db/mysql': function () {
            return {
              connect: connect
            }
          }
        }

        var metrics = proxyquire('../../bin/metrics', mocks)
        return metrics.run({
          General: {
            db_dnsname: 'foo',
            db_username: 'bar',
            db_password: 'baz',
            db_name: 'qux'
          }
        }, new Date(1977, 5, 10, 10, 30))
        .then(function () {
          t.plan(83)

          t.equal(connect.callCount, 1, 'mysql.connect was called once')
          t.equal(connect.getCall(0).args.length, 1, 'mysql.connect was passed one argument')
          var options = connect.getCall(0).args[0]
          t.equal(Object.keys(options).length, 3, 'mysql.connect options had correct number of properties')
          t.equal(typeof options.master, 'object', 'mysql.connect master option was object')
          t.equal(Object.keys(options.master).length, 4, 'mysql.connect master option had correct number of properties')
          t.equal(options.master.host, 'foo', 'mysql.connect master.host option was correct')
          t.equal(options.master.user, 'bar', 'mysql.connect master.user option was correct')
          t.equal(options.master.password, 'baz', 'mysql.connect master.password option was correct')
          t.equal(options.master.database, 'qux', 'mysql.connect master.database option was correct')
          t.equal(typeof options.slave, 'object', 'mysql.connect slave option was object')
          t.equal(Object.keys(options.slave).length, 4, 'mysql.connect slave option had correct number of properties')
          t.equal(options.slave.host, 'foo', 'mysql.connect slave.host option was correct')
          t.equal(options.slave.user, 'bar', 'mysql.connect slave.user option was correct')
          t.equal(options.slave.password, 'baz', 'mysql.connect slave.password option was correct')
          t.equal(options.slave.database, 'qux', 'mysql.connect slave.database option was correct')
          t.equal(options.patchKey, 'schema-patch-level', 'mysql.connect patchKey option was correct')

          t.equal(readMultiple.callCount, 1, 'readMultiple was called once')
          t.equal(readMultiple.getCall(0).args.length, 2, 'readMultiple was passed two arguments')
          var queries = readMultiple.getCall(0).args[0]
          t.ok(Array.isArray(queries), 'readMultiple was passed queries array')
          t.equal(queries.length, 7, 'query array was correct length')

          queries.forEach(function (query, index) {
            t.equal(typeof query, 'object', 'query item was object [' + index + ']')
            if (index <= 1) {
              t.equal(Object.keys(query).length, 1, 'query item had correct number of properties [' + index + ']')
            } else {
              t.equal(Object.keys(query).length, 2, 'query item had correct number of properties [' + index + ']')
              t.ok(Array.isArray(query.params), 'query item had params array [' + index + ']')
              t.equal(query.params.length, 1, 'query item had correct number of params [' + index + ']')
              t.equal(query.params[0], Date.UTC(1977, 5, 10, 0, 0, 0, 0), 'query item had correct param [' + index + ']')
            }
          })
          t.equal(queries[0].sql, 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED', 'first query had correct SQL')
          t.equal(queries[1].sql, 'START TRANSACTION', 'second query had correct SQL')
          t.equal(queries[2].sql, metrics.countAccounts, 'third query had correct SQL')
          t.equal(queries[3].sql, metrics.countVerifiedAccounts, 'fourth query had correct SQL')
          t.equal(queries[4].sql, metrics.countAccountsWithTwoOrMoreDevices, 'fifth query had correct SQL')
          t.equal(queries[5].sql, metrics.countAccountsWithThreeOrMoreDevices, 'sixth query had correct SQL')
          t.equal(queries[6].sql, metrics.countAccountsWithMobileDevice, 'seventh query had correct SQL')
          var finalQuery = readMultiple.getCall(0).args[1]
          t.equal(Object.keys(finalQuery).length, 1, 'final query had correct number of properties')
          t.equal(finalQuery.sql, 'COMMIT', 'final query had correct SQL')

          t.equal(mocks.fs.appendFileSync.callCount, 1, 'fs.appendFileSync was called once')
          var args = mocks.fs.appendFileSync.getCall(0).args
          t.equal(args.length, 2, 'fs.appendFileSync was passed two arguments')
          t.equal(args[0], '/media/ephemeral0/fxa-admin/basic_metrics.log', 'log file path was correct')
          t.equal(typeof args[1], 'string', 'log file data was string')
          var delimiterIndex = args[1].length - 1
          t.equal(args[1][delimiterIndex], '\n', 'log file data was correctly delimited')
          var data = JSON.parse(args[1].substr(0, delimiterIndex))
          t.equal(Object.keys(data).length, 10, 'log file data had correct number of properties')
          t.equal(data.hostname, 'fake hostname', 'log file hostname property was correct')
          t.equal(data.pid, process.pid, 'log file pid property was correct')
          t.equal(data.op, 'account_totals', 'log file op property was correct')
          t.equal(data.total_accounts, 1, 'log file total_accounts property was correct')
          t.equal(data.total_verified_accounts, 2, 'log file total_verified_accounts property was correct')
          t.equal(data.total_accounts_with_two_or_more_devices, 3, 'log file total_accounts_with_two_or_more_devices property was correct')
          t.equal(data.total_accounts_with_three_or_more_devices, 4, 'log file total_accounts_with_three_or_more_devices property was correct')
          t.equal(data.total_accounts_with_mobile_device, 5, 'log file total_accounts_with_mobile_device property was correct')
          t.equal(typeof data.time, 'string', 'log file time property was a string')
          var time = new Date(data.time)
          t.equal(time.getUTCFullYear(), 1977, 'log file time property had correct year')
          t.equal(time.getUTCMonth(), 5, 'log file time property had correct month')
          t.equal(time.getUTCDate(), 10, 'log file time property had correct date')
          t.equal(time.getUTCHours(), 0, 'log file time property had correct hour')
          t.equal(time.getUTCMinutes(), 0, 'log file time property had correct minute')
          t.equal(time.getUTCSeconds(), 0, 'log file time property had correct second')
          t.equal(time.getUTCMilliseconds(), 0, 'log file time property had correct millisecond')
          t.equal(data.v, 0, 'log file v property was correct')

          t.equal(close.callCount, 1, 'connection.close was called once')
          t.equal(close.getCall(0).args.length, 0, 'connection.close was passed no arguments')
        })
      }
    )

    test(
      'teardown',
      function (t) {
        return db.close()
      }
    )

    function createAccount (uid, time, emailVerified) {
      var email = ('' + Math.random()).substr(2) + '@foo.com'
      return db.createAccount(uid, {
        email: email,
        normalizedEmail: email.toLowerCase(),
        emailCode: zeroBuffer16,
        emailVerified: emailVerified,
        verifierVersion: 1,
        verifyHash: zeroBuffer32,
        authSalt: zeroBuffer32,
        kA: zeroBuffer32,
        wrapWrapKb: zeroBuffer32,
        verifierSetAt: time,
        createdAt: time,
        locale: 'en_US'
      })
    }

    function deleteAccount(uid) {
      return db.deleteAccount(uid)
    }

    function createSessionToken (uid, uaDeviceType) {
      return db.createSessionToken(hex(32), {
        data: hex(32),
        uid: uid,
        createdAt: Date.now(),
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: uaDeviceType,
        tokenVerificationId: hex(16)
      })
    }

    function hex (length) {
      return Buffer(crypto.randomBytes(length).toString('hex'), 'hex')
    }
  })

