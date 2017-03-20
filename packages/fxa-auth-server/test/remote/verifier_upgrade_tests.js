/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()
var createDBServer = require('fxa-auth-db-mysql')
var log = { trace() {} }

var config = require('../../config').getProperties()

var Token = require('../../lib/tokens')(log)
var DB = require('../../lib/db')(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

describe('remote verifier upgrade', function() {
  this.timeout(30000)

  before(() => {
    process.env.VERIFIER_VERSION = '0'
  })

  it(
    'upgrading verifierVersion upgrades the account on password change',
    () => {
      return createDBServer().then(function (db_server) {
        db_server.listen(config.httpdb.url.split(':')[2])
        db_server.on('error', function () {})

        var email = Math.random() + '@example.com'
        var password = 'ok'
        var uid = null

        return TestServer.start(config)
        .then(
          function main(server) {
            return Client.create(config.publicUrl, email, password, { preVerified: true, keys: true })
              .then(
                function (c) {
                  uid = Buffer(c.uid, 'hex')
                  return server.stop()
                }
              )
          }
        )
        .then(
          function () {
            return DB.connect(config[config.db.backend])
              .then(
                function (db) {
                  return db.account(uid)
                    .then(
                      function (account) {
                        assert.equal(account.verifierVersion, 0, 'wrong version')
                      }
                    )
                    .then(
                      function () {
                        return db.close()
                      }
                    )
                }
              )
          }
        )
        .then(
          function () {
            process.env.VERIFIER_VERSION = '1'
            return TestServer.start(config)
          }
        )
        .then(
          function (server) {
            var client
            return Client.login(config.publicUrl, email, password, server.mailbox)
              .then(
                function (x) {
                  client = x
                  return client.keys()
                }
              )
              .then(
                function () {
                  return client.changePassword(password)
                }
              )
              .then(
                function () {
                  return server.stop()
                }
              )
          }
        )
        .then(
          function () {
            return DB.connect(config[config.db.backend])
              .then(
                function (db) {
                  return db.account(uid)
                    .then(
                      function (account) {
                        assert.equal(account.verifierVersion, 1, 'wrong upgrade version')
                      }
                    )
                    .then(
                      function () {
                        return db.close()
                      }
                    )
                }
              )
          }
        )
        .then(
          function () {
            try {
              db_server.close()
            } catch (e) {
              // This connection may already be dead if a real mysql server is
              // already bound to :8000.
            }
          }
        )
      })
    }
  )

  after(() => {
    delete process.env.VERIFIER_VERSION
  })
})
