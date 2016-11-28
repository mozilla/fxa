/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */

var restify = require('restify')

// a dummy reputation server to receive violations
var server = restify.createServer()
server.timeout = process.env.REPUTATION_SERVICE_TIMEOUT
server.use(restify.bodyParser())

// hashmap of ip -> list of violations
var mostRecentViolationByIp = {}

server.put('/violations/:ip', function (req, res, next) {
  var ip = req.params.ip
  mostRecentViolationByIp[ip] = req.body.Violation
  console.log('put req', req.url)
  res.send(200)
  next()
})

// not real tigerblood endpoints
server.get('/mostRecentViolation/:ip', function (req, res, next) {
  var ip = req.params.ip
  console.log('get req', req.url)
  res.send(200, mostRecentViolationByIp[ip] || null)

  next()
})
server.del('/mostRecentViolation/:ip', function (req, res, next) {
  var ip = req.params.ip
  console.log('delete req', req.url)
  delete mostRecentViolationByIp[ip]
  res.send(200)

  next()
})
server.get('/', function (req, res, next) {
  res.send(200)
  next()
})

server.listen(process.env.REPUTATION_SERVICE_PORT)
