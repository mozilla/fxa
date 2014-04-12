/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('./log').getLogger('bid.summary');

module.exports = function middlewareFactory() {


  return function summary(req, res, next) {
    function log() {
      res.removeListener('finish', log);
      res.removeListener('close', log);

      var summary = res._summary;
      summary.code = res.statusCode;

      logger.info(summary);
    }

    res._summary = {
      api: req.url === '/v2' ? 2 : 1, // api version, /v1 or /v2
      agent: req.headers['user-agent'],
      host: req.headers.host,
      v: 1 // log format version
    };

    res.on('finish', log);
    res.on('close', log);

    next();
  };
};
