/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var _ = require('lodash');
var config = require('../configuration');
var flowEvent = require('../flow-event');
var MetricsCollector = require('../metrics-collector-stderr');
var StatsDCollector = require('../statsd-collector');
var GACollector = require('../ga-collector');
var logger = require('mozlog')('server.post-metrics');

var DISABLE_CLIENT_METRICS_STDERR = config.get('client_metrics').stderr_collector_disabled;

var FLOW_BEGIN_EVENT_TYPES = /^flow\.[a-z_-]+\.begin$/;

module.exports = function () {
  var metricsCollector = new MetricsCollector();
  var statsd = new StatsDCollector();
  var ga = new GACollector();
  statsd.init();

  return {
    method: 'post',
    path: '/metrics',
    process: function (req, res) {
      var requestReceivedTime = Date.now();

      // don't wait around to send a response.
      res.json({ success: true });

      process.nextTick(function () {
        var metrics = req.body || {};

        var contentType = req.get('content-type') || '';
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

        optionallyLogFlowEvents(req, metrics, requestReceivedTime);
      });
    }
  };
};

function optionallyLogFlowEvents (req, metrics, requestReceivedTime) {
  if (DISABLE_CLIENT_METRICS_STDERR) {
    return;
  }

  if (! metrics.flowBeginTime) {
    // Don't risk corrupting good data by attempting to fix bad.
    return;
  }

  const events = metrics.events || [];
  const flowEvents = _.filter(events, event => {
    return event.type.indexOf('flow.') === 0;
  });

  flowEvents.forEach(event => {
    if (FLOW_BEGIN_EVENT_TYPES.test(event.type)) {
      event.time = metrics.flowBeginTime;
      event.flowTime = 0;
    } else {
      event.time = estimateTime({
        /*eslint-disable sorting/sort-object-props*/
        start: metrics.startTime,
        offset: event.offset,
        sent: metrics.flushTime,
        received: requestReceivedTime
        /*eslint-enable sorting/sort-object-props*/
      });
      event.flowTime = event.time - metrics.flowBeginTime;
    }

    flowEvent(event, metrics, req);
  });
}

function estimateTime (times) {
  var skew = times.received - times.sent;
  return times.start + times.offset + skew;
}

