/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const config = require('../configuration');
const flowEvent = require('../flow-event');
const MetricsCollector = require('../metrics-collector-stderr');
const StatsDCollector = require('../statsd-collector');
const GACollector = require('../ga-collector');
const logger = require('mozlog')('server.post-metrics');

const DISABLE_CLIENT_METRICS_STDERR = config.get('client_metrics').stderr_collector_disabled;

module.exports = function () {
  const metricsCollector = new MetricsCollector();
  const statsd = new StatsDCollector();
  const ga = new GACollector();
  statsd.init();

  return {
    method: 'post',
    path: '/metrics',
    process: function (req, res) {
      const requestReceivedTime = Date.now();

      // don't wait around to send a response.
      res.json({ success: true });

      process.nextTick(function () {
        let metrics = req.body || {};

        const contentType = req.get('content-type') || '';
        if (contentType.indexOf('text/plain') === 0) {
          try {
            metrics = JSON.parse(req.body);
          } catch (error) {
            logger.error(error);
            return;
          }
        }

        metrics.agent = req.get('user-agent');

        if (metrics.isSampledUser) {
          if (! DISABLE_CLIENT_METRICS_STDERR) {
            metricsCollector.write(metrics);
          }
          // send the metrics body to the StatsD collector for processing
          statsd.write(metrics);
        }
        ga.write(metrics);

        flowEvent(req, metrics, requestReceivedTime);
      });
    }
  };
};
