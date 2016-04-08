#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

 Usage:

 node scripts/must-reset.js -i ./reset.json

 This script is used to put user accounts into a "must reset" state. It uses the
 same config file as key_server.js so should be run from a production instance.

 /*/

var butil = require('../lib/crypto/butil')
var commandLineOptions = require('commander')
var config = require('../config').getProperties()
var crypto = require('crypto')
var error = require('../lib/error')
var log = require('../lib/log')(config.log.level)
var P = require('../lib/promise')
var path = require('path')
var Token = require('../lib/tokens')(log, config.tokenLifetimes)

commandLineOptions
  .option('-i, --input <filename>', 'JSON input file')
  .parse(process.argv)

var requiredOptions = [
  'input'
]

requiredOptions.forEach(checkRequiredOption)


var DB = require('../lib/db')(
  config.db.backend,
  log,
  error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

DB.connect(config[config.db.backend])
  .then(
    function (db) {
      var json = require(path.resolve(commandLineOptions.input))

      var uids = butil.bufferize(json.map(function (entry) {
        return entry.uid
      }), {inplace: true})

      return P.all(uids.map(
        function (uid) {
          return db.resetAccount(
            { uid: uid },
            {
              authSalt: butil.ONES,
              verifyHash: butil.ONES,
              wrapWrapKb: crypto.randomBytes(32),
              verifierVersion: 1
            }
          )
          .catch(function (err) {
            log.error({ op: 'reset.failed', uid: uid, err: err })
          })
        }
        ))
        .then(
          function () {
            log.info({ complete: true, uidsReset: uids.length })
          },
          function (err) {
            log.error(err)
          }
        )
        .then(db.close.bind(db))
    }
  )

function checkRequiredOption(optionName) {
  if (! commandLineOptions[optionName]) {
    console.error('--' + optionName + ' required')
    process.exit(1)
  }
}
