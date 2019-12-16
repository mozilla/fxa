/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Environment from 'lib/environment';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';
import SubscriptionModel from 'models/subscription';
import WindowMock from '../../mocks/window';

const FLOW_ID =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const FLOW_BEGIN_TIME = 1484923219448;
const MARKETING_CAMPAIGN = 'campaign1';
const MARKETING_CAMPAIGN_URL = 'https://accounts.firefox.com';

describe('lib/metrics', () => {
  let environment;
  let metrics;
  let notifier;
  let windowMock;
  let xhr;

  function createMetrics(options = {}) {
    environment = new Environment(windowMock);

    notifier = new Notifier();
    sinon.spy(notifier, 'on');

    xhr = { ajax() {} };

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
        environment,
        inactivityFlushMs: 50,
        isSampledUser: true,
        lang: 'db_LB',
        notifier,
        screenHeight: 1200,
        screenWidth: 1600,
        service: 'sync',
        startTime: 1439233336187,
        uid: '0ae7fe2b244f4a789857dff3ae263927',
        uniqueUserId: '0ae7fe2b-244f-4a78-9857-dff3ae263927',
        utmCampaign: 'utm_campaign',
        utmContent: 'utm_content',
        utmMedium: 'utm_medium',
        utmSource: 'none',
        utmTerm: '',
        window: windowMock,
        xhr,
      })
    );
    sinon.spy(metrics, '_initializeSubscriptionModel');
  }

  beforeEach(() => {
    windowMock = new WindowMock();
    windowMock.document.referrer = 'https://marketplace.firefox.com';
    $(windowMock.document.body).attr('data-flow-id', FLOW_ID);
    $(windowMock.document.body).attr('data-flow-begin', FLOW_BEGIN_TIME);

    createMetrics();
  });

  afterEach(() => {
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

  describe('getFilteredData', () => {
    beforeEach(() => {
      sinon.stub(metrics, 'getFlowEventMetadata').returns({
        flowBeginTime: 123,
        flowId: 'flow-id',
      });
      sinon.stub;

      metrics._setInitialView({ viewName: 'signup' });
      metrics.logNumStoredAccounts(1);
      metrics.logUserPreferences('pref', 'value');
      notifier.trigger(
        'subscription.initialize',
        new SubscriptionModel({
          planId: 'plid',
          productId: 'pid',
        })
      );
    });

    it('gets data that is allowed to be sent to the server', () => {
      const filteredData = metrics.getFilteredData();

      // ensure results are filtered and no unexpected data makes it through.
      assert.lengthOf(
        Object.keys(_.omit(filteredData, metrics.ALLOWED_FIELDS)),
        0
      );
    });

    it('gets non-optional fields', () => {
      const filteredData = metrics.getFilteredData();
      assert.lengthOf(Object.keys(filteredData), 36);

      assert.isTrue(filteredData.hasOwnProperty('events'));
      assert.isTrue(filteredData.hasOwnProperty('timers'));
      assert.isTrue(filteredData.hasOwnProperty('navigationTiming'));
      assert.isTrue(filteredData.hasOwnProperty('duration'));

      assert.equal(filteredData.broker, 'fx-desktop-v3');
      assert.equal(filteredData.context, 'fx_desktop_v3');
      assert.isTrue(filteredData.hasOwnProperty('deviceId'));
      assert.equal(filteredData.emailDomain, 'none');
      assert.equal(filteredData.entrypoint, 'menupanel');
      assert.equal(filteredData.entrypoint_experiment, 'wibble');
      assert.equal(filteredData.entrypoint_variation, 'blee');
      assert.deepEqual(filteredData.experiments, []);
      assert.equal(filteredData.flowBeginTime, 123);
      assert.equal(filteredData.flowId, 'flow-id');
      assert.isNumber(filteredData.flushTime);
      assert.equal(filteredData.initialView, 'signup');
      assert.isTrue(filteredData.isSampledUser);
      assert.equal(filteredData.lang, 'db_LB');
      assert.deepEqual(filteredData.marketing, []);
      assert.equal(filteredData.migration, 'none');
      assert.equal(filteredData.numStoredAccounts, 1);

      assert.equal(filteredData.planId, 'plid');
      assert.equal(filteredData.productId, 'pid');

      assert.equal(filteredData.referrer, 'https://marketplace.firefox.com');
      assert.equal(filteredData.screen.width, 1600);
      assert.equal(filteredData.screen.height, 1200);
      assert.equal(filteredData.screen.devicePixelRatio, 2);
      assert.equal(filteredData.screen.clientWidth, 1033);
      assert.equal(filteredData.screen.clientHeight, 966);
      assert.equal(filteredData.service, 'sync');
      assert.equal(filteredData.startTime, 1439233336187);
      assert.deepEqual(filteredData.syncEngines, []);

      assert.equal(filteredData.uid, '0ae7fe2b244f4a789857dff3ae263927');
      assert.equal(
        filteredData.uniqueUserId,
        '0ae7fe2b-244f-4a78-9857-dff3ae263927'
      );

      assert.deepEqual(filteredData.userPreferences, {
        pref: true,
      });

      assert.equal(filteredData.utm_campaign, 'utm_campaign');
      assert.equal(filteredData.utm_content, 'utm_content');
      assert.equal(filteredData.utm_medium, 'utm_medium');
      assert.equal(filteredData.utm_source, 'none');
      assert.equal(filteredData.utm_term, 'none');
    });
  });

  describe('logEvent', () => {
    it('adds events to output data', () => {
      sinon.stub(metrics, 'flush').resolves({});

      metrics.logEvent('event1');
      metrics.logEvent('event2');
      metrics.logEvent('event3');

      const filteredData = metrics.getFilteredData();
      assert.equal(filteredData.events.length, 3);
      assert.equal(filteredData.events[0].type, 'event1');
      assert.equal(filteredData.events[1].type, 'event2');
      assert.equal(filteredData.events[2].type, 'event3');

      assert.isFalse(metrics.flush.called);
    });

    it('flushes events as soon as a screen.* event is logged', () => {
      sinon.stub(metrics, 'flush').resolves({});

      metrics.logEvent('event1');
      metrics.logEvent('event2');
      metrics.logEvent('event3');
      metrics.logEvent('screen.signin');

      assert.isTrue(metrics.flush.calledOnce);
    });

    it('flushes events as soon as a *.complete event is logged', () => {
      sinon.stub(metrics, 'flush').resolves({});

      metrics.logEvent('event1');
      metrics.logEvent('event2');
      metrics.logEvent('event3');
      metrics.logEvent('signin.complete');

      assert.isTrue(metrics.flush.calledOnce);
    });

    it('flushes events as soon as a *.success event is logged', () => {
      sinon.stub(metrics, 'flush').resolves({});

      metrics.logEvent('event1');
      metrics.logEvent('event2');
      metrics.logEvent('event3');
      metrics.logEvent('signin.success');

      assert.isTrue(metrics.flush.calledOnce);
    });
  });

  describe('logEventOnce', () => {
    it('adds events to output data', () => {
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event3');

      const filteredData = metrics.getFilteredData();
      assert.equal(filteredData.events.length, 2);
      assert.equal(filteredData.events[0].type, 'event1');
      assert.equal(filteredData.events[1].type, 'event3');
    });
  });

  describe('markEventLogged', () => {
    it('does not log an event if marked logged', () => {
      metrics.markEventLogged('event2');
      metrics.logEventOnce('event1');
      metrics.logEventOnce('event2');

      const filteredData = metrics.getFilteredData();
      assert.equal(filteredData.events.length, 1);
      assert.equal(filteredData.events[0].type, 'event1');
    });
  });

  describe('startTimer/stopTimer', () => {
    it('adds a timer to output data', () => {
      metrics.startTimer('timer1');
      metrics.stopTimer('timer1');

      const filteredData = metrics.getFilteredData();
      assert.equal(filteredData.timers.timer1.length, 1);

      const timerData = filteredData.timers.timer1[0];
      assert.ok(timerData.hasOwnProperty('start'));
      assert.ok(timerData.hasOwnProperty('stop'));
      assert.ok(timerData.hasOwnProperty('elapsed'));
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      notifier.trigger('set-uid', 'mock uid');
    });

    describe('flush, no data has changed, flush again', () => {
      beforeEach(async () => {
        sinon.stub(environment, 'hasSendBeacon').callsFake(() => true);
        sinon.stub(windowMock.navigator, 'sendBeacon').callsFake(() => true);

        metrics.logEvent('event');
        metrics.startTimer('timer1');
        metrics.stopTimer('timer1');
        await metrics.flush();
        await metrics.flush();
      });

      it('sends data once', () => {
        assert.equal(windowMock.navigator.sendBeacon.callCount, 1);

        const data = JSON.parse(windowMock.navigator.sendBeacon.args[0][1]);
        assert.isUndefined(data.planId);
        assert.isUndefined(data.productId);
      });
    });

    describe('flush, data has changed, flush again', () => {
      beforeEach(async () => {
        sinon.stub(environment, 'hasSendBeacon').callsFake(() => true);
        sinon.stub(windowMock.navigator, 'sendBeacon').callsFake(() => true);
        metrics.logMarketingImpression(
          MARKETING_CAMPAIGN,
          MARKETING_CAMPAIGN_URL
        );
        await metrics.flush();
        metrics.logMarketingClick(MARKETING_CAMPAIGN, MARKETING_CAMPAIGN_URL);
        await metrics.flush();
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

    describe('flush with timer', () => {
      beforeEach(function(done) {
        sinon.stub(environment, 'hasSendBeacon').returns(true);
        sinon.stub(windowMock.navigator, 'sendBeacon').returns(true);
        metrics.startTimer('foo');
        setTimeout(() => {
          metrics.stopTimer('foo');
          metrics.flush().then(() => {
            done();
          });
        }, 4);
      });

      it('sends data', () => {
        assert.equal(windowMock.navigator.sendBeacon.callCount, 1);
        const data = JSON.parse(
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

      sinon.stub(metrics, '_send').callsFake(data => {
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

  describe('_send', () => {
    const dataToSend = {
      foo: 'bar',
    };

    describe('has sendBeacon', () => {
      beforeEach(() => {
        sinon.stub(environment, 'hasSendBeacon').returns(true);
      });

      it('sendBeacon succeeds resolves to true', async () => {
        sinon.stub(windowMock.navigator, 'sendBeacon').returns(true);
        const result = await metrics._send(dataToSend);
        assert.isTrue(result);
        assert.isTrue(
          windowMock.navigator.sendBeacon.calledOnceWith(
            '/metrics',
            JSON.stringify(dataToSend)
          )
        );
      });

      it('resolves to false', async () => {
        sinon.stub(windowMock.navigator, 'sendBeacon').returns(false);
        const result = await metrics._send(dataToSend);
        assert.isFalse(result);
        assert.isTrue(
          windowMock.navigator.sendBeacon.calledOnceWith(
            '/metrics',
            JSON.stringify(dataToSend)
          )
        );
      });
    });

    describe('does not have sendBeacon', () => {
      beforeEach(() => {
        sinon.stub(environment, 'hasSendBeacon').returns(false);
      });

      it('ajax succeeds synchronously', async () => {
        sinon.stub(xhr, 'ajax').resolves({});

        const result = await metrics._send(dataToSend, true);
        assert.isTrue(result);

        assert.isTrue(xhr.ajax.calledOnce);
        const settings = xhr.ajax.args[0][0];
        assert.isObject(settings);
        assert.lengthOf(Object.keys(settings), 5);
        assert.isFalse(settings.async);
        assert.equal(settings.type, 'POST');
        assert.equal(settings.url, '/metrics');
        assert.equal(settings.contentType, 'application/json');

        const data = JSON.parse(settings.data);
        assert.deepEqual(data, dataToSend);
      });

      it('flush, ajax succeeds asynchronously', async () => {
        sinon.stub(xhr, 'ajax').resolves({});

        await metrics._send(dataToSend, false);
        const settings = xhr.ajax.args[0][0];
        assert.isTrue(settings.async);
      });

      it('flush, ajax fails', async () => {
        sinon.stub(xhr, 'ajax').rejects(new Error('uh oh'));

        const result = await metrics._send(dataToSend, false);
        assert.isFalse(result);
      });
    });
  });

  describe('errorToId', () => {
    it('converts an error into an id that can be used for logging', () => {
      const error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');
      error.viewName = 'sms'; // this should be ignored, context is specified

      const id = metrics.errorToId(error);
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

  describe('logError', () => {
    it('logs an error', () => {
      sinon.stub(metrics, 'logEvent');
      sinon.stub(metrics, 'errorToId').returns('some_error_id');
      const error = AuthErrors.toError('UNEXPECTED_ERROR', 'signup');

      metrics.logError(error);

      assert.isTrue(metrics.logEvent.calledOnceWith('some_error_id'));
      assert.isTrue(metrics.errorToId.calledOnceWith(error));
    });
  });

  describe('logView', () => {
    it('logs the screen', () => {
      sinon.stub(metrics, 'logEvent');
      metrics.logView('signup');

      assert.isTrue(metrics.logEvent.calledOnceWith('screen.signup'));
    });

    it('adds the viewName prefix', () => {
      sinon.stub(metrics, 'logEvent');
      metrics.setViewNamePrefix('signup');
      metrics.logView('sms');
      assert.isTrue(metrics.logEvent.calledOnceWith('screen.signup.sms'));
    });
  });

  describe('logViewEvent', () => {
    beforeEach(() => {
      sinon.stub(metrics, 'logEvent');
    });

    it('logs an event with the view name as a prefix to the event stream', () => {
      metrics.logViewEvent('view-name', 'event1');
      assert.isTrue(metrics.logEvent.calledOnceWith('view-name.event1'));
    });

    it('adds the viewName prefix', () => {
      metrics.setViewNamePrefix('signup');
      metrics.logViewEvent('view-name', 'event1');
      assert.isTrue(metrics.logEvent.calledOnceWith('signup.view-name.event1'));
    });
  });

  describe('setBrokerType', function() {
    it('sets the broker name', function() {
      metrics.setBrokerType('fx-desktop-v3');
      const { broker } = metrics.getFilteredData();

      assert.equal(broker, 'fx-desktop-v3');
    });
  });

  describe('setService', function() {
    it('sets the service identifier', function() {
      metrics.setService('00112233445566');
      const { service } = metrics.getFilteredData();

      assert.equal(service, '00112233445566');
    });
  });

  describe('setService', function() {
    it('sets the service identifier', function() {
      metrics.setService('00112233445566');
      const { service } = metrics.getFilteredData();

      assert.equal(service, '00112233445566');
    });
  });

  describe('isCollectionEnabled', () => {
    it('reports that collection is enabled if `isSampledUser===true`', () => {
      assert.isTrue(metrics.isCollectionEnabled());
    });

    it('reports that collection is disabled if `isSampledUser===false`', () => {
      createMetrics({
        isSampledUser: false,
      });
      assert.isFalse(metrics.isCollectionEnabled());
    });
  });

  describe('logMarketingImpression & logMarketingClick', () => {
    it('logs the marketing impression and click', () => {
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

  describe('logExperiment', () => {
    it('logs the experiment name and group', () => {
      const experiment = 'mailcheck';
      const group = 'group';
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

    it('correctly reports count', async () => {
      sinon.stub(metrics, '_send').callsFake(() => Promise.resolve(true));
      sinon.stub(metrics, '_isFlushRequired').callsFake(() => true);

      await metrics.flush();
      // not sent if logNumStoredAccounts has not been called
      assert.notProperty(metrics._send.args[0][0], 'numStoredAccounts');

      metrics.logNumStoredAccounts(2);

      await metrics.flush();
      // a second flush!
      assert.equal(metrics._send.args[1][0].numStoredAccounts, 2);

      await metrics.flush();
      assert.notProperty(metrics._send.args[0][0], 'numStoredAccounts');
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

    it('correctly reports user preferences', async () => {
      sinon.stub(metrics, '_send').callsFake(() => Promise.resolve(true));
      sinon.stub(metrics, '_isFlushRequired').callsFake(() => true);

      await metrics.flush();
      assert.deepEqual(metrics.getAllData().userPreferences, {});

      metrics.logUserPreferences('account-recovery', true);
      metrics.logUserPreferences('two-step-authentication', false);

      await metrics.flush();
      assert.deepEqual(
        metrics._send.args[1][0].userPreferences,
        userPrefMetrics
      );
    });
  });

  describe('notifier events', () => {
    it('flow.initialize', () => {
      sinon.stub(metrics, '_initializeFlowModel');
      notifier.trigger('flow.initialize');

      assert.isTrue(metrics._initializeFlowModel.calledOnce);
    });

    it('flow.event', () => {
      sinon.stub(metrics, '_logFlowEvent');
      notifier.trigger('flow.event');

      assert.isTrue(metrics._logFlowEvent.calledOnce);
    });

    it('set-email-domain (other)', () => {
      notifier.trigger('set-email-domain', 'foo@example.com');
      assert.equal(metrics.getFilteredData().emailDomain, 'other');
    });

    it('set-email-domain (popular domain)', () => {
      notifier.trigger('set-email-domain', 'pmbooth@gmail.com');
      assert.equal(metrics.getFilteredData().emailDomain, 'gmail.com');
    });

    it('set-sync-engines', () => {
      notifier.trigger('set-sync-engines', ['foo', 'bar']);
      assert.deepEqual(metrics.getFilteredData().syncEngines, ['foo', 'bar']);
    });

    it('set-uid', () => {
      sinon.stub(metrics, '_setUid');
      notifier.trigger('set-uid');

      assert.isTrue(metrics._setUid.calledOnce);
    });

    it('clear-uid', () => {
      sinon.stub(metrics, '_clearUid');
      notifier.trigger('clear-uid');

      assert.isTrue(metrics._clearUid.calledOnce);
    });

    it('subscription.initialize', () => {
      notifier.trigger('subscription.initialize');

      assert.isTrue(metrics._initializeSubscriptionModel.calledOnce);
    });

    it('view-shown', () => {
      sinon.stub(metrics, '_setInitialView');
      // should only call the handler once
      notifier.trigger('view-shown');
      notifier.trigger('view-shown');
      notifier.trigger('view-shown');

      assert.isTrue(metrics._setInitialView.calledOnce);
    });
  });

  describe('DOM events', () => {
    it('flushes on window blur', () => {
      sinon.stub(metrics, 'flush');
      metrics.logEvent('blee');
      $(windowMock).trigger('blur');

      assert.isTrue(metrics.flush.calledOnceWith(true));
    });

    it('flushes on window unload', () => {
      sinon.stub(metrics, 'flush');
      metrics.logEvent('wibble');
      $(windowMock).trigger('unload');

      assert.isTrue(metrics.flush.calledOnceWith(true));
    });
  });

  describe('inactivity timeout', () => {
    it('automatic flushes after inactivityFlushMs', () => {
      return new Promise((resolve, reject) => {
        sinon.stub(metrics, 'logEvent').callsFake(() => {});
        sinon.stub(metrics, 'flush').callsFake(() => {
          try {
            assert.equal(metrics.logEvent.callCount, 2);
            assert.equal(metrics.logEvent.args[0][0], 'flism');
            assert.equal(metrics.logEvent.args[1][0], 'inactivity.flush');
            assert.isTrue(metrics.flush.calledOnce);
            assert.lengthOf(metrics.flush.getCall(0).args, 0);
          } catch (e) {
            return reject(e);
          }

          resolve();
        });

        metrics.logEvent('flism');
      });
    });
  });

  describe('all together now', () => {
    it('flushes as expected', done => {
      sinon.stub(metrics, '_send').resolves(true);

      notifier.trigger('set-uid', 'mock uid');
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
      notifier.trigger('flow.event', { event: 'buz', once: true });
      metrics.logEvent('signin.complete');

      metrics.logEvent('signin.password.incorrect');
      metrics.logEvent('signin.success');

      metrics.logEvent('sent.on.timeout');

      setTimeout(() => {
        try {
          assert.equal(metrics._send.callCount, 3);

          const firstPayload = metrics._send.args[0][0];
          assert.equal(firstPayload.events[0].type, 'foo');
          assert.equal(firstPayload.events[1].type, 'flow.bar');
          assert.equal(firstPayload.events[2].type, 'baz');
          assert.equal(firstPayload.events[3].type, 'loaded');
          assert.equal(firstPayload.events[4].type, 'flow.buz');
          assert.equal(firstPayload.events[5].type, 'signin.complete');

          assert.equal(firstPayload.planId, 'plid');
          assert.equal(firstPayload.productId, 'pid');

          assert.equal(
            metrics._send.args[1][0].events[0].type,
            'signin.password.incorrect'
          );
          assert.equal(
            metrics._send.args[1][0].events[1].type,
            'signin.success'
          );

          assert.equal(
            metrics._send.args[2][0].events[0].type,
            'sent.on.timeout'
          );
          assert.equal(
            metrics._send.args[2][0].events[1].type,
            'inactivity.flush'
          );
        } catch (err) {
          return done(err);
        }

        done();
      }, 50);
    });
  });
});
