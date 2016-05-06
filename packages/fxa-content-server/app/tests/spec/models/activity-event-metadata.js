/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var ActivityEventMetadata = require('models/activity-event-metadata');

  describe('models/activity-event-metadata', function () {
    var activityEventMetadata;

    beforeEach(function () {
      activityEventMetadata = new ActivityEventMetadata({
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
      assert.lengthOf(Object.keys(activityEventMetadata.attributes), 11);
      assert.equal(activityEventMetadata.get('context'), 'mock context');
      assert.equal(activityEventMetadata.get('entrypoint'), 'mock entrypoint');
      assert.equal(activityEventMetadata.get('migration'), 'mock migration');
      assert.equal(activityEventMetadata.get('service'), 'mock service');
      assert.equal(activityEventMetadata.get('utmCampaign'), 'mock utmCampaign');
      assert.equal(activityEventMetadata.get('utmContent'), 'mock utmContent');
      assert.equal(activityEventMetadata.get('utmMedium'), 'mock utmMedium');
      assert.equal(activityEventMetadata.get('utmSource'), 'mock utmSource');
      assert.equal(activityEventMetadata.get('utmTerm'), 'mock utmTerm');
      assert.isUndefined(activityEventMetadata.get('flowBeginTime'));
      assert.isUndefined(activityEventMetadata.get('flowId'));
      assert.isUndefined(activityEventMetadata.get('wibble'));
    });

    describe('activityEventMetadata.set flowBeginTime', function () {
      beforeEach(function () {
        activityEventMetadata.set('flowBeginTime', 'foo');
      });

      it('set flowBeginTime correctly', function () {
        assert.equal(activityEventMetadata.get('flowBeginTime'), 'foo');
      });
    });

    describe('set flowId correctly', function () {
      beforeEach(function () {
        activityEventMetadata.set('flowId', 'foo');
      });

      it('returned a different result object', function () {
        assert.equal(activityEventMetadata.get('flowId'), 'foo');
      });
    });
  });
});

