/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
express = require('express'),
http = require('http'),
toobusy = require('toobusy'),
log = require('./log').getLogger('bid.server'),
summary = require('./summary'),
config = require('./config'),
CCVerifier = require('./ccverifier'),
v1api = require('./v1'),
v2api = require('./v2');

log.debug("verifier server starting up");

var app = express();
var server = http.createServer(app);

var verifier = new CCVerifier({
  httpTimeout: config.get('httpTimeout'),
  insecureSSL: config.get('insecureSSL'),
  testServiceFailure: config.get('testServiceFailure')
});


// handle shutdown
function shutdown(signal) {
  return function() {
    log.info("recieved signal", signal +", shutting down...");
    toobusy.shutdown();
    verifier.shutdown();
    server.close();
  };
}

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(function(signal) {
  process.on(signal, shutdown(signal.substr(3)));
});


// health check - registered before all other middleware.
app.use(function(req, res, next) {
  if (req.url === '/status') {
    res.setHeader('Content-Type', 'text/plain');
    res.send("OK");
  } else {
    next();
  }
});


// return 503 when the server is too busy
toobusy.maxLag(config.get("toobusy.maxLag"));
app.use(function(req, res, next) {
  if (toobusy()) {
    log.warn("too busy");
    res.json(503, { status: "failure", reason: "too busy"});
  } else {
    next();
  }
});

// log HTTP requests
app.use(express.logger({
  stream: {
    write: function(message){
      // trim newlines as our logger inserts them for us.
      if (typeof message === 'string') {
        message = message.trim();
      }
      log.info(message);
    }
  }
}));

// header manipulation
app.use(function(req, res, next) {
  // no caching allowed, this is an API server.
  res.setHeader('Cache-Control', 'no-cache, max-age=0');
  // shave some needless bytes
  res.removeHeader('X-Powered-By');
  res.setHeader('Connection', "close");
  next();
});

// log summary - GH24
app.use(summary());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb" }));

app.post('/verify', v1api.bind(v1api, verifier));
app.post('/', v1api.bind(v1api, verifier));
app.post('/v2', v2api.bind(v2api, verifier));

function wrongMethod(req, res) {
  return res.send(405);
}

['/verify', '/', '/v2'].forEach(function(route) {
  app.get(route, wrongMethod);
});

// error handler goes last, to receive any errors from previous middleware
app.use(function(err, req, res, next) {
  if (err) {
    if (err.status) {
      res.statusCode = err.status;
    } else {
      res.statusCode = 500;
      log.error(err);
    }
    res.end();
  }
  next();
});

server.listen(config.get('port'), config.get('ip'), function() {
  log.info("running on http://" +
           server.address().address + ":" + server.address().port);
});
