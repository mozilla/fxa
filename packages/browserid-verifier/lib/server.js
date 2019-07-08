/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  http = require('http'),
  toobusy = require('toobusy-js'),
  log = require('./log')('server'),
  summary = require('./summary'),
  config = require('./config'),
  CCVerifier = require('./ccverifier'),
  version = require('./version'),
  v1api = require('./v1'),
  v2api = require('./v2');

log.debug('starting');

var app = express();
var server = http.createServer(app);

var verifier = new CCVerifier({
  httpTimeout: config.get('httpTimeout'),
  insecureSSL: config.get('insecureSSL'),
  forceInsecureLookupOverHTTP: config.get('forceInsecureLookupOverHTTP'),
  testServiceFailure: config.get('testServiceFailure'),
});

// handle shutdown
function shutdown(signal) {
  return function() {
    log.info('shutdown', { signal });
    toobusy.shutdown();
    verifier.shutdown();
    server.close();
  };
}

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(function(signal) {
  process.on(signal, shutdown(signal.substr(3)));
});

// header manipulation
app.use(function(req, res, next) {
  // no caching allowed, this is an API server.
  res.setHeader(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate, max-age=0'
  );

  // security headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; report-uri /__cspreport__"
  );

  // shave some needless bytes
  res.removeHeader('X-Powered-By');
  res.setHeader('Connection', 'close');
  next();
});

// health checks - registered before all other middleware.
app.use(function(req, res, next) {
  switch (req.url) {
    case '/status':
      res.setHeader('Content-Type', 'text/plain');
      res.send('OK');
      break;
    case '/__heartbeat__':
    case '/__lbheartbeat__':
      res.send({});
      break;
    case '/__version__':
      version.getVersionInfo(function(info) {
        res.send(info);
      });
      break;
    default:
      next();
  }
});

// return 503 when the server is too busy
toobusy.maxLag(config.get('toobusy.maxLag'));
app.use(function(req, res, next) {
  if (toobusy()) {
    log.warn('tooBusy');
    res.json(503, { status: 'failure', reason: 'too busy' });
  } else {
    next();
  }
});

// log HTTP requests
app.use(
  morgan('common', {
    stream: {
      write: function(message) {
        // trim newlines as our logger inserts them for us.
        if (typeof message === 'string') {
          message = message.trim();
        }
        log.info('message', { message });
      },
    },
  })
);

// log summary - GH24
app.use(summary());

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ limit: '10kb' }));

app.post('/verify', v1api.bind(v1api, verifier));
app.post('/', v1api.bind(v1api, verifier));
app.post('/v2', v2api.bind(v2api, verifier));

function wrongMethod(req, res) {
  return res.sendStatus(405);
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
  log.info('running', {
    url: 'http://' + server.address().address + ':' + server.address().port,
  });
});
