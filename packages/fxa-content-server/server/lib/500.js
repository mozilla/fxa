/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const logger = require('./logging/log')('route.500');

// It's a 500 server error response.

module.exports = function (err, req, res, next) {
  res.status(500);

  logger.error(err);

  if (req.accepts('html')) {
    return res.render('500');
  }

  if (req.accepts('json')) {
    return res.send({
      error: res.gettext('System unavailable, try again soon'),
    });
  }

  res.type('txt').send(res.gettext('System unavailable, try again soon'));
};
