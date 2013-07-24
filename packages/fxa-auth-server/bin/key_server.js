#!/usr/bin/env node
var server = require('../')

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
