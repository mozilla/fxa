#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*/

Usage:

RESET_UIDS=./reset.json node scripts/must-reset.js

This script is used to put user accounts into a "must reset" state. It uses the
same config file as key_server.js so should be run from a production instance.

The RESET_UIDS env variable is the path to json file of uids to reset.
It defaults to 'must-reset.json' in the project root directory.

The RESET_UIDS json file should look something like the following:

["3D6D8002E5819D54916477CBDEC9A7ED","A065335EE7694671A3E72699F773A912"]

Its just a bare json array of hex uid strings and not case sensitive.

/*/

var path = require('path')
var crypto = require('crypto')
var butil = require('../lib/crypto/butil')
var P = require('../lib/promise')
var config = require('../config').getProperties()
var log = require('../lib/log')(config.log.level)
var error = require('../lib/error')
var Token = require('../lib/tokens')(log, config.tokenLifetimes)

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
      var json = require(path.resolve(config.resetUids))
      var uids = butil.bufferize(json, {inplace: true})

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
