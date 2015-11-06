/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var p = require('lib/promise');
  var requireOnDemand = require('lib/require-on-demand');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('lib/require-on-demand', function () {
    var sandbox;
    var MockModule1 = {};
    var MockModule2 = {};

    describe('successful load', function () {
      beforeEach(function () {
        sandbox = sinon.sandbox.create();

        sandbox.stub(window, 'require', function (moduleList, callback) {
          // requirejs is asynchronous, add a setTimeout to mimic that behavior.
          setTimeout(function () {
            var requestedModule = moduleList[0];
            if (requestedModule === 'nocache!module1') {
              callback(MockModule1);
            } else if (requestedModule === 'nocache!module2') {
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

    describe('unsuccessful load', function () {
      var errType;

      beforeEach(function () {
        sandbox = sinon.sandbox.create();

        sandbox.stub(window, 'require', function (moduleList, callback, errback) {
          // requirejs is asynchronous, add a setTimeout to mimic that behavior.
          setTimeout(function () {
            errback({
              requireModules: [moduleList],
              requireType: errType
            });
          }, 0);
        });
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('fails if there is a timeout fetching the resource', function () {
        errType = 'timeout';
        return requireOnDemand('module1')
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'TIMEOUT'));
          });
      });

      it('fails if there is a scripterror fetching the resource', function () {
        errType = 'scripterror';
        return requireOnDemand('module1')
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'SCRIPTERROR'));
          });
      });

      it('fails if there is resource does not contain a define', function () {
        errType = 'nodefine';
        return requireOnDemand('module1')
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'NODEFINE'));
          });
      });
    });
  });
});

