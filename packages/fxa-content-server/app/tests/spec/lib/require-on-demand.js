/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const requireOnDemand = require('lib/require-on-demand');
  const sinon = require('sinon');

  describe('lib/require-on-demand', function () {
    var MockModule1 = {};
    var MockModule2 = {};
    var windowMock;

    describe('successful load', function () {
      beforeEach(function () {
        windowMock = {
          require: sinon.spy((moduleList, callback) => {
            // requirejs is asynchronous, add a setTimeout to mimic that behavior.
            setTimeout(() => {
              var requestedModule = moduleList[0];
              if (requestedModule === 'module1') {
                callback(MockModule1);
              } else if (requestedModule === 'module2') {
                callback(MockModule2);
              }
            }, 0);

          })
        };

        windowMock.require.config = sinon.spy(() => {});
      });

      it('loads a module', function () {
        return requireOnDemand('module1', windowMock)
          .then(function (LoadedModule) {
            assert.strictEqual(LoadedModule, MockModule1);
            assert.isTrue(windowMock.require.calledOnce);
            assert.equal(windowMock.require.config.args[0][0].waitSeconds, 40, 'correct require waitSeconds set');
          });
      });

      it('multiple calls to requireOnDemand work as expected', function () {
        return Promise.all([
          requireOnDemand('module1', windowMock),
          requireOnDemand('module2', windowMock)
        ]).then(([LoadedModule1, LoadedModule2]) => {
          assert.strictEqual(LoadedModule1, MockModule1);
          assert.strictEqual(LoadedModule2, MockModule2);
          assert.isTrue(windowMock.require.calledTwice);
        });
      });
    });

    describe('unsuccessful load', function () {
      var errType;

      beforeEach(function () {
        windowMock = {
          require: sinon.spy((moduleList, callback, errback) => {
            // requirejs is asynchronous, add a setTimeout to mimic that behavior.
            setTimeout(() => {
              errback({
                requireModules: [moduleList],
                requireType: errType
              });
            }, 0);
          })
        };
        windowMock.require.config = sinon.spy(() => {});
      });

      it('fails if there is a timeout fetching the resource', function () {
        errType = 'timeout';
        return requireOnDemand('module1', windowMock)
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'TIMEOUT'));
          });
      });

      it('fails if there is a scripterror fetching the resource', function () {
        errType = 'scripterror';
        return requireOnDemand('module1', windowMock)
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'SCRIPTERROR'));
          });
      });

      it('fails if there is resource does not contain a define', function () {
        errType = 'nodefine';
        return requireOnDemand('module1', windowMock)
          .then(assert.fail, function (err) {
            assert.isTrue(requireOnDemand.Errors.is(err, 'NODEFINE'));
          });
      });
    });
  });
});

