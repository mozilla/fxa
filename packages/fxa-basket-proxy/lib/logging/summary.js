/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var onFinished = require('on-finished');
var logger = require('./')('summary');

// Adds request-summary logging to an express app.
// https://mana.mozilla.org/wiki/display/CLOUDSERVICES/Logging+Standard

module.exports = function() {
  return function summary(req, res, next) {
    if (req.method === 'options') {
      return;
    }
    var startTime = Date.now();
    onFinished(res, function logSummary(err, res) {
      var line = {
        agent: req.headers['user-agent'],
        auth: res.locals &&
          res.locals.creds && {
            user: res.locals.creds.user,
          },
        code: res.statusCode,
        method: req.method,
        path: req.path,
        payload: Object.keys(req.body || {}),
        t: Date.now() - startTime,
      };
      if (line.code >= 500) {
        line.stack = res.stack || err ? err.stack : '';
        logger.error('summary', line);
      } else {
        logger.info('summary', line);
      }
    });
    next();
  };
};
