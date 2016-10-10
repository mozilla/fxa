/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const assert = require('chai').assert;
  const FlowEventMetadata = require('models/flow-event-metadata');

  describe('models/flow-event-metadata', function () {
    var flowEventMetadata;

    beforeEach(function () {
      flowEventMetadata = new FlowEventMetadata({
        context: 'mock context',
        entrypoint: 'mock entrypoint',
        flowBeginTime: 'mock flowBeginTime',
        flowId: 'mock flowId',
        migration: 'mock migration',
        service: 'mock service',
        utmCampaign: 'mock utmCampaign',
        utmContent: 'mock utmContent',
        utmMedium: 'mock utmMedium',
        utmSource: 'mock utmSource',
        utmTerm: 'mock utmTerm',
        wibble: 'blee'
      });
    });

    it('set initial attributes correctly', function () {
      assert.lengthOf(Object.keys(flowEventMetadata.attributes), 11);
      assert.equal(flowEventMetadata.get('context'), 'mock context');
      assert.equal(flowEventMetadata.get('entrypoint'), 'mock entrypoint');
      assert.equal(flowEventMetadata.get('migration'), 'mock migration');
      assert.equal(flowEventMetadata.get('service'), 'mock service');
      assert.equal(flowEventMetadata.get('utmCampaign'), 'mock utmCampaign');
      assert.equal(flowEventMetadata.get('utmContent'), 'mock utmContent');
      assert.equal(flowEventMetadata.get('utmMedium'), 'mock utmMedium');
      assert.equal(flowEventMetadata.get('utmSource'), 'mock utmSource');
      assert.equal(flowEventMetadata.get('utmTerm'), 'mock utmTerm');
      assert.isUndefined(flowEventMetadata.get('flowBeginTime'));
      assert.isUndefined(flowEventMetadata.get('flowId'));
      assert.isUndefined(flowEventMetadata.get('wibble'));
    });

    describe('flowEventMetadata.set flowBeginTime', function () {
      beforeEach(function () {
        flowEventMetadata.set('flowBeginTime', 'foo');
      });

      it('set flowBeginTime correctly', function () {
        assert.equal(flowEventMetadata.get('flowBeginTime'), 'foo');
      });
    });

    describe('set flowId correctly', function () {
      beforeEach(function () {
        flowEventMetadata.set('flowId', 'foo');
      });

      it('returned a different result object', function () {
        assert.equal(flowEventMetadata.get('flowId'), 'foo');
      });
    });
  });
});

