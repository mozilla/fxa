/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var MetricsCollector = require('../metrics-collector-stderr');

module.exports = function () {
  var metricsCollector = new MetricsCollector();

  return {
    method: 'post',
    path: '/metrics',
    process: function (req, res) {
      // don't wait around to send a response.
      res.json({ success: true });

      var metrics = req.body;
      metrics.agent = req.get('user-agent');
      metricsCollector.write(req.body);
    }
  };
};
