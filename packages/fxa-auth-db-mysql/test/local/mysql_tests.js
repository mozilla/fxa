/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var dbServer = require('../../fxa-auth-db-server')
var log = require('../lib/log')
var DB = require('../../lib/db/mysql')(log, dbServer.errors)
var config = require('../../config')
var test = require('tap').test
var P = require('../../lib/promise')
var crypto = require('crypto')

var zeroBuffer16 = Buffer.from('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
var now = Date.now()

DB.connect(config)
  .then(
    function (db) {

      test(
        'ping',
        function (t) {
          t.plan(1)
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

          return db.retryable_(writer, [ 1146 ])
            .then(
              function(result) {
                t.fail('This should never happen, even with a retry ' + callCount)
              },
              function(err) {
                t.equal(callCount, 2, 'the function was retried')
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

          t.plan(5)

          return db.write(dropProcedure, [])
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
            }, function(err) {
              t.pass('The call to the stored procedure failed as expected')
              t.equal(err.code, 500, 'error code is correct')
              var possibleErrors = [
                { msg: 'ER_BAD_NULL_ERROR', errno: 1048 },
                { msg: 'ER_NO_DEFAULT_FOR_FIELD', errno: 1364 }
              ]
              var matchedError = false
              possibleErrors.forEach(function(possibleErr) {
                if (err.message === possibleErr.msg) {
                  if (err.errno === possibleErr.errno ) {
                    matchedError = true
                  }
                }
              })
              t.ok(matchedError, 'error message and errno are correct')
            })
        }
      )

      test(
        'readMultiple with valid queries',
        function (t) {
          t.plan(9)
          return db.readMultiple([
            {
              sql: 'SELECT * FROM accounts LIMIT ?',
              params: 1
            },
            {
              sql: 'SELECT COUNT(*) AS count FROM accounts WHERE createdAt < ? AND normalizedEmail LIKE ?',
              params: [ Date.now(), '%@mozilla.com' ]
            }
          ])
          .then(
            function(results) {
              t.ok(Array.isArray(results), 'results array was returned')
              t.equal(results.length, 2, 'results array contained two items')
              t.ok(Array.isArray(results[0]), 'first result was an array')
              t.ok(results[0].length <= 1, 'first result contained zero or one items')
              t.ok(Array.isArray(results[1]), 'second result was an array')
              t.equal(results[1].length, 1, 'second result contained one item')
              t.equal(typeof results[1][0], 'object', 'second result item was object')
              t.equal(Object.keys(results[1][0]).length, 1, 'second result item had one property')
              t.ok(results[1][0].count >= 0, 'count property was non-negative number')
            }
          )
        }
      )

      test(
        'readMultiple with final query',
        function (t) {
          t.plan(1)
          return db.readMultiple([
            { sql: 'SELECT * FROM accounts LIMIT 1' },
            { sql: 'SELECT * FROM accounts LIMIT 1' }
          ], { sql: 'SELECT * FROM accounts LIMIT 1' })
          .then(
            function(results) {
              t.equal(results.length, 2, 'results array contained two items')
            }
          )
        }
      )

      test(
        'readMultiple with error in query',
        function (t) {
          t.plan(1)
          return db.readMultiple([
            { sql: 'SELECT nonsense FROM gibberish' },
            { sql: 'SELECT * FROM accounts LIMIT 1' }
          ], { sql: 'SELECT * FROM accounts LIMIT 1' })
          .then(
            function(results) {
              t.fail('should have failed')
            },
            function(err) {
              t.pass('failed correctly')
            }
          )
        }
      )

      test(
        'readMultiple with error in final query',
        function (t) {
          t.plan(1)
          return db.readMultiple([
            { sql: 'SELECT * FROM accounts LIMIT 1' },
            { sql: 'SELECT * FROM accounts LIMIT 1' }
          ], { sql: 'SELECT nonsense FROM gibberish' })
          .then(
            function(results) {
              t.fail('should have failed')
            },
            function(err) {
              t.pass('failed correctly')
            }
          )
        }
      )

      test(
        '_connectionConfig returns a plausible config object',
        function (t) {
          t.plan(4)
          return db._connectionConfig('MASTER')
            .then(
              function(config) {
                t.isa(config, 'object')
                // slightly opinionated
                t.equal(config.protocol41, true, 'protocol41 is true')
                t.equal(config.charsetNumber, 33, 'charsetNumber should be 33 (utf8)')
                t.equal(config.multipleStatements, false, 'multipleStatements should normally be false')
              }
            )
        }
      )

      test(
        '_showVariables returns a plausible set of values',
        function (t) {
          t.plan(3)
          return db._showVariables('MASTER')
            .then(
              function(vars) {
                t.isa(vars, 'object')
                // Not doing a hardcore enumeration (yet) (or utfmb4)
                t.equal(vars['character_set_client'], 'utf8', 'character_set_connection is utf8')
                t.equal(vars['character_set_connection'], 'utf8', 'character_set_client is utf8')
              }
            )
        }
      )

      test(
        'create account and read email record',
        function (t) {
          var uid = crypto.randomBytes(16)
          var account = {
            uid: uid,
            email: ('' + Math.random()).substr(2) + '@bar.com',
            emailCode: zeroBuffer16,
            emailVerified: false,
            verifierVersion: 1,
            verifyHash: zeroBuffer32,
            authSalt: zeroBuffer32,
            kA: zeroBuffer32,
            wrapWrapKb: zeroBuffer32,
            verifierSetAt: now,
            createdAt: now,
            locale : 'en_US',
          }
          account.normalizedEmail = account.email.toLowerCase()

          return db.createAccount(uid, account)
            .then(
              function(result) {
                t.deepEqual(result, {}, 'Returned an empty object on account creation')
                return db.emailRecord(account.email)
              }
            )
            .then(
              function(result) {
                t.equal(result.createdAt, account.createdAt, 'createdAt set')
                t.equal(result.email, account.email, 'email set')
                t.equal(result.emailVerified, 0, 'emailVerified set')
                t.equal(result.normalizedEmail, account.normalizedEmail, 'normalizedEmail set')
                t.equal(result.verifierSetAt, account.verifierSetAt, 'verifierSetAt set')
                t.equal(result.verifierVersion, account.verifierVersion, 'verifierVersion set')
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
