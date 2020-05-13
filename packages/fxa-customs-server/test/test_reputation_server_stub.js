/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */

var url = require('url');
var restify = require('restify');

// a dummy reputation server to receive violations
var server = restify.createServer();
server.timeout = process.env.REPUTATION_SERVICE_TIMEOUT;
server.use(restify.plugins.bodyParser({ mapParams: true }));

// hashmap of ip -> list of violations
var mostRecentViolationByIp = {};

// hashmap of ip -> reputation
var reputationsByIp = {};

server.put('/violations/type/ip/:ip', function(req, res, next) {
  var ip = req.params.ip;
  mostRecentViolationByIp[ip] = req.body.violation;
  console.log('put req', req.url);
  res.send(200);
  next();
});

// This is not a real route in iprepd, and is only used by the tests
server.get('/mostRecentViolation/:ip', function(req, res, next) {
  var ip = req.params.ip;
  console.log('get req', req.url);
  res.send(200, mostRecentViolationByIp[ip] || {});

  next();
});
// This is not a real route in iprepd, and is only used by the tests
server.del('/mostRecentViolation/:ip', function(req, res, next) {
  var ip = req.params.ip;
  console.log('delete req', req.url);
  delete mostRecentViolationByIp[ip];
  res.send(200);

  next();
});
server.get('/heartbeat', function(req, res, next) {
  res.send(200);
  next();
});

server.get('/type/ip/:ip', function(req, res, next) {
  var ip = req.params.ip;
  if (ip === '9.9.9.9') {
    res.send(500);
  } else if (reputationsByIp.hasOwnProperty(ip)) {
    res.send(200, { reputation: reputationsByIp[ip], reviewed: false });
  } else {
    res.send(404);
  }
  next();
});
server.del('/type/ip/:ip', function(req, res, next) {
  var ip = req.params.ip;
  if (reputationsByIp.hasOwnProperty(ip)) {
    delete reputationsByIp[ip];
  }
  res.send(200);
  next();
});
server.put('/type/ip/:ip', function(req, res, next) {
  var ip = req.params.ip;
  reputationsByIp[ip] = req.body.reputation;
  res.send(200);
  next();
});

server.listen(url.parse(process.env.REPUTATION_SERVICE_BASE_URL).port);
