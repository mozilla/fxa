/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A proxy to forward requests to the auth server. Used for
 * older browsers like IE8 that do not have CORS enabled
 * XMLHttpRequest objects.
 */

'use strict';

var httpProxy = require('http-proxy');
var logger = require('intel').getLogger('server.proxy');
var restreamer = require('connect-restreamer')();

var config = require('./configuration');
var fxaAuthServerUrl = config.get('fxaccount_url');
var fxaOAuthServerUrl = config.get('oauth_url');

var proxy = httpProxy.createServer({});

module.exports = function (req, res, next) {
  // node requests are streams. The proxy expects a readable stream.
  // The request stream is drained by the bodyParser before ever arriving
  // here. restreamer re-establishes the stream for the proxy.
  // See https://github.com/nodejitsu/node-http-proxy/issues/180
  // and the solution at
  // https://github.com/nodejitsu/node-http-proxy/issues/180#issuecomment-12244852
  restreamer(req, res, function () {
    var origUrl = req.url;
    req.url = getUpdatedUrl(origUrl);
    var target = getTarget(origUrl);

    logger.info('proxying request: (%s) %s => %s',
                          req.method, origUrl, target + req.url);

    proxy.web(req, res, { target: target }, function (e) {
      logger.error('proxy error: %s', String(e));

      res.send(503, JSON.stringify({
        code: 503,
        error: 'Service Unavailable',
        // 998 is the client side errno to display `System unavailable`
        errno: 998,
        message: 'Service unavailable'
      }));
    });
  });
};


function getTarget (url) {
  if (/^\/auth\//.test(url)) {
    return fxaAuthServerUrl;
  } else if (/^\/oauth\//.test(url)) {
    return fxaOAuthServerUrl;
  }
}

function getUpdatedUrl (url) {
  return url.replace(/^\/(oauth|auth)\//, '/');
}
