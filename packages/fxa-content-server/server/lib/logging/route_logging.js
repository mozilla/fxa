/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Middleware to log the requests

const logger = require('mozlog')('server.requests');
const morgan = require('morgan');
const config = require('../configuration').getProperties();

/**
 * Enhances connect logger middleware - custom formats.
 * See lib/configuration for usage.
 */

// Used when logging is disabled
const disabled = function (req, res, next) {
  next();
};

function defaultFxaFormat(tokens, req, res) {
  'use strict';
  let xff = (req.headers['x-forwarded-for'] || '').split(/\s*,\s*/);
  xff.push(req.ip || req.connection.remoteAddress);
  // Remove empty items from the list, in case of badly-formed header.
  xff = xff.filter(x => x);
  let clientAddressIndex = xff.length - (config.clientAddressDepth || 1);
  if (clientAddressIndex < 0) {
    clientAddressIndex = 0;
  }
  return JSON.stringify({
    clientAddress: xff[clientAddressIndex],
    contentLength: tokens.res(req, res, 'content-length'),
    method: tokens.method(req, res),
    path: tokens.url(req, res),
    referer: req.headers['referer'],
    remoteAddressChain: xff,
    status: tokens.status(req, res),
    t: tokens['response-time'](req, res),
    'userAgent': req.headers['user-agent']
  });
}

const formats = {
  'default_fxa': defaultFxaFormat,
  'dev_fxa': (tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens['response-time'](req, res),
    tokens.status(req, res)
  ].join(' ')
};

module.exports = function () {
  return config.disable_route_logging ?
          disabled :
          morgan(formats[config.route_log_format], {
            stream: {
              write: (x) => {
                const logBody = config.route_log_format === 'dev_fxa' ? x.trim() : JSON.parse(x);
                logger.info('route', logBody);
              }
            }
          });
};
