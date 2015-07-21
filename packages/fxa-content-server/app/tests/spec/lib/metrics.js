/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define([
  'chai',
  'jquery',
  'lib/promise',
  'lib/metrics',
  'lib/auth-errors',
  'underscore',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, $, p, Metrics, AuthErrors, _, WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('lib/metrics', function () {
    var metrics;
    var windowMock;

    function createMetrics(options) {
      options = options || {};

      metrics = new Metrics(_.defaults(options, {
        window: windowMock,
        lang: 'db_LB',
        service: 'sync',
        context: 'fx_desktop_v1',
        brokerType: 'fx-desktop',
        entrypoint: 'menupanel',
        migration: 'sync1.5',
        campaign: 'fennec',
        devicePixelRatio: 2,
        clientWidth: 1033,
        clientHeight: 966,
        screenWidth: 1600,
        screenHeight: 1200,
        isSampledUser: true,
        uniqueUserId: '0ae7fe2b-244f-4a78-9857-dff3ae263927',
        utmCampaign: 'utm_campaign',
        utmContent: 'utm_content',
        utmMedium: 'utm_medium',
        utmSource: 'utm_source',
        utmTerm: 'utm_term'
      }));
    }

    beforeEach(function () {
      windowMock = new WindowMock();
      windowMock.document.referrer = 'https://marketplace.firefox.com';

      createMetrics();
      metrics.init();
    });

    afterEach(function () {
      metrics.destroy();
      metrics = null;
    });

    describe('getFilteredData', function () {
      it('gets data that is allowed to be sent to the server', function () {
        var filteredData = metrics.getFilteredData();

        // ensure results are filtered and no unexpected data makes it through.
        for (var key in filteredData) {
          assert.include(metrics.ALLOWED_FIELDS, key);
        }
      });

      it('gets non-optional fields', function () {
        var filteredData = metrics.getFilteredData();

        assert.isTrue(filteredData.hasOwnProperty('events'));
        assert.isTrue(filteredData.hasOwnProperty('timers'));
        assert.isTrue(filteredData.hasOwnProperty('navigationTiming'));
        assert.isTrue(filteredData.hasOwnProperty('duration'));

        assert.equal(filteredData.context, 'fx_desktop_v1');
        assert.equal(filteredData.service, 'sync');
        assert.equal(filteredData.broker, 'fx-desktop');
        assert.equal(filteredData.lang, 'db_LB');
        assert.equal(filteredData.entrypoint, 'menupanel');
        assert.equal(filteredData.migration, 'sync1.5');
        assert.equal(filteredData.campaign, 'fennec');
        assert.equal(filteredData.uniqueUserId, '0ae7fe2b-244f-4a78-9857-dff3ae263927');

        assert.equal(filteredData.referrer, 'https://marketplace.firefox.com');
        assert.equal(filteredData.screen.width, 1600);
        assert.equal(filteredData.screen.height, 1200);
        assert.equal(filteredData.screen.devicePixelRatio, 2);
        assert.equal(filteredData.screen.clientWidth, 1033);
        assert.equal(filteredData.screen.clientHeight, 966);

        assert.isTrue(filteredData.isSampledUser);

        assert.equal(filteredData.utm_campaign, 'utm_campaign');
        assert.equal(filteredData.utm_content, 'utm_content');
        assert.equal(filteredData.utm_medium, 'utm_medium');
        assert.equal(filteredData.utm_source, 'utm_source');
        assert.equal(filteredData.utm_term, 'utm_term');
      });
    });

    describe('logEvent', function () {
      it('adds events to output data', function () {
        metrics.logEvent('event1');
        metrics.logEvent('event2');
        metrics.logEvent('event3');

        var filteredData = metrics.getFilteredData();
        assert.equal(filteredData.events.length, 3);
        assert.equal(filteredData.events[0].type, 'event1');
        assert.equal(filteredData.events[1].type, 'event2');
        assert.equal(filteredData.events[2].type, 'event3');
      });
    });

    describe('startTimer/stopTimer', function () {
      it('adds a timer to output data', function () {
        metrics.startTimer('timer1');
        metrics.stopTimer('timer1');

        var filteredData = metrics.getFilteredData();
        assert.equal(filteredData.timers.timer1.length, 1);

        var timerData = filteredData.timers.timer1[0];
        assert.ok(timerData.hasOwnProperty('start'));
        assert.ok(timerData.hasOwnProperty('stop'));
        assert.ok(timerData.hasOwnProperty('elapsed'));
      });
    });

    describe('flush', function () {
      var sentData, serverError;

      function ajaxMock(options) {
        sentData = options.data;

        if (serverError) {
          return p.reject({ statusText: serverError });
        }

        return p({});
      }

      beforeEach(function () {
        metrics.destroy();

        metrics = new Metrics({
          ajax: ajaxMock,
          window: windowMock,
          inactivityFlushMs: 100
        });
        metrics.init();

        sentData = serverError = null;
      });

      it('sends filtered data to the server and clears the event stream', function () {
        metrics.logEvent('event1');
        metrics.logEvent('event2');

        return metrics.flush()
            .then(function (data) {
              var parsedSentData = JSON.parse(sentData);
              assert.deepEqual(data, parsedSentData);

              var events = metrics.getFilteredData().events;
              assert.equal(events.length, 0);
            });
      });

      it('sends filtered data to the server on window unload', function (done) {
        metrics.logEvent('event10');
        metrics.logEvent('event20');

        var filteredData = metrics.getFilteredData();
        metrics.on('flush.success', function () {
          var parsedSentData = JSON.parse(sentData);

          // `duration` fields are different if the above `getFilteredData`
          // is called in a different millisecond than the one used to
          // generate data that is sent to the server.
          // Ensure `duration` is in the results, but do not compare the two.
          assert.isTrue(parsedSentData.hasOwnProperty('duration'));

          delete parsedSentData.duration;
          delete filteredData.duration;

          assert.deepEqual(filteredData, parsedSentData);

          done();
        });

        $(windowMock).trigger('unload');
      });

      it('handles server errors', function () {
        metrics.logEvent('event100');
        metrics.logEvent('event200');

        serverError = 'server down';

        return metrics.flush()
            .then(null, function (err) {
              // to ensure the failure branch is called, pass the error
              // on to the next success callback which is called on
              // success or failure.
              return err;
            })
            .then(function (err) {
              assert.equal(err, 'server down');
            });
      });

      it('automatically flushes after inactivityFlushMs', function (done) {
        metrics.events.clear();
        metrics.logEvent('event-is-autoflushed');

        metrics.on('flush.success', function (sentData) {
          assert.equal(sentData.events[0].type, 'event-is-autoflushed');
          done();
        });
      });
    });

    describe('errorToId', function () {
      it('converts an error into an id that can be used for logging', function () {
        var error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');

        var id = metrics.errorToId(error);
        assert.equal(id, 'error.signup.auth.999');
      });
    });

    describe('logError', function () {
      it('logs an error', function () {
        var error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');

        metrics.logError(error);
        assert.isTrue(TestHelpers.isErrorLogged(metrics, error));
      });
    });

    describe('logScreen', function () {
      it('logs the screen', function () {
        metrics.logScreen('signup');
        assert.isTrue(TestHelpers.isScreenLogged(metrics, 'signup'));
      });
    });

    describe('setBrokerType', function () {
      it('sets the broker name', function () {
        metrics.setBrokerType('fx-desktop-v2');
        var filteredData = metrics.getFilteredData();

        assert.equal(filteredData.broker, 'fx-desktop-v2');
      });
    });

    describe('isCollectionEnabled', function () {
      it('reports that collection is enabled if `isSampledUser===true`', function () {
        assert.isTrue(metrics.isCollectionEnabled());
      });

      it('reports that collection is disabled if `isSampledUser===false`', function () {
        createMetrics({
          isSampledUser: false
        });
        assert.isFalse(metrics.isCollectionEnabled());
      });
    });

    describe('logMarketingImpression & logMarketingClick', function () {
      it('logs the marketing impression and click', function () {
        var campaign = 'campaign1';
        var url = 'https://accounts.firefox.com';

        assert.isUndefined(metrics.getMarketingImpression(campaign, url));
        metrics.logMarketingImpression(campaign, url);
        assert.isFalse(metrics.getMarketingImpression(campaign, url).clicked);
        metrics.logMarketingClick(campaign, url);
        assert.isTrue(metrics.getMarketingImpression(campaign, url).clicked);
      });
    });
  });
});
