#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
fs = require('fs'),
express = require('express'),
http = require('http'),
toobusy = require('toobusy'),
log = require('./log'),
config = require('./config');

log.debug("verifier server starting up");

var app = express();
var server = http.createServer(app);

// XXX: handle shutdown
process.on('SIGINT', function() {
  toobusy.shutdown();
  server.close();
});

// XXX: heartbeat

// return 503 when the server is too busy
toobusy.maxLag(70 /* XXX: config */);
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send("server is too busy", {"Content-Type": "text/plain"}, 503);
  } else {
    next();
  }
});

// XXX: log requests

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb" }));

function verify(req, res) {
  res.send("not implemented", {"Content-Type": "text/plain"}, 500);
}

app.post('/verify', verify);

app.post('/', verify);

// XXX: shutdown nicely on signals
server.listen(config.get('port'), config.get('ip'), function() {
  log.info("running on http://" +
           server.address().address + ":" + server.address().port);
});
