#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express'),
      nunjucks = require('nunjucks'),
      path = require('path');

var app = express();
var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    path.join(__dirname, '..', 'views')));

env.express(app);

app.get('/.well-known/browserid', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.render('browserid.html');
});

app.get('/provision', function(req, res) {
  res.send('Yo');
});

app.get('/authentication', function(req, res) {
  res.send('Yo');
});

app.listen(3000);
console.log('Firefox Account Bridge listening at http://localhost:3000');