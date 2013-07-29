#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config)

  // stats
  var statsBackend = config.stats.backend
  var Stats = require('../stats')
  // TODO: think about the stats structure
  var Backend = Stats.getBackend(statsBackend, log)
  var stats = new Stats(new Backend(config[statsBackend]))

  // memory monitor
  var MemoryMonitor = require('../memory_monitor')
  var memoryMonitor = new MemoryMonitor()
  memoryMonitor.on('mem', stats.mem.bind(stats))
  memoryMonitor.start()

  // databases
  var dbs = require('../kv')(config)

  // email sender
  config.smtp.subject = 'PiCL email verification'
  config.smtp.sender = config.smtp.sender || config.smtp.user
  // TODO: send to the SMTP server directly. In the future this may change
  // to another process that we send an http request to.
  var Mailer = require('../mailer')
  var mailer = new Mailer(config.smtp)

  // stored objects
  var models = require('../models')(config, dbs, mailer)

  // server public key
  var serverPublicKey = fs.readFileSync(config.publicKeyFile)

  //signer compute-cluster
  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })

  var routes = require('../routes')(log, serverPublicKey, signer, models)
  var Server = require('../server')
  var server = Server.create(log, config, routes, models.tokens)

  server.start(
    function () {
      log.info('running on ' + server.info.uri)
    }
  )

  process.on(
    'SIGINT',
    function () {
      memoryMonitor.stop()
      server.stop(
        function () {
          process.exit()
        }
      )
    }
  )
}

if (!fs.existsSync(config.publicKeyFile)) {
  require('../scripts/gen_keys')(main)
}
else {
  main()
}
