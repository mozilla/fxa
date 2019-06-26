/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('../logging')('routes.subscribe');
var basket = require('../basket');
var config = require('../config');

var DEFAULT_SOURCE_URL = config.get('basket.source_url');

module.exports = function subscribe(req, res) {
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

  var params = req.body;
  params.email = res.locals.creds.email;
  /* eslint-disable camelcase */
  if (req.headers['accept-language']) {
    params.accept_lang = req.headers['accept-language'];
  }
  if (!params.source_url) {
    params.source_url = DEFAULT_SOURCE_URL;
  }
  /* eslint-enable camelcase */
  logger.info('params', params);
  logger.info('activityEvent', {
    event: 'basket.subscribe',
    uid: res.locals.creds.user,
    userAgent: req.headers['user-agent'] || undefined,
  });

  basket.proxy('/subscribe/', { method: 'post', form: params }, res);
};
