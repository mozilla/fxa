/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Constants from 'lib/constants';
import Environment from 'lib/environment';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import SubscriptionModel from 'models/subscription';
import TestHelpers from '../../lib/helpers';
import WindowMock from '../../mocks/window';

const FLOW_ID =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const FLOW_BEGIN_TIME = 1484923219448;
const MARKETING_CAMPAIGN = 'campaign1';
const MARKETING_CAMPAIGN_URL = 'https://accounts.firefox.com';

describe('lib/metrics', function() {
  let metrics;
  let notifier;
  let windowMock;

  function createMetrics(options) {
    options = options || {};

    notifier = new Notifier();
    sinon.spy(notifier, 'on');

    metrics = new Metrics(
      _.defaults(options, {
        brokerType: 'fx-desktop-v3',
        clientHeight: 966,
        clientWidth: 1033,
        context: 'fx_desktop_v3',
        devicePixelRatio: 2,
        entrypoint: 'menupanel',
        entrypointExperiment: 'wibble',
        entrypointVariation: 'blee',
        isSampledUser: true,
        lang: 'db_LB',
        notifier,
        screenHeight: 1200,
        screenWidth: 1600,
        service: 'sync',
        startTime: 1439233336187,
        uniqueUserId: '0ae7fe2b-244f-4a78-9857-dff3ae263927',
        utmCampaign: 'utm_campaign',
        utmContent: 'utm_content',
        utmMedium: 'utm_medium',
        utmSource: 'none',
        utmTerm: '',
        window: windowMock,
      })
    );
    sinon.spy(metrics, '_initializeSubscriptionModel');
  }

  beforeEach(function() {
    windowMock = new WindowMock();
    windowMock.document.referrer = 'https://marketplace.firefox.com';
    $(windowMock.document.body).attr('data-flow-id', FLOW_ID);
    $(windowMock.document.body).attr('data-flow-begin', FLOW_BEGIN_TIME);

    createMetrics();
  });

  afterEach(function() {
    metrics.destroy();
    metrics = null;
  });

  it('has the expected notifications', () => {
    assert.lengthOf(Object.keys(metrics.notifications), 8);

    assert.isTrue('flow.initialize' in metrics.notifications);
    assert.isTrue('flow.event' in metrics.notifications);
    assert.isTrue('set-email-domain' in metrics.notifications);
    assert.isTrue('set-sync-engines' in metrics.notifications);
    assert.equal(
      metrics.notifications['subscription.initialize'],
      '_initializeSubscriptionModel'
    );
    assert.isTrue('set-uid' in metrics.notifications);
    assert.isTrue('clear-uid' in metrics.notifications);
    assert.isTrue('once!view-shown' in metrics.notifications);
  });

  it('observable flow state is correct', () => {
    assert.isUndefined(metrics.getFlowModel());
    assert.deepEqual(metrics.getFlowEventMetadata(), {
      deviceId: undefined,
      entrypoint: 'menupanel',
      entrypointExperiment: 'wibble',
      entrypointVariation: 'blee',
      flowBeginTime: undefined,
      flowId: undefined,
      planId: undefined,
      productId: undefined,
      utmCampaign: 'utm_campaign',
      utmContent: 'utm_content',
      utmMedium: 'utm_medium',
      utmSource: undefined,
      utmTerm: undefined,
    });
  });

  it('observable subscription state is correct', () => {
    assert.equal(metrics._initializeSubscriptionModel.callCount, 0);
    const subscriptionModel = metrics.getSubscriptionModel();
    assert.instanceOf(subscriptionModel, SubscriptionModel);
    assert.equal(subscriptionModel.get('planId'), null);
    assert.equal(subscriptionModel.get('productId'), null);
  });

  it('deviceId defaults to NOT_REPORTED_VALUE', () => {
    assert.equal(metrics.getAllData().deviceId, 'none');
  });

  describe('trigger flow.initialize event', () => {
    beforeEach(() => {
      notifier.trigger('flow.initialize');
    });

    it('observable flow state is correct', () => {
      assert.equal(metrics.getFlowModel().get('flowId'), FLOW_ID);
      assert.equal(metrics.getFlowModel().get('flowBegin'), FLOW_BEGIN_TIME);
      const metadata = metrics.getFlowEventMetadata();
      assert.match(metadata.deviceId, /^[0-9a-f]{32}$/);
      assert.equal(metadata.flowBeginTime, FLOW_BEGIN_TIME);
      assert.equal(metadata.flowId, FLOW_ID);
      assert.equal(metadata.utmCampaign, 'utm_campaign');
      assert.equal(metadata.utmContent, 'utm_content');
      assert.equal(metadata.utmMedium, 'utm_medium');
      assert.equal(metadata.utmSource, undefined);
      assert.equal(metadata.utmTerm, undefined);
    });

    it('flow events are triggered correctly', () => {
      notifier.trigger('flow.event', { event: 'foo', viewName: 'signin' });
      notifier.trigger('flow.event', { event: 'foo', viewName: 'signin' });
      notifier.trigger('flow.event', {
        event: 'bar',
        viewName: 'oauth.signin',
      });
      notifier.trigger('flow.event', { event: 'baz' });

      const events = metrics.getFilteredData().events;
      assert.equal(events.length, 4);
      assert.equal(events[0].type, 'flow.signin.foo');
      assert.equal(events[1].type, 'flow.signin.foo');
      assert.equal(events[2].type, 'flow.signin.bar');
      assert.equal(events[3].type, 'flow.baz');
    });

    it('flow events are triggered correctly with once=true', () => {
      notifier.trigger('flow.event', {
        event: 'foo',
        once: true,
        viewName: 'signin',
      });
      notifier.trigger('flow.event', {
        event: 'foo',
        once: true,
        viewName: 'signin',
      });
      notifier.trigger('flow.event', {
        event: 'foo',
        once: true,
        viewName: 'signup',
      });

      const events = metrics.getFilteredData().events;
      assert.equal(events.length, 2);
      assert.equal(events[0].type, 'flow.signin.foo');
      assert.equal(events[1].type, 'flow.signup.foo');
    });

    describe('trigger flow.initialize event with fresh data', () => {
      beforeEach(() => {
        $(windowMock.document.body).attr(
          'data-flow-id',
          'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
        );
        $(windowMock.document.body).attr('data-flow-begin', 1484930216699);
        notifier.trigger('flow.initialize');
      });

      it('observable flow state is correct', () => {
        assert.equal(metrics.getFlowModel().get('flowId'), FLOW_ID);
        assert.equal(metrics.getFlowModel().get('flowBegin'), FLOW_BEGIN_TIME);
        const metadata = metrics.getFlowEventMetadata();
        assert.match(metadata.deviceId, /^[0-9a-f]{32}$/);
        assert.equal(metadata.flowBeginTime, FLOW_BEGIN_TIME);
        assert.equal(metadata.flowId, FLOW_ID);
        assert.equal(metadata.utmCampaign, 'utm_campaign');
        assert.equal(metadata.utmContent, 'utm_content');
        assert.equal(metadata.utmMedium, 'utm_medium');
        assert.equal(metadata.utmSource, undefined);
        assert.equal(metadata.utmTerm, undefined);
      });
    });
  });

  describe('trigger subscription.initialize event with explicit model', () => {
    let subscriptionModel;

    beforeEach(() => {
      subscriptionModel = new SubscriptionModel({
        planId: 'foo',
        productId: 'bar',
      });
      notifier.trigger('subscription.initialize', subscriptionModel);
    });

    it('observable subscription state is correct', () => {
      assert.equal(metrics._initializeSubscriptionModel.callCount, 1);
      assert.equal(metrics.getSubscriptionModel(), subscriptionModel);
      assert.equal(subscriptionModel.get('planId'), 'foo');
      assert.equal(subscriptionModel.get('productId'), 'bar');
    });

    it('subscription state is available in metrics metadata', () => {
      const metadata = metrics.getFlowEventMetadata();
      assert.equal(metadata.planId, 'foo');
      assert.equal(metadata.productId, 'bar');
    });
  });

  describe('trigger subscription.initialize event with url params', () => {
    beforeEach(() => {
      windowMock.location.search = 'foo=bar&plan=wibble';
      windowMock.location.pathname = '/subscriptions/products/prod_blee';
      notifier.trigger('subscription.initialize');
    });

    it('observable subscription state is correct', () => {
      assert.equal(metrics._initializeSubscriptionModel.callCount, 1);
      const subscriptionModel = metrics.getSubscriptionModel();
      assert.instanceOf(subscriptionModel, SubscriptionModel);
      assert.equal(subscriptionModel.get('planId'), 'wibble');
      assert.equal(subscriptionModel.get('productId'), 'prod_blee');
    });
  });

  describe('getFilteredData', function() {
    it('gets data that is allowed to be sent to the server', function() {
      var filteredData = metrics.getFilteredData();

      // ensure results are filtered and no unexpected data makes it through.
      for (var key in filteredData) {
        assert.include(metrics.ALLOWED_FIELDS, key);
      }
    });

    it('gets non-optional fields', function() {
      var filteredData = metrics.getFilteredData();

      assert.isTrue(filteredData.hasOwnProperty('events'));
      assert.isTrue(filteredData.hasOwnProperty('timers'));
      assert.isTrue(filteredData.hasOwnProperty('navigationTiming'));
      assert.isTrue(filteredData.hasOwnProperty('duration'));

      assert.equal(filteredData.context, 'fx_desktop_v3');
      assert.equal(filteredData.service, 'sync');
      assert.equal(filteredData.broker, 'fx-desktop-v3');
      assert.equal(filteredData.lang, 'db_LB');
      assert.equal(filteredData.emailDomain, 'none');
      assert.equal(filteredData.entrypoint, 'menupanel');
      assert.equal(filteredData.entrypoint_experiment, 'wibble');
      assert.equal(filteredData.entrypoint_variation, 'blee');
      assert.equal(filteredData.migration, 'none');
      assert.equal(
        filteredData.uniqueUserId,
        '0ae7fe2b-244f-4a78-9857-dff3ae263927'
      );
      assert.equal(filteredData.startTime, 1439233336187);

      assert.equal(filteredData.referrer, 'https://marketplace.firefox.com');
      assert.equal(filteredData.screen.width, 1600);
      assert.equal(filteredData.screen.height, 1200);
      assert.equal(filteredData.screen.devicePixelRatio, 2);
      assert.equal(filteredData.screen.clientWidth, 1033);
      assert.equal(filteredData.screen.clientHeight, 966);
      assert.deepEqual(filteredData.syncEngines, []);

      assert.isTrue(filteredData.isSampledUser);

      assert.equal(filteredData.utm_campaign, 'utm_campaign');
      assert.equal(filteredData.utm_content, 'utm_content');
      assert.equal(filteredData.utm_medium, 'utm_medium');
      assert.equal(filteredData.utm_source, 'none');
      assert.equal(filteredData.utm_term, 'none');
    });
  });

  describe('logEvent', function() {
    it('adds events to output data', function() {
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

  describe('logEventOnce', function() {
    it('adds events to output data', function() {
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event3');

      var filteredData = metrics.getFilteredData();
      assert.equal(filteredData.events.length, 2);
      assert.equal(filteredData.events[0].type, 'event1');
      assert.equal(filteredData.events[1].type, 'event3');
    });
  });

  describe('markEventLogged', function() {
    it('does not log an event if marked logged', function() {
      metrics.markEventLogged('event2');
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event2');

      const filteredData = metrics.getFilteredData();
      assert.equal(filteredData.events.length, 1);
      assert.equal(filteredData.events[0].type, 'event1');
    });
  });

  describe('startTimer/stopTimer', function() {
    it('adds a timer to output data', function() {
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

  describe('create and initialise metrics', function() {
    var sandbox, xhr, environment;

    beforeEach(function() {
      metrics.destroy();

      sandbox = sinon.sandbox.create();
      xhr = { ajax() {} };
      environment = new Environment(windowMock);
      metrics = new Metrics({
        environment: environment,
        inactivityFlushMs: 100,
        notifier,
        window: windowMock,
        xhr: xhr,
      });
      notifier.trigger('set-uid', 'mock uid');
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe('log events', function() {
      beforeEach(function() {
        notifier.trigger('flow.initialize');
        metrics.logEvent('foo');
        notifier.trigger('flow.event', { event: 'bar', once: true });
        metrics.logEvent('baz');
        notifier.trigger('view-shown', { viewName: 'wibble' });
        // trigger `view-shown` twice, ensure it's only logged once.
        notifier.trigger('view-shown', { viewName: 'blee' });
        notifier.trigger(
          'subscription.initialize',
          new SubscriptionModel({
            planId: 'plid',
            productId: 'pid',
          })
        );
      });

      describe('has sendBeacon', function() {
        beforeEach(function() {
          sandbox.stub(environment, 'hasSendBeacon').callsFake(function() {
            return true;
          });
        });

        describe('flush, sendBeacon succeeds', function() {
          var result;

          beforeEach(function() {
            sandbox
              .stub(windowMock.navigator, 'sendBeacon')
              .callsFake(function() {
                return true;
              });
            metrics.logNumStoredAccounts(2);
            return metrics.flush().then(function(r) {
              result = r;
            });
          });

          afterEach(function() {
            result = undefined;
          });

          it('calls sendBeacon correctly', function() {
            assert.isTrue(windowMock.navigator.sendBeacon.calledOnce);
            assert.lengthOf(windowMock.navigator.sendBeacon.getCall(0).args, 2);
            assert.equal(
              windowMock.navigator.sendBeacon.getCall(0).args[0],
              '/metrics'
            );

            var data = JSON.parse(
              windowMock.navigator.sendBeacon.getCall(0).args[1]
            );
            assert.lengthOf(Object.keys(data), 36);
            assert.equal(data.broker, 'none');
            assert.equal(data.context, Constants.CONTENT_SERVER_CONTEXT);
            assert.match(data.deviceId, /^[0-9a-f]{32}$/);
            assert.isNumber(data.duration);
            assert.equal(data.emailDomain, 'none');
            assert.equal(data.entrypoint, 'none');
            assert.equal(data.entrypoint_experiment, 'none');
            assert.equal(data.entrypoint_variation, 'none');
            assert.isArray(data.events);
            assert.lengthOf(data.events, 4);
            assert.equal(data.events[0].type, 'foo');
            assert.equal(data.events[1].type, 'flow.bar');
            assert.equal(data.events[2].type, 'baz');
            assert.equal(data.events[3].type, 'loaded');
            assert.equal(data.flowId, FLOW_ID);
            assert.equal(data.flowBeginTime, FLOW_BEGIN_TIME);
            assert.equal(data.initialView, 'wibble');
            assert.equal(data.isSampledUser, false);
            assert.equal(data.lang, 'unknown');
            assert.isArray(data.marketing);
            assert.isArray(data.experiments);
            assert.equal(data.migration, 'none');
            assert.isObject(data.navigationTiming);
            assert.equal(data.numStoredAccounts, 2);
            assert.equal(data.referrer, 'https://marketplace.firefox.com');
            assert.isObject(data.screen);
            assert.equal(data.service, 'none');
            assert.isDefined(data.startTime);
            assert.deepEqual(data.syncEngines, []);
            assert.isDefined(data.flushTime);
            assert.isObject(data.timers);
            assert.lengthOf(Object.keys(data.timers), 0);
            assert.equal(data.planId, 'plid');
            assert.equal(data.productId, 'pid');
            assert.equal(data.uid, 'mock uid');
            assert.equal(data.utm_campaign, 'none');
            assert.equal(data.utm_content, 'none');
            assert.equal(data.utm_medium, 'none');
            assert.equal(data.utm_source, 'none');
            assert.equal(data.utm_term, 'none');
            assert.isObject(data.userPreferences);
          });

          it('resolves to true', function() {
            assert.isTrue(result);
          });

          it('clears the event stream', function() {
            assert.equal(metrics.getFilteredData().events.length, 0);
          });

          describe('log a duplicate flow event', function() {
            beforeEach(function() {
              notifier.trigger('flow.event', { event: 'bar', once: true });
              metrics.logEvent('baz');
              return metrics.flush();
            });

            it('calls sendBeacon correctly', function() {
              assert.equal(windowMock.navigator.sendBeacon.callCount, 2);
              var data = JSON.parse(windowMock.navigator.sendBeacon.args[1][1]);
              assert.isArray(data.events);
              assert.lengthOf(data.events, 1);
              assert.equal(data.events[0].type, 'baz');
              assert.equal(data.flowId, FLOW_ID);
              assert.equal(data.flowBeginTime, FLOW_BEGIN_TIME);
            });
          });
        });

        describe('sendBeacon after set-email-domain (other domain)', () => {
          beforeEach(() => {
            notifier.trigger('set-email-domain', 'foo@example.com');
            sandbox.spy(windowMock.navigator, 'sendBeacon');
            return metrics.flush();
          });

          it('set emailDomain correctly', () => {
            const data = JSON.parse(windowMock.navigator.sendBeacon.args[0][1]);
            assert.equal(data.emailDomain, 'other');
          });
        });

        describe('sendBeacon after set-email-domain (popular domain)', () => {
          beforeEach(() => {
            notifier.trigger('set-email-domain', 'pmbooth@gmail.com');
            sandbox.spy(windowMock.navigator, 'sendBeacon');
            return metrics.flush();
          });

          it('set emailDomain correctly', () => {
            const data = JSON.parse(windowMock.navigator.sendBeacon.args[0][1]);
            assert.equal(data.emailDomain, 'gmail.com');
          });
        });

        describe('sendBeacon after set-sync-engines', () => {
          beforeEach(() => {
            notifier.trigger('set-sync-engines', ['foo', 'bar']);
            sandbox.spy(windowMock.navigator, 'sendBeacon');
            return metrics.flush();
          });

          it('set syncEngines correctly', () => {
            const data = JSON.parse(windowMock.navigator.sendBeacon.args[0][1]);
            assert.deepEqual(data.syncEngines, ['foo', 'bar']);
          });
        });

        describe('emit clear-uid then flush', () => {
          beforeEach(() => {
            sandbox
              .stub(windowMock.navigator, 'sendBeacon')
              .callsFake(() => true);
            notifier.trigger('clear-uid');
            return metrics.flush();
          });

          it('calls sendBeacon correctly', () => {
            assert.equal(windowMock.navigator.sendBeacon.callCount, 1);
            const data = JSON.parse(
              windowMock.navigator.sendBeacon.getCall(0).args[1]
            );
            assert.equal(data.uid, 'none');
          });
        });

        describe('flush, sendBeacon fails', function() {
          var result;

          beforeEach(function(done) {
            sandbox
              .stub(windowMock.navigator, 'sendBeacon')
              .callsFake(function() {
                return false;
              });
            metrics.flush().then(function(r) {
              result = r;
              done();
            }, done);
          });

          afterEach(function() {
            result = undefined;
          });

          it('resolves to false', function() {
            assert.isFalse(result);
          });

          it('clears the event stream', () => {
            assert.equal(metrics.getFilteredData().events.length, 0);
          });

          it('calls navigator.sendBeacon twice', () => {
            assert.equal(windowMock.navigator.sendBeacon.callCount, 2);
          });
        });
      });

      describe('does not have sendBeacon', function() {
        beforeEach(function() {
          sandbox.stub(environment, 'hasSendBeacon').callsFake(function() {
            return false;
          });
        });

        describe('flush, ajax succeeds synchronously', function() {
          var result;

          beforeEach(function() {
            sandbox.stub(xhr, 'ajax').callsFake(function() {
              return Promise.resolve(true);
            });
            metrics.logEvent('qux');
            return metrics.flush(true).then(function(r) {
              result = r;
            });
          });

          afterEach(function() {
            result = undefined;
          });

          it('calls ajax correctly', function() {
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
            assert.lengthOf(Object.keys(data), 35);
            assert.match(data.deviceId, /^[0-9a-f]{32}$/);
            assert.isArray(data.events);
            assert.lengthOf(data.events, 5);
            assert.equal(data.events[0].type, 'foo');
            assert.equal(data.events[1].type, 'flow.bar');
            assert.equal(data.events[2].type, 'baz');
            assert.equal(data.events[3].type, 'loaded');
            assert.equal(data.events[4].type, 'qux');
            assert.equal(data.uid, 'mock uid');
          });

          it('resolves to true', function() {
            assert.isTrue(result);
          });

          it('clears the event stream', function() {
            assert.equal(metrics.getFilteredData().events.length, 0);
          });
        });

        describe('flush, ajax succeeds asynchronously', function() {
          beforeEach(function() {
            sandbox.stub(xhr, 'ajax').callsFake(function() {
              return Promise.resolve(true);
            });
            return metrics.flush();
          });

          it('calls ajax correctly', function() {
            var settings = xhr.ajax.getCall(0).args[0];
            assert.isTrue(settings.async);
          });
        });

        describe('flush, ajax fails', function() {
          var result;

          beforeEach(function() {
            sandbox.stub(xhr, 'ajax').callsFake(function() {
              return Promise.reject();
            });
            return metrics.flush().then(function(r) {
              result = r;
            });
          });

          afterEach(function() {
            result = undefined;
          });

          it('resolves to false', function() {
            assert.isFalse(result);
          });

          it('clears the event stream', () => {
            assert.equal(metrics.getFilteredData().events.length, 0);
          });

          it('calls xhr.ajax twice', () => {
            assert.equal(xhr.ajax.callCount, 2);
          });
        });
      });

      describe('sends filtered data to the server on window unload', function() {
        beforeEach(function(done) {
          sandbox.stub(metrics, '_send').callsFake(function() {
            done();
          });
          metrics.logEvent('wibble');
          $(windowMock).trigger('unload');
        });

        it('calls _send correctly', function() {
          assert.isTrue(metrics._send.calledOnce);
          assert.lengthOf(metrics._send.getCall(0).args, 2);
          assert.isTrue(metrics._send.getCall(0).args[1]);

          var data = metrics._send.getCall(0).args[0];
          assert.lengthOf(Object.keys(data), 35);
          assert.lengthOf(data.events, 5);
          assert.equal(data.events[0].type, 'foo');
          assert.equal(data.events[1].type, 'flow.bar');
          assert.equal(data.events[2].type, 'baz');
          assert.equal(data.events[3].type, 'loaded');
          assert.equal(data.events[4].type, 'wibble');
        });
      });

      describe('sends filtered data to the server on window blur', function() {
        beforeEach(function(done) {
          sandbox.stub(metrics, '_send').callsFake(function() {
            done();
          });
          metrics.logEvent('blee');
          $(windowMock).trigger('blur');
        });

        it('calls _send correctly', function() {
          assert.isTrue(metrics._send.calledOnce);
          assert.lengthOf(metrics._send.getCall(0).args, 2);
          assert.isTrue(metrics._send.getCall(0).args[1]);

          var data = metrics._send.getCall(0).args[0];
          assert.lengthOf(Object.keys(data), 35);
          assert.lengthOf(data.events, 5);
          assert.equal(data.events[0].type, 'foo');
          assert.equal(data.events[1].type, 'flow.bar');
          assert.equal(data.events[2].type, 'baz');
          assert.equal(data.events[3].type, 'loaded');
          assert.equal(data.events[4].type, 'blee');
        });
      });

      describe('automatic flush after inactivityFlushMs', function() {
        beforeEach(function(done) {
          sandbox.stub(metrics, 'logEvent').callsFake(function() {});
          sandbox.stub(metrics, 'flush').callsFake(function() {
            done();
          });
        });

        it('calls logEvent correctly', function() {
          assert.isTrue(metrics.logEvent.calledOnce);
          assert.lengthOf(metrics.logEvent.getCall(0).args, 1);
          assert.equal(metrics.logEvent.getCall(0).args[0], 'inactivity.flush');
        });

        it('calls flush correctly', function() {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
        });
      });
    });

    describe('flush, no data has changed, flush again', () => {
      beforeEach(function() {
        sandbox.stub(environment, 'hasSendBeacon').callsFake(() => true);
        sandbox.stub(windowMock.navigator, 'sendBeacon').callsFake(() => true);

        metrics.logEvent('event');
        metrics.startTimer('timer1');
        metrics.stopTimer('timer1');
        return metrics.flush().then(() => metrics.flush());
      });

      it('sends data once', function() {
        assert.equal(windowMock.navigator.sendBeacon.callCount, 1);

        const data = JSON.parse(windowMock.navigator.sendBeacon.args[0][1]);
        assert.isUndefined(data.planId);
        assert.isUndefined(data.productId);
      });
    });

    describe('flush, data has changed, flush again', () => {
      beforeEach(function() {
        sandbox.stub(environment, 'hasSendBeacon').callsFake(() => true);
        sandbox.stub(windowMock.navigator, 'sendBeacon').callsFake(() => true);
        metrics.logMarketingImpression(
          MARKETING_CAMPAIGN,
          MARKETING_CAMPAIGN_URL
        );
        return metrics.flush().then(() => {
          metrics.logMarketingClick(MARKETING_CAMPAIGN, MARKETING_CAMPAIGN_URL);
          return metrics.flush();
        });
      });

      it('sends data both times, navigationTiming data only sent on first flush', () => {
        assert.equal(windowMock.navigator.sendBeacon.callCount, 2);

        const firstPayload = JSON.parse(
          windowMock.navigator.sendBeacon.args[0][1]
        );
        assert.isObject(firstPayload.navigationTiming);
        const secondPayload = JSON.parse(
          windowMock.navigator.sendBeacon.args[1][1]
        );
        assert.notProperty(secondPayload, 'navigationTiming');
      });
    });

    describe('flush with timer', function() {
      beforeEach(function(done) {
        sandbox.stub(environment, 'hasSendBeacon').callsFake(function() {
          return true;
        });
        sandbox.stub(windowMock.navigator, 'sendBeacon').callsFake(() => true);
        metrics.startTimer('foo');
        setTimeout(function() {
          metrics.stopTimer('foo');
          metrics.flush().then(function() {
            done();
          });
        }, 4);
      });

      it('sends data', function() {
        assert.equal(windowMock.navigator.sendBeacon.callCount, 1);
        var data = JSON.parse(
          windowMock.navigator.sendBeacon.getCall(0).args[1]
        );
        assert.isArray(data.events);
        assert.lengthOf(data.events, 0);
        assert.isObject(data.timers);
        assert.lengthOf(Object.keys(data.timers), 1);
        assert.isArray(data.timers.foo);
        assert.lengthOf(data.timers.foo, 1);
        assert.isObject(data.timers.foo[0]);
        assert.isAtLeast(data.timers.foo[0].elapsed, 4);
      });
    });

    it('flush is safely re-entrant', () => {
      let sendCount = 0;
      const events = [];

      sandbox.stub(metrics, '_send').callsFake(data => {
        events[sendCount++] = data.events;
        if (sendCount < 3) {
          // Trigger re-entrant flushes the first couple of times
          metrics.logEvent(`reentrant-${sendCount}`);
          metrics.flush();
        } else if (sendCount === 3) {
          assert.lengthOf(events[0], 1);
          assert.equal(events[0][0].type, 'wibble');
          assert.lengthOf(events[1], 1);
          assert.equal(events[1][0].type, 'reentrant-1');
          assert.lengthOf(events[2], 1);
          assert.equal(events[2][0].type, 'reentrant-2');
        } else {
          assert.notOk(sendCount);
        }

        return Promise.resolve(true);
      });

      metrics.logEvent('wibble');
      metrics.flush();
    });
  });

  describe('errorToId', function() {
    it('converts an error into an id that can be used for logging', function() {
      var error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');
      error.viewName = 'sms'; // this should be ignored, context is specified

      var id = metrics.errorToId(error);
      assert.equal(id, 'error.signup.auth.999');
    });

    it('handles a viewName on the error', () => {
      const error = AuthErrors.toError('UNEXPECTED_ERROR');
      error.viewName = 'sms';

      const id = metrics.errorToId(error);
      assert.equal(id, 'error.sms.auth.999');
    });

    it('handles viewName prefix', () => {
      const error = AuthErrors.toError('UNEXPECTED_ERROR');
      error.viewName = 'sms';
      metrics.setViewNamePrefix('signup');

      const id = metrics.errorToId(error);
      assert.equal(id, 'error.signup.sms.auth.999');
    });
  });

  describe('logError', function() {
    it('logs an error', function() {
      var error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');

      metrics.logError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, error));
    });
  });

  describe('logView', function() {
    it('logs the screen', function() {
      metrics.logView('signup');

      assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signup'));
    });

    it('adds the viewName prefix', () => {
      metrics.setViewNamePrefix('signup');
      metrics.logView('sms');
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'screen.signup.sms'));
    });
  });

  describe('logViewEvent', function() {
    beforeEach(function() {
      metrics.logViewEvent('view-name', 'event1');
    });

    it('logs an event with the view name as a prefix to the event stream', function() {
      assert.isTrue(TestHelpers.isEventLogged(metrics, 'view-name.event1'));
    });

    it('adds the viewName prefix', () => {
      metrics.setViewNamePrefix('signup');
      metrics.logViewEvent('view-name', 'event1');
      assert.isTrue(
        TestHelpers.isEventLogged(metrics, 'signup.view-name.event1')
      );
    });
  });

  describe('setBrokerType', function() {
    it('sets the broker name', function() {
      metrics.setBrokerType('fx-desktop-v2');
      var filteredData = metrics.getFilteredData();

      assert.equal(filteredData.broker, 'fx-desktop-v2');
    });
  });

  describe('isCollectionEnabled', function() {
    it('reports that collection is enabled if `isSampledUser===true`', function() {
      assert.isTrue(metrics.isCollectionEnabled());
    });

    it('reports that collection is disabled if `isSampledUser===false`', function() {
      createMetrics({
        isSampledUser: false,
      });
      assert.isFalse(metrics.isCollectionEnabled());
    });
  });

  describe('logMarketingImpression & logMarketingClick', function() {
    it('logs the marketing impression and click', function() {
      assert.isUndefined(
        metrics.getMarketingImpression(
          MARKETING_CAMPAIGN,
          MARKETING_CAMPAIGN_URL
        )
      );
      metrics.logMarketingImpression(
        MARKETING_CAMPAIGN,
        MARKETING_CAMPAIGN_URL
      );
      assert.isFalse(
        metrics.getMarketingImpression(
          MARKETING_CAMPAIGN,
          MARKETING_CAMPAIGN_URL
        ).clicked
      );
      metrics.logMarketingClick(MARKETING_CAMPAIGN, MARKETING_CAMPAIGN_URL);
      assert.isTrue(
        metrics.getMarketingImpression(
          MARKETING_CAMPAIGN,
          MARKETING_CAMPAIGN_URL
        ).clicked
      );
    });
  });

  describe('logExperiment', function() {
    it('logs the experiment name and group', function() {
      var experiment = 'mailcheck';
      var group = 'group';
      sinon.spy(metrics, 'logEvent');
      sinon.spy(metrics, 'logEventOnce');
      notifier.trigger('flow.initialize');

      metrics.logExperiment();
      assert.equal(Object.keys(metrics._activeExperiments).length, 0);
      assert.equal(metrics.logEventOnce.callCount, 1);
      assert.equal(
        metrics.logEventOnce.args[0][0],
        'flow.experiment.undefined.undefined'
      );

      metrics.logExperiment(experiment);
      assert.equal(Object.keys(metrics._activeExperiments).length, 0);
      assert.equal(metrics.logEventOnce.callCount, 2);
      assert.equal(
        metrics.logEventOnce.args[1][0],
        'flow.experiment.mailcheck.undefined'
      );

      metrics.logExperiment(experiment, group);
      assert.equal(Object.keys(metrics._activeExperiments).length, 1);
      assert.isDefined(metrics._activeExperiments['mailcheck']);
      assert.equal(metrics.logEventOnce.callCount, 3);
      assert.equal(
        metrics.logEventOnce.args[2][0],
        'flow.experiment.mailcheck.group'
      );
    });
  });

  describe('logNumStoredAccounts', () => {
    it('correctly stores count', () => {
      assert.equal(metrics.getAllData().numStoredAccounts, '');
      metrics.logNumStoredAccounts(4);
      assert.equal(metrics.getAllData().numStoredAccounts, 4);
    });

    it('correctly reports count', () => {
      sinon.stub(metrics, '_send').callsFake(() => Promise.resolve(true));
      sinon.stub(metrics, '_isFlushRequired').callsFake(() => true);

      return metrics
        .flush()
        .then(() => {
          // not sent if logNumStoredAccounts has not been called
          assert.notProperty(metrics._send.args[0][0], 'numStoredAccounts');

          metrics.logNumStoredAccounts(2);

          return metrics.flush();
        })
        .then(() => {
          // a second flush!
          assert.equal(metrics._send.args[1][0].numStoredAccounts, 2);

          return metrics.flush();
        })
        .then(() => {
          assert.notProperty(metrics._send.args[0][0], 'numStoredAccounts');
        });
    });
  });

  describe('logUserPreferences', () => {
    const userPrefMetrics = {
      'account-recovery': true,
      'two-step-authentication': false,
    };

    it('correctly stores user preference', () => {
      assert.deepEqual(metrics.getAllData().userPreferences, {});
      metrics.logUserPreferences('account-recovery', true);
      metrics.logUserPreferences('two-step-authentication', false);
      assert.deepEqual(metrics.getAllData().userPreferences, userPrefMetrics);
    });

    it('correctly reports user preferences', () => {
      sinon.stub(metrics, '_send').callsFake(() => Promise.resolve(true));
      sinon.stub(metrics, '_isFlushRequired').callsFake(() => true);

      return metrics
        .flush()
        .then(() => {
          assert.deepEqual(metrics.getAllData().userPreferences, {});

          metrics.logUserPreferences('account-recovery', true);
          metrics.logUserPreferences('two-step-authentication', false);

          return metrics.flush();
        })
        .then(() => {
          assert.deepEqual(
            metrics._send.args[1][0].userPreferences,
            userPrefMetrics
          );
        });
    });
  });
});
