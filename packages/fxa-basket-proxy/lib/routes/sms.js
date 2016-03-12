/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('../logging')('routes.sms');
var basket = require('../basket');

module.exports = function sms(req, res) {
  if (! res.locals.creds) {
    logger.error('auth.missing-authorization-header');
    res.status(400).json(basket.errorResponse('missing authorization header', basket.errors.USAGE_ERROR));
    return;
  }

  var params = req.body;
  logger.info('params', params);
  logger.info('activityEvent', {
    event: 'basket.sms',
    uid: res.locals.creds.user,
    userAgent: req.headers['user-agent'] || undefined,
  });

  basket.request('/subscribe_sms/', { method: 'post', form: params })
    .on('error', function (error) {
      logger.error('error', error);
      res.status(500).json(basket.errorResponse(error, basket.errors.UNKNOWN_ERROR));
    })
    .pipe(res);
};
