/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const MarketingEmailClient = require('lib/marketing-email-client');
  const MarketingEmailErrors = require('lib/marketing-email-errors');
  const sinon = require('sinon');
  const xhr = require('lib/xhr');
  const WindowMock = require('../../mocks/window');

  const BASE_URL = 'https://basket.mozilla.com';
  const PREFERENCES_URL = 'https://www.allizom.org/newsletter/existing/';

  describe('lib/marketing-email-client', function () {

    let client;
    let xhrMock;
    let windowMock;

    beforeEach(function () {
      // Xhr has no constructor
      xhrMock = Object.create(xhr);
      xhrMock.ajax = function () {
        return Promise.resolve();
      };

      windowMock = new WindowMock();

      client = new MarketingEmailClient({
        baseUrl: BASE_URL,
        preferencesUrl: PREFERENCES_URL,
        window: windowMock,
        xhr: xhrMock
      });
    });

    describe('_request', function () {
      it('calls xhr.ajax', function () {
        sinon.stub(xhrMock, 'ajax').callsFake(function () {
          return Promise.resolve({});
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
        sinon.stub(xhrMock, 'ajax').callsFake(function () {
          return Promise.reject({
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
        sinon.stub(xhrMock, 'ajax').callsFake(function () {
          return Promise.resolve({
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
      it('opts in the user', function () {
        sinon.spy(xhrMock, 'ajax');

        windowMock.location.href =
          'https://accounts.firefox.com/settings?client_id=clientsid&' +
          'service=sync&uid=asdfasd&utm_campaign=newsletter&' +
          'utm_content=content&utm_medium=email&utm_source=menupanel&' +
          'utm_term=awesome&unknown=false&email=no@no.com';

        return client.optIn('token', 'newsletter_id')
          .then(function () {
            const request = xhrMock.ajax.args[0][0];
            const cleanedSourceUrl =
              'https://accounts.firefox.com/settings?client_id=clientsid&' +
              'service=sync&utm_campaign=newsletter&utm_content=content&' +
              'utm_medium=email&utm_source=menupanel&utm_term=awesome';
            assert.equal(request.url, BASE_URL + '/subscribe');
            assert.equal(request.type, 'post');
            assert.include(request.headers.Authorization, 'token');
            assert.deepEqual(request.data, {
              newsletters: 'newsletter_id',
              source_url: cleanedSourceUrl //eslint-disable-line camelcase
            });
          });
      });
    });
  });
});
