var crypto = require('crypto')
var fs = require('fs')

var config = require('./config').root()

if (!fs.existsSync(config.publicKeyFile)) {
  var started = false
  require('./scripts/gen_keys')(
    function () {
      load()
      process.exit(1) // TODO not ideal
    }
  )
  module.exports = {
    start: function () {}
  }
}
else {
  module.exports = load()
}
function load() {
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

  var RecoveryMethod = require('./recovery_method')(crypto, P, dbs.store)
  var Account = require('./account')(P, tokens.SessionToken, RecoveryMethod, dbs.store, config.domain)
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
    RecoveryMethod,
    tokens
  )
  var Server = require('./server')
  var server = Server.create(log, config, routes, tokens)
  return server
}
