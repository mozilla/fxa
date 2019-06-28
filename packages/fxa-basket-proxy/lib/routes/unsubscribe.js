/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('../logging')('routes.unsubscribe');
var basket = require('../basket');

module.exports = function unsubscribe(req, res) {
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

  var creds = res.locals.creds;
  var email = encodeURIComponent(creds.email);

  logger.info('activityEvent', {
    event: 'basket.unsubscribe',
    uid: res.locals.creds.user,
    userAgent: req.headers['user-agent'] || undefined,
  });

  basket.request('/lookup-user/?email=' + email, { method: 'get' }, function(
    lookupError,
    httpRequest,
    body
  ) {
    if (lookupError) {
      logger.error('lookup-user.error', lookupError);
      res
        .status(400)
        .json(basket.errorResponse(lookupError, basket.errors.UNKNOWN_ERROR));
      return;
    }

    var responseData;
    try {
      responseData = JSON.parse(body);
    } catch (parseError) {
      logger.error('lookup-user.cannot-parse-response', parseError);
      res
        .status(400)
        .json(basket.errorResponse(parseError, basket.errors.UNKNOWN_ERROR));
      return;
    }
    if (responseData.status !== 'ok') {
      logger.error('lookup-user.status-not-ok', responseData.status);
      res.status(httpRequest.statusCode).json(responseData);
      return;
    }

    var params = req.body;
    params.email = creds.email;
    logger.info('params', params);

    basket.proxy(
      '/unsubscribe/' + responseData.token + '/',
      { method: 'post', form: params },
      res
    );
  });
};
