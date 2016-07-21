#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


 /*/

 Use in combination with config-list.js to update customs server settings
 in memcache. config-set.js reads json from stdin and writes it to the
 memcache server specified by the first argument.

 Example:

 $ config-list.js localhost:11211 > settings.json
 $ vi settings.json
 $ cat settings.json | config-set.js localhost:11211

 /*/

/* eslint-disable no-console */
var Memcached = require('memcached')
var P = require('bluebird')
var BL = require('bl')

P.promisifyAll(Memcached.prototype)

if (process.argv.length < 3) {
  var usage = 'Usage: cat settings.json | config-set.js <memcacheHost:port>'
  return console.error(usage)
}

if (!/.+:\d+/.test(process.argv[2])) {
  var x = "use a host:port like 'localhost:11211'"
  return console.error(x)
}

var b = process.stdin.pipe(new BL())

process.stdin.on('end', function () {
  var input = null
  try {
    input = JSON.parse(b.toString())
  }
  catch (e) {
    return console.error('Input is not valid JSON')
  }
  var mc = new Memcached(process.argv[2], { namespace: 'fxa~' })

  var actions = []
  if (input.limits) {
    actions.push(mc.setAsync('limits', input.limits, 0))
  }

  if (input.allowedIPs) {
    actions.push(mc.setAsync('allowedIPs', input.allowedIPs, 0))
  }

  P.all(actions)
    .catch(
      function (err) {
        console.error('update failed')
        console.error(err)
      }
    )
    .then(
      function () {
        mc.end()
      }
    )
})
