/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/metrics-collector-stderr'
], function (intern, registerSuite, assert, StdErrCollector) {
  var und;

  var suite = {
    name: 'metrics-collector-stderr'
  };

  // This test cannot be run remotely like the other tests in tests/server. So,
  // if production, just skip these tests (register a suite with no tests).
  if (intern.config.fxaProduction) {
    registerSuite(suite);
    return;
  }

  var metricsCollector = new StdErrCollector();

  suite['writes formatted data to stderr'] = function () {
    var dfd = this.async(1000);

    // process.stderr.write is overwritten because the 'data' message
    // is never received and the test times out.
    var _origWrite = process.stderr.write;
    process.stderr.write = function (chunk) {
      var loggedMetrics = JSON.parse(String(chunk));

      if (loggedMetrics.op === 'client.metrics') {
        // fields originating on the server.
        assert.ok(loggedMetrics.time);
        assert.equal(loggedMetrics.op, 'client.metrics');
        assert.ok(loggedMetrics.hostname);
        assert.ok(loggedMetrics.pid);
        assert.ok(loggedMetrics.v);

        // fields origininating on the client.
        assert.ok(loggedMetrics.lang, 'db_LB');
        assert.ok(loggedMetrics.agent, 'Firefox 32.0');
        assert.equal(loggedMetrics.duration, 1234);
        assert.equal(loggedMetrics['nt.included'], 0);
        assert.isUndefined(loggedMetrics['nt.notIncludedUndefined']);
        assert.isUndefined(loggedMetrics['nt.notIncludedNull']);

        assert.equal(loggedMetrics.events[0], 'firstEvent');
        assert.equal(loggedMetrics.event_durations[0], 1235);

        assert.equal(loggedMetrics.events[1], 'secondEvent');
        assert.equal(loggedMetrics.event_durations[1], 3512);

        assert.equal(loggedMetrics.service, 'sync');
        assert.equal(loggedMetrics.context, 'fx_desktop_v1');
        assert.equal(loggedMetrics.broker, 'fx-desktop-v1');

        assert.equal(loggedMetrics['screen.width'], 1680);
        assert.equal(loggedMetrics['screen.height'], 1050);
        assert.equal(loggedMetrics.entrypoint, 'menupanel');
        assert.equal(loggedMetrics.migration, 'sync1.5');
        assert.equal(loggedMetrics.campaign, 'fennec');
      } else if (loggedMetrics.op === 'client.marketing') {
        assert.equal(loggedMetrics.campaignId, 'survey');
        assert.isFalse(loggedMetrics.clicked, true);
        assert.equal(loggedMetrics.url, 'http://mzl.la/1oV7jUy');

        assert.equal(loggedMetrics.lang, 'db_LB');
        assert.ok(loggedMetrics.agent, 'Firefox 32.0');
        assert.equal(loggedMetrics.context, 'fx_desktop_v1');
        assert.equal(loggedMetrics.entrypoint, 'menupanel');
        assert.equal(loggedMetrics.service, 'sync');
        assert.equal(loggedMetrics.migration, 'sync1.5');

        process.stderr.write = _origWrite;
        dfd.resolve();
      }
    };

    metricsCollector.write({
      broker: 'fx-desktop-v1',
      campaign: 'fennec',
      context: 'fx_desktop_v1',
      duration: 1234,
      entrypoint: 'menupanel',
      events: [
        {
          offset: 1235,
          type: 'firstEvent'
        },
        {
          offset: 3512,
          type: 'secondEvent'
        }
      ],
      lang: 'db_LB',
      marketing: [{
        campaignId: 'survey',
        clicked: false,
        url: 'http://mzl.la/1oV7jUy'
      }],
      migration: 'sync1.5',
      navigationTiming: {
        included: 0,
        notIncludedNull: null,
        notIncludedUndefined: und
      },
      screen: {
        height: 1050,
        width: 1680
      },
      service: 'sync',
      'user-agent': 'Firefox 32.0'
    });
  };

  registerSuite(suite);
});
