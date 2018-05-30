/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const $ = require('jquery');
  const assert = require('chai').assert;
  const AuthErrors = require('lib/auth-errors');
  const Flow = require('models/flow');
  const ResumeToken = require('models/resume-token');
  const sinon = require('sinon');
  const Url = require('lib/url');
  const WindowMock = require('../../mocks/window');

  var BODY_FLOW_ID = 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103';
  var RESUME_FLOW_ID = '71031D71031D71031D71031D71031D71031D71031D71031D71031D71031D7103';

  describe('models/flow', function () {
    var flow;
    var sentryMetricsMock;
    var windowMock;
    var metricsMock;

    beforeEach(function () {
      sentryMetricsMock = {
        captureException: sinon.spy()
      };
      metricsMock = {
        markEventLogged: sinon.spy()
      };
      windowMock = new WindowMock();
      $(windowMock.document.body).removeData('flowId').removeAttr('data-flow-id');
      $(windowMock.document.body).removeData('flowBegin').removeAttr('data-flow-begin');
    });

    function createFlow () {
      flow = new Flow({
        metrics: metricsMock,
        sentryMetrics: sentryMetricsMock,
        window: windowMock
      });
    }

    afterEach(function () {
      flow = null;
    });

    it('fetches from the `resume` search parameter, if available', function () {
      windowMock.location.search = Url.objToSearchString({
        resume: ResumeToken.stringify({ flowBegin: 42, flowId: RESUME_FLOW_ID })
      });

      createFlow();

      assert.equal(flow.get('flowId'), RESUME_FLOW_ID);
      assert.equal(flow.get('flowBegin'), 42);
    });

    it('fetches from body data attributes, if available', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '42');

      createFlow();

      assert.equal(flow.get('flowId'), BODY_FLOW_ID);
      assert.equal(flow.get('flowBegin'), 42);
    });

    it('gives preference to values from the `resume` search parameter', function () {
      windowMock.location.search = Url.objToSearchString({
        resume: ResumeToken.stringify({ flowBegin: 42, flowId: RESUME_FLOW_ID })
      });
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '24');

      createFlow();

      assert.equal(flow.get('flowId'), RESUME_FLOW_ID);
      assert.equal(flow.get('flowBegin'), 42);
    });

    it('fetches from query parameters, if available', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '42');

      const QUERY_FLOW_BEGIN = '55';
      const QUERY_FLOW_ID = 'A1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103';

      windowMock.location.search = Url.objToSearchString({
        /*eslint-disable camelcase*/
        flow_begin_time: QUERY_FLOW_BEGIN,
        flow_id: QUERY_FLOW_ID
        /*eslint-enable camelcase*/
      });

      createFlow();

      assert.equal(flow.get('flowId'), QUERY_FLOW_ID);
      assert.equal(flow.get('flowBegin'), QUERY_FLOW_BEGIN);
      assert.ok(metricsMock.markEventLogged.calledOnce);
    });

    it('logs an error when the resume token contains `flowId` but not `flowBegin`', function () {
      windowMock.location.search = Url.objToSearchString({
        resume: ResumeToken.stringify({ flowId: RESUME_FLOW_ID })
      });
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '24');

      createFlow();

      assert.equal(flow.get('flowId'), RESUME_FLOW_ID);
      assert.notOk(flow.has('flowBegin'));

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_RESUME_TOKEN_PROPERTY'));
      assert.strictEqual(args[0].property, 'flowBegin');
    });

    it('logs an error when the resume token contains `flowBegin` but not `flowId`', function () {
      windowMock.location.search = Url.objToSearchString({
        resume: ResumeToken.stringify({ flowBegin: 42 })
      });
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '24');

      createFlow();

      assert.notOk(flow.has('flowId'));
      assert.equal(flow.get('flowBegin'), 42);

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_RESUME_TOKEN_PROPERTY'));
      assert.strictEqual(args[0].property, 'flowId');
    });

    it('logs an error when the DOM contains `flowId` but not `flowBegin`', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);

      createFlow();

      assert.equal(flow.get('flowId'), BODY_FLOW_ID);
      assert.notOk(flow.has('flowBegin'));

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowBegin');
    });

    it('logs an error when the DOM contains `flowBegin` but not `flowId`', function () {
      $(windowMock.document.body).attr('data-flow-begin', '42');

      createFlow();

      assert.notOk(flow.has('flowId'));
      assert.equal(flow.get('flowBegin'), 42);

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowId');
    });

    it('logs two errors when there is no flow data available', function () {
      createFlow();

      assert.notOk(flow.has('flowId'));
      assert.notOk(flow.has('flowBegin'));

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 2);

      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowId');

      args = sentryMetricsMock.captureException.args[1];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'MISSING_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowBegin');
    });

    it('logs an error when `data-flow-id` is too short', function () {
      $(windowMock.document.body).attr('data-flow-id', '123456');
      $(windowMock.document.body).attr('data-flow-begin', '42');

      createFlow();

      assert.notOk(flow.has('flowId'));
      assert.equal(flow.get('flowBegin'), 42);

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'INVALID_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowId');
    });

    it('logs an error when `data-flow-id` is not a hex string', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID.substr(0, 63) + 'X');
      $(windowMock.document.body).attr('data-flow-begin', '42');

      createFlow();

      assert.notOk(flow.has('flowId'));
      assert.equal(flow.get('flowBegin'), 42);

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'INVALID_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowId');
    });

    it('logs an error when `data-flow-begin` is not a number', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', 'forty-two');

      createFlow();

      assert.equal(flow.get('flowId'), BODY_FLOW_ID);
      assert.notOk(flow.has('flowBegin'));

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'INVALID_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowBegin');
    });

    it('logs an error when `data-flow-begin` is not an integer', function () {
      $(windowMock.document.body).attr('data-flow-id', BODY_FLOW_ID);
      $(windowMock.document.body).attr('data-flow-begin', '3.14159265');

      createFlow();

      assert.equal(flow.get('flowId'), BODY_FLOW_ID);
      assert.notOk(flow.has('flowBegin'));

      assert.strictEqual(sentryMetricsMock.captureException.callCount, 1);
      var args = sentryMetricsMock.captureException.args[0];
      assert.lengthOf(args, 1);
      assert.isTrue(AuthErrors.is(args[0], 'INVALID_DATA_ATTRIBUTE'));
      assert.strictEqual(args[0].property, 'flowBegin');
    });
  });
});

