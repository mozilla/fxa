/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const config = require('./configuration');
const logger = require('./logging/log')('route.500');
const {
  createSettingsProxy,
  modifySettingsStatic,
} = require('./beta-settings');

// It's a 500 server error response.

module.exports = function (err, req, res, next) {
  res.status(500);

  logger.error(err);

  if (req.accepts('html')) {
    res.locals.serverError = true;
    return config.get('proxy_settings')
      ? createSettingsProxy(req, res, next)
      : modifySettingsStatic(req, res);
  }

  if (req.accepts('json')) {
    return res.send({
      error: 'System unavailable, try again soon',
    });
  }

  res.type('txt').send('System unavailable, try again soon');
};
