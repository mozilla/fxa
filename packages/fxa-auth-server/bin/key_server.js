#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config)

  // memory monitor
  var MemoryMonitor = require('../memory_monitor')
  var memoryMonitor = new MemoryMonitor()
  memoryMonitor.on(
    'mem',
    function (usage) {
      log.trace(
        {
          op: 'stat',
          stat: 'mem',
          rss: usage.rss,
          heapTotal: usage.heapTotal,
          heapUsed: usage.heapUsed
        }
      )
    }
  )
  memoryMonitor.start()

  // databases
  var dbs = require('../kv')(config, log)

  // TODO: send to the SMTP server directly. In the future this may change
  // to another process that we send an http request to.
  var mailer = require('../mailer')(config.smtp, log)

  // stored objects
  var models = require('../models')(log, config, dbs, mailer)

  // server public key
  var serverPublicKey = JSON.parse(fs.readFileSync(config.publicKeyFile))

  //signer compute-cluster
  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })

  var routes = require('../routes')(log, serverPublicKey, signer, models, config)
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
