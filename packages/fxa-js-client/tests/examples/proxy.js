/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Auth Proxy tester for better IE debugging.
 *
 * Run using:  node tests/examples/proxy.js
 */
var http = require('http');
var fs = require('fs');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer();
var port = 9133;
var targetAuthServer = 'http://127.0.0.1:9000';

http
  .createServer(function(req, res) {
    if (req.url === '/example.html') {
      res.end(fs.readFileSync('tests/examples/example.html'));
    } else if (req.url === '/build/fxa-client.js') {
      res.end(fs.readFileSync('build/fxa-client.js'));
    } else {
      proxy.web(req, res, {
        target: targetAuthServer,
      });
    }
  })
  .listen(port);

console.log(
  'Starting proxy on',
  port,
  'targeting',
  targetAuthServer,
  'fxa-auth-server'
);
