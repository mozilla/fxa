/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Serve x-frame-options headers
 *
 * x-frame-options headers are set by default to DENY. On Fx Desktop 40
 * and above, the firstrun page is allowed to be framed the
 * ALLOW-FROM <origin> directive is used. `origin` is pulled from the
 * `origin` query parameter, specified by the firstrun page.
 *
 * ALLOW-FROM is only set under the following conditions:
 *
 * 1) Fx Desktop 40 or above.
 * 2) origin query parameter is set and is on the list of
 *    allowed_parent_origins specified in config.
 * 3) context query parameter is set and is on the list of
 *    allowed_iframe_contexts specified in config. If a new
 *    context is allowed, it can be added to this list.
 * 4) service=sync
 *
 * DENY is specified for everybody else. about:accounts in Fx Desktop
 * and Fennec frame FxA but ignore the header.
 */

'use strict';
const helmet = require('helmet');
const htmlOnly = require('./html-middleware');
const uaParser = require('./user-agent');

function isAllowedToFrame(req, allowedContexts) {
  return isContextAllowedToFrame(req.query.context, allowedContexts) &&
         isServiceAllowedToFrame(req.query.service) &&
         isUAAllowedToFrame(req.headers['user-agent'] || '');
}

function isServiceAllowedToFrame(service) {
  // For now, the only service allowed to frame is Sync.
  return service === 'sync';
}

function isContextAllowedToFrame(context, allowedContexts) {
  return allowedContexts.indexOf(context) > -1;
}

function isUAAllowedToFrame(uaHeader) {
  const agent = uaParser.parse(uaHeader);
  // Only the firstrun page is allowed to frame. The firstrun page
  // was first available in Fx 40.
  return agent.ua.family === 'Firefox' &&
         parseInt(agent.ua.major, 10) >= 40;
}


module.exports = function (config) {
  const allowedContexts = config.get('allowed_iframe_contexts');
  const allowedOrigins = config.get('allowed_parent_origins');

  const denyMiddleware = helmet.frameguard({
    action: 'deny'
  });

  const allowFromMiddlewareCache = {};
  allowedOrigins.forEach(function (origin) {
    allowFromMiddlewareCache[origin] = helmet.frameguard({
      action: 'allow-from',
      domain: origin
    });
  });

  return htmlOnly((req, res, next) => {
    if (! isAllowedToFrame(req, allowedContexts)) {
      return denyMiddleware(req, res, next);
    }

    // If the origin is not specified or is not on the list
    // of acceptable origins, the denyMiddleware is used.
    const middleware =
      allowFromMiddlewareCache[req.query.origin] || denyMiddleware;

    middleware(req, res, next);
  });
};
