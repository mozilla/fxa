#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
// ./server is our current working directory
process.chdir(path.dirname(__dirname));

const clientSessions = require('client-sessions'),
      config = require('../lib/configuration'),
      express = require('express'),
      nunjucks = require('nunjucks'),

      urlparse = require('urlparse');


var app = express();
var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    path.join(__dirname, '..', 'views')));

env.express(app);
app.use(express.cookieParser());
app.use(express.bodyParser());

var isHttps = 'https' === urlparse(config.get('public_url')).scheme;
console.log('public_url=', config.get('public_url'), urlparse(config.get('public_url')));
// BigTent must be deployed behind SSL.
// Tell client-sessions everything will be alright
app.use(function(req, res, next) {
  req.connection.proxySecure = isHttps;
  next();
});

var sess_config = config.get('client_sessions');
app.use(clientSessions({
  cookieName: sess_config.cookie_name,
  secret:     sess_config.secret,
  duration:   sess_config.duration,
  cookie: {
    secure: isHttps,
    httpOnly: true,
    maxAge: sess_config.duration
  }
}));

console.log('Doing csrf');
app.use(express.csrf());
app.use(function(req, resp, next) {
  resp.locals({'csrf_token': req.session._csrf});
  next();
});
console.log('Setup routes');
app.get('/.well-known/browserid', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.render('browserid.html');
});

app.get('/provision', function(req, res) {
  res.send('Yo');
});

app.get('/authentication', function(req, res) {
  console.log('Doing authentication');
  res.send('Yo');
});

app.listen(3000);
console.log('Firefox Account Bridge listening at http://localhost:3000');