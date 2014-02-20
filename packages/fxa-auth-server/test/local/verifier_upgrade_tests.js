/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var Client = require('../../client')
var log = { trace: console.log }

process.env.CONFIG_FILES = path.join(__dirname, '../config/verifier_version_0.json')
var config = require('../../config').root()
var Token = require('../../tokens')(log)
var DB = require('../../db')(
  config.db.backend,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

// This is only testable with a persistent database
if (config.db.backend === 'memory') { return }

var email = Math.random() + "@example.com"
var password = 'ok'
var uid = null
test(
  'upgrading verifierVersion upgrades the account on password change',
function (t) {
return TestServer.start(config)
.then(
  function main(server) {
    return Client.create(config.publicUrl, email, password, { preVerified: true })
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
                t.equal(account.verifierVersion, 0, 'wrong version')
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
    process.env.CONFIG_FILES = path.join(__dirname, '../config/verifier_version_1.json')
    return TestServer.start(config)
  }
)
.then(
  function (server) {
    return Client.changePassword(config.publicUrl, email, password, password)
      .then(
        function () {
          return Client.login(config.publicUrl, email, password)
        }
      )
      .then(
        function (c) {
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
                t.equal(account.verifierVersion, 1, 'wrong upgrade version')
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
})
