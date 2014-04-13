/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
os = require('os'),
logger = require('./log').getLogger('bid.summary');

var logSummaryInfo = {
  v: 1, // log format version
  op: 'verifier.summary',
  host: os.hostname()
};

module.exports = function middlewareFactory() {


  return function summary(req, res, next) {
    function log() {
      res.removeListener('finish', log);
      res.removeListener('close', log);

      var summary = res._summary;
      summary.code = res.statusCode;

      logger.info(summary);
    }

    // Include global log info in the summary for each request.
    res._summary = {};
    for (var key in logSummaryInfo) {
      res._summary[key] = logSummaryInfo[key];
    }

    // Add useful request-level info to the summary.
    res._summary.agent = req.headers['user-agent'] || '';
    var xff = (req.headers['x-forwarded-for'] || '').split(/\s*,\s*/);
    xff.push(req.connection.remoteAddress);
    res._summary.remoteAddressChain = xff.filter(function(x){ return x; });

    res.on('finish', log);
    res.on('close', log);

    next();
  };
};
