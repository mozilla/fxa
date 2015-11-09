/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var ConfigLoader = require('lib/config-loader');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var Xhr = require('lib/xhr');

  var assert = chai.assert;

  describe('lib/config-loader', function () {
    describe('fetch', function () {
      var configLoader;
      var successfulConfigResponse = {
        cookiesEnabled: true,
        language: 'en-GB'
      };

      var sandbox;
      var xhr;

      beforeEach(function () {
        sandbox = sinon.sandbox.create();

        xhr = Object.create(Xhr);
        configLoader = new ConfigLoader({
          xhr: xhr
        });
      });

      afterEach(function () {
        sandbox.restore();
      });

      it('fetches config from `/config`', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p(successfulConfigResponse);
        });

        return configLoader.fetch()
          .then(function (config) {
            assert.strictEqual(config, successfulConfigResponse);
            assert.isTrue(xhr.getJSON.calledOnce);
          });
      });

      it('caches responses', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p(successfulConfigResponse);
        });

        return configLoader.fetch()
          .then(function () {
            return configLoader.fetch();
          })
          .then(function (config) {
            assert.strictEqual(config, successfulConfigResponse);
            assert.isTrue(xhr.getJSON.calledOnce);
          });
      });

      it('only makes one XHR request for multiple concurrent requests', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p(successfulConfigResponse);
        });

        return p.all([
          configLoader.fetch(),
          configLoader.fetch()
        ])
        .spread(function (config1, config2) {
          assert.strictEqual(config1, successfulConfigResponse);
          assert.strictEqual(config2, successfulConfigResponse);
          assert.isTrue(xhr.getJSON.calledOnce);
        });
      });

      it('fails with `SERVICE_UNAVAILABLE` if the server cannot be reached', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p.reject();
        });

        return configLoader.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(ConfigLoader.Errors.is(err, 'SERVICE_UNAVAILABLE'));
            assert.equal(err.namespace, 'config');
            assert.equal(err.status, 0);
          });
      });

      it('fails with `SERVICE_UNAVAILABLE` if the HTTP status code is 0', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p.reject({
            status: 0
          });
        });

        return configLoader.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(ConfigLoader.Errors.is(err, 'SERVICE_UNAVAILABLE'));
            assert.equal(err.namespace, 'config');
            assert.equal(err.status, 0);
          });
      });

      it('fails with `UNEXPECTED_ERROR` if the HTTP status code is > 0', function () {
        sandbox.stub(xhr, 'getJSON', function () {
          return p.reject({
            status: 400
          });
        });

        return configLoader.fetch()
          .then(assert.fail, function (err) {
            assert.isTrue(ConfigLoader.Errors.is(err, 'UNEXPECTED_ERROR'));
            assert.equal(err.namespace, 'config');
            assert.equal(err.status, 400);
          });
      });
    });
  });
});


