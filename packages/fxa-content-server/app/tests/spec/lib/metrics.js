/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Constants = require('lib/constants');
  const Environment = require('lib/environment');
  const Metrics = require('lib/metrics');
  const p = require('lib/promise');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const WindowMock = require('../../mocks/window');

  describe('lib/metrics', function () {
    var metrics;
    var windowMock;

    function createMetrics(options) {
      options = options || {};

      metrics = new Metrics(_.defaults(options, {
        brokerType: 'fx-desktop-v1',
        clientHeight: 966,
        clientWidth: 1033,
        context: 'fx_desktop_v1',
        devicePixelRatio: 2,
        entrypoint: 'menupanel',
        isSampledUser: true,
        lang: 'db_LB',
        migration: 'sync1.5',
        screenHeight: 1200,
        screenWidth: 1600,
        service: 'sync',
        startTime: 1439233336187,
        uniqueUserId: '0ae7fe2b-244f-4a78-9857-dff3ae263927',
        utmCampaign: 'utm_campaign',
        utmContent: 'utm_content',
        utmMedium: 'utm_medium',
        utmSource: 'utm_source',
        utmTerm: 'utm_term',
        window: windowMock
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
        assert.equal(filteredData.broker, 'fx-desktop-v1');
        assert.equal(filteredData.lang, 'db_LB');
        assert.equal(filteredData.entrypoint, 'menupanel');
        assert.equal(filteredData.migration, 'sync1.5');
        assert.equal(filteredData.uniqueUserId, '0ae7fe2b-244f-4a78-9857-dff3ae263927');
        assert.equal(filteredData.startTime, 1439233336187);

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

    describe('logEventOnce', function () {
      it('adds events to output data', function () {
        metrics.logEventOnce('event1');
        metrics.logEventOnce('event1');
        metrics.logEventOnce('event3');

        var filteredData = metrics.getFilteredData();
        assert.equal(filteredData.events.length, 2);
        assert.equal(filteredData.events[0].type, 'event1');
        assert.equal(filteredData.events[1].type, 'event3');
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

    describe('create and initialise metrics', function () {
      var sandbox, xhr, environment;

      beforeEach(function () {
        metrics.destroy();

        sandbox = sinon.sandbox.create();
        xhr = { ajax () {} };
        environment = new Environment(windowMock);
        metrics = new Metrics({
          environment: environment,
          inactivityFlushMs: 100,
          window: windowMock,
          xhr: xhr
        });

        metrics.init();
      });

      afterEach(function () {
        sandbox.restore();
      });

      describe('log events', function () {
        beforeEach(function () {
          metrics.logEvent('foo');
          metrics.logFlowBegin('bar', 'baz', 'wibble');
          metrics.logEvent('qux');
        });

        describe('has sendBeacon', function () {
          beforeEach(function () {
            sandbox.stub(environment, 'hasSendBeacon', function () {
              return true;
            });
          });

          describe('flush, sendBeacon succeeds', function () {
            var result;

            beforeEach(function () {
              sandbox.stub(windowMock.navigator, 'sendBeacon', function () {
                return true;
              });
              return metrics.flush().then(function (r) {
                result = r;
              });
            });

            afterEach(function () {
              result = undefined;
            });

            it('calls sendBeacon correctly', function () {
              assert.isTrue(windowMock.navigator.sendBeacon.calledOnce);
              assert.lengthOf(windowMock.navigator.sendBeacon.getCall(0).args, 2);
              assert.equal(windowMock.navigator.sendBeacon.getCall(0).args[0], '/metrics');

              var data = JSON.parse(windowMock.navigator.sendBeacon.getCall(0).args[1]);
              assert.lengthOf(Object.keys(data), 25);
              assert.equal(data.broker, 'none');
              assert.equal(data.context, Constants.CONTENT_SERVER_CONTEXT);
              assert.isNumber(data.duration);
              assert.equal(data.entrypoint, 'none');
              assert.isArray(data.events);
              assert.lengthOf(data.events, 3);
              assert.equal(data.events[0].type, 'foo');
              assert.equal(data.events[1].type, 'flow.wibble.begin');
              assert.equal(data.events[2].type, 'qux');
              assert.equal(data.flowId, 'bar');
              assert.equal(data.flowBeginTime, 'baz');
              assert.equal(data.isSampledUser, false);
              assert.equal(data.lang, 'unknown');
              assert.isArray(data.marketing);
              assert.isArray(data.experiments);
              assert.equal(data.migration, 'none');
              assert.isObject(data.navigationTiming);
              assert.equal(data.referrer, 'https://marketplace.firefox.com');
              assert.isObject(data.screen);
              assert.equal(data.service, 'none');
              assert.isDefined(data.startTime);
              assert.isDefined(data.flushTime);
              assert.isObject(data.timers);
              assert.lengthOf(Object.keys(data.timers), 0);
              assert.equal(data.utm_campaign, 'none');
              assert.equal(data.utm_content, 'none');
              assert.equal(data.utm_medium, 'none');
              assert.equal(data.utm_source, 'none');
              assert.equal(data.utm_term, 'none');
            });

            it('resolves to true', function () {
              assert.isTrue(result);
            });

            it('clears the event stream', function () {
              assert.equal(metrics.getFilteredData().events.length, 0);
            });

            describe('log a second flow.begin event with same flowId', function () {
              beforeEach(function () {
                metrics.logFlowBegin('bar', 'blee', 'hong');
                metrics.logEvent('wibble');
                return metrics.flush();
              });

              it('calls sendBeacon correctly', function () {
                assert.equal(windowMock.navigator.sendBeacon.callCount, 2);
                var data = JSON.parse(windowMock.navigator.sendBeacon.args[1][1]);
                assert.isArray(data.events);
                assert.lengthOf(data.events, 1);
                assert.equal(data.events[0].type, 'wibble');
                assert.equal(data.flowId, 'bar');
                assert.equal(data.flowBeginTime, 'baz');
              });
            });
          });

          describe('flush, sendBeacon fails', function () {
            var result;

            beforeEach(function (done) {
              sandbox.stub(windowMock.navigator, 'sendBeacon', function () {
                return false;
              });
              metrics.flush().then(function (r) {
                result = r;
                done();
              }, done);
            });

            afterEach(function () {
              result = undefined;
            });

            it('resolves to false', function () {
              assert.isFalse(result);
            });

            it('does not clear the event stream', function () {
              assert.equal(metrics.getFilteredData().events.length, 3);
            });
          });
        });

        describe('does not have sendBeacon', function () {
          beforeEach(function () {
            sandbox.stub(environment, 'hasSendBeacon', function () {
              return false;
            });
          });

          describe('flush, ajax succeeds synchronously', function () {
            var result;

            beforeEach(function () {
              sandbox.stub(xhr, 'ajax', function () {
                return p(true);
              });
              metrics.logEvent('baz');
              return metrics.flush(true).then(function (r) {
                result = r;
              });
            });

            afterEach(function () {
              result = undefined;
            });

            it('calls ajax correctly', function () {
              assert.isTrue(xhr.ajax.calledOnce);
              assert.lengthOf(xhr.ajax.getCall(0).args, 1);

              var settings = xhr.ajax.getCall(0).args[0];
              assert.isObject(settings);
              assert.lengthOf(Object.keys(settings), 5);
              assert.isFalse(settings.async);
              assert.equal(settings.type, 'POST');
              assert.equal(settings.url, '/metrics');
              assert.equal(settings.contentType, 'application/json');

              var data = JSON.parse(settings.data);
              assert.lengthOf(Object.keys(data), 25);
              assert.isArray(data.events);
              assert.lengthOf(data.events, 4);
              assert.equal(data.events[0].type, 'foo');
              assert.equal(data.events[1].type, 'flow.wibble.begin');
              assert.equal(data.events[2].type, 'qux');
              assert.equal(data.events[3].type, 'baz');
            });

            it('resolves to true', function () {
              assert.isTrue(result);
            });

            it('clears the event stream', function () {
              assert.equal(metrics.getFilteredData().events.length, 0);
            });
          });

          describe('flush, ajax succeeds asynchronously', function () {
            beforeEach(function () {
              sandbox.stub(xhr, 'ajax', function () {
                return p(true);
              });
              return metrics.flush();
            });

            it('calls ajax correctly', function () {
              var settings = xhr.ajax.getCall(0).args[0];
              assert.isTrue(settings.async);
            });
          });

          describe('flush, ajax fails', function () {
            var result;

            beforeEach(function () {
              sandbox.stub(xhr, 'ajax', function () {
                return p.reject();
              });
              return metrics.flush().then(function (r) {
                result = r;
              });
            });

            afterEach(function () {
              result = undefined;
            });

            it('resolves to false', function () {
              assert.isFalse(result);
            });

            it('does not clear the event stream', function () {
              assert.equal(metrics.getFilteredData().events.length, 3);
            });
          });
        });

        describe('sends filtered data to the server on window unload', function () {
          beforeEach(function (done) {
            sandbox.stub(metrics, '_send', function () {
              done();
            });
            metrics.logEvent('wibble');
            $(windowMock).trigger('unload');
          });

          it('calls _send correctly', function () {
            assert.isTrue(metrics._send.calledOnce);
            assert.lengthOf(metrics._send.getCall(0).args, 2);
            assert.isTrue(metrics._send.getCall(0).args[1]);

            var data = metrics._send.getCall(0).args[0];
            assert.lengthOf(Object.keys(data), 25);
            assert.lengthOf(data.events, 4);
            assert.equal(data.events[0].type, 'foo');
            assert.equal(data.events[1].type, 'flow.wibble.begin');
            assert.equal(data.events[2].type, 'qux');
            assert.equal(data.events[3].type, 'wibble');
          });
        });

        describe('sends filtered data to the server on window blur', function () {
          beforeEach(function (done) {
            sandbox.stub(metrics, '_send', function () {
              done();
            });
            metrics.logEvent('blee');
            $(windowMock).trigger('blur');
          });

          it('calls _send correctly', function () {
            assert.isTrue(metrics._send.calledOnce);
            assert.lengthOf(metrics._send.getCall(0).args, 2);
            assert.isTrue(metrics._send.getCall(0).args[1]);

            var data = metrics._send.getCall(0).args[0];
            assert.lengthOf(Object.keys(data), 25);
            assert.lengthOf(data.events, 4);
            assert.equal(data.events[0].type, 'foo');
            assert.equal(data.events[1].type, 'flow.wibble.begin');
            assert.equal(data.events[2].type, 'qux');
            assert.equal(data.events[3].type, 'blee');
          });
        });

        describe('automatic flush after inactivityFlushMs', function () {
          beforeEach(function (done) {
            sandbox.stub(metrics, 'logEvent', function () {});
            sandbox.stub(metrics, 'flush', function () {
              done();
            });
          });

          it('calls logEvent correctly', function () {
            assert.isTrue(metrics.logEvent.calledOnce);
            assert.lengthOf(metrics.logEvent.getCall(0).args, 1);
            assert.equal(metrics.logEvent.getCall(0).args[0], 'inactivity.flush');
          });

          it('calls flush correctly', function () {
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
          });
        });
      });

      describe('flush, no events or timers', function () {
        beforeEach(function () {
          sandbox.stub(environment, 'hasSendBeacon', function () {
            return true;
          });
          sandbox.stub(windowMock.navigator, 'sendBeacon', function () {});
          return metrics.flush();
        });

        it('does not send data', function () {
          assert.equal(windowMock.navigator.sendBeacon.callCount, 0);
        });
      });

      describe('flush with timer', function () {
        beforeEach(function (done) {
          sandbox.stub(environment, 'hasSendBeacon', function () {
            return true;
          });
          sandbox.stub(windowMock.navigator, 'sendBeacon', function () {});
          metrics.startTimer('foo');
          setTimeout(function () {
            metrics.stopTimer('foo');
            metrics.flush().then(function () {
              done();
            });
          }, 4);
        });

        it('sends data', function () {
          assert.equal(windowMock.navigator.sendBeacon.callCount, 1);
          var data = JSON.parse(windowMock.navigator.sendBeacon.getCall(0).args[1]);
          assert.isArray(data.events);
          assert.lengthOf(data.events, 0);
          assert.isObject(data.timers);
          assert.lengthOf(Object.keys(data.timers), 1);
          assert.isArray(data.timers.foo);
          assert.lengthOf(data.timers.foo, 1);
          assert.isObject(data.timers.foo[0]);
          assert.isTrue(data.timers.foo[0].elapsed >= 4);
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

    describe('logView', function () {
      it('logs the screen', function () {
        metrics.logView('signup');
        assert.isTrue(TestHelpers.isViewLogged(metrics, 'signup'));
      });
    });

    describe('logViewEvent', function () {
      beforeEach(function () {
        metrics.logViewEvent('view-name', 'event1');
      });

      it('logs an event with the view name as a prefix to the event stream', function () {
        assert.isTrue(TestHelpers.isEventLogged(metrics, 'view-name.event1'));
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

    describe('logExperiment', function () {
      it('logs the experiment name and group', function () {
        var experiment = 'mailcheck';
        var group = 'group';

        metrics.logExperiment();
        assert.equal(Object.keys(metrics._activeExperiments).length, 0);
        metrics.logExperiment(experiment);
        assert.equal(Object.keys(metrics._activeExperiments).length, 0);
        metrics.logExperiment(experiment, group);
        assert.equal(Object.keys(metrics._activeExperiments).length, 1);
        assert.isDefined(metrics._activeExperiments['mailcheck']);
      });
    });

    it('metrics.logFlowEvent', () => {
      metrics.logFlowEvent('foo', 'signin');
      metrics.logFlowEvent('foo', 'signin');
      metrics.logFlowEvent('bar', 'oauth.signin');
      metrics.logFlowEvent('baz');

      const events = metrics.getFilteredData().events;
      assert.equal(events.length, 4);
      assert.equal(events[0].type, 'flow.signin.foo');
      assert.equal(events[1].type, 'flow.signin.foo');
      assert.equal(events[2].type, 'flow.signin.bar');
      assert.equal(events[3].type, 'flow.baz');
    });

    it('metrics.logFlowEventOnce', () => {
      metrics.logFlowEventOnce('foo', 'signin');
      metrics.logFlowEventOnce('foo', 'signin');
      metrics.logFlowEventOnce('foo', 'signup');

      const events = metrics.getFilteredData().events;
      assert.equal(events.length, 2);
      assert.equal(events[0].type, 'flow.signin.foo');
      assert.equal(events[1].type, 'flow.signup.foo');
    });
  });
});
