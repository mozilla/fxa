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
        'check that an error in a stored procedure (with transaction) is propagated back',
        function (t) {
          // let's add a stored procedure which will cause an error
          var dropProcedure = 'DROP PROCEDURE IF EXISTS `testStoredProcedure`;'
          var ensureProcedure = [
            'CREATE PROCEDURE `testStoredProcedure` ()',
            'BEGIN',
            '    DECLARE EXIT HANDLER FOR SQLEXCEPTION',
            '    BEGIN',
            '        -- ERROR',
            '        ROLLBACK;',
            '        RESIGNAL;',
            '    END;',
            '    START TRANSACTION;',
            '    INSERT INTO accounts(uid) VALUES(null);',
            '    COMMIT;',
            'END;',
          ].join('\n')

          t.plan(6)

          db.write(dropProcedure, [])
            .then(function() {
              t.pass('Drop procedure was successful')
              return db.write(ensureProcedure, [])
            })
            .then(
              function(result) {
                t.pass('The stored procedure creation was successful')
              },
              function(err) {
                t.fail('Error when creating a stored procedure' + err)
              }
            )
            .then(function() {
              // monkey patch the DB so that we're doing what the other writes to stored procedures are doing
              db.testStoredProcedure = function() {
                var callProcedure = 'CALL testStoredProcedure()'
                return this.write(callProcedure)
              }
              return db.testStoredProcedure()
            })
            .then(function() {
              t.fail('The call to the stored prodcedure should have failed')
              t.end()
            }, function(err) {
              t.pass('The call to the stored procedure failed as expected')
              t.equal('' + err, "Error: ER_BAD_NULL_ERROR", 'error stringified is correct')
              t.equal(err.code, 500, 'error code is correct')
              t.equal(err.errno, 1048, 'error errno is correct')
              t.end()
            })
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
