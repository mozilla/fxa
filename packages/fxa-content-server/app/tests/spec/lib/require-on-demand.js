/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/promise',
  'lib/require-on-demand',
  'sinon'
], function (chai, p, requireOnDemand, sinon) {
  'use strict';

  var assert = chai.assert;

  describe('lib/require-on-demand', function () {
    var sandbox;
    var MockModule1 = {};
    var MockModule2 = {};

    beforeEach(function () {
      sandbox = sinon.sandbox.create();

      sandbox.stub(window, 'require', function (moduleList, callback) {
        // requirejs is asynchronous, add a setTimeout to mimic that behavior.
        setTimeout(function () {
          var requestedModule = moduleList[0];
          if (requestedModule === 'module1') {
            callback(MockModule1);
          } else if (requestedModule === 'module2') {
            callback(MockModule2);
          }
        }, 0);
      });
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('loads a module', function () {
      return requireOnDemand('module1')
        .then(function (LoadedModule) {
          assert.strictEqual(LoadedModule, MockModule1);
          assert.isTrue(window.require.calledOnce);
        });
    });

    it('multiple calls to requireOnDemand work as expected', function () {
      return p.all([
        requireOnDemand('module1'),
        requireOnDemand('module2')
      ]).spread(function (LoadedModule1, LoadedModule2) {
        assert.strictEqual(LoadedModule1, MockModule1);
        assert.strictEqual(LoadedModule2, MockModule2);
        assert.isTrue(window.require.calledTwice);
      });
    });
  });
});

