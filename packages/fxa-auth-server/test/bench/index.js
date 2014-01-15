#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var cp = require('child_process')
var split = require('binary-split')
var through = require('through')

var clientCount = 2
var pathStats = {}
var requests = 0
var pass = 0
var fail = 0
var start = null

var server = cp.spawn(
  'node',
  ['../../bin/key_server.js'],
  {
    cwd: __dirname
  }
)

server.stderr
  .pipe(split())
  .pipe(
    through(
      function (data) {
        try {
          this.emit('data', JSON.parse(data))
        }
        catch (e) {}
      }
    )
  )
  .pipe(
    through(
      function (json) {
        if (json.level > 30) {
          console.log(json)
        }
        if (json.op && json.op === 'server.response') {
          if (!start) start = Date.now()
          requests++
          if (json.code === 200) { pass++ } else { fail++ }
          var stat = pathStats[json.path] || {}
          stat.count = stat.count + 1 || 1
          stat.max = Math.max(stat.max || 0, json.t)
          stat.min = Math.min(stat.min || Number.MAX_VALUE, json.t)
          pathStats[json.path] = stat
          this.emit('data', json)
        }
        else if (json.op === 'server.start.1') {
          startClients()
        }
      }
    )
  )

function startClient() {
  var client = cp.spawn(
    'node',
    ['./bot.js'],
    {
      cwd: __dirname
    }
  )
  client.stdout.on('data', process.stdout.write.bind(process.stdout))
  client.stderr.on('data', process.stderr.write.bind(process.stderr))
  return client
}

function clientExit() {
  clientCount--
  if (clientCount === 0) {
    var seconds = (Date.now() - start) / 1000
    var rps = Math.floor(requests / seconds)
    console.log('rps: %d requests: %d errors: %d', rps, requests, fail)
    console.log(pathStats)
    server.kill('SIGINT')
  }
}

function startClients() {
  for (var i = 0; i < clientCount; i++) {
    var c = startClient()
    c.on('exit', clientExit)
  }
}
