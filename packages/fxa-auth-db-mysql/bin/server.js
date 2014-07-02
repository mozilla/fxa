var config = require('../config')
var createServer = require('fxa-auth-db-server')
var error = require('../error')
var log = require('../log')(config.logLevel, 'db-api')
var DB = require('../db/mysql')(log, error)
var version = require('../package.json').version

function shutdown() {
  process.nextTick(process.exit)
}

// defer to allow ass code coverage results to complete processing
if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', shutdown)
}

DB.connect(config).done(
  function (db) {
    var server = createServer(version, db, log, config.port, config.host)
  }
)
