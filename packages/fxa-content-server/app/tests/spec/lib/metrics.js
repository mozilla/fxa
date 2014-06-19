/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define([
  'chai',
  'lib/metrics',
  '../../mocks/window'
],
function (chai, Metrics, WindowMock) {
  'use strict';

  /*global describe, it*/
  var assert = chai.assert;

  describe('lib/metrics', function () {
    var metrics, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      windowMock.location.search = '?service=sync&context=fxa_desktop_v1';
      metrics = new Metrics({
        window: windowMock
      });
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

        assert.isTrue(filteredData.hasOwnProperty('date'));
        assert.isTrue(filteredData.hasOwnProperty('events'));
        assert.isTrue(filteredData.hasOwnProperty('timers'));
        assert.isTrue(filteredData.hasOwnProperty('navigationTiming'));
        assert.isTrue(filteredData.hasOwnProperty('duration'));
        assert.isTrue(filteredData.hasOwnProperty('context'));
        assert.isTrue(filteredData.hasOwnProperty('service'));
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
          options.error({}, 'bad jiji', serverError);
        } else {
          options.success();
        }
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
        metrics.on('flush:success', function () {
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
            .then(function(err) {
              assert.equal(err, 'server down');
            });
      });

      it('automatically flushes after inactivityFlushMs', function (done) {
        metrics.events.clear();
        metrics.logEvent('event-is-autoflushed');

        metrics.on('flush:success', function (sentData) {
          assert.equal(sentData.events[0].type, 'event-is-autoflushed');
          done();
        });
      });
    });
  });
});
