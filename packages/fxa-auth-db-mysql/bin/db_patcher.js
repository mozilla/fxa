/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var mysql = require('mysql')
var clone = require('clone')
var config = require('../config')
var logger = require('../logging')('bin.db_patcher')
var patcher = require('mysql-patcher')

var patch = require('../db/patch')

// set some options
var options = clone(config.master)
options.dir = path.join(__dirname, '..', 'db', 'schema')
options.patchKey = config.patchKey
options.metaTable = 'dbMetadata'
options.patchLevel = patch.level
options.mysql = mysql
options.createDatabase = true
options.reversePatchAllowed = false

patcher.patch(options, function(err) {
  if (err) {
    logger.error('patch-error', { err : '' + err })
    process.exit(2)
  }
  logger.info('patched', { level : options.patchLevel })
})
