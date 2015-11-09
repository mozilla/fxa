/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var MarketingEmailClient = require('lib/marketing-email-client');
  var MarketingEmailErrors = require('lib/marketing-email-errors');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var xhr = require('lib/xhr');

  var assert = chai.assert;

  describe('lib/marketing-email-client', function () {
    var BASE_URL = 'https://basket.mozilla.com';
    var PREFERENCES_URL = 'https://www.allizom.org/newsletter/existing/';

    var client;
    var xhrMock;

    beforeEach(function () {
      // Xhr has no constructor
      xhrMock = Object.create(xhr);
      xhrMock.ajax = function () {
        return p();
      };

      client = new MarketingEmailClient({
        baseUrl: BASE_URL,
        preferencesUrl: PREFERENCES_URL,
        xhr: xhrMock
      });
    });

    describe('_request', function () {
      it('calls xhr.ajax', function () {
        sinon.stub(xhrMock, 'ajax', function () {
          return p({});
        });

        return client._request('get', '/endpoint', 'token', { key: 'value' })
          .then(function () {
            var ajaxOptions = xhrMock.ajax.args[0][0];

            assert.equal(ajaxOptions.url, BASE_URL + '/endpoint');
            assert.equal(ajaxOptions.type, 'get');
            assert.equal(ajaxOptions.headers.Authorization, 'Bearer token');
            assert.equal(ajaxOptions.data.key, 'value');
          });
      });

      it('converts any errors returned', function () {
        sinon.stub(xhrMock, 'ajax', function () {
          return p.reject({
            responseJSON: {
              code: MarketingEmailErrors.toErrno('UNKNOWN_TOKEN')
            }
          });
        });

        return client._request('/endpoint', 'get', 'token')
          .then(assert.fail, function (err) {
            assert.isTrue(MarketingEmailErrors.is(err, 'UNKNOWN_TOKEN'));
          });
      });
    });

    describe('fetch', function () {
      it('returns a preferences URL for the user', function () {
        sinon.stub(xhrMock, 'ajax', function () {
          return p({
            token: 'users_uuid'
          });
        });

        return client.fetch('token')
          .then(function (data) {
            assert.equal(data.token, 'users_uuid');
            assert.equal(data.preferencesUrl, PREFERENCES_URL + 'users_uuid');

            var request = xhrMock.ajax.args[0][0];
            assert.equal(request.url, BASE_URL + '/lookup-user');
            assert.equal(request.type, 'get');
            assert.include(request.headers.Authorization, 'token');
          });
      });
    });

    describe('optIn', function () {
      it('opts the user in', function () {
        sinon.spy(xhrMock, 'ajax');

        return client.optIn('token', 'newsletter_id')
          .then(function () {
            var request = xhrMock.ajax.args[0][0];
            assert.equal(request.url, BASE_URL + '/subscribe');
            assert.equal(request.type, 'post');
            assert.include(request.headers.Authorization, 'token');
            assert.deepEqual(request.data, { newsletters: 'newsletter_id' });
          });
      });
    });

    describe('optOut', function () {
      it('opts the user out', function () {
        sinon.spy(xhrMock, 'ajax');

        return client.optOut('token', 'newsletter_id')
          .then(function () {
            var request = xhrMock.ajax.args[0][0];
            assert.equal(request.url, BASE_URL + '/unsubscribe');
            assert.equal(request.type, 'post');
            assert.include(request.headers.Authorization, 'token');
            assert.deepEqual(request.data, { newsletters: 'newsletter_id' });
          });
      });
    });
  });
});
