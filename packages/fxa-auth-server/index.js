#!/usr/bin/env node

var crypto = require('crypto')
var fs = require('fs')

var config = require('./config').root()
var log = require('./log')(config)

// stats
var statsBackend = config.stats.backend
var Stats = require('./stats')
// TODO: think about the stats structure
var Backend = Stats.getBackend(statsBackend, log)
var stats = new Stats(new Backend(config[statsBackend])) // TODO logBackend constructor

// memory monitor
var MemoryMonitor = require('./memory_monitor')
var memoryMonitor = new MemoryMonitor()
memoryMonitor.on('mem', stats.mem.bind(stats))
memoryMonitor.start()

// storage
var dbs = require('./db')(config)

var srp = require('./srp')
var bigint = require('bigint')
var P = require('p-promise')
var uuid = require('uuid')
var hkdf = require('./hkdf')

var Bundle = require('./bundle')(crypto, bigint, P, hkdf)
var tokens = require('./tokens')(Bundle, dbs)
var Account = require('./account')(P, tokens.SessionToken, dbs.store, config.domain)
var SrpSession = require('./srp_session')(P, uuid, srp, bigint, dbs.cache, Account)


var inherits = require('util').inherits
var AuthBundle = require('./auth_bundle')(inherits, Bundle, Account, tokens)

// server public key
var serverPublicKey = fs.readFileSync(config.publicKeyFile)

//signer compute-cluster
var CC = require('compute-cluster')
var signer = new CC({ module: __dirname + '/bin/signer.js' })

var routes = require('./routes')(
  log,
  dbs,
  serverPublicKey,
  signer,
  Account,
  AuthBundle,
  SrpSession,
  tokens
)
var Server = require('./server')
var server = Server.create(log, config, routes, tokens)

server.start(
  function () {
    log.info('running on ' + server.info.uri)
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

