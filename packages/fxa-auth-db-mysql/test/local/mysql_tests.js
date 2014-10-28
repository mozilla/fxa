/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var dbServer = require('fxa-auth-db-server')
var log = { trace: console.log, error: console.log, stat: console.log, info: console.log }
var DB = require('../../db/mysql')(log, dbServer.errors)
var config = require('../../config')
var test = require('../ptaptest')
var P = require('../../promise')

DB.connect(config)
  .then(
    function (db) {

      test(
        'ping',
        function (t) {
          t.plan(1);
          return db.ping()
          .then(function(account) {
            t.pass('Got the ping ok')
          }, function(err) {
            t.fail('Should not have arrived here')
          })
        }
      )

      test(
        'a select on an unknown table should result in an error',
        function (t) {
          var query = 'SELECT mumble as id FROM mumble.mumble WHERE mumble = ?'
          var param = 'mumble'
          db.read(query, param)
            .then(
              function(result) {
                t.plan(1)
                t.fail('Should not have arrived here for an invalid select')
              },
              function(err) {
                t.plan(5)
                t.ok(err, 'we have an error')
                t.equal(err.code, 500)
                t.equal(err.errno, 1146)
                t.equal(err.error, 'Internal Server Error')
                t.equal(err.message, 'ER_NO_SUCH_TABLE')
              }
            )
        }
      )

      test(
        'an update to an unknown table should result in an error',
        function (t) {
          var query = 'UPDATE mumble.mumble SET mumble = ?'
          var param = 'mumble'

          db.write(query, param)
            .then(
              function(result) {
                t.plan(1)
                t.fail('Should not have arrived here for an invalid update')
              },
              function(err) {
                t.plan(5)
                t.ok(err, 'we have an error')
                t.equal(err.code, 500)
                t.equal(err.errno, 1146)
                t.equal(err.error, 'Internal Server Error')
                t.equal(err.message, 'ER_NO_SUCH_TABLE')
              }
            )
        }
      )

      test(
        'an transaction to update an unknown table should result in an error',
        function (t) {
          var sql = 'UPDATE mumble.mumble SET mumble = ?'
          var param = 'mumble'

          function query(connection, sql, params) {
            var d = P.defer()
            connection.query(
              sql,
              params || [],
              function (err, results) {
                if (err) { return d.reject(err) }
                d.resolve(results)
              }
            )
            return d.promise
          }

          db.transaction(
            function (connection) {
              return query(connection, sql, param)
            })
            .then(
              function(result) {
                t.plan(1)
                t.fail('Should not have arrived here for an invalid update')
              },
              function(err) {
                t.plan(5)
                t.ok(err, 'we have an error')
                t.equal(err.code, 500)
                t.equal(err.errno, 1146)
                t.equal(err.error, 'Internal Server Error')
                t.equal(err.message, 'ER_NO_SUCH_TABLE')
              }
            )
        }
      )

      test(
        'retryable does retry when the errno is matched',
        function (t) {
          var query = 'UPDATE mumble.mumble SET mumble = ?'
          var param = 'mumble'

          var callCount = 0

          var writer = function() {
            ++callCount
            return db.write(query, param)
              .then(
                function(result) {
                  t.fail('this query should never succeed!')
                },
                function(err) {
                  t.ok(true, 'we got an error')
                  t.equal(err.code, 500)
                  t.equal(err.errno, 1146)
                  t.equal(err.error, 'Internal Server Error')
                  t.equal(err.message, 'ER_NO_SUCH_TABLE')
                  throw err
                }
              )
          }

          db.retryable_(writer, [ 1146 ])
            .then(
              function(result) {
                t.fail('This should never happen, even with a retry ' + callCount)
                t.end()
              },
              function(err) {
                t.equal(callCount, 2, 'the function was retried')
                t.end()
              }
            )
        }
      )

      test(
        'teardown',
        function (t) {
          return db.close()
        }
      )

    }
  )
