/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'client/lib/metricsContext',
], function(t, assert, metricsContext) {
  'use strict';

  t.suite('metricsContext', function() {
    t.test('interface is correct', function() {
      assert.isObject(metricsContext);
      assert.lengthOf(Object.keys(metricsContext), 1);
      assert.isFunction(metricsContext.marshall);
    });

    t.test('marshall returns correct data', function() {
      var input = {
        context: 'fx_desktop_v3',
        deviceId: '0123456789abcdef0123456789abcdef',
        entrypoint: 'menupanel',
        entrypointExperiment: 'wibble',
        entrypointVariation: 'blee',
        flowBeginTime: 1479815991573,
        flowId:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        migration: 'sync11',
        service: 'sync',
        utmCampaign: 'foo',
        utmContent: 'bar',
        utmMedium: 'baz',
        utmSource: 'qux',
        utmTerm: 'wibble',
      };

      assert.deepEqual(metricsContext.marshall(input), {
        deviceId: input.deviceId,
        entrypoint: 'menupanel',
        entrypointExperiment: 'wibble',
        entrypointVariation: 'blee',
        flowBeginTime: input.flowBeginTime,
        flowId: input.flowId,
        utmCampaign: 'foo',
        utmContent: 'bar',
        utmMedium: 'baz',
        utmSource: 'qux',
        utmTerm: 'wibble',
      });
    });
  });
});
