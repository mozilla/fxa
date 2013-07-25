#!/usr/bin/env node
var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config)

  // stats
  var statsBackend = config.stats.backend
  var Stats = require('../stats')
  // TODO: think about the stats structure
  var Backend = Stats.getBackend(statsBackend, log)
  var stats = new Stats(new Backend(config[statsBackend])) // TODO logBackend constructor

  // memory monitor
  var MemoryMonitor = require('../memory_monitor')
  var memoryMonitor = new MemoryMonitor()
  memoryMonitor.on('mem', stats.mem.bind(stats))
  memoryMonitor.start()

  // stored objects
  var models = require('../models')(config)

  // server public key
  var serverPublicKey = fs.readFileSync(config.publicKeyFile)

  //signer compute-cluster
  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })

  var routes = require('../routes')(
    log,
    serverPublicKey,
    signer,
    models
  )
  var Server = require('../server')
  var server = Server.create(log, config, routes, models.tokens)

  server.start(
    function () {
      server.app.log.info('running on ' + server.info.uri)
    }
  )

  process.on(
    'SIGINT',
    function () {
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
