/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to log the requests

'use strict';

const logger = require('./log')('server.requests');
const morgan = require('morgan');
const config = require('../configuration').getProperties();
const remoteAddress = require('../../../../fxa-shared/express/remote-address')(
  config.clientAddressDepth
);

/**
 * Enhances connect logger middleware - custom formats.
 * See lib/configuration for usage.
 */

// Used when logging is disabled
const disabled = function (req, res, next) {
  next();
};

function defaultFxaFormat(tokens, req, res) {
  const { clientAddress, addresses } = remoteAddress(req);
  return JSON.stringify({
    clientAddress,
    contentLength: tokens.res(req, res, 'content-length'),
    method: tokens.method(req, res),
    path: tokens.url(req, res),
    referer: req.headers['referer'],
    remoteAddressChain: addresses,
    status: tokens.status(req, res),
    t: tokens['response-time'](req, res),
    userAgent: req.headers['user-agent'],
  });
}

const formats = {
  default_fxa: defaultFxaFormat,
  dev_fxa: (tokens, req, res) =>
    [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens['response-time'](req, res),
      tokens.status(req, res),
    ].join(' '),
};

module.exports = function () {
  return config.disable_route_logging
    ? disabled
    : morgan(formats[config.route_log_format], {
        stream: {
          write: (x) => {
            const logBody =
              config.route_log_format === 'dev_fxa' ? x.trim() : JSON.parse(x);
            logger.info('route', logBody);
          },
        },
      });
};
