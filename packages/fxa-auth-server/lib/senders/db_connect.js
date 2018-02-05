/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const config = require('../../config').getProperties()
const log = require('./log')('db')
const P = require('bluebird')
const Token = require('../tokens')(log, config)
const UnblockCode = require('../crypto/base32')(config.signinUnblock.codeLength)

const DB = require('../db')(config, log, Token, UnblockCode)

const { connectionTimeout, connectionRetry, backend } = config.db

/**
 * This modules exports a function that polls and waits for the database connection to become available.
 *
 * @returns {dbConnect}
 */
module.exports = function () {
  function dbConnect() {
    var cancelled = false
    function dbConnectPoll() {
      return DB.connect(config[backend])
        .then(
          function (db) {
            return db
          },
          function (err) {
            if (err && err.message && err.message.indexOf('ECONNREFUSED') > -1) {
              log.warn('db', {message: 'Failed to connect to database, retrying...'})
              if (! cancelled) {
                return P.delay(connectionRetry)
                  .then(function () {
                    if (! cancelled) {
                      return dbConnectPoll()
                    }
                  })
              }
            } else {
              log.error('db', {err: err})
            }
          }
        )
    }

    return dbConnectPoll()
      .timeout(connectionTimeout)
      .catch(function (err) {
        cancelled = true
        // report any errors to the db log and rethrow it to the consumer.
        log.error('db', {err: err})
        throw err
      })
  }

  return dbConnect
}
