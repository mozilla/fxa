/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('../logging')('routes.lookup-user');
var basket = require('../basket');

module.exports = function lookup(req, res) {
  if (!res.locals.creds) {
    logger.error('auth.missing-authorization-header');
    res
      .status(400)
      .json(
        basket.errorResponse(
          'missing authorization header',
          basket.errors.USAGE_ERROR
        )
      );
    return;
  }

  var email = encodeURIComponent(res.locals.creds.email);

  basket.proxy('/lookup-user/?email=' + email, { method: 'get' }, res);
};
